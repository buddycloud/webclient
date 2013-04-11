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
  var Backbone = require('backbone');
  var avatarFallback = require('util/avatarFallback');
  var Preferences = require('models/Preferences');
  var l10nBrowser = require('l10n-browser');
  var template = require('text!templates/content/preferences.html');
  var localTemplate;

  var PreferencesStream = Backbone.View.extend({
    className: 'stream clearfix',

    events: {
      'click .save': 'save',
      'click .discard': '_renderCheckboxes',
      'click .twoStepConfirmation .stepOne': '_renderConfirmButton',
      'click .twoStepConfirmation .stepTwo': '_deleteAccount'
    },

    initialize: function() {
      if (!localTemplate) localTemplate = l10nBrowser.localiseHTML(template, {});
      this.checkboxes = {
          'newFollowers': 'followMyChannel',
          'mentions': 'postMentionedMe',
          'ownChannel': 'postOnMyChannel',
          'followedChannels': 'postOnSubscribedChannel',
          'threads': 'postAfterMe'
        };
      this.model = new Preferences();
      this.model.bind('change', this.render, this);
      this.model.fetch({credentials: this.options.user.credentials, data: {type: 'email'}});
    },

    render: function() {
      this.$el.html(_.template(localTemplate, {
        preferences: this.model
      }));

      this._renderCheckboxes();
    },

    _renderCheckboxes: function() {
      var self = this;
      _.each(_.keys(this.checkboxes), function(checkbox) {
        self._check(self.$('#' + checkbox), self.model[checkbox]());
      });
    },

    _renderConfirmButton: function() {
      this.$('.twoStepConfirmation').toggleClass('confirmed');
    },

    _deleteAccount: function() {
      //TODO delete account
    },

    save: function(event) {
      // FIXME Workaround to not get events from disabled save button
      if (this.$('.save').hasClass('disabled')) return;

      var email = this.$('#email_address').val();
      if (email) {
        this._savePreferences(email);
      }
    },

    _savePreferences: function(email) {
      var self = this;
      _.each(_.keys(this.checkboxes), function(checkbox) {
        self.model.set(self.checkboxes[checkbox],
          self._isChecked(self.$('#' + checkbox)));
      });
      this.model.set('target', email);
      this.model.save({}, {
        credentials: this.options.user.credentials,
        complete: this._saveComplete()
      });
      this._disableSaveButton();
    },

    _saveComplete: function() {
      var self = this;
      return function() {
        self.$('.save').removeClass('disabled').addClass('completed').text('Saved');
        setTimeout(self._enableSaveButton(), 7000);
      }
    },

    _enableSaveButton: function() {
      var self = this;
      return function() {
        self.$('.save').removeClass('completed').text('Save');
      }
    },

    _disableSaveButton: function() {
      this.$('.save').addClass('disabled').text('Saving...');
    },

    _check: function(element, value) {
      if (element) {
        element.attr('checked', value);
      }
    },

    _isChecked: function(element) {
      if (element) {
        var checked = element.attr('checked');
        if (checked && checked === 'checked') {
          return 'true';
        }
      }
      return 'false';
    }
  });

  return PreferencesStream;
});
