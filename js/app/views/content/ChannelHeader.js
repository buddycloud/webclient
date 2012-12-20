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
  var ChannelMetadata = require('models/ChannelMetadata');
  var Events = Backbone.Events;
  var l10n = require('l10n');
  var l10nBrowser = require('l10n-browser');
  var template = require('text!templates/content/header.html')
  var l = l10n.get;
  var localTemplate;

  var ChannelHeader = Backbone.View.extend({
    className: 'channelHeader justify',

    events: {'click .follow': '_follow',
             'click .unfollow': '_unfollow',
             'click .edit': '_edit'},

    initialize: function() {
      if (!localTemplate) localTemplate = l10nBrowser.localiseHTML(template, {});

      if (!this.model) {
        this.model = new ChannelMetadata(this.options.channel);
      }
      this.model.bind('change', this.render, this);
      this.model.fetch({credentials: this.options.user.credentials});

      if (this.options.user.subscribedChannels) {
        this.options.user.subscribedChannels.bind('subscriptionSync', this._switchButton, this);
      }

      // Avatar changed event
      Events.on('avatarChanged', this.render, this);
    },

    destroy: function() {
      if (this.options.user.subscribedChannels) {
        this.options.user.subscribedChannels.unbind('subscriptionSync', this._switchButton, this);
      }
      this.remove();
    },

    render: function() {
      var metadata = this.model;
      this.$el.html(_.template(localTemplate, {metadata: metadata}));
      avatarFallback(this.$('.avatar'), metadata.channelType(), 75);
      this._renderButtons();
    },

    _switchButton: function(action) {
      var button;
      if (action === 'subscribedChannel') {
        button = this.$('.follow');
        button.toggleClass('follow unfollow').text(l('unfollowButton', {}, "Unfollow"));
      } else {
        button = this.$('.unfollow');
        button.toggleClass('unfollow follow').text(l('followButton', {}, "Follow"));
      }
      button.removeClass('disabled');
    },

    _renderButtons: function() {
      if (this.options.user.isAnonymous() || this.options.edit) {
        // Hide both buttons
        this.hideButtons();
      } else {
        if (this._isOwner()) {
          // Show only edit button
          this._hideFollowButton();
        } else {
          // Show only (un)follow button
          this._hideEditButton();

          if (this._follows()) {
            var button = this.$('.follow');
            button.toggleClass('follow unfollow').text(l('unfollowButton', {}, "Unfollow"));
          }
        }
      }
    },

    _edit: function() {
      Events.trigger('navigate', this.model.channel + '/edit');
    },

    hideButtons: function() {
      this._hideEditButton();
      this._hideFollowButton();
    },

    _hideFollowButton: function() {
      this.$('.follow').hide();
    },

    _hideEditButton: function() {
      this.$('.edit').hide();
    },

    _isOwner: function() {
      var channel = this.model.channel;
      return this.options.user.subscribedChannels.isOwner(channel);
    },

    _follows: function() {
      var followedChannels = this.options.user.subscribedChannels.channels();
      var channel = this.model.channel;
      return _.include(followedChannels, channel);
    },

    _follow: function(e) {
      var channel = this.model.channel;
      var role = this.model.defaultAffiliation();
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
      var channel = this.model.channel;
      var credentials = this.options.user.credentials;

      // Unsubscribe
      this.options.user.subscribedChannels.unsubscribe(channel, 'posts', credentials);

      // Disable button
      this.$('.unfollow').toggleClass('disabled');
    }
  });

  return ChannelHeader;
});
