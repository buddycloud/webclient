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
  var CollectionBase = require('models/CollectionBase');
  var MetadataSearchResult = require('models/MetadataSearchResult');

  var DiscoverCollection = CollectionBase.extend({
    model: MetadataSearchResult,

    constructor: function(discoverUrl) {
      CollectionBase.call(this);
      this.discoverUrl = discoverUrl;
    },

    url: function() {
      return this.discoverUrl;
    },

    doDiscover: function(query, callback, credentials) {
      query = _.extend({max: 5}, query);
      // TODO Local discover
      this.fetch({data: query, credentials: credentials, success: callback});
    },

    parse: function(resp, xhr) {
      if (typeof(resp) === 'object' && resp.rsm && resp.items) {
        this.index = resp.rsm.index;
        this.count = resp.rsm.count;
        return resp.items;
      } else {
        return resp;
      }
    }
  });

  return DiscoverCollection;
});
