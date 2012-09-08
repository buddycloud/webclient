/*
 * Copyright 2012 Denis Washington <denisw@online.de>
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
  var _ = require('underscore');
  var api = require('app/util/api');
  var Backbone = require('backbone');

  var SubscribedChannels = Backbone.Model.extend({
    constructor: function() {
      Backbone.Model.call(this);
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

    subscribe: function(channel, node, credentials) {
      var self = this;
      this.set(channel + '/' + node, 'publisher', {silent: true})
      this._saveChangedAttributes(credentials, function() {
        self.trigger('sync');
      });
    },

    unsubscribe: function(channel, node, credentials) {
      var self = this;
      var channelAndNode = channel + '/' + node;
      this.set(channelAndNode, 'none', {silent: true})
      this._saveChangedAttributes(credentials, function() {
        self.fetch();
        self.trigger('sync');
      });
    },

    _saveChangedAttributes: function(credentials, callback) {
      this.save({},
      {
        headers: {'Authorization': credentials.toAuthorizationHeader()},
        xhrFields: {withCredentials: true},
        silent: true,
        success: callback
      });
    },

    sync: function(method, model, options) {
      if (method === 'update' || method === 'create') {
        // always POST only changed attributes
        var changed = model.changedAttributes();
        if (changed) {
          options.data = JSON.stringify(changed || {});
          options.contentType = 'application/json';
          options.dataType = 'text';
          method = 'create';
        }
      }

      Backbone.sync.call(this, method, model, options);
    }
  });

  return SubscribedChannels;
});
