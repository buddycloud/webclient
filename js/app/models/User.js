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
  var Backbone = require('backbone');
  var ModelBase = require('models/ModelBase')
  var PostNotifications = require('models/PostNotifications')
  var SubscribedChannels = require('models/SubscribedChannels')
  var UserCredentials = require('models/UserCredentials')

  var User = ModelBase.extend({
    constructor: function() {
      ModelBase.call(this);
      this.credentials = new UserCredentials;
      this.notifications = new PostNotifications;
      this.subscribedChannels = null;
    },

    isAnonymous: function() {
      return !this.credentials.username;
    },

    avatarUrl: function(size) {
      if (this.isAnonymous()) {
        return "";
      } else {
        return api.avatarUrl(this.credentials.username, size);
      }
    },

    username: function() {
      return this.credentials.username;
    },

    channels: function() {
      return this.subscribedChannels.channels();
    },

    login: function(options) {
      if (this.isAnonymous()) {
        this.trigger('loginSuccess');
      } else {
       var self = this;
        this._tryFetchingSubscribedChannels({
          error: function() {
            self.trigger('loginError');
          },
          success: function() {
            self._loginPermanent = options ? options.permanent : false;
            if (!self._loginPermanent) {
              self._increaseLoginCount();
            }
            self.trigger('loginSuccess');
          }
        });
      }
    },

    logout: function() {
      this.credentials.save({username: null, password: null}, {permanent: true});
    },

    _tryFetchingSubscribedChannels: function(options) {
       this.subscribedChannels = new SubscribedChannels(this.username);
       this.subscribedChannels.fetch({
         credentials: this.credentials,
         success: options.success,
         error: options.error
      });
    },

    _increaseLoginCount: function() {
      var count = localStorage.loginCount || 0;
      count++;
      localStorage.loginCount = count + '';
    },

    endSession: function() {
      if (!this.isAnonymous()) {
        if (this._loginPermanent) {
          this.credentials.save();
        } else {
          var newCount = this._decreaseLoginCount();
          if (newCount == 0) {
            this.credentials.save({username: null, password: null});
          }
        }
      }
    },

    _decreaseLoginCount: function() {
      var count = localStorage.loginCount || 0;
      count = Math.max(count - 1, 0);
      localStorage.loginCount = count + '';
      return count;
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
  });

  return User;
});
