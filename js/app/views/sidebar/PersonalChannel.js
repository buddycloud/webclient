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
        'click .metadata': '_navigate',
        'click .settings': '_showSettings',
        'click .settings li': '_hideSettings',
        'click .preferences': '_showPrefs'
      },

    initialize: function() {
      this.metadata = new ChannelMetadata(this.model.username);
      this.metadata.bind('change', this.render, this);
      this.metadata.fetch();
      this.$el.on('click', this._navigate);
    },

    render: function() {
      this.$el.html(_.template(template, {
        metadata: this.metadata,
        selected: this.selected
      }));
      avatarFallback(this.$('.avatar img'), this.metadata.channelType(), 50);
    },

    _navigate: function() {
      Events.trigger('navigate', this.model.username);
    },

    selectChannel: function(channelId) {
      this.selected = (this.metadata.channel == channelId);
      if (this.selected) {
        this.$el.addClass('selected');
      } else {
        this.$el.removeClass('selected');
      }
    },

    _showPrefs: function() {
      Events.trigger('navigate', 'prefs');
    },

    _showSettings: function() {
      $('.settings').toggleClass('showSettings');
    },

    _hideSettings: function() {
      $('.settings').toggleClass('noSelect');
    }
  });

  return PersonalChannel;
});
