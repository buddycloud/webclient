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
  var avatarFallback = require('util/avatarFallback');
  var Backbone = require('backbone');
  var ChannelMetadata = require('models/ChannelMetadata');
  var template = require('text!templates/sidebar/personalChannel.html');
  var Events = Backbone.Events;

  var PersonalChannel = Backbone.View.extend({
    className: 'personal channel',
    events:  
      {
        'click .logout': '_logout',
        'click .metadata': '_navigate',
        'click .noSelect': 'showSettings',
        'click .showSettings' : 'hideSettings',
        'click .preferences': '_showPrefs'
      },

    initialize: function() {
      this.metadata = new ChannelMetadata(this.model.username());
      this.metadata.bind('change', this.render, this);
      this.metadata.fetch();

      _.bindAll(this, 'showSettings', 'hideSettings');
    },

    render: function() {
      this.$el.html(_.template(template, {
        metadata: this.metadata
      }));
      avatarFallback(this.$('.avatar img'), this.metadata.channelType(), 50);
    },

    _logout: function() {
      this.model.logout();
      location.reload();
    },

    selectChannel: function(channel) {
      this.selected = (this.metadata.channel == channel);
      if (this.selected) {
        this.$el.addClass('selected');
      } else {
        this.$el.removeClass('selected');
      }
    },

    _navigate: function() {
      Events.trigger('navigate', this.model.username());
    },

    _showPrefs: function() {
      Events.trigger('navigate', 'prefs');
    },

    showSettings: function() {
      event.stopPropagation();
      this.$('.settings').removeClass('noSelect').addClass('showSettings');

      // Hide settings clicking elsewhere
      $('body, html').on('click', this.hideSettings);
    },

    hideSettings: function() {
      this.$('.settings').removeClass('showSettings').addClass('noSelect');

      // Remove click event
      $('body, html').off('click', this.hideSettings);
    }
  });

  return PersonalChannel;
});
