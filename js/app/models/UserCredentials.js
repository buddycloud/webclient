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
  require(['jquery', 'jquery.cookie']);
  var $ = require('jquery');
  var api = require('util/api');
  var config = require('config');
  var Backbone = require('backbone');
  var ModelBase = require('models/ModelBase');

  var UserCredentials = ModelBase.extend({
    fetch: function(options) {
      var username = $.cookie('username') || localStorage.username;
      var credentials = $.cookie('credentials') || localStorage.credentials;

      if (username && credentials) {
        this.set({
          'username': username,
          'credentials': credentials
        });
      } else {
        this.clear();
      }

      if (options && options.success) {
        options.success();
      }
    },

    _saveToStorage: function(storage) {
      this._setStorageKey(storage, 'username', this.username);
      this._setStorageKey(storage, 'credentials', this.credentials);
    },

    _setStorageKey: function(storage, key, value) {
      if (value) {
        storage[key] = value;
      } else {
        delete storage[key];
      }
    },

    isPermanent: function() {
      return localStorage.username && localStorage.password;
    },

    set: function() {
      Backbone.Model.prototype.set.apply(this, arguments);
      this.username = this.get('username');
      this.credentials = this.get('credentials');
    },

    clear: function(options) {
      this.set({username: null, credentials: null});
      this._saveToStorage(localStorage);
      $.removeCookie('username');
      $.removeCookie('credentials');
    },

    save: function(attributes, options) {
      var username = attributes.username;
      var password = attributes.password;

      if (username && username.indexOf('@') == -1) {
        username += '@' + config.homeDomain;
      }

      var credentials = btoa(username + ':' + password);
      this.set({'username': username, 'credentials': credentials});

      if (options && options.permanent) {
        this._saveToStorage(localStorage);
      } else {
        // Save cookie
        $.cookie('username', username, {path: '/'});
        $.cookie('credentials', credentials, {path: '/'});
      }
    },

    addAuthorizationToAjaxOptions: function(options) {
      if (options) {
        options.headers = options.headers || {};
        options.headers['Authorization'] = this.authorizationHeader();
        options.xhrFields = options.xhrFields || {};
        options.xhrFields.withCredentials = true;
      }
    },

    authorizationHeader: function() {
      if (this.username) {
        return 'Basic ' + this.credentials;
      } else {
        return undefined;
      }
    }
  });

  return UserCredentials;
});
