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

    events: {'click .follow': '_follow',
             'click .unfollow': '_unfollow'},

    initialize: function() {
      this.options.user.subscribedChannels.bind('sync', this.render, this);
    },

    render: function() {
      var metadata = this.model.metadata;
      this.$el.html(_.template(template, {metadata: metadata}));
      avatarFallback(this.$('.avatar'), metadata.channelType(), 75);
      this._renderButtons();
    },

    _renderButtons: function() {
      if (this.options.user.isAnonymous()) {
        // Hide both buttons
        this.$('.edit').hide();
        this.$('.follow').hide();
      } else {
        if (this._itsMe() || this._isOwner()) {
          // Show only edit button
          this.$('.follow').hide();
        } else {
          // Show (un)follow button
          this.$('.edit').hide();

          if (this._follows()) {
            var button = this.$('.follow');
            button.toggleClass('follow unfollow').text('Unfollow')
          }
        }
      }
    },

    _isOwner: function() {
      var username = this.options.user.username();
      return this.model.followers.isOwner(username);
    },

    _itsMe: function() {
      return this.options.user.username().indexOf(this.model.name) != -1;
    },

    _follows: function() {
      var followedChannels = this.options.user.subscribedChannels.channels();
      var channel = this.model.metadata.channel;
      return _.include(followedChannels, channel);
    },

    _follow: function() {
      var channel = this.model.metadata.channel;
      var role = this.model.metadata.defaultAffiliation();
      var credentials = this.options.user.credentials;

      // Subscribe
      this.options.user.subscribedChannels.subscribe(channel, 'posts', role, credentials);
    },

    _unfollow: function() {
      var channel = this.model.metadata.channel;
      var credentials = this.options.user.credentials;

      // Subscribe
      this.options.user.subscribedChannels.unsubscribe(channel, 'posts', credentials);
    }    
  });

  return ChannelHeader;
});
