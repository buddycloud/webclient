/*
 * Copyright 2012 Denis Washington <denisw@online.de>
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
  var template = require('text!templates/sidebar/channels.html')
  var Events = Backbone.Events;

  var Channels = Backbone.View.extend({
    className: 'channels antiscroll-wrap',
    events: {'click .channel': '_selectChannel'},

    initialize: function() {
      this.metadatas = [];
      this._getChannelsMetadata();
    },

    render: function() {
      this.$el.html(_.template(template, {
        metadatas: this.metadatas,
      }));
      avatarFallback(this.$('.channel img'), undefined, 50);
      this._setupAnimation();
    },

    _selectChannel: function(event) {
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
          var metadata = new ChannelMetadata(channel);
          self.metadatas.push(metadata);
          metadata.fetch({success: callback});
        }
      });
    },

    _itsMe: function(channel) {
      return this.model.username().indexOf(channel) != -1;
    },

    _triggerRenderCallback: function() {
      var self = this;
      var fetched = [];
      return function(model) {
        fetched.push(model);
        if (fetched.length === self.metadatas.length) {
          self.render();
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
        this._growDestinationArea(bubblingChannel);
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

    _growDestinationArea: function(bubblingChannel) {
      var landingArea = $('<div></div>').addClass('bubbleHolder');
      bubblingChannel.wrap(landingArea);
      document.redraw();
      bubblingChannel.bind(animations.transitionsEndEvent(), {self: this}, this._adjustNewSpot);
      // start animation
      this._triggerGrowingAnimation(bubblingChannel);
    },

    _triggerGrowingAnimation: function(bubblingChannel) {
      bubblingChannel.addClass('bubbling').css({'top': 0, 'z-index': ++this._movingChannels + 1});
      bubblingChannel.parent().css('height', this._channelHeight);
    },

    _removeOldSpot: function(event) {
      var propertyToWaitFor = event.data ? event.data.propertyName : undefined;
      if (propertyToWaitFor !== undefined && event.originalEvent.propertyName === propertyToWaitFor) {
        var $this = $(this);
        $this.remove();
        $this.unbind(event.originalEvent.type);
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
    }
  });

  return Channels;
});
