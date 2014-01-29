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
  var avatarFallback = require('util/avatarFallback');
  var animations = require('util/animations');
  var Backbone = require('backbone');
  var template = require('text!templates/sidebar/channels.html');
  var channelTemplate = require('text!templates/sidebar/channel.html');
  var Events = Backbone.Events;

  var Channels = Backbone.View.extend({
    className: 'channels antiscroll-wrap',
    events: {'click .channel': '_navigateToChannel'},

    initialize: function() {
      this.sidebarInfo = this.model.sync.sidebarInfo;
      this.subscribedChannels = this.model.subscribedChannels;
      this._listeningNewItems = false;

      this.listenTo(this.subscribedChannels, 'subscriptionSync', this._updateChannels);

      this._getChannelsMetadata();

      // Avatar changed event
      Events.on('avatarChanged', this._avatarChanged, this);

      // Channel created event
      Events.on('channelCreated', this._channelCreated, this);

      // Channel deleted event
      Events.on('channelDeleted', this._removeChannel, this);
    },

    _getChannelsMetadata: function() {
      var self = this;
      this._initMetadataCache();

      var callback = _.after(this.metadatas.length, function() {
        self.render();
        self._listenForNewItems();
      });

      this.metadatas.forEach(function(metadata) {
        self._fetchMetadata(metadata, callback);
      });
    },

    _initMetadataCache: function() {
      var self = this;
      var channels = this.model.subscribedChannels.channels();
      this.metadatas = [];
      
      channels.forEach(function(channel) {
        if (!self._itsMe(channel)) {
          var metadata = self.model.metadata(channel);
          self.metadatas.unshift(metadata);
        }
      });
    },

    _renderUnreadCount: function(channel) {
      var channelEl = this.$('.channel[data-href="' + channel + '"]');
      var info = this.sidebarInfo.getInfo(channel);

      var totalCountEl = channelEl.find('.channelpost');
      var totalCount = info.totalCount;
      this._showOrHideCount(totalCountEl, totalCount);

      var mentionsCountEl = channelEl.find('.admin');
      var mentionsCount = info.mentionsCount;
      this._showOrHideCount(mentionsCountEl, mentionsCount);
    },

    _showOrHideCount: function(countEl, count) {
      if (count > 0) {
        if (count > 30) {
          countEl.text('30+');
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
      if (!this._itsMe(channel)) {
        if (action === 'subscribedChannel') {
          this._addChannel(channel, extra);
        } else {
          this._removeChannel(channel);
        }
      }
    },

    _containsChannel: function(channel) {
      for (var i in this.metadatas) {
        if (this.metadatas[i].channel === channel) {
          return true;
        }
      }

      return false;
    },

    _channelCreated: function(channel) {
      var metadataModel = this.model.metadata(channel);
      this.metadatas.unshift(metadataModel);
      var channelEl = _.template(channelTemplate,{
        metadata: metadataModel,
        selected: true
      });

      var $channel = $(channelEl);
      this._$innerHolder.prepend($channel);
      avatarFallback($channel.find('img'), metadataModel.channelType(), 50);

      this._growDestinationArea($channel, 'bubbleHolder', 'bubbling');
    },

    _addChannel: function(channel, extra) {
      if (!this._containsChannel(channel)) {
        var callback = this._triggerUpdateCallback(extra);
        var metadata = this.model.metadata(channel);
        this.metadatas.unshift(metadata);
        this._fetchMetadata(metadata, callback);
      }
    },

    _removeChannel: function(channel) {
      if (this._containsChannel(channel)) {
        this._removeMetadata(channel);

        // Update template
        var channelToRemove = this.$('.channel[data-href="' + channel + '"]');
        channelToRemove.bind(animations.transitionsEndEvent(), {propertyName : 'height'}, this._removeOldSpot);
        document.redraw();
        channelToRemove.addClass('remove');
        channelToRemove.css('height', 0);
      }
    },

    _removeMetadata: function(channel) {
      var spot = this._channelSpot(channel);
      this.metadatas.splice(spot, 1);
    },

    _fetchMetadata: function(metadata, callback) {
      if (!metadata.hasEverChanged()) {
        this.listenToOnce(metadata, 'error change', callback);
        metadata.fetch({credentials: this.model.credentials});
      } else {
        if (callback) {
          callback(metadata);
        }
      }
    },

    _renderCounters: function() {
      for (var i in this.metadatas) {
        this._renderUnreadCount(this.metadatas[i].channel);
      }
    },

    _avatarChanged: function(channel) {
      var index = this._channelSpot(channel);
      if (index > -1) {
        var $imgEl = this.$('.channel[data-href="' + channel + '"]').find('img');
        $imgEl.attr('src', this.metadatas[index].avatarUrl(50) + '&' + new Date().getTime());
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
      document.redraw();
    },

    // 1 - mentions
    // 2 - replies
    // 3 - total unread
    // 4 - hits last week
    // 5 - posts last week
    // 6 - still equal? Just compare the names then
    _comparePosts: function(a, b) {
      var aInfo = this.sidebarInfo.getInfo(a.channel);
      var bInfo = this.sidebarInfo.getInfo(b.channel);

      var diff = bInfo.mentionsCount - aInfo.mentionsCount;
      if (diff === 0) {
        diff = bInfo.repliesCount - aInfo.repliesCount;

        if (diff === 0) {
          diff = bInfo.totalCount - aInfo.totalCount;

          if (diff === 0) {
            diff = bInfo.hitsLastWeek.length - aInfo.hitsLastWeek.length;

            if (diff === 0) {
              diff = aInfo.postsLastWeek.length - bInfo.postsLastWeek.length;

              if (diff === 0) {
                return a.channel.localeCompare(b.channel);
              }
            }
          }

        }
      }

      return diff;
    },

    _sortChannels: function() {
      var self = this;
      this.metadatas.sort(
        function(a, b) {
          return self._comparePosts(a, b);
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
        self._rainbowAnimation($(channel), model.channel,
          model.channelType(), extra.offset, extra.animationClass, extra.selected);
      };
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

    _bubbleSpot: function(channel, oldSpot) {
      var currentSpot = oldSpot;
      var next = currentSpot - 1;

      while (next >= 0) {
        var compare = this._comparePosts(this.metadatas[currentSpot], this.metadatas[next]);
        if (compare >= 0) {
          break;
        }
        this._swap(currentSpot, next);
        currentSpot = next;
        next = currentSpot - 1;
      }

      return currentSpot;
    },

    _swap: function(i, j) {
      var temp = this.metadatas[i];
      this.metadatas[i] = this.metadatas[j];
      this.metadatas[j] = temp;
    },

    _bubbleUp: function(channel) {
      var currentSpot = this._channelSpot(channel);
      if (currentSpot > 0) {
        var newSpot = this._bubbleSpot(channel, currentSpot);
        this._bubble(channel, newSpot, currentSpot);
      }
    },

    _bubbleDown: function(channel) {
      var currentSpot = this._channelSpot(channel);
      var size = this.metadatas.length;
      if (currentSpot !== -1 && currentSpot !== size - 1) {
        for (var i = currentSpot + 1; i < size; i++) {
          this._swap(i, i - 1);
        }
        var newSpot = this._bubbleSpot(channel, size - 1);
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
      if (!this._listeningNewItems) {
        var user = this.model;
        var sidebarInfo = this.sidebarInfo;
        
        var self = this;
        this.listenTo(user.notifications, 'new', function(item) {
          var channel = item.source;
          if (channel !== self.selected) {
            sidebarInfo.parseItem(user.username(), item);

            if (channel === user.username()) {
              Events.trigger('personalChannelTotalCount', sidebarInfo.getInfo(channel).totalCount);
              Events.trigger('personalChannelMentionsCount', sidebarInfo.getInfo(channel).mentionsCount);
            } else {
              self._renderUnreadCount(channel);
              self._bubbleUp(channel);
            }
          }
        });

        user.notifications.listen({credentials: user.credentials});
        this._listeningNewItems = true;
      }
    },

    _shouldBubble: function(prev, username, channel) {
      return prev && prev !== username && prev !== channel;
    },

    selectChannel: function(channel) {
      var prev = this.selected;
      var username = this.model.username();
      if (this._shouldBubble(prev, username, channel)) {
        // Previous channel should go to the right place
        this._bubbleDown(prev);
      }

      this.selected = channel;
      this.$('.selected').removeClass('selected');
      this.$('.channel[data-href="' + channel + '"]').addClass('selected');

      if (this.sidebarInfo.isReady()) {
        this.sidebarInfo.resetCounters(username, channel);

        if (channel === username) {
          Events.trigger('personalChannelTotalCount', 0);
          Events.trigger('personalChannelMentionsCount', 0);
        } else {
          this._renderUnreadCount(channel);
        }
      }
      document.redraw();
    },

    _rainbowAnimation: function($channel, channel, channelType, offset, animationClassName, selected) {
      var self = this;

      this._setupFlyingChannel($channel, channelType, offset);
      // trigger the fly-in animation
      this._growDestinationArea($channel, 'bubbleHolder rainbowBubble', animationClassName,
        this._rainbowAnimationCallback($channel, channel, selected));
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
      };
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
