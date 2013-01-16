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
  var Backbone = require('backbone');
  var UnreadCounter = require('models/UnreadCounter');
  var UnreadCountersData = require('models/db/UnreadCountersData');
  require('backbone-indexeddb');

  var UnreadCounters = Backbone.Collection.extend({
  	model: UnreadCounter,
    database: UnreadCountersData,
    storeName: UnreadCountersData.id,

    initialize: function() {
      this._isReady = false;
      this.bind('reset', this._setReady(), this);
    },

    _setReady: function() {
      this._isReady = true;
    },

    isReady: function() {
      return this._isReady;
    },

    getUnreadCount: function(channel) {
      var temp = this.where({'channel': channel});
      // Unread counters should be unique
      return temp.length === 1 ? temp[0] : null;
    },

    getCounter: function(channel) {
      var unreadCount = this.getUnreadCount(channel);
      return unreadCount ? unreadCount.get('counter') : 0;
    },

    resetCounter: function(user, channel) {
      var unreadCount = this.getUnreadCount(channel);
      if (unreadCount) {
        // Update
        unreadCount.set({'counter': 0});
      } else {
        // Create
        unreadCount = this._buildUnreadCounter(user, channel, 0);
      }

      this.create(unreadCount);
    },

    _buildUnreadCounter: function(user, channel, counter) {
      return {'user': user, 'channel': channel, 'counter': counter};
    },

    incrementCounter: function(user, channel) {
      this.increaseCounter(user, channel, 1);
    },

    increaseCounter: function(user, channel, value) {
      var unreadCount = this.getUnreadCount(channel);
      if (unreadCount) {
        // Update
        var prev = unreadCount.get('counter');
        unreadCount.set({'counter': prev + value});
      } else {
        // Create
        unreadCount = this._buildUnreadCounter(user, channel, value);
      }

      this.create(unreadCount);
    }
  });

  return UnreadCounters;
});
