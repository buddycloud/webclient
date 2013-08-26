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
  var ModelBase = require('models/ModelBase');
  var ChannelItems = require('models/ChannelItems');
  var SidebarInfoCollection = require('models/SidebarInfoCollection');

  var Sync = ModelBase.extend({
    constructor: function() {
      ModelBase.call(this);
      this.channelItems = {};
      this.sidebarInfo = new SidebarInfoCollection();
      this.listenTo(this, 'sync', this._saveItems);
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

      if (_.isEmpty(channels)) {
         this._triggerSyncCallback();
      } else {
        for (var i in channels) {
          var self = this;
          var items = this.get(channels[i]);
          items.forEach(function(item) {
            item = new Item(item);
            self.listenToOnce(item, 'sync', afterCallback);
            item.save(null, {syncWithServer: false});
          });
        }
      }

    },

    _triggerSyncCallback: function() {
      Events.trigger('syncSuccess');
    },

    fetch: function(options) {
      // First, init the unread counters to avoid possible race conditions
      if (this.sidebarInfo.useIndexedDB && !this.sidebarInfo.isReady()) {
        this.listenToOnce(this.sidebarInfo, 'error reset', this._fetch(options));
        this.sidebarInfo.fetch({conditions: {'user': this.get('username')}, reset: true});
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

    parseSidebarInfo: function(channel, items) {
      var username = this.get('username');
      this.sidebarInfo.parseItems(username, channel, items);
    },

    _insertSource: function(channel, items) {
      items.forEach(function(item) {
        item['source'] = channel;
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
          self._insertSource(channel, items);

          result[channel] = items;

          // Parse counters
          self.parseSidebarInfo(channel, items);
        });

        return result;
      }
      return resp;
    }
  });

  return Sync;
});
