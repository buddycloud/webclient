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
      'click .twoStepConfirmation .stepTwo': '_delete'
    },

    initialize: function() {
      if (!localTemplate) localTemplate = l10nBrowser.localiseHTML(template, {});
      this._initialize();
      if (!this.model.hasEverChanged()) {
        this.listenTo(this.model, 'fetch', this.render);
      } else {
        this.render();
      }

      this.listenTo(this.model, 'sync', this.render);
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
      this._save(this.model, this._responseCallback());
    },

    _responseCallback: function() {
      var self = this;
      return function(jqXHR, status) {
        var $saveButton = self.$('.save');
        $saveButton.removeClass('disabled').addClass('completed');
        if (jqXHR.status === 200) {
          $saveButton.text('Saved');
        } else {
          $saveButton.text('Error');
        }
        setTimeout(function() {
          Events.trigger('navigate', self.model.channel);
        }, 7000);
      };
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
      if (this.model.defaultAffiliation() === 'publisher') {
        this.$('#channel_default_role').val('followerPlus');
      }
    },

    _renderConfirmButton: function() {
      this.$('.twoStepConfirmation').toggleClass('confirmed');
    },

    _delete: function() {
      var self = this;
      var options = {
        type: 'DELETE',
        url: api.url(this.model.channel),
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
      };

      $.ajax(options);
    }
  });

  return EditChannelStream;
});
