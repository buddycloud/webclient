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
  var ChannelFollowers = require('models/ChannelFollowers');
  var ModelBase = require('models/ModelBase');
  var SimilarChannels = require('models/SimilarChannels');

  var Channel = ModelBase.extend({
    constructor: function(name) {
      ModelBase.call(this);
      this.name = name;
      this.similarChannels = new SimilarChannels(name);
      this.followers = new ChannelFollowers(name);
    },

    fetch: function(options) {
      options = _.extend(options || {}, {
        complete: this._triggerFetchCallback()
      });
      this.followers.fetch(options);
      this.similarChannels.fetch(options);
    },

    _triggerFetchCallback: function() {
      var self = this;
      var fetched = [];
      return function(model) {
        fetched.push(model);
        if (_.include(fetched, self.followers) &&
            _.include(fetched, self.similarChannels)) {
          self.trigger('fetch');
        }
      };
    }
  });

  return Channel;
});
