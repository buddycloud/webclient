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
  var SubscribedChannels = require('models/SubscribedChannels')
  var UserCredentials = require('models/UserCredentials')

  var User = ModelBase.extend({
    constructor: function() {
      ModelBase.call(this);
      this.credentials = new UserCredentials;
      this.subscribedChannels = null;
    },

    isAnonymous: function() {
      return !this.credentials.username;
    },

    avatarUrl: function() {
      if (this.isAnonymous()) {
        return "";
      } else {
        return api.avatarUrl(this.credentials.username);
      }
    },

    login: function() {
      if (this.isAnonymous()) {
        this.trigger('loginSuccess');
      } else {
        this._tryFetchingSubscribedChannels();
      }
    },

    register: function(username, password, email) {
      if (username && password && email) {
        var self = this;
        var data = {
          'username': username,
          'password': password,
          'email': email
        };
        var successCallback = function() {
          self.credentials.save({'username': username, 'password': password});
          self.trigger('registrationSuccess');
        };
        var errorCallback = function(res) {
          var message = 'Registration error'
          if (res.status === 503) {
            message = 'User "' + username + '" already exists';
          }
          self.trigger('registrationError', message);
        };

        this._sendRegistrationRequest(data, successCallback, errorCallback);
      }
    },

    _sendRegistrationRequest: function(data, successCallback, errorCallback) {
      var options = {
        type: 'POST',
        url: api.url('account'),
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: successCallback,
        error: errorCallback
      };

      $.ajax(options);
    },

    _tryFetchingSubscribedChannels: function() {
       this.subscribedChannels = new SubscribedChannels(this.username);
       var self = this;
       this.subscribedChannels.fetch({
         credentials: this.credentials,
         success: function() { self.trigger('loginSuccess'); },
         error: function() { self.trigger('loginError'); }
      });
    }
  });

  return User;
});
