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
  var Backbone = require('backbone');
  var ChannelFollowers = require('models/ChannelFollowers');
  var ChannelItems = require('models/ChannelItems');
  var ChannelMetadata = require('models/ChannelMetadata');
  var ModelBase = require('models/ModelBase');

  var Channel = ModelBase.extend({
    constructor: function(name) {
      ModelBase.call(this);
      this.name = name;
      this.followers = new ChannelFollowers(name);
      this.metadata = new ChannelMetadata(name);
      this.items = new ChannelItems(name);
    },

    fetch: function(options) {
      options = _.extend(options || {}, {
        success: this._triggerFetchCallback(),
        error: this._triggerErrorCallback()
      });
      this.followers.fetch(options);
      this.metadata.fetch(options);
      this.items.fetch(options);
    },

    _triggerFetchCallback: function() {
      var self = this;
      var fetched = [];
      return function(model) {
        fetched.push(model);
        if (_.include(fetched, self.followers) &&
            _.include(fetched, self.metadata) &&
            _.include(fetched, self.items)) {
          self.trigger('fetch');
        }
      }
    },

    _triggerErrorCallback: function() {
      var self = this;
      var error = [];
      return function(model, xhr) {
        error.push(model);
        if (_.include(error, self.followers) &&
            _.include(error, self.metadata) &&
            _.include(error, self.items)) {
          self.trigger('error', {status: xhr.status, statusText: xhr.statusText});
        }
      }
    }
  });

  return Channel;
});
