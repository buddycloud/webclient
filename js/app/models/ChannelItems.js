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
  var CollectionBase = require('models/CollectionBase')
  var Item = require('models/Item');

  var ChannelItems = CollectionBase.extend({
    model: Item,

    constructor: function(channel) {
      CollectionBase.call(this);
      this.channel = channel;
      this.bind('add', this._itemAdded, this);
    },

    _itemAdded: function(item) {
      if (item.isPost()) {
        this.trigger('addPost', item);
      } else {
        var post = this.get(item.replyTo);
        if (post) {
          post.comments.push(item);
          post.trigger('addComment', item, post);
        }
      }
    },

    url: function() {
      return api.url(this.channel, 'content', 'posts');
    },

    lastItem: function() {
      var lastItem = _.last(_.values(this.models));
      return lastItem ? lastItem.id : null;
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

    parse: function(response) {
      var comments = {};
      _.each(response, function(item) {
        if (item.replyTo) {
          var postId = item.replyTo;
          comments[postId] = comments[postId] || [];
          comments[postId].unshift(item);
        } else {
          item.comments = comments[item.id];
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
