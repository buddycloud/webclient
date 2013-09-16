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

  var ModelBase = Backbone.Model.extend({
    fetch: function(options) {
      if (options && options.credentials) {
        options.credentials.addAuthorizationToAjaxOptions(options);
      }
      Backbone.Model.prototype.fetch.call(this, options);
    },

    save: function(attributes, options) {
      if (options && options.credentials) {
        options.credentials.addAuthorizationToAjaxOptions(options);
      }
      Backbone.Model.prototype.save.call(this, attributes, options);
    },

    sync: function(method, model, options) {
      var sync = Backbone.ajaxSync ? Backbone.ajaxSync : Backbone.sync;
      sync.call(this, method, model, options);
    }
  });

  return ModelBase;
});
