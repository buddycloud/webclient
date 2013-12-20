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
  var ModelBase = require('models/ModelBase');

  var ChannelFollowersRequests = ModelBase.extend({
    constructor: function(channel) {
      ModelBase.call(this);
      this.channel = channel;
    },

    url: function() {
      return api.url(this.channel, 'subscribers', 'posts', 'approve');
    },

    pending: function() {
      return _.where(this.attributes, {subscription: 'pending'});
    },

    // These are workarounds resultant by server issues
    parse: function(resp, xhr) {
      if (typeof(resp) === 'string') {
        return {};
      }

      return resp;
    },

    sync: function(method, model, options) {
      if (method === 'update' || method === 'create') {
        // Always POST only changed attributes
        var changed = model.changedAttributes();
        if (changed) {
          options.data = JSON.stringify([changed] || [{}]);
          options.contentType = 'application/json';
          options.dataType = 'text';
          method = 'create';
        }
      }
      var sync = Backbone.ajaxSync ? Backbone.ajaxSync : Backbone.sync;
      sync.call(this, method, model, options);
    }
  });

  return ChannelFollowersRequests;
});
