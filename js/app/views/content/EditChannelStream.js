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
  var AbstractEditStream = require('views/content/AbstractEditStream');
  var api = require('util/api');
  var Backbone = require('backbone');
  var Events = Backbone.Events;
  var l10nBrowser = require('l10n-browser');
  var template = require('text!templates/content/editChannel.html');
  var localTemplate;

  var EditChannelStream = AbstractEditStream.extend({

    events: {
      'click .save': 'save',
      'click .discard': 'render',
      'click .twoStepConfirmation .stepOne': '_renderConfirmButton',
      'click .twoStepConfirmation .stepTwo': '_delete',
      'change #channel_default_role': '_toggleHint'
    },

    _toggleHint: function() {
      var $defaultRole = this.$('#channel_default_role');
      var value = $defaultRole.val();
      var $hint = $defaultRole.next('.hint');
      $hint.removeClass('followerSelected followerPlusSelected').addClass(value + 'Selected');
    },

    initialize: function() {
      if (!localTemplate) localTemplate = l10nBrowser.localiseHTML(template, {});
      this._initialize();
      if (!this.model.hasEverChanged()) {
        this.listenTo(this.model, 'fetch', this.render);
      } else {
        this.render();
      }
      this.isPersonalChannel = this.options.user.username() === this.model.channel;
      this.listenToOnce(this.model, 'sync', this.render);
    },

    destroy: function() {
      this.remove();
    },

    render: function() {
      this.$el.html(_.template(localTemplate, {
        metadata: this.model
      }));
      this._fillCheckbox();
      this._selectDefaultRole();
    },

    save: function() {
      // FIXME Workaround to not get events from disabled save button
      if (this.$('.save').hasClass('disabled')) return;
      this._disableSaveButton();
      this._save(this.model, {complete: this._handleResponse()});
    },

    _handleResponse: function() {
      var self = this;
      return function(xhr) {
        if (xhr.status === 0 || xhr.status === 200) {
          self._successCallback();
        } else {
          self._errorCallback();
        }
      };
    },

    _successCallback: function() {
      var $saveButton = this.$('.save');
      $saveButton.removeClass('disabled');
      $saveButton.text('Saved');
      var channel = this.model.channel;
      setTimeout(function() {
        Events.trigger('navigate', channel);
      }, 7000);
    },

    _errorCallback: function() {
      var $saveButton = this.$('.save');
      $saveButton.removeClass('disabled').addClass('completed');
      $saveButton.text('Error');
      setTimeout(function() {
        $saveButton.removeClass('completed');
        $saveButton.text('Save');
      }, 7000);
    },

    _disableSaveButton: function() {
      this.$('.save').addClass('disabled').text('Saving...');
    },

    _fillCheckbox: function() {
      this._check(this.$('#channel_public_access'), this._hasPublicAccess());
    },

    _hasPublicAccess: function() {
      return this.model.accessModel() === 'open';
    },

    _selectDefaultRole: function() {
      var $defaultRole = this.$('#channel_default_role');
      var value = this.model.defaultAffiliation() === 'publisher' ? 'followerPlus' : 'follower';
      $defaultRole.val(value);
      $defaultRole.next('.hint').addClass(value + 'Selected');
    },

    _renderConfirmButton: function() {
      this.$('.twoStepConfirmation').toggleClass('confirmed');
    },

    _disableConfirmButton: function() {
      this.$('.stepTwo').addClass('disabled').text('Deleting...');
    },

    _deleteErrorCallback: function() {
      var $confirmButton = this.$('.stepTwo');
      $stepTwo.removeClass('disabled').addClass('completed');
      $stepTwo.text('Error');
      setTimeout(function() {
        $stepTwo.removeClass('completed');
        $stepTwo.text('Confirm');
      }, 7000);
    },

    _delete: function() {
      var self = this;
      var channel = this.model.channel;
      var url = this.isPersonalChannel ? api.url('account') : api.url(channel);
      var credentials = this.options.user.credentials;
      var options = {
        type: 'DELETE',
        url: url,
        crossDomain: true,
        xhrFields: {withCredentials: true},
        contentType: false,
        processData: false,
        beforeSend: function(xhr) {
          xhr.setRequestHeader('Authorization',
            credentials.authorizationHeader());
        },
        success: function() {
          Events.trigger('channelDeleted', channel);
          Events.trigger('navigate', 'home');
        },
        error: function() {
          self._deleteErrorCallback();
        }
      };

      this._disableConfirmButton();
      $.ajax(options);
    }
  });

  return EditChannelStream;
});
