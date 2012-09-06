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
  var _ = require('underscore');
  var api = require('app/util/api');
  var Backbone = require('backbone');
  var ChannelMetadata = require('app/models/ChannelMetadata');

  var ChannelFollowers = Backbone.Model.extend({
    constructor: function(channel) {
      Backbone.Model.call(this);
      this.channel = channel;
      // Temporary necessary for workarounds
      this.metadata = new ChannelMetadata(this.channel);
      this.metadata.fetch();
    },

    url: function() {
      return api.url(this.channel, 'subscribers', 'posts');
    },

    usernames: function() {
      return _.keys(this.attributes);
    },

    byType: function() {
      var roles = this.attributes;
      return _.groupBy(this.usernames(), function(username) {
        return roles[username];
      });
    },

    // These are workarounds resultant by server issues
    parse: function(resp, xhr) {
      var parsed = resp;
      parsed = this._normalizeTypes(parsed);
      parsed = this._removeAnonymous(parsed);
      parsed = this._setOwner(parsed);
      return parsed;
    },

    _removeAnonymous: function(followers) {
      var result = {};
      _.each(followers, function(role, username) {
        if (username.indexOf('@anon.') === -1) {
          result[username] = role;
        }
      });
      return result;
    },

    _setOwner: function(followers) {
      if (this._isPersonalChannel() && this._hasNoOwner(followers)) {
        followers[this.channel] = 'owner';
      }
      return followers;
    },

    _isPersonalChannel: function() {
      // This might return false if metadata attributes are not filled yet.
      // It can happen because metadata.fetch() is async
      return this.metadata && this.metadata.get('channel_type') === 'personal';
    },

    _hasNoOwner: function(followers) {
      return !followers[this.channel] && followers[this.channel] !== 'owner';
    },

    _normalizeTypes: function(followers) {
      var normalizedRolesMap = {
        'follower+post': 'publisher',
        'follower': 'member'
      };
      var result = {};
      _.each(followers, function(role, username) {
        result[username] = normalizedRolesMap[role] || role;
      });
      return result;
    }
  });

  return ChannelFollowers;
});