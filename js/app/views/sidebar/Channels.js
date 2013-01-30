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
  var Sync = require('models/Sync');
  var UnreadCounter = require('models/UnreadCounter');
  var UnreadCounters = require('models/UnreadCounters');

  var Channels = Backbone.View.extend({
    className: 'channels antiscroll-wrap',
    events: {'click .channel': '_navigateToChannel'},

    initialize: function() {
      this.metadatas = [];
      this._getChannelsMetadata();
      this.model.subscribedChannels.bind('subscriptionSync', this._updateChannels, this);
    },

    _initUnreadCounters: function() {
      this.unreadCounters = new UnreadCounters();
      this.unreadCounters.bind('reset', this._syncUnreadCounters, this);
      this.unreadCounters.fetch({conditions: {'user': this.model.username()}});
    },

    _syncUnreadCounters: function() {
      var options = {
        data: {'since': this.model.lastSession, 'max': 51, counters: 'true'},
        credentials: this.model.credentials,
        success: this._updateCounters()
      };

      this.sync = new Sync();
      this.sync.fetch(options);
    },

    _updateCounters: function() {
      var self = this;
      var username = this.model.username();
      var unreadCounters = this.unreadCounters;
      return function(model) {
        _.each(model.counters(), function(counter, channel) {
          if (self.selected !== channel) {
            unreadCounters.increaseCounter(username, channel, counter);
            if (channel === username) {
              Events.trigger('personalChannelCounter', unreadCounters.getCounter(channel));
            }
          } else {
            unreadCounters.resetCounter(username, channel);
          }
        });

        self.render();
        self._listenForNewItems();
      }
    },

    _renderUnreadCount: function(channel) {
      var channelEl = this.$('.channel[data-href="' + channel + '"]');
      var countEl = channelEl.find('.counter');
      var count = this.unreadCounters.getCounter(channel);
      if (count > 0) {
        if (count > 50) {
          countEl.text('50+');
        } else {
          countEl.text(count);
        }
        countEl.show();
      } else {
        countEl.hide();
      }
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
      var spot = this._channelSpot(channel);
      this.metadatas.splice(spot, 1);
    },

    _fetchMetadata: function(channel, callback) {
      var metadata = new ChannelMetadata(channel);
      this.metadatas.unshift(metadata);
      metadata.fetch({success: callback});
    },

    _renderCounters: function() {
      for (var i in this.metadatas) {
        this._renderUnreadCount(this.metadatas[i].channel);
      }
    },

    render: function() {
      this._sortChannels();
      this.$el.html(_.template(template, {
        metadatas: this.metadatas,
        selected: this.selected
      }));
      this._renderCounters();
      avatarFallback(this.$('.channel img'), undefined, 50);
      this._setupAnimation();
    },

    _sortChannels: function() {
      var unreadCounters = this.unreadCounters;
      this.metadatas.sort(
        function(a, b) {
          var aCount = unreadCounters.getCounter(a.channel);
          var bCount = unreadCounters.getCounter(b.channel);
          var diff = bCount - aCount;
          if (diff === 0) {
            var aTitle = a.title() || a.channel;
            var bTitle = b.title() || b.channel;
            return aTitle.localeCompare(bTitle);
          }

          return diff;
        }
      );
    },

    _navigateToChannel: function(event) {
      //this._bubbleToTop(event.currentTarget);
      this._dispatchNavigationEvent(event.currentTarget.dataset['href']);
    },

    _dispatchNavigationEvent: function(path) {
      Events.trigger('navigate', path);
    },

    _getChannelsMetadata: function() {
      var self = this;
      var callback = this._triggerInitUnreadCountersCallback();

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
        self._rainbowAnimation($(channel), model.channel, model.channelType(), extra.offset, extra.animationClass, extra.selected);
      }
    },

    _triggerInitUnreadCountersCallback: function() {
      var self = this;
      var fetched = [];
      return function(model) {
        fetched.push(model);
        if (fetched.length === self.metadatas.length) {
          self._initUnreadCounters();
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

    _channelSpot: function(channel) {
      for (var i = 0; i < this.metadatas.length; i++) {
        if (channel === this.metadatas[i].channel) {
          return i;
        }
      }
      return -1;
    },

    _bubbleUpSpot: function(channel, oldSpot) {
      var counters = this.unreadCounters;
      var count = counters.getCounter(channel);
      var bubbleSpot = oldSpot;

      for (var i = oldSpot; i - 1 > 0; i--) {
        var prev = this.metadatas[i - 1].channel;
        if (count > counters.getCounter(prev)) {
          var temp = this.metadatas[i-1];
          this.metadatas[i-1] = this.metadatas[i];
          this.metadatas[i] = temp;
          bubbleSpot = i - 1;
        }
      }

      return bubbleSpot;
    },

    _bubbleDownSpot: function(channel, oldSpot) {
      var counters = this.unreadCounters;
      var count = counters.getCounter(channel);
      var bubbleSpot = oldSpot;

      for (var i = oldSpot; i + 1 < this.metadatas.length; i++) {
        var next = this.metadatas[i + 1].channel;
        if (count < counters.getCounter(next)) {
          var temp = this.metadatas[i+1];
          this.metadatas[i+1] = this.metadatas[i];
          this.metadatas[i] = temp;
          bubbleSpot = i + 1;
        }
      }

      return bubbleSpot;
    },

    _bubbleUp: function(channel) {
      var currentSpot = this._channelSpot(channel);
      if (currentSpot > 0) {
        var newSpot = this._bubbleUpSpot(channel, currentSpot);
        this._bubble(channel, newSpot, currentSpot);
      }
    },

    _bubbleDown: function(channel) {
      var currentSpot = this._channelSpot(channel);
      if (currentSpot != -1 && currentSpot < this.metadatas.length - 1) {
        var newSpot = this._bubbleDownSpot(channel, currentSpot);
        this._bubble(channel, newSpot, currentSpot);
      }
    },

    _bubble: function(channel, newSpot, oldSpot) {
      var bubblingChannel = this.$('.channel[data-href="' + channel + '"]');

      if (this._needsBubbling(newSpot, oldSpot, bubblingChannel)) {
        var bubbleDestination = bubblingChannel.position().top + this._$innerHolder.scrollTop();
        this._shrinkStartArea(bubblingChannel, bubbleDestination);

        if (newSpot === 0) {
          this._$innerHolder.prepend(bubblingChannel);
        } else if (newSpot === this.metadatas.length - 1) {
          this._$innerHolder.append(bubblingChannel);
        } else {
          var $channelToMove = this.$('.channel[data-href="' + this.metadatas[newSpot+1].channel + '"]');
          $channelToMove.before(bubblingChannel);
        }

        this._growDestinationArea(bubblingChannel, 'bubbleHolder', 'bubbling');
      }
    },

    _needsBubbling: function(newSpot, oldSpot, bubblingChannel) {
      return  newSpot != oldSpot && !bubblingChannel.parent().hasClass('bubbleHolder');
    },

    _shrinkStartArea: function(bubblingChannel, bubbleDestination) {
      var startingArea = $('<div></div>').height( this._channelHeight ).addClass('startingArea');
      bubblingChannel.before(startingArea);
      document.redraw();
      startingArea.bind(animations.transitionsEndEvent(), {propertyName: 'height'}, this._removeOldSpot);
      startingArea.css('height', 0);
      this._triggerShrinkingAnimation(bubblingChannel, bubbleDestination);
    },

    _triggerShrinkingAnimation: function(bubblingChannel, bubbleDestination) {
      bubblingChannel.detach().css('top', bubbleDestination);
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
      // FIXME Workaround for channels that are being put in top of each other
      // this._adjustNewSpot not being called when the bubblingChannel is the top one
      this._ensureNewSpotAdjust(bubblingChannel);
    },

    _ensureNewSpotAdjust: function(bubblingChannel) {
      var self = this;
      setTimeout(function() {
        if (bubblingChannel.parent().hasClass('bubbleHolder')) {
          bubblingChannel.removeClass('bubbling');
          bubblingChannel.css({'height': '', 'z-index': ''});
          bubblingChannel.unwrap();
          bubblingChannel.unbind(animations.transitionsEndEvent());
          self.movingChannels--;
        }
      },
      2000);
    },

    _removeOldSpot: function(event) {
      var propertyToWaitFor = event.data ? event.data.propertyName : undefined;
      if (propertyToWaitFor !== undefined && event.originalEvent.propertyName === propertyToWaitFor) {
        $(this).remove();
      }
    },

    _adjustNewSpot: function(event) {
      var $this = $(this);
      $this.removeClass('bubbling');
      $this.css({'height': '', 'z-index': ''});
      $this.unwrap();
      $this.unbind(event.originalEvent.type);

      var data = event.data;
      if (data && data.callback) {
        data.callback();
      }
      data.self._movingChannels--;
    },

    _listenForNewItems: function() {
      var user = this.model;
      var unreadCounters = this.unreadCounters;
      var self = this;
      user.notifications.on('new', function(item) {
        var channel = item.source;
        if (channel !== self.selected) {
          unreadCounters.incrementCounter(user.username(), channel);
          if (channel === user.username()) {
            Events.trigger('personalChannelCounter', unreadCounters.getCounter(channel));
          } else {
            self._renderUnreadCount(channel);
            self._bubbleUp(channel);
          }
        }
      });
      user.notifications.listen({credentials: user.credentials});
    },

    selectChannel: function(channel) {
      var prev = this.selected;
      var username = this.model.username();
      if (prev && prev !== username && prev != channel) {
        // Previous channel should go to the right place
        this._bubbleDown(prev);
      }

      this.selected = channel;
      this.$('.selected').removeClass('selected');
      this.$('.channel[data-href="' + channel + '"]').addClass('selected');

      var unreadCounters = this.unreadCounters;
      if (unreadCounters && unreadCounters.isReady()) {
        if (unreadCounters.getCounter(channel) > 0) {
          unreadCounters.resetCounter(username, channel);

          if (channel === username) {
            Events.trigger('personalChannelCounter', 0);
          } else {
            this._renderUnreadCount(channel);
          }
        }
      }
    },

    _rainbowAnimation: function($channel, channel, channelType, offset, animationClassName, selected) {
      var self = this;

      this._setupFlyingChannel($channel, channelType, offset);
      // trigger the fly-in animation
      this._growDestinationArea($channel, 'bubbleHolder rainbowBubble', animationClassName, this._rainbowAnimationCallback($channel, channel, selected));
    },

    _rainbowAnimationCallback: function($channel, channel, selected) {
      var self = this;
      return function() {
        self.$el.removeClass('rainbowAnimationRunning');
        if (selected) {
          self.$('.selected').removeClass('selected');
          //$channel.addClass('selected').css({left: '', top: ''});
          self.selectChannel(channel);
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
