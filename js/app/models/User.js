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
  var ChannelMetadata = require('models/ChannelMetadata');
  var ModelBase = require('models/ModelBase');
  var PostNotifications = require('models/PostNotifications');
  var SubscribedChannels = require('models/SubscribedChannels');
  var UserCredentials = require('models/UserCredentials');

  var User = ModelBase.extend({
    constructor: function() {
      ModelBase.call(this);
      this.credentials = new UserCredentials();
      this.notifications = new PostNotifications();
      this.channelsMetadata = {};
      this.subscribedChannels = null;
    },

    _earliestTime: function() {
      return new Date(1970, 0, 1).toISOString();
    },

    _currentTime: function() {
      return new Date().toISOString();
    },

    isAnonymous: function() {
      return !this.username();
    },

    avatarUrl: function(size) {
      if (this.isAnonymous()) {
        return "";
      } else {
        return api.avatarUrl(this.username(), size);
      }
    },

    metadata: function(channel) {
      var channelMetadata = this.channelsMetadata[channel];
      if (!channelMetadata) {
        channelMetadata = new ChannelMetadata(channel);
        this.channelsMetadata[channel] = channelMetadata;
      }
      return channelMetadata;
    },

    username: function() {
      return this.credentials.username;
    },

    channels: function() {
      return this.subscribedChannels ? this.subscribedChannels.channels() : null;
    },

    start: function() {
      this.credentials.fetch();
      if (this.isAnonymous()) {
        this.trigger('loginSuccess');
      } else {
        var self = this;
        this._tryFetchingSubscribedChannels({
          error: function() {
            self.trigger('loginError');
          },
          success: function() {
            self.lastSession = localStorage[self.username() + '.lastSession'] || self._earliestTime(); // FIXME workaround to get last session
            self.trigger('loginSuccess');
          }
        });
      }
    },

    login: function(loginInfo, options) {
      this.credentials.save(loginInfo, options);
      var self = this;
      this._tryFetchingSubscribedChannels({
        error: function() {
          self.credentials.clear();
          self.trigger('loginError');
        },
        success: function() {
          self.lastSession = localStorage[self.username() + '.lastSession'] || self._earliestTime(); // FIXME workaround to get last session
          self.trigger('loginSuccess');
        }
      });
    },

    logout: function() {
      this._saveLastSessionTime();
      this.credentials.clear();
    },

    _saveLastSessionTime: function() {
      localStorage[this.username() + '.lastSession'] = this._currentTime();
    },

    _tryFetchingSubscribedChannels: function(options) {
       this.subscribedChannels = new SubscribedChannels();
       this.subscribedChannels.fetch({
         credentials: this.credentials,
         success: options.success,
         error: options.error
      });
    },

    endSession: function() {
      if (!this.isAnonymous()) {
        this._saveLastSessionTime();
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
          var message = 'Registration error';
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
    }
  });

  return User;
});
