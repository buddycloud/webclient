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
  var ModelBase = require('models/ModelBase');

  var SubscribedChannels = ModelBase.extend({
    constructor: function() {
      ModelBase.call(this);
    },

    url: function() {
      return api.url('subscribed');
    },

    channels: function() {
      var nodes = _.keys(this.attributes);
      var channelsList = _.map(nodes, function(node) {
        return node.split('/')[0];
      });
      return _.uniq(channelsList);
    },

    role: function(channel) {
      var postsNode = channel + '/posts';
      return this.attributes[postsNode];
    },

    isModerator: function(channel) {
      var postsNode = channel + '/posts';
      var affiliation = this.attributes[postsNode];
      return affiliation === 'moderator';
    },

    isOwner: function(channel) {
      var postsNode = channel + '/posts';
      var affiliation = this.attributes[postsNode];
      return affiliation === 'owner';
    },

    isPostingAllowed: function(channel) {
      var postsNode = channel + '/posts';
      var affiliation = this.attributes[postsNode];
      return _.include(['owner', 'moderator', 'publisher'], affiliation);
    },

    isDeletingAllowed: function(channel) {
      var postsNode = channel + '/posts';
      var affiliation = this.attributes[postsNode];
      return _.include(['owner', 'moderator'], affiliation);
    },

    addChannel: function(channel, node, role, extra) {
      this.set(channel + '/' + node, role, {silent: true});
      this.trigger('subscriptionSync', 'subscribedChannel', channel, role, extra);
    },

    _triggerSubscribedEvent: function(channel, role, extra) {
      var self = this;
      return function() {
        self.trigger('subscriptionSync', 'subscribedChannel', channel, role, extra);
      }
    },

    subscribe: function(channel, nodes, role, credentials, extra) {
      for (var i in nodes) {
        this.set(channel + '/' + nodes[i], role, {silent: true});
      }
      this.bind('sync', this._triggerSubscribedEvent(channel, role, extra), this);
      this.save(null, {'credentials': credentials});
    },

    _triggerUnsubscribedEvent: function(channel) {
      var self = this;
      return function () {
        for (var attr in self.attributes) {
          if (channel === attr.split('/')[0]) {
            self.unset(attr);
          }
        }
        self.trigger('subscriptionSync', 'unsubscribedChannel', channel);
      }
    },

    unsubscribe: function(channel, credentials) {
      for (var attr in self.attributes) {
        if (channel === attr.split('/')[0]) {
           this.set(attr, 'none', {silent: true});
        }
      }
      this.bind('sync', this._triggerUnsubscribedEvent(channel), this);
      this.save(null, {'credentials': credentials});
    },

    parse: function(resp, xhr) {
      // This typeof(resp) === 'string') comparison is necessary
      // because the HTTP API returns a plain text and Backbone
      // parses it like an attribute
      if (typeof(resp) === 'string') {
        return {};
      } else if (typeof(resp) === 'object') {
        var result = {};
        _.each(resp, function(value, node) {
          if (node.indexOf('/posts') !== -1) {
            result[node] = value;
          }
        });
        return result;
      }
      return resp;
    },

    sync: function(method, model, options) {
      if (method === 'update' || method === 'create') {
        // Always POST only changed attributes
        var changed = model.changedAttributes();
        if (changed) {
          options.data = JSON.stringify(changed || {});
          options.contentType = 'application/json';
          options.dataType = 'text';
          method = 'create';
        }
      }
      var sync = Backbone.ajaxSync ? Backbone.ajaxSync : Backbone.sync;
      sync.call(this, method, model, options);
    }
  });

  return SubscribedChannels;
});