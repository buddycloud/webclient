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
  var UnreadCounter = require('models/UnreadCounter');
  var UnreadCountersData = require('models/db/UnreadCountersData');
  require('backbone-indexeddb');

  var UnreadCounters = Backbone.Collection.extend({
  	model: UnreadCounter,
    database: UnreadCountersData,
    storeName: UnreadCountersData.id,

    unreadCounts: function() {
      var counters = {};

      this.models.forEach(function(unreadCount) {
	    	var channel = unreadCount.get('channel');
	    	var counter = unreadCount.get('counter');
      	if (channel && counter) {
          counters[channel] = counter;
      	}
      });

      return counters;
    },

    getUnreadCount: function(channel) {
      var temp = this.where({'channel': channel});
      // Unread counters should be unique
      return temp.length === 1 ? temp[0] : null;
    }
  });

  return UnreadCounters;
});
