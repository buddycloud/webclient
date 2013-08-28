/*
 * Copyright 2012 buddycloud
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

define(function(require) {
  var api = require('util/api');
  var Backbone = require('backbone');
  var dateUtils = require('util/dateUtils');
  var indexedDB = require('util/indexedDB');
  var ModelBase = require('models/ModelBase');
  var PostsDB = require('models/db/PostsDB');
  require('backbone-indexeddb');

  var Item = ModelBase.extend({
    database: PostsDB,
    storeName: PostsDB.id,

    initialize: function() {
      this._initializeComments();
      this._defineGetter('author', function() {
        var author = this.get('author');
        if (author) {
          if (author.indexOf('acct:') !== -1) {
            return author.slice('acct:'.length);
          } else {
            return author;
          }
        }
      });
      this._defineGetter('source', function() {
        var source = this.get('source');
        return source ? source.split('/', 2)[0] : undefined;
      });
      this._defineGetter('content', function() {
        return this.get('content') || '';
      });
      this._defineGetter('media', function() {
        return this.get('media') || '';
      });
      this._defineGetter('updated', function() {
        return this.get('updated') || this.published;
      });
      this._defineGetter('replyTo');
      this._defineGetter('published');
      this._defineGetter('id');
      this._useIndexedDB = indexedDB.isSuppported();
    },

    _initializeComments: function() {
      var comments = [];
      _.each(this.attributes.comments || [], function(comment) {
        comments.push(new Item(comment));
      });
      this.comments = comments;
      delete this.attributes.comments;
    },

    _defineGetter: function(name, getter) {
      getter = getter ? _.bind(getter, this) : _.bind(this.get, this, name);
      Object.defineProperty(this, name, {get: getter});
    },

    isPost: function() {
      return !this.replyTo;
    },

    isComment: function() {
      return !this.isPost();
    },

    lastUpdated: function() {
      var updated = dateUtils.toMillis(this.updated);
      this.comments.forEach(function(comment) {
        var updatedComment = dateUtils.toMillis(comment.updated);
        if (updatedComment > updated) {
          updated = updatedComment;
        }
      });

      return updated;
    },

    deleteComment: function(id) {
      for (var i in this.comments) {
        if (this.comments[i].id === id) {
          this.comments.splice(i, 1);
        }
      }
    },

    authorAvatarUrl: function(size) {
      return api.avatarUrl(this.author, size);
    },

    _syncServer: function(method, model, options) {
      var sync = Backbone.ajaxSync ? Backbone.ajaxSync : Backbone.sync;
      sync.call(this, method, model, options);
    },

    _syncIndexedDB: function(method, model, options) {
      if (this._useIndexedDB) {
        Backbone.sync.call(this, method, model, options);
      }
    },

    _syncIndexedDBCallback: function(method, model, options) {
      var self = this;
      return function() {
        self._syncIndexedDB(method, model, options);
      }
    },

    sync: function(method, model, options) {
      if (options.syncWithServer) {
        this.once('sync', this._syncIndexedDBCallback(method, model, options), this);
        this._syncServer(method, model, options);
      } else {
        this._syncIndexedDB(method, model, options);
      }
    }
  });

  return Item;
});
