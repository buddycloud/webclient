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
  var api = require('util/api');
  var Backbone = require('backbone');
  var ChannelMetadata = require('models/ChannelMetadata');
  var Events = Backbone.Events;
  var dateUtils = require('util/dateUtils');
  var ModelBase = require('models/ModelBase');
  var PostNotifications = require('models/PostNotifications');
  var SubscribedChannels = require('models/SubscribedChannels');
  var Sync = require('models/Sync');
  var UserCredentials = require('models/UserCredentials');

  var User = ModelBase.extend({
    constructor: function() {
      ModelBase.call(this);
      this.credentials = new UserCredentials();
      this.channelsMetadata = {};
      this.notifications = new PostNotifications();
      this.subscribedChannels = null;
      this.sync = new Sync();
      Events.on('updateLastSession', this.updateLastSession, this);
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
      return this.subscribedChannels ? this.subscribedChannels.channels() : [];
    },

    start: function() {
      this.credentials.fetch();
      if (this.isAnonymous()) {
        Events.trigger('syncSuccess');
      } else {
        var self = this;
        this._tryFetchingSubscribedChannels({
          error: function() {
            self.trigger('loginError');
          },
          success: function() {
            self.trigger('loginSuccess', self.username());
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
          self.trigger('loginSuccess', self.username());
        }
      });
    },

    updateLastSession: function(time) {
      localStorage[this.username() + '.lastSession'] = time;
    },

    logout: function() {
      this.credentials.clear();
    },

    _trySync: function() {
      this.sync.set('username', this.credentials.username, {silent: true});

      var since = localStorage[this.username() + '.lastSession'] || dateUtils.earliestTime();
      this.sync.fetch({
        credentials: this.credentials,
        data: {since: since, max: 51}
      });
    },

    _tryFetchingSubscribedChannels: function(options) {
       this.subscribedChannels = new SubscribedChannels();
       this.listenToOnce(this.subscribedChannels, 'change', this._trySync);
       this.subscribedChannels.fetch({
         credentials: this.credentials,
         success: options.success,
         error: options.error
      });
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
          switch (res.status) {
            case 500:
              message = 'Server down';
              break;
            case 503:
              message = 'User "' + username + '" already exists';
              break;
            default:
              message = 'Registration error!';
              break;
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
