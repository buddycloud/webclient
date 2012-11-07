/*
 * Copyright 2012 buddycloud
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

define(function(require) {
  var _ = require('underscore')
  var avatarFallback = require('util/avatarFallback');
  var animations = require('util/animations');
  var Backbone = require('backbone');
  var ChannelMetadata = require('models/ChannelMetadata');
  var template = require('text!templates/sidebar/channels.html');
  var channelTemplate = require('text!templates/sidebar/channel.html');
  var Events = Backbone.Events;

  var Channels = Backbone.View.extend({
    className: 'channels antiscroll-wrap',
    events: {'click .channel': '_navigateToChannel'},

    initialize: function() {
      this.metadatas = [];
      this._unreadCounts = {};
      this._getChannelsMetadata();
      this.model.subscribedChannels.bind('subscriptionSync', this._updateChannels, this);
    },

    _updateChannels: function(action, channel, role, extra) {
      // extra for rainbow animation
      if (action === 'subscribedChannel') {
        this._addChannel(channel, extra);
      } else {
        this._removeChannel(channel);
      }
    },

    _addChannel: function(channel, extra) {
      var callback = this._triggerUpdateCallback(extra);
      this._fetchMetadata(channel, callback, extra);
    },

    _removeChannel: function(channel) {
      this._removeMetadata(channel);

      // Update template
      var channelToRemove = this.$('.channel[data-href="' + channel + '"]');
      channelToRemove.bind(animations.transitionsEndEvent(), {propertyName : 'height'}, this._removeOldSpot);
      document.redraw();
      channelToRemove.addClass('remove');
      channelToRemove.css('height', 0);
    },

    _removeMetadata: function(channel) {
      var self = this;
      _.each(this.metadatas, function(metadata, index) {
        if (metadata.channel === channel) {
          self.metadatas.splice(index, 1);
        }
      });
    },

    _fetchMetadata: function(channel, callback) {
      var metadata = new ChannelMetadata(channel);
      this.metadatas.push(metadata);
      metadata.fetch({success: callback});
    },

    render: function() {
      this.$el.html(_.template(template, {
        metadatas: this.metadatas,
        selected: this.selected
      }));
      avatarFallback(this.$('.channel img'), undefined, 50);
      this._setupAnimation();
    },

    _navigateToChannel: function(event) {
      this._bubble(event.currentTarget);
      this._dispatchNavigationEvent(event.currentTarget.dataset['href']);
    },

    _dispatchNavigationEvent: function(path) {
      Events.trigger('navigate', path);
    },

    _getChannelsMetadata: function() {
      var self = this;
      var callback = this._triggerRenderCallback();

      _.each(this.model.subscribedChannels.channels(), function(channel, index) {
        if (!self._itsMe(channel)) {
          self._fetchMetadata(channel, callback);
        }
      });
    },

    _itsMe: function(channel) {
      return this.model.username().indexOf(channel) != -1;
    },

    _triggerUpdateCallback: function(extra) {
      var self = this;
      return function(model) {
        var channel = _.template(channelTemplate,{
          metadata: model,
          selected: false
        });
        self._rainbowAnimation($(channel), model.channelType(), extra.offset, extra.animationClass, extra.selected);
      }
    },

    _triggerRenderCallback: function() {
      var self = this;
      var fetched = [];
      return function(model) {
        fetched.push(model);
        if (fetched.length === self.metadatas.length) {
          self.render();
          self._listenForNewItems();
        }
      }
    },

    _setupAnimation: function() {
      // caching elements and values
      this._$innerHolder = this.$el.find('.scrollHolder');
      this._$channels = this.$el.find('.channel:not(".personal")');
      this._channelHeight = this._$channels.first().outerHeight();
      this._movingChannels = 0;
    },

    _bubble: function(target) {
      var bubblingChannel = $(target);
      var bubbleDestination = bubblingChannel.position().top + this._$innerHolder.scrollTop();

      if (this._needsBubbling(bubblingChannel, bubbleDestination)) {
        this._shrinkStartArea(bubblingChannel, bubbleDestination);
        this._growDestinationArea(bubblingChannel, 'bubbleHolder', 'bubbling');
      }
    },

    _needsBubbling: function(bubblingChannel, bubbleDestination) {
      // if the selected channel is not the first or the bubble one
      return bubbleDestination !== 0 && !bubblingChannel.parent().hasClass('bubbleHolder');
    },

    _shrinkStartArea: function(bubblingChannel, bubbleDestination) {
      var startingArea = $('<div></div>').height( this._channelHeight ).addClass('startingArea');
      bubblingChannel.before(startingArea);
      document.redraw();
      startingArea.bind(animations.transitionsEndEvent(), {propertyName: 'height'}, this._removeOldSpot);
      startingArea.css('height', 0);
      // start animation
      this._triggerShrinkingAnimation(bubblingChannel, bubbleDestination);
    },

    _triggerShrinkingAnimation: function(bubblingChannel, bubbleDestination) {
      bubblingChannel.detach().css('top', bubbleDestination);
      this._$innerHolder.prepend(bubblingChannel);
    },

    _growDestinationArea: function(bubblingChannel, bubbleClasses, animationClass, callback) {
      var landingArea = $('<div></div>').addClass(bubbleClasses);
      bubblingChannel.wrap(landingArea);
      document.redraw();
      bubblingChannel.bind(animations.transitionsEndEvent(), {self: this, callback: callback}, this._adjustNewSpot);
      // start animation
      this._triggerGrowingAnimation(bubblingChannel);
    },

    _triggerGrowingAnimation: function(bubblingChannel, animationClass) {
      bubblingChannel.addClass(animationClass).css({'top': 0, 'left': 0, 'z-index': ++this._movingChannels + 1});
      bubblingChannel.parent().css('height', this._channelHeight);
    },

    _removeOldSpot: function(event) {
      var propertyToWaitFor = event.data ? event.data.propertyName : undefined;
      if (propertyToWaitFor !== undefined && event.originalEvent.propertyName === propertyToWaitFor) {
        $(this).remove();
      }
    },

    _adjustNewSpot: function(event) {
      var $this = $(this);
      var data = event.data;

      if (data && data.callback) {
        data.callback();
      }
      $this.removeClass('bubbling');
      $this.css({'height': '', 'z-index': ''});
      $this.unwrap();
      $this.unbind(event.originalEvent.type);
      data.self._movingChannels--;
    },

    _listenForNewItems: function() {
      var user = this.model;
      var self = this;
      user.notifications.on('new', function(item) {
        var channel = item.source;
        if (channel != self.selected) {
          self._increaseUnreadCount(channel);
        }
      });
      user.notifications.listen({credentials: user.credentials});
    },

    _increaseUnreadCount: function(channel) {
      var numUnread = this._unreadCounts[channel];
      numUnread = numUnread ? numUnread + 1 : 1;
      this._unreadCounts[channel] = numUnread;
      this._renderUnreadCount(channel);
    },

    _renderUnreadCount: function(channel) {
      var channelEl = this.$('.channel[data-href="' + channel + '"]');
      var countEl = channelEl.find('.counter');
      var count = this._unreadCounts[channel];
      if (count > 0) {
        countEl.text(count);
        countEl.show();
      } else {
        countEl.hide();
      }
    },

    selectChannel: function(channel) {
      this.selected = channel;
      this.$('.selected').removeClass('selected');
      this.$('.channel[data-href="' + channel + '"]').addClass('selected');
      this._resetUnreadCount(channel);
    },

    _resetUnreadCount: function(channel) {
      this._unreadCounts[channel] = 0;
      this._renderUnreadCount(channel);
    },

    _rainbowAnimation: function($channel, channelType, offset, animationClassName, selected) {
      var self = this;

      this._setupFlyingChannel($channel, channelType, offset);
      // trigger the fly-in animation
      this._growDestinationArea($channel, 'bubbleHolder rainbowBubble', animationClassName, this._rainbowAnimationCallback($channel, selected));
    },

    _rainbowAnimationCallback: function($channel, selected) {
      var self = this;
      return function() {
        self.$el.removeClass('rainbowAnimationRunning');
        if (selected) {
          self.$('.selected').removeClass('selected');
          $channel.addClass('selected').css({left: '', top: ''});
        }
      }
    },

    _setupFlyingChannel: function($channel, channelType, offset) {
      this.$el.addClass('rainbowAnimationRunning');
      $channel.css({
        left: offset.left - this._$innerHolder.offset().left,
        top: offset.top - this._$innerHolder.offset().top
      });
      this._$innerHolder.prepend($channel);
      avatarFallback($channel.find('img'), channelType, 50);
    }

  });

  return Channels;
});
