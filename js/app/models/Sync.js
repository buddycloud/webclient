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
      this.listenTo(this, 'error sync', this._begin);
    },

    _begin: function() {
      var channels = _.keys(_.omit(this.attributes, 'username'));

      if (!_.isEmpty(channels)) {
        var mostRecent;
        
        for (var i in channels) {
          var channel = channels[i];
          var info = this.get(channel);

          postsLastWeek = [];
          for (var j in info.postsThisWeek) {
            var date = new Date(info.postsThisWeek[j]);
            if (!mostRecent || date > mostRecent) {
              mostRecent = date;
            }
            postsLastWeek.push(date);
          }

          info['postsLastWeek'] = postsLastWeek; // Maintain old property name
          info['hitsLastWeek'] = [];
          this.sidebarInfo.setInfo(this.get('username'), channel, info);
        }

        if (mostRecent) {
          Events.trigger('updateLastSession', mostRecent.toISOString());
        }
      }

      this._triggerSyncCallback();
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
      };
    },

    url: function() {
      return api.url('sync');
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
        _.each(resp, function(info, node) {
          var channel = node.split('/')[2];
          result[channel] = info;
        });

        return result;
      }
      return resp;
    }
  });

  return Sync;
});
