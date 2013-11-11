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
  var dateUtils = require('util/dateUtils');
  var CollectionBase = require('models/CollectionBase');
  var Item = require('models/Item');

  var ChannelItems = CollectionBase.extend({
    model: Item,

    constructor: function(channel) {
      CollectionBase.call(this);
      this.channel = channel;
      this._fetched = false;
      this.listenTo(this, 'add', this._itemAdded);
      this.listenToOnce(this, 'reset', this._onReset);
      this.listenTo(this, 'sort', this._onSort);
    },

    isReady: function() {
      return this._fetched;
    },

    _onReset: function() {
      this._fetched = true;
    },

    comparator: function(item) {
      return -item.lastUpdated();
    },

    _itemAdded: function(item, collection, options) {
      if (item.isPost()) {
        this.trigger('addPost', item);
      } else {
        var post = this.get(item.replyTo);
        if (post) {
          post.comments.push(item);
          post.trigger('addComment', post, options);
        }
      }
    },

    url: function() {
      return api.url(this.channel, 'content', 'posts');
    },

    lastItem: function() {
      var last = _.last(this.models);
      return last ? last.id : null;
    },

    fetch: function(options) {
      // Explicitly set "Accept: application/json" so that we get the
      // JSON representation instead of an Atom feed.
      options = options || {};
      options.headers = options.headers || {};
      options.headers['Accept'] = 'application/json';
      CollectionBase.prototype.fetch.call(this, options);
    },

    posts: function() {
      return this.filter(function(item) {
        return item.isPost();
      });
    },

    _compareItems: function(a, b) {
      aUpdated = dateUtils.utcDate(a.updated);
      bUpdated = dateUtils.utcDate(b.updated);

      if (aUpdated > bUpdated) return 1;
      if (aUpdated < bUpdated) return -1;

      return 0;
    },

    parse: function(response, options) {
      // Cluster all comments by poster id
      var comments = {};
      response.forEach(function(item) {
        if (item.replyTo) {
          var postId = item.replyTo;
          comments[postId] = comments[postId] || [];
          comments[postId].push(item);
        }
      });

      var self = this;
      // Add comments to posts
      response.forEach(function(item) {
        if (!item.replyTo) {
          var itemComments = comments[item.id];
          if (itemComments) {
            itemComments.sort(self._compareItems);
            item.comments = itemComments;
          }
        }
      });

      return response;
    },

    byThread: function() {
      var incompleteThreads = {};
      var completeThreads = [];

      // Note that the items returned by the buddycloud
      // API are sorted from newest to oldest.
      this.models.forEach(function(item) {
        var threadId = item.get('replyTo') || item.get('id');
        var thread = incompleteThreads[threadId];
        if (!thread) {
          thread = incompleteThreads[threadId] = [];
        }
        thread.unshift(item);
        if (!item.get('replyTo')) { // is top-level post
          completeThreads.push(thread);
          delete incompleteThreads[threadId];
        }
      });

      return completeThreads;
    }
  });

  return ChannelItems;
});
