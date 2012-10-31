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
  var $ = require('jquery');
  var api = require('util/api');
  var config = require('config');
  var Backbone = require('backbone');
  var ModelBase = require('models/ModelBase')

  var UserCredentials = ModelBase.extend({
    fetch: function(options) {
      this.set({
        username: sessionStorage.username || localStorage.username,
        password: sessionStorage.password || localStorage.password
      });
      this._saveToStorage(sessionStorage);
      if (!localStorage.username) {
        this._saveToStorage(localStorage);
      }
      if (options && options.success) {
        options.success();
      }
    },

    _saveToStorage: function(storage) {
      this._setStorageKey(storage, 'username', this.username);
      this._setStorageKey(storage, 'password', this.password);
    },

    _setStorageKey: function(storage, key, value) {
      if (value) {
        storage[key] = value;
      } else {
        delete storage[key];
      }
    },

    set: function() {
      Backbone.Model.prototype.set.apply(this, arguments);
      this.username = this.get('username');
      this.password = this.get('password');
      if (this.username && this.username.indexOf('@') == -1) {
        this.username += '@' + config.homeDomain;
      }
    },

    save: function(attributes, options) {
      this.set(attributes);
      this._saveToStorage(localStorage);

      if (options && options.permanent) {
        this._saveToStorage(sessionStorage);
      }
    },

    addAuthorizationToAjaxOptions: function(options) {
      if (options) {
        options.headers = options.headers || {};
        options.headers['Authorization'] = this.authorizationHeader();
        options.headers['X-Session-Id'] = this._sessionId;
        options.xhrFields = options.xhrFields || {};
        options.xhrFields.withCredentials = true;
        this._addSessionIdRecording(options);
      }
    },

    authorizationHeader: function() {
      if (this.username) {
        return 'Basic ' + btoa(this.username + ':' + this.password);
      } else {
        return undefined;
      }
    },

    _addSessionIdRecording: function(options) {
      var complete = options.complete
      var self = this;
      options.complete = function(arg1, arg2) {
        var xhr;
        if (arg1.getResponseHeader) {
          xhr = arg1;
        } else {
          xhr = arg2[0];
        }
        self._sessionId = xhr.getResponseHeader('X-Session-Id');
        if (complete) {
          complete.apply(this, arguments);
        }
      }
    }
  });

  return UserCredentials;
});
