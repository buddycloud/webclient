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
  var MetadataSearch = require('models/MetadataSearch');
  var ContentSearch = require('models/ContentSearch');

  var Search = ModelBase.extend({
    constructor: function() {
      ModelBase.call(this);
      this.channels = new MetadataSearch();
      this.posts = new ContentSearch();
    },

    doSearch: function(params) {
      var callback = this._triggerSearchCallback();
      this.channels.doSearch(params, callback);
      this.posts.doSearch(params, callback);
    },

    _triggerSearchCallback: function() {
      var self = this;
      var fetched = [];
      return function(model) {
        fetched.push(model);
        if (_.include(fetched, self.channels) &&
            _.include(fetched, self.posts)) {
          self.trigger('fetch');
        }
      }
    }
  });

  return Search;
});
