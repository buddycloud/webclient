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
          'channel_title': 'title',
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

    _setFields: function(model) {
      this._setTextFields(model);
      this._setAccessModel(model);
      this._setDefaultRole(model);
    },

    _save: function(model, callback) {
      // Set fields
      this._setFields(model);

      // Save
      this._saveAvatar(model);

      var self = this;
      model.save({}, {
        credentials: this.options.user.credentials,
        complete: function() {
          if (callback) {
            callback();
          }
        }
      });
    },

    _saveAvatar: function(model) {
      var file = this.$(':file')[0].files[0];
      if (file) {
        var formData = this._buildFormData(file);
        this._sendUploadFileResquest(formData, model);
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

    _sendUploadFileResquest: function(formData, model) {
      var self = this;
      $.ajax({
        type: 'PUT',
        url: model.avatarUrl(),
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
            Events.trigger('avatarChanged', model.channel);
          }
        }
      });
    },

    _setTextFields: function(model) {
      // FIXME not all fields are handled by HTTP API
      // var textFields = ['channel_title', 'channel_description', 'channel_status', 'channel_location'];
      var textFields = ['channel_title', 'channel_description'];
      for (var i = 0; i < textFields.length; i++) {
        var content = this.$('#' + textFields[i]).val();
        model.set(this.fields[textFields[i]], content, {silent: true});
      }
    },

    _isChecked: function(element) {
      if (element) {
        var checked = element.attr('checked');
        return checked && checked === 'checked';
      }

      return false;
    },

    _setAccessModel: function(model) {
      var accessField = this.fields['channel_public_access'];
      if (this._isChecked(this.$('#channel_public_access'))) {
        model.set(accessField, 'open', {silent: true});
      } else {
        model.set(accessField, 'whitelist', {silent: true});
      }
    },

    _setDefaultRole: function(model) {
      var defaultRoleField = this.fields['channel_default_role'];
      if (this.$('#channel_default_role').val() == 'followerPlus') {
        model.set(defaultRoleField, 'publisher', {silent: true});
      } else if (this.$('#channel_default_role').val() == 'follower') {
        model.set(defaultRoleField, 'member', {silent: true});
      }
    }
  });

  return AbstractEditStream;
});
