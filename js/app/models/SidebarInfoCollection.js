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

    _emptyInfo: function(postsLastWeek, hitsLastWeek) {
      return this._buildInfo(0, 0, 0, postsLastWeek || [], hitsLastWeek || []);
    },

    _buildInfo: function(mentionsCount, totalCount, repliesCount, postsLastWeek, hitsLastWeek) {
      return {
        'mentionsCount': mentionsCount,
        'totalCount': totalCount,
        'repliesCount': repliesCount,
        'postsLastWeek': postsLastWeek,
        'hitsLastWeek': hitsLastWeek
      };
    },

    _buildSidebarInfo: function(user, channel, info) {
      return {
        'user': user,
        'channel': channel,
        'info': info
      };
    },

    _filterLastWeek: function(toFilter) {
      var lastWeek = dateUtils.lastWeekDate();
      var idx = 0;
      while (toFilter[idx] < lastWeek) {
        toFilter.splice(idx, 1);
        idx++;
      }

      return toFilter;
    },

    _checkMentions: function(user, item) {
      var mentionsCount = 0;
      var mentions =  linkify.mentions(item.content) || [];
      mentions.forEach(function(mention) {
        if (mention === user) {
          mentionsCount++;
        }
      });

      return mentionsCount;
    },

    parseItem: function(user, item) {
      var info = this._emptyInfo();
      var lastWeek =  dateUtils.lastWeekDate();
      var updated = dateUtils.utcDate(item.updated);
      if (updated > lastWeek) {
        info.postsLastWeek.push(updated);
      }

      if (item.author !== user) {
        info.mentionsCount = this._checkMentions(user, item);
        info.totalCount++;
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

    _updateInfo: function(cachedInfo, newInfo) {
      cachedInfo.mentionsCount += newInfo.mentionsCount;
      cachedInfo.totalCount += newInfo.totalCount;
      cachedInfo.repliesCount += newInfo.repliesCount;
      cachedInfo.postsLastWeek = this._filterLastWeek(cachedInfo.postsLastWeek || []);
      cachedInfo.hitsLastWeek = this._filterLastWeek(cachedInfo.hitsLastWeek || []);
    },

    _setIndexedDBInfo: function(user, channel, info) {
      var sidebarInfo = this._getSidebarInfo(channel);
      if (sidebarInfo) {
        var cachedInfo = sidebarInfo.get('info');
        if (info) {
          cachedInfo.postsLastWeek.concat(info.postsLastWeek);
          this._updateInfo(cachedInfo, info);
          sidebarInfo.set({'info': cachedInfo});
        } else {
          cachedInfo.hitsLastWeek.push(dateUtils.toUTCDate(dateUtils.now()));
          cachedInfo.hitsLastWeek = this._filterLastWeek(cachedInfo.hitsLastWeek || []);
          cachedInfo.postsLastWeek = this._filterLastWeek(cachedInfo.postsLastWeek || []);
          sidebarInfo.set({'info': this._emptyInfo(cachedInfo.postsLastWeek, cachedInfo.hitsLastWeek)});
        }
      } else {
        sidebarInfo = this._buildSidebarInfo(user, channel, info || this._emptyInfo());
      }
      this.create(sidebarInfo);
    },

    _setInfo: function(user, channel, info) {
      var cachedInfo = this._info[channel] || this._emptyInfo();
      if (info) {
        cachedInfo.postsLastWeek.concat(info.postsLastWeek);
        this._updateInfo(cachedInfo, info);
        this._info[channel] = cachedInfo;
      } else {
        cachedInfo.hitsLastWeek.push(dateUtils.toUTCDate(dateUtils.now()));
        this._info[channel] = this._emptyInfo(
          this._filterLastWeek(cachedInfo.postsLastWeek || []),
          this._filterLastWeek(cachedInfo.hitsLastWeek || [])
        );
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
