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
  var api = require('app/util/api');
  var Backbone = require('backbone');

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

    register: function(username, password, email) {
      if (username && password && email) {
        var self = this;
        $.ajax({
          type: 'POST',
          url: api.url('account'),
          contentType: 'application/json',
          data: JSON.stringify({'username': username, 'password': password}),
          success: function() {
            self.save({'username': username, 'password': password});
            self.trigger('registrationSuccess');
          },
          error: function(xhr) {
            var message = 'Registration error'
            if (xhr.status === 503) {
              message = 'User "' + username + '" already exists';            
            }
            self.trigger('registrationError', message);
          }
        });         
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
        url: api.rootUrl(),
        headers: {'Authorization': this.toAuthorizationHeader()},
        xhrFields: {withCredentials: true},
        success: function() {
          self.trigger('accepted');
        },
        error: function() {
          self.trigger('rejected', 'Authentication failed');
        },
      });
    },

    toAuthorizationHeader: function() {
      if (this.username) {
        return 'Basic ' + btoa(this.username + ':' + this.password);
      } else {
        return undefined;
      }
    }
  });

  return UserCredentials;
});