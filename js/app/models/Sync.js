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
  var Item = require('models/Item');

  var Sync = ModelBase.extend({
    constructor: function() {
      ModelBase.call(this);
    },

    url: function() {
      return api.url('sync');
    },

    counters: function() {
      var result = {};
      _.each(this.attributes, function(value, node) {
        result[node.split('/')[2]] = value;
      });

      return result;
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
          result[node] = value;
        });
        return result;
      }
      return resp;
    }
  });

  return Sync;
});
