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
  var indexedDB = require('util/indexedDB');
  var ModelBase = require('models/ModelBase');
  var ChannelMetadataDB = require('models/db/ChannelMetadataDB');
  require('backbone-indexeddb');

  var ChannelMetadata = ModelBase.extend({
    database: ChannelMetadataDB,
    storeName: ChannelMetadataDB.id,

    constructor: function(channel) {
      ModelBase.call(this);
      this.channel = channel;
      this.set({'channel': channel}, {silent: true});
    },

    initialize: function() {
      this._useIndexedDB = this._syncWithServer = indexedDB.isSuppported();
    },

    url: function() {
      return api.url(this.channel, 'metadata', 'posts');
    },

    avatarUrl: function(size) {
      return api.avatarUrl(this.channel, size);
    },

    channel: function() {
      return this.get('channel');
    },

    title: function() {
      return this.get('title');
    },

    description: function() {
      return this.get('description') || '';
    },

    creationDate: function() {
      return this.get('creation_date');
    },

    channelType: function() {
      return this.get('channel_type');
    },

    accessModel: function() {
      return this.get('access_model');
    },

    defaultAffiliation: function() {
      return this.get('default_affiliation');
    },

    _storeOnDB: function() {
      var self = this;
      return function() {
        self._syncWithServer = false;
        self.save({}, {silent: true, complete: function() {self._syncWithServer = true}});
      }
    },

    _syncServerCallback: function(method, model, options) {
      var self = this;
      return function() {
        self._syncServer(method, model, options)
      }
    },

    _addCallback: function(options, triggerName, callback) {
      var self = this;
      var trigger = options[triggerName];
      options[triggerName] = function() {
        callback();
        if (trigger) {
          trigger.apply(this, arguments);
        }
      }
    },

    _syncIndexedDB: function(method, model, options) {
      if (this._syncWithServer) {
        var opt = _.extend({}, options);
        if (method === 'read') {
          this.once('change', this._storeOnDB());
        }
        this.once('error success', this._syncServerCallback(method, model, options));
      }

      Backbone.sync.call(this, method, model, options);
    },

    _syncServer: function(method, model, options) {
      if (method === 'update') {
        // Always POST
        method = 'create';
      }
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


  return ChannelMetadata;
});
