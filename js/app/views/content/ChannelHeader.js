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
  var _ = require('underscore');
  var avatarFallback = require('util/avatarFallback');
  var Backbone = require('backbone');
  var template = require('text!templates/content/header.html')

  var ChannelHeader = Backbone.View.extend({
    className: 'channelHeader justify',

    render: function() {
      var metadata = this.model.metadata;
      this.$el.html(_.template(template, {metadata: metadata}));
      avatarFallback(this.$('.avatar'), metadata.channelType(), 75);
      this._renderFollowButton();
    },

    _renderFollowButton: function() {
      if (this.options.user.isAnonymous()) {
        this.$('.follow').hide();
      } else {
        if (!this._follows()) {
          this.$('.follow').text('Unfollow');
        }
      }
    },

    _follows: function() {
      var followedChannels = this.options.user.subscribedChannels.channels();
      var channel = this.model.metadata.channel;
      _.each(followedChannels, function(followedChannel, index) {
        if (followedChannel.indexOf(channel) != -1) {
          return true;
        }
      });

      return false;
    }
  });

  return ChannelHeader;
});
