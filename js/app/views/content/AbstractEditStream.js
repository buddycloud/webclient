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
  var mediaServer = require('util/mediaServer');

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
        complete: function(xhr, status) {
          if (callback) {
            callback(xhr, status);
          }
        }
      });
    },

    _saveAvatar: function(model) {
      var file = this.$(':file')[0].files[0];
      if (file) {
        var channel = this.model.channel;
        var authHeader = this.options.user.credentials.authorizationHeader();
        mediaServer.uploadAvatar(file, channel, authHeader, this._handleUploadResponse());
      }
    },

    _handleUploadResponse: function() {
      var channel = this.model.channel;
      return function(jqXHR, status) {
        if (jqXHR.status === 201) { // Created
          Events.trigger('avatarChanged', channel);
        } else {
          Events.trigger('avatarUploadError', channel);
        }
      }
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
