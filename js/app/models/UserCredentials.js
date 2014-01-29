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
  require('jquery.cookie');
  var api = require('util/api');
  var config = require('config');
  var Backbone = require('backbone');
  var ModelBase = require('models/ModelBase');

  var UserCredentials = ModelBase.extend({
    fetch: function(options) {
      var username = localStorage.username;
      var credentials = $.cookie('credentials');

      if (username && credentials) {
        this.set({
          'username': username,
          'credentials': credentials
        });
      }

      if (options && options.success) {
        options.success();
      }
    },

    updateCookie: function() {
      if (this.isPermanent()) {
        this._setCookieKey('credentials', this.credentials, true);
      }
    },

    _persist: function(permanent) {
      this._setStorageKey('loginPermanent', permanent);
      this._setStorageKey('username', this.username);
      this._setCookieKey('credentials', this.credentials, permanent);
    },

    _setStorageKey: function(key, value) {
      if (value) {
        localStorage[key] = value;
      } else {
        delete localStorage[key];
      }
    },

    _setCookieKey: function(key, value, permanent) {
      if (value) {
        if (permanent) {
          $.cookie(key, value, { expires: 7 });
        } else {
          $.cookie(key, value);
        }
      } else {
        $.removeCookie(key);
      }
    },

    isPermanent: function() {
      return Boolean(localStorage.loginPermanent);
    },

    set: function() {
      Backbone.Model.prototype.set.apply(this, arguments);
      this.username = this.get('username');
      this.credentials = this.get('credentials');
    },

    clear: function(options) {
      this.set({username: null, credentials: null});
      this._persist();
    },

    save: function(attributes, options) {
      var username = attributes.username;
      var password = attributes.password;

      if (username && password) {
        if (username.indexOf('@') == -1) {
          if (config.useURLHostAsDomain) {
            username += '@' + Backbone.history.location.hostname;
          } else {
            username += '@' + config.homeDomain;
          }
        }

        var credentials = btoa(username + ':' + password);
        this.set({'username': username, 'credentials': credentials});

        options = options || {};
        this._persist(options.permanent);
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
