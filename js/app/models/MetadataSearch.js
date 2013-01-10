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
  var CollectionBase = require('models/CollectionBase');
  var MetadataSearchResult = require('models/MetadataSearchResult');

  var MetadataSearch = CollectionBase.extend({
    model: MetadataSearchResult,

    constructor: function() {
      CollectionBase.call(this);
    },

    url: function() {
      return api.url('search');
    },

    doSearch: function(query, callback) {
      if (query.q) {
        query = _.extend({type: 'metadata', max: 5}, query);
        this.fetch({data: query, success: callback});
      }
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

  return MetadataSearch;
});
