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
  var Backbone = require('backbone');
  var avatarFallback = require('util/avatarFallback');
  var Preferences = require('models/Preferences');
  var template = require('text!templates/content/preferences.html');

  var PreferencesView = Backbone.View.extend({
    className: 'stream clearfix',

    events: {
      'click .save': 'save',
    },

    initialize: function() {
      this.model = new Preferences();
      this.model.bind('change', this.render, this);
      this.model.fetch({credentials: this.options.user.credentials});
    },

    render: function() {
      this.$el.html(_.template(template, {
        preferences: this.model
      }));

      // Update checkboxes
      $('#newFollowers').attr('checked', this.model.newFollowers());
      $('#mentions').attr('checked', this.model.mentions());
      $('#ownChannel').attr('checked', this.model.ownChannel());
      console.log(this.model.followedChannels());
      $('#followedChannels').attr('checked', this.model.followedChannels());
      $('#threads').attr('checked', this.model.threads());
    },

    save: function(event) {
      event.preventDefault();
      var email = $('#email_address').val();

      if (email) {
        var newFollowers = $('#newFollowers').attr('checked') ? true : false;
        var mentions = $('#mentions').attr('checked') ? true : false;
        var ownChannel = $('#ownChannel').attr('checked') ? true : false;
        var followedChannels = $('#followedChannels').attr('checked') ? true : false;
        var threads = $('#threads').attr('checked') ? true : false;

        this.model.save({
          'email': email,
          'followMyChannel': newFollowers,
          'postMentionedMe': mentions,
          'postOnMyChannel': ownChannel,
          'postOnSubscribedChannel': followedChannels,
          'postAfterMe': threads,
          'followRequest': newFollowers
        }, {credentials: this.options.user.credentials});        
      }
    }
  });

  return PreferencesView;
});
