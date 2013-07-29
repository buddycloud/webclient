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
  var Item = require('models/Item');
  var linkify = require('util/linkify');
  var ModelBase = require('models/ModelBase');
  var ChannelItems = require('models/ChannelItems');
  var UnreadCounters = require('models/UnreadCounters');

  var Sync = ModelBase.extend({
    constructor: function() {
      ModelBase.call(this);
      this.channelItems = {};
      this.unreadCounters = new UnreadCounters();
      this.on('change', this._saveItems, this);
    },

    _itemsSize: function(channels) {
      var total = 0;
      for (var i in channels) {
        var items = this.get(channels[i]);
        total += items.length;
      }

      return total;
    },

    _saveItems: function() {
      var channels = _.keys(_.omit(this.attributes, 'username'));
      var afterCallback = _.after(this._itemsSize(channels), this._triggerSyncCallback);

      for (var i in channels) {
        var items = this.get(channels[i]);
        items.forEach(function(item) {
          item = new Item(item);
          item.once('sync', afterCallback);
          item.save(null, {syncWithServer: false});
        });
      }
    },

    _triggerSyncCallback: function() {
      Events.trigger('syncSuccess');
    },

    fetch: function(options) {
      // First, init the unread counters to avoid possible race conditions
      if (this.unreadCounters.useIndexedDB && !this.unreadCounters.isReady()) {
        this.unreadCounters.once('error reset', this._fetch(options), this);
        this.unreadCounters.fetch({conditions: {'user': this.username}, reset: true});
      } else {
        ModelBase.prototype.fetch.call(this, options);
      }
    },

    _fetch: function(options) {
      var self = this;
      return function() {
        ModelBase.prototype.fetch.call(self, options);
      }
    },

    url: function() {
      return api.url('sync');
    },

    parseCounters: function(channel, items) {
      var totalCount = items.length;
      var mentionsCount = 0;
      var username = this.get('username');

      items.forEach(function(value) {
        var content = value.content;
        if (content) {
          var mentions =  linkify.mentions(content) || [];
          mentions.forEach(function(mention) {
            if (mention === username) {
              mentionsCount++;
            }
          });
        }
      });

      this.unreadCounters.increaseCounters(username, channel, mentionsCount, totalCount);
    },

    _insertChannel: function(channel, items) {
      items.forEach(function(item) {
        item['channel'] = channel;
      });

      return items;
    },

    parse: function(resp, xhr) {
      // This typeof(resp) === 'string') comparison is necessary
      // because the HTTP API returns a plain text and Backbone
      // parses it like an attribute
      if (typeof(resp) === 'string') {
        return {};
      } else if (typeof(resp) === 'object') {
        var result = {};

        var self = this;
        _.each(resp, function(items, node) {
          var channel = node.split('/')[2];
          self._insertChannel(channel, items);

          result[channel] = items;

          // Parse counters
          self.parseCounters(channel, items);
        });

        return result;
      }
      return resp;
    }
  });

  return Sync;
});
