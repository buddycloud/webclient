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
      return -item.update;
    },

    _itemAdded: function(item, collection, options) {
      if (item.isPost()) {
        this.trigger('addPost', item);
      } else {
        var post = this.get(item.replyTo);
        if (post) {
          post.set('updated', item.updated);
          post.comments.push(item);
          post.trigger('addComment', post, options);
        }
      }
    },

    threadsUrl: function() {
      return api.url(this.channel, 'content', 'posts', 'threads');
    },

    defaultUrl: function() {
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
      options.url = this.threadsUrl();
      options.headers = options.headers || {};
      options.headers['Accept'] = 'application/json';
      CollectionBase.prototype.fetch.call(this, options);
    },

    posts: function() {
      return this.filter(function(item) {
        return item.isPost();
      });
    },

    parse: function(response, options) {
      var parsed = [];
      response.forEach(function(resp) {
        var post;
        var comments = [];
        for (var i in resp.items) {
          var item = resp.items[i];
          if (item.replyTo) {
            comments.push(item);
          } else {
            post = item;
          }
        }

        if (post) {
          post.updated = resp.updated;
          post.comments = comments;
          parsed.push(post);
        }
      });

      return parsed;
    },

    create: function(attributes, options) {
      options = _.defaults((options || {}), {url: this.defaultUrl()});
      return CollectionBase.prototype.create.call(this, attributes, options);
    },
  });

  return ChannelItems;
});
