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
  var Events = Backbone.Events;
  var CollectionBase = require('models/CollectionBase');
  var indexedDB = require('util/indexedDB');
  var Item = require('models/Item');
  var PostsDB = require('models/db/PostsDB');
  require('backbone-indexeddb');

  var ChannelItems = CollectionBase.extend({
    model: Item,
    database: PostsDB,
    storeName: PostsDB.id,

    constructor: function(channel) {
      CollectionBase.call(this);
      this.channel = channel;
      this._fetched = false;
      this._useIndexedDB = indexedDB.isSuppported();
      this.bind('add', this._itemAdded, this);
      this.once('fetch', this._onFetch, this);
      Events.on('subscriptionSync', this._storeModels, this);
    },

    _storeModels: function(action) {
      if (action == 'subscribedChannel') {
        var channel = this.channel;
        this.models.forEach(function(item) {
          item.set('channel', channel, {silent: true});
          item.save(null, {silent: true, syncWithServer: false});
        });
      }
    },

    isReady: function() {
      return this._fetched;
    },

    _onFetch: function() {
      this._fetched = true;
    },

    comparator: function(item) {
      return -item.lastUpdated();
    },

    _itemAdded: function(item) {
      if (item.isPost()) {
        this.trigger('addPost', item);
      } else {
        var post = this.get(item.replyTo);
        if (post) {
          post.comments.push(item);
          post.trigger('addComment', post);
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
      options.conditions = {channel: this.channel};
      
      var data = options.data;
      if (data) {
        if (data.max) {
          options.limit = data.max;
        }

        if (data.after) {
          options.offset = this.models.length;
        }
      }

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
    },

    _syncServerCallback: function(method, model, options) {
      var self = this;
      return function() {
        self._syncServer(method, model, options);
      };
    },

    _triggerFetchCallback: function(options) {
      var self = this;
      options = options || {};
      var callback = options.complete;
      options.complete = function() {
        self.trigger('fetch');
        if (callback) {
          callback();
        }
      };
    },

    _onSync: function(method, model, options) {
      var self = this;
      return function() {
        if (_.isEmpty(self.models)) {
          // If is empty, try to get posts from server
          self._triggerFetchCallback(options);
          self._syncServer(method, model, options);
        } else {
          self.trigger('fetch');
        }
      }
    },

    _syncIndexedDB: function(method, model, options) {
      var opt = _.clone(options);
      if (method === 'read') {
        this.once('sync', this._onSync(method, model, options), this);
      } else {
        this.once('sync', this._syncServerCallback(method, model, options), this);
      }

      Backbone.sync.call(this, method, model, options);
    },

    _syncServer: function(method, model, options) {
      var sync = Backbone.ajaxSync ? Backbone.ajaxSync : Backbone.sync;
      sync.call(this, method, model, options);
    },

    sync: function(method, model, options) {
      if (this._useIndexedDB) {
        this._syncIndexedDB(method, model, options);
      } else {
        this._syncServer(method, model, options);
      }
    }
  });

  return ChannelItems;
});
