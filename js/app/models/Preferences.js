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

  var Preferences = ModelBase.extend({

    url: function() {
      return api.url('notification_settings');
    },

    parse: function(resp, xhr) {
      // FIXME: only handling one email
      resp = resp[0] || {}

      if (!resp.target) {
        // Workaround for old accounts (without email)
        this.trigger('change')
      }

      return resp
    },

    sync: function(method, model, options) {
      if (method === 'update') {
        // always POST
        method = 'create';
      }
      var sync = Backbone.ajaxSync ? Backbone.ajaxSync : Backbone.sync;
      sync.call(this, method, model, options);
    }
  });

  return Preferences;
});
