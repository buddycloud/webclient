/*
 * Copyright 2012 Denis Washington <denisw@online.de>
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
  var Backbone = require('backbone');
  var ModelBase = require('models/ModelBase')

  var UserCredentials = ModelBase.extend({
    fetch: function(options) {
      this.set({
        username: sessionStorage.username,
        password: sessionStorage.password
      });
      if (options && options.success) {
        options.success();
      }
    },

    set: function() {
      Backbone.Model.prototype.set.apply(this, arguments);
      this.username = this.get('username');
      this.password = this.get('password');
    },

    save: function(attributes) {
      this.set(attributes);
      this._setSessionStorage('username', this.get('username'));
      this._setSessionStorage('password', this.get('password'));
    },

    _setSessionStorage: function(key, value) {
      if (value) {
        sessionStorage[key] = value;
      } else {
        delete sessionStorage[key];
      }
    },

    addAuthorizationToAjaxOptions: function(options) {
      if (options) {
        options.headers = options.headers || {};
        options.headers['Authorization'] = this._authorizationHeader();
        options.headers['X-Session-Id'] = this._sessionId;
        options.xhrFields = options.xhrFields || {};
        options.xhrFields.withCredentials = true;
        this._addSessionIdRecording(options);
      }
    },

    _authorizationHeader: function() {
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
          options.complete.apply(this, arguments);
        }
      }
    }
  });

  return UserCredentials;
});
