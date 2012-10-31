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
  var _ = require('underscore');
  var api = require('util/api');
  var ChannelMetadata = require('models/ChannelMetadata');
  var ModelBase = require('models/ModelBase');

  var ChannelFollowers = ModelBase.extend({
    constructor: function(channel) {
      ModelBase.call(this);
      this.channel = channel;
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

    isPublisher: function(username) {
      var role = this.get(username);
      return role === 'publisher' || role === 'owner' || role === 'moderator';
    },

    isOwner: function(username) {
      var role = this.get(username);
      return role === 'owner';
    },

    // These are workarounds resultant by server issues
    parse: function(resp, xhr) {
      this._normalizeTypes(resp);
      this._removeAnonymous(resp);
      this._ensureHasOwner(resp);
      return resp;
    },

    _removeAnonymous: function(followers) {
      var result = {};
      _.each(followers, function(role, username) {
        if (username.indexOf('@anon.') !== -1) {
          delete followers[username];
        }
      });
    },

    _normalizeTypes: function(followers) {
      var normalizedRolesMap = {
        'follower+post': 'publisher',
        'follower': 'member'
      };
      _.each(followers, function(role, username) {
        followers[username] = normalizedRolesMap[role] || role;
      });
    },

    _ensureHasOwner: function(followers) {
      if (!this._hasOwner(followers)) {
        // Assume that the channel name is the owner name unless
        // it's domain starts with "topics.". Yes, this is ugly,
        // but hey it's a legacy version workaround.
        if (this.channel.indexOf('@topics.') == -1) {
          followers[this.channel] = 'owner';
        }
      }
    },

    _hasOwner: function(followers) {
      return _.any(followers, function(role) {
        return role == 'owner';
      });
    }
  });

  return ChannelFollowers;
});
