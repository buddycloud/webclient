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
  var ModelBase = require('models/ModelBase')

  var ChannelMetadata = ModelBase.extend({
    constructor: function(channel) {
      ModelBase.call(this);
      this.channel = channel;
    },

    url: function() {
      return api.url(this.channel, 'metadata', 'posts');
    },

    avatarUrl: function(size) {
      return api.avatarUrl(this.channel, size);
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

    sync: function(method, model, options) {
      if (method === 'update') {
        // Always POST
        method = 'create';
      }
      Backbone.sync.call(this, method, model, options);
    }
  });

  return ChannelMetadata;
});
