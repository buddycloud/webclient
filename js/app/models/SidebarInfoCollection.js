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
  require('backbone-indexeddb');

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

    parseItems: function(username, channel, items) {
      var self = this;
      var totalCount = items.length;
      var mentionsCount = 0;
      var userPosts = [];
      var replies = {};
      var mostRecent;

      var sidebarInfo = this._getSidebarInfo(channel);
      if (sidebarInfo) {
        mostRecent = dateUtils.toMillis(sidebarInfo.get('info').updated);
      }

      items.forEach(function(item) {
        var updated = dateUtils.toMillis(item.updated);
        if (!mostRecent || updated > mostRecent) {
          mostRecent = updated;
        }

        self._checkAuthor(item, username, userPosts, replies);
        mentionsCount = self._checkMention(item, username, mentionsCount);
      });
      var repliesCount = this._countReplies(userPosts, replies);
      var updated = new Date(mostRecent).toISOString();
      
      this._setInfo(username, channel, this._buildInfo(mentionsCount, totalCount, 
        repliesCount, updated));
    },

    _checkAuthor: function(item, username, userPosts, replies) {
      if (item.replyTo) {
        if (replies[item.replyTo]) {
          replies[item.replyTo] += 1;
        } else {
          replies[item.replyTo] = 1;
        }
      } else {
        // Posts from this user
        if (item.author === username) {
          userPosts.push(item.id);
        }
      }
    },

    _checkMention: function(item, username, mentionsCount) {
      var content = item.content;
      if (content) {
        var mentions =  linkify.mentions(content) || [];
        mentions.forEach(function(mention) {
          if (mention === username) {
            mentionsCount++;
          }
        });
      }

      return mentionsCount;
    },

    _countReplies: function(posts, replies) {
      var repliesCount = 0;
      posts.forEach(function(post) {
        repliesCount += replies[post];
      });

      return repliesCount;
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
      return this._buildInfo(0, 0, 0, new Date(1970, 0, 1).toISOString());
    },

    _buildInfo: function(mentions, total, replies, updated) {
      return {
        'mentions': mentions,
        'total': total,
        'replies': replies,
        'updated': updated
      };
    },

    _buildSidebarInfo: function(user, channel, info) {
      return {
        'user': user,
        'channel': channel,
        'info': info
      };
    },

    resetCounters: function(user, channel) {
      if (this.useIndexedDB) {
        var sidebarInfo = this._getSidebarInfo(channel);
        if (sidebarInfo) {
          sidebarInfo.set({'info': this._emptyInfo()});
          this.create(sidebarInfo);
        }
      } else {
        var counter = this._emptyInfo();
        this._info[channel] = counter;
      }
    },

    _setInfo: function(user, channel, info) {
      if (this.useIndexedDB) {
        var sidebarInfo = this._getSidebarInfo(channel);
        if (sidebarInfo) {
          var oldInfo = sidebarInfo.get('info');

          var newInfo = this._buildInfo(
            oldInfo.mentions + info.mentions,
            oldInfo.total + info.total,
            oldInfo.replies + info.replies,
            info.updated
          );
          sidebarInfo.set({'info': newInfo});
        } else {
          sidebarInfo = this._buildSidebarInfo(user, channel, info);
        }
        this.create(sidebarInfo);
      } else {
        var oldInfo = this._info[channel] || this._emptyInfo();
        var newInfo = this._buildInfo(
          oldInfo.mentions + info.mentions,
          oldInfo.total + info.total,
          oldInfo.replies + info.replies,
          info.updated
        );
        this._info[channel] = newInfo;
      }
    }

  });

  return SidebarInfoCollection;
});
