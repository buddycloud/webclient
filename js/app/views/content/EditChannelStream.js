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
  var l10nBrowser = require('l10n-browser');
  var template = require('text!templates/content/editChannel.html');

  var EditChannelStream = AbstractEditStream.extend({

    events: {
      'click .save': 'save',
      'click .discard': 'render',
      'click .twoStepConfirmation .stepOne': '_renderConfirmButton',
      'click .twoStepConfirmation .stepTwo': '_delete'
    },

    initialize: function() {
      this._initialize();
      this.localTemplate = l10nBrowser.localiseHTML(template, {});
      this.model.metadata.bind('change', this.render, this);
      this.model.metadata.bind('sync', this.render, this);
    },

    render: function() {
      this.$el.html(_.template(this.localTemplate, {
        metadata: this.model.metadata
      }));
      this._fillCheckbox();
      this._selectDefaultRole();
    },

    save: function() {
      this._save(this.model.metadata, this._enableSaveButton);
      this._disableSaveButton();
    },

    _enableSaveButton: function() {
      this.$('.save').removeClass('disabled').text('Save');
    },

    _disableSaveButton: function() {
      this.$('.save').addClass('disabled').text('Saving...');
    },

    _fillCheckbox: function() {
      this._check(this.$('#channel_public_access'), this._hasPublicAccess());
    },

    _hasPublicAccess: function() {
      return this.model.metadata.accessModel() === 'open';
    },

    _selectDefaultRole: function() {
      if (this.model.metadata.defaultAffiliation() === 'publisher') {
        this.$('#channel_default_role').val('followerPlus');
      }
    },

    _renderConfirmButton: function() {
      this.$('.twoStepConfirmation').toggleClass('confirmed');
    },

    _delete: function() {
      var self = this;
      $.ajax({
        type: 'DELETE',
        url: this.model.url(),
        crossDomain: true,
        xhrFields: {withCredentials: true},
        contentType: false,
        processData: false,
        beforeSend: function(xhr) {
          xhr.setRequestHeader('Authorization',
            self.options.user.credentials.authorizationHeader());
        },
        statusCode: {
          200: function() {
            Events.trigger('navigate', '/');
          }
        }
      });
    }
  });

  return EditChannelStream;
});
