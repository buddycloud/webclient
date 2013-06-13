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
  var _ = require('underscore');
  var api = require('util/api');
  var Backbone = require('backbone');
  var Events = Backbone.Events;
  var ModelBase = require('models/ModelBase');

  var ChannelStatus = ModelBase.extend({
    constructor: function(channel) {
      ModelBase.call(this);
      this.channel = channel;
      this.bind('sync', this._onSync, this);
    },

    _onSync: function() {
      Events.trigger('statusChanged', this.channel, this.get('content'));
    },

    url: function() {
      return api.url(this.channel, 'content', 'status');
    },

    fetch: function(options) {
      // Explicitly set "Accept: application/json"
      // so that we get the JSON representation.
      options = options || {};
      options.headers = options.headers || {};
      options.headers['Accept'] = 'application/json';

      // Explicitly set max=1
      options.data = options.data || {};
      options.data['max'] = 1;
      ModelBase.prototype.fetch.call(this, options);
    }
  });

  return ChannelStatus;
});
