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

    _lastWeekDate: function() {
      var weekInMillis = 7*(24*60*(60*1000));
      var now = dateUtils.toUTCDate(dateUtils.now());
      return now - weekInMillis;
    },

    _filterLastWeek: function(toFilter) {
      var lastWeek =  this._lastWeekDate();
      var idx = 0;
      while (toFilter[idx] < lastWeek) {
        toFilter.splice(idx, 1);
        idx++;
      }

      return toFilter;
    },

    resetCounters: function(user, channel) {
      if (this.useIndexedDB) {
        var sidebarInfo = this._getSidebarInfo(channel);
        if (sidebarInfo) {
          var oldInfo = sidebarInfo.get('info');
          oldInfo.hitsLastWeek.push(dateUtils.toUTCDate(dateUtils.now()));

          sidebarInfo.set({
            'info': this._buildInfo(
              0, 0, 0,
              this._filterLastWeek(oldInfo.postsLastWeek || []),
              this._filterLastWeek(oldInfo.hitsLastWeek || [])
            )
          });
          this.create(sidebarInfo);
        }
      } else {
        var oldInfo = this._info[channel] || this._emptyInfo();
        this._info[channel] = this._buildInfo(
          0, 0, 0,
          this._filterLastWeek(oldInfo.postsLastWeek || []),
          this._filterLastWeek(oldInfo.hitsLastWeek || [])
        );
      }
    },

    setInfo: function(user, channel, info) {
      if (this.useIndexedDB) {
        var sidebarInfo = this._getSidebarInfo(channel);
        if (sidebarInfo) {
          var oldInfo = sidebarInfo.get('info');
          oldInfo.postsLastWeek.concat(info.postsLastWeek);

          var newInfo = this._buildInfo(
            oldInfo.mentionsCount + info.mentionsCount,
            oldInfo.totalCount + info.totalCount,
            oldInfo.repliesCount + info.repliesCount,
            this._filterLastWeek(oldInfo.postsLastWeek || []),
            this._filterLastWeek(oldInfo.hitsLastWeek || [])
          );
          sidebarInfo.set({'info': newInfo});
        } else {
          sidebarInfo = this._buildSidebarInfo(user, channel, info);
        }
        this.create(sidebarInfo);
      } else {
        var oldInfo = this._info[channel] || this._emptyInfo();
        oldInfo.postsLastWeek.concat(info.postsLastWeek);

        var newInfo = this._buildInfo(
          oldInfo.mentionsCount + info.mentionsCount,
          oldInfo.totalCount + info.totalCount,
          oldInfo.repliesCount + info.repliesCount,
          this._filterLastWeek(oldInfo.postsLastWeek || []),
          this._filterLastWeek(oldInfo.hitsLastWeek || [])
        );
        this._info[channel] = newInfo;
      }
    }

  });

  return SidebarInfoCollection;
});
