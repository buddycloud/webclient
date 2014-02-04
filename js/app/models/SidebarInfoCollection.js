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
  var dateUtils = require('util/dateUtils');
  var indexedDB = require('util/indexedDB');
  var linkify = require('util/linkify');
  var SidebarInfo = require('models/SidebarInfo');
  var SidebarInfoDB = require('models/db/SidebarInfoDB');
  require(['backbone', 'backbone-indexeddb']);

  var SidebarInfoCollection = Backbone.Collection.extend({
    model: SidebarInfo,
    database: SidebarInfoDB,
    storeName: SidebarInfoDB.id,

    initialize: function() {
      this.useIndexedDB = this._isLoading = indexedDB.isSuppported();
      if (this.useIndexedDB) {
        this.listenTo(this, 'reset error', this._onInit);
      } else {
        this._info = {};
      }
    },

    _onInit: function() {
      this._isLoading = false;
    },

    isReady: function() {
      return !this._isLoading;
    },

    _getSidebarInfo: function(channel) {
      var temp = this.where({'channel': channel});
      // Should be unique
      return temp.length > 0 ? temp[0] : null;
    },

    getInfo: function(channel) {
      if (this.useIndexedDB) {
        var info = this._getSidebarInfo(channel);
        return info ? info.get('info') : this._emptyInfo();
      } else {
        return this._info[channel] || this._emptyInfo();
      }
    },

    _emptyInfo: function() {
      var earliest = dateUtils.utcDate(dateUtils.earliestTime())
      return this._buildInfo(0, 0, earliest, earliest)
    },

    _buildInfo: function(mentionsCount, totalCount, lastPost, lastMention) {
      return {
        'mentionsCount': mentionsCount,
        'totalCount': totalCount,
        'lastPost': lastPost,
        'lastMention': lastMention
      };
    },

    _buildSidebarInfo: function(user, channel, info) {
      return {
        'user': user,
        'channel': channel,
        'info': info
      };
    },

    _checkMention: function(user, item) {
      var mentions =  linkify.mentions(item.content) || [];
      mentions.forEach(function(mention) {
        if (mention === user) {
          return true;
        }
      });

      return false;
    },

    parseItem: function(user, item) {
      var info = this._emptyInfo()

      var updated = dateUtils.utcDate(item.updated)
      info.lastPost = updated

      if (!item.author === user) {
        if (this._checkMention(user, item)) {
          info.mentionsCount++
          info.lastMention = updated
        }

        info.totalCount++
      }

      this.setInfo(user, item.source, info);
    },

    resetCounters: function(user, channel) {
      if (this.useIndexedDB) {
        this._setIndexedDBInfo(user, channel);
      } else {
        this._setInfo(user, channel);
      }
    },

    _setIndexedDBInfo: function(user, channel, newInfo) {
      var sidebarInfo = this._getSidebarInfo(channel)
      if (sidebarInfo) {
        var cached = sidebarInfo.get('info')
        if (newInfo) {
          newInfo.mentionsCount += cached.mentionsCount
          newInfo.totalCount += cached.totalCount
          sidebarInfo.set({info: newInfo})
        } else {
          cached.mentionsCount = 0
          cached.totalCount = 0
          sidebarInfo.set({info: cached})
        }
      } else {
        sidebarInfo = this._buildSidebarInfo(user, channel, newInfo || this._emptyInfo());
      }
      this.create(sidebarInfo)
    },

    _setInfo: function(user, channel, newInfo) {
      var cachedInfo = this._info[channel] || this._emptyInfo()
      if (newInfo) {
        newInfo.mentionsCount += cached.mentionsCount
        newInfo.totalCount += cached.totalCount
        this._info[channel] = newInfo
      } else {
        cachedInfo.mentionsCount = 0
        cachedInfo.totalCount = 0
        this._info[channel] = cachedInfo
      }
    },

    setInfo: function(user, channel, info) {
      if (this.useIndexedDB) {
        this._setIndexedDBInfo(user, channel, info);
      } else {
        this._setInfo(user, channel, info);
      }
    }

  });

  return SidebarInfoCollection;
});
