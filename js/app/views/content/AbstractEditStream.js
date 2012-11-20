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
  var Events = Backbone.Events;

  var AbstractEditStream = Backbone.View.extend({
    className: 'stream clearfix',

    _initialize: function() {
      this.fields =
        {
          'channel_name': 'title',
          'channel_description': 'description',
          'channel_public_access': 'access_model',
          'channel_default_role': 'default_affiliation'
        };
    },

    _check: function(element, value) {
      if (element) {
        element.attr('checked', value);
      }
    },

    _save: function(event) {
      // Set fields
      this._setTextFields();
      this._setAccessModel();
      this._setDefaultRole();

      // Save
      this._saveAvatar();

      var self = this;
      this.model.save({}, {
        credentials: this.options.user.credentials,
        complete: function() {
          self._enableSaveButton();
        }
      });

      this._disableSaveButton();
    },

    _saveAvatar: function() {
      var file = this.$(':file')[0].files[0];
      if (file) {
        var formData = this._buildFormData(file);
        this._sendUploadFileResquest(formData);
      }
    },

    _buildFormData: function(file) {
      var formData = new FormData();
      formData.append('data', file);
      formData.append('content-type', file.type);
      if (file.name) {
        formData.append('filename', file.name);
      }

      return formData;
    },

    _sendUploadFileResquest: function(formData) {
      var self = this;
      $.ajax({
        type: 'PUT',
        url: this.model.avatarUrl(),
        crossDomain: true,
        data: formData,
        xhrFields: {withCredentials: true},
        contentType: false,
        processData: false,
        beforeSend: function(xhr) {
          xhr.setRequestHeader('Authorization',
            self.options.user.credentials.authorizationHeader());
        },
        statusCode: {
          201: function() {
            Events.trigger('avatarChanged', self.model.channel);
          }
        }
      });
    },

    _enableSaveButton: function() {
      this.$('.save').removeClass('disabled').text('Save');
    },

    _disableSaveButton: function() {
      this.$('.save').addClass('disabled').text('Saving...');
    },

    _setTextFields: function() {
      // FIXME not all fields are handled by HTTP API
      // var textFields = ['channel_name', 'channel_description', 'channel_status', 'channel_location'];
      var textFields = ['channel_name', 'channel_description'];
      for (var i = 0; i < textFields.length; i++) {
        var content = this.$('#' + textFields[i]).val();
        this.model.set(this.fields[textFields[i]], content, {silent: true});
      }
    },

    _isChecked: function(element) {
      if (element) {
        var checked = element.attr('checked');
        return checked && checked === 'checked';
      }

      return false;
    },

    _setAccessModel: function() {
      var accessField = this.fields['channel_public_access'];
      if (this._isChecked(this.$('#channel_public_access'))) {
        this.model.set(accessField, 'open', {silent: true});
      } else {
        this.model.set(accessField, 'whitelist', {silent: true});
      }
    },

    _setDefaultRole: function() {
      var defaultRoleField = this.fields['channel_default_role'];
      if (this.$('#channel_default_role').val() == 'followerPlus') {
        this.model.set(defaultRoleField, 'publisher', {silent: true});
      } else if (this.$('#channel_default_role').val() == 'follower') {
        this.model.set(defaultRoleField, 'member', {silent: true});
      }
    }
  });

  return AbstractEditStream;
});
