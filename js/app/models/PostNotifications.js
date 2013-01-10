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
  var Item = require('models/Item')
  var ModelBase = require('models/ModelBase')

  var PostNotifications = ModelBase.extend({
    initialize: function() {
      this.bind('change', this._triggerNewItem);
    },

    _triggerNewItem: function() {
      var item = new Item(this.attributes);
      this.trigger('new', item);
    },

    url: function() {
      return api.url('notifications', 'posts');
    },

    fetch: function(options) {
      // Explicitly set "Accept: application/json"
      // so that we get the JSON representation.
      options = options || {};
      options.headers = options.headers || {};
      options.headers['Accept'] = 'application/json';
      ModelBase.prototype.fetch.call(this, options);
    },

    listen: function(options) {
      if (!this._listening) {
        this._listening = true;
        this._doListen(options);
      }
    },

    _doListen: function(options) {
      options = options || {};
      if (options.credentials && options.credentials.username) {
        var self = this;
        options.complete = function() {
          setTimeout(self._doListen.bind(self, options), 0);
        };
        this.fetch(options);
      }
    }
  });

  return PostNotifications;
});
