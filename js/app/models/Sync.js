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
  var api = require('models/util/api');
  var CollectionBase = require('models/CollectionBase');
  var instance = null;

  var Sync = CollectionBase.extend({
    constructor: function(user) {
      if (instance !== null) {
        throw new Error("Cannot instantiate more than one Sync, use Sync.getInstance()");
      } 

      CollectionBase.call(this);
      this.user = user;
    },

    url: function() {
      return api.url('sync');
    },

    doSync: function() {
      var query = {max: 20};
      this.fetch({data: query, credentials: this.user.credentials}); 
    }
  });

  Sync.getInstance = function(user) {
    if (instance === null) {
      instance = new Sync(user);
    }

    return instance;
  };

  return Sync;
});
