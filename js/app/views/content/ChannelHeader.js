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
  var _ = require('underscore');
  var avatarFallback = require('util/avatarFallback');
  var Backbone = require('backbone');
  var Events = Backbone.Events;
  var l10nBrowser = require('l10n-browser');
  var template = require('text!templates/content/header.html')

  var ChannelHeader = Backbone.View.extend({
    className: 'channelHeader justify',

    events: {'click .follow': '_follow',
             'click .unfollow': '_unfollow',
             'click .edit': '_edit'},

    initialize: function() {
      this.localTemplate = l10nBrowser.localiseHTML(template, {});
      if (this.options.user.subscribedChannels) {
        this.options.user.subscribedChannels.bind('subscriptionSync', this._switchButton, this);
      }
    },

    destroy: function() {
      if (this.options.user.subscribedChannels) {
        this.options.user.subscribedChannels.unbind('subscriptionSync', this._switchButton, this);
      }
      this.remove();
    },

    render: function() {
      var metadata = this.model.metadata;
      this.$el.html(_.template(this.localTemplate, {metadata: metadata}));
      avatarFallback(this.$('.avatar'), metadata.channelType(), 75);
      this._renderButtons();
    },

    _switchButton: function(action) {
      var button;
      if (action === 'subscribedChannel') {
        button = this.$('.follow');
        button.toggleClass('follow unfollow').text('Unfollow');
      } else {
        button = this.$('.unfollow');
        button.toggleClass('unfollow follow').text('Follow');
      }
      button.removeClass('disabled');
    },

    _renderButtons: function() {
      if (this.options.user.isAnonymous()) {
        // Hide both buttons
        this._hideButtons('edit', 'follow');
      } else {
        if (this._itsMe() || this._isOwner()) {
          // Show only edit button
          this._hideButtons('follow');
        } else {
          // Show only (un)follow button
          this._hideButtons('edit');

          if (this._follows()) {
            var button = this.$('.follow');
            button.toggleClass('follow unfollow').text('Unfollow');
          }
        }
      }
    },

    _edit: function() {
      Events.trigger('navigate', this.model.name + '/edit');
    },

    _hideButtons: function() {
      for (var i = 0; i < arguments.length; i++) {
        this.$('.' + arguments[i]).hide();
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

    _follow: function(e) {
      var channel = this.model.metadata.channel;
      var role = this.model.metadata.defaultAffiliation();
      var credentials = this.options.user.credentials;

      // rainbow animation stuff
      var animationClassName = 'channelHeader';
      var offset = this.$el.offset();

      // subscribe
      // the final parameter is an extra thing necessary to the rainbow animation
      this.options.user.subscribedChannels.subscribe(channel, 'posts', role, credentials, {offset: offset, animationClass: animationClassName, selected: true});

      // Disable button
      this.$('.follow').toggleClass('disabled');
    },

    _unfollow: function() {
      var channel = this.model.metadata.channel;
      var credentials = this.options.user.credentials;

      // Unsubscribe
      this.options.user.subscribedChannels.unsubscribe(channel, 'posts', credentials);

      // Disable button
      this.$('.unfollow').toggleClass('disabled');
    }
  });

  return ChannelHeader;
});
