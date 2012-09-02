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
  var Backbone = require('backbone');
  var util = require('app/models/util');

  var UserCredentials = Backbone.Model.extend({
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

    verify: function() {
      if (!this.username) {
        this.trigger('accepted');
      } else {
        this._sendVerificationRequest();
      }
    },

    _sendVerificationRequest: function() {
      var self = this;
      $.ajax({
        method: 'GET',
        url: util.apiUrl(''),
        headers: {'Authorization': this.toAuthHeader()},
        xhrFields: {withCredentials: true},
        success: function() {
          self.trigger('accepted');
        },
        error: function() {
          self.trigger('rejected');
        },
      });
    },

    toAuthHeader: function() {
      return 'Basic ' + btoa(this.username + ':' + this.password);
    }
  });

  return UserCredentials;
});