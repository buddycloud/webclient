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
  var indexedDB = require('util/indexedDB');
  var UnreadCounter = require('models/UnreadCounter');
  var UnreadCountersDB = require('models/db/UnreadCountersDB');
  require('backbone-indexeddb');

  var UnreadCounters = Backbone.Collection.extend({
  	model: UnreadCounter,
    database: UnreadCountersDB,
    storeName: UnreadCountersDB.id,

    initialize: function() {
      this.useIndexedDB = this._isLoading = indexedDB.isSuppported();
      if (this.useIndexedDB) {
        this.bind('reset error', this._onInit, this);
      } else {
        this._unreadCounts = {};
      }
    },

    _onInit: function() {
      this._isLoading = false;
    },

    isReady: function() {
      return !this._isLoading;
    },

    _getUnreadCount: function(channel) {
      var temp = this.where({'channel': channel});
      // Unread counters should be unique
      return temp.length > 0 ? temp[0] : null;
    },

    getCounters: function(channel) {
      if (this.useIndexedDB) {
        var unreadCount = this._getUnreadCount(channel);
        return unreadCount ? unreadCount.get('counter') : this._buildCounters(0, 0);
      } else {
        return this._unreadCounts[channel] || this._buildCounters(0, 0);
      }
    },

    resetCounters: function(user, channel) {
      if (this.useIndexedDB) {
        var unreadCount = this._getUnreadCount(channel);
        if (unreadCount) {
          var counter = unreadCount.get('counter');
          if (counter.totalCount > 0 || counter.mentionsCount > 0) {
            // Update
            counter = this._buildCounters(0, 0);
            unreadCount.set({'counter': counter});
            this.create(unreadCount);
          }
        }
      } else {
        var counter = this._buildCounters(0, 0);
        this._unreadCounts[channel] = counter;
      }
    },

    _buildCounters: function(mentionsCount, totalCount) {
      return {'mentionsCount': mentionsCount, 'totalCount': totalCount};
    },

    _buildUnreadCounter: function(user, channel, mentionsCount, totalCount) {
      var counter = this._buildCounters(mentionsCount, totalCount);
      return {'user': user, 'channel': channel, 'counter': counter};
    },

    incrementCounters: function(user, channel) {
      this.increaseCounters(user, channel, 1, 1);
    },

    incrementTotalCount: function(user, channel) {
      this.increaseCounters(user, channel, 0, 1);
    },

    increaseCounters: function(user, channel, mentionsValue, totalValue) {
      if (this.useIndexedDB) {
        var unreadCount = this._getUnreadCount(channel);
        if (unreadCount) {
          // Update
          var prevMentions = unreadCount.get('counter').mentionsCount;
          var prevTotal = unreadCount.get('counter').totalCount;
          var counter = this._buildCounters(prevMentions + mentionsValue, prevTotal + totalValue);
          unreadCount.set({'counter': counter});
        } else {
          // Create
          unreadCount = this._buildUnreadCounter(user, channel, mentionsValue, totalValue);
        }

        this.create(unreadCount);
      } else {
        var counter = this._unreadCounts[channel] || {};
        var prevMentions = counter.mentionsCount || 0;
        var prevTotal = counter.totalCount || 0;
        counter = this._buildCounters(prevMentions + mentionsValue, prevTotal + totalValue);
        this._unreadCounts[channel] = counter;
      }
    }
  });

  return UnreadCounters;
});
