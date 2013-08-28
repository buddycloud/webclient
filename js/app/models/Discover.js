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
  var DiscoverCollection = require('models/DiscoverCollection');

  var Discover = ModelBase.extend({
    constructor: function(username) {
      ModelBase.call(this);
      this.username = username;
      this.mostActive = new DiscoverCollection(api.url('most_active'));
      this.recommendations = new DiscoverCollection(api.url('recommendations'));
    },

    doDiscover: function() {
      var callback = this._triggerDiscoverCallback();
      this.listenTo(this.mostActive, 'reset', callback);
      this.mostActive.fetch({data: {max:5}, reset: true});
      
      this.listenTo(this.recommendations, 'reset', callback);
      this.recommendations.fetch({data: {max:5, user: this.username}, reset: true});
    },

    _triggerDiscoverCallback: function() {
      var self = this;
      var fetched = [];
      return function(model) {
        fetched.push(model);
        if (_.include(fetched, self.mostActive) &&
            _.include(fetched, self.recommendations)) {
          self.trigger('fetch');
        }
      }
    }
  });

  return Discover;
});
