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

  var CollectionBase = Backbone.Collection.extend({
    fetch: function(options) {
      if (options && options.credentials) {
        options.credentials.addAuthorizationToAjaxOptions(options);
      }
      Backbone.Collection.prototype.fetch.call(this, options);
    },

    save: function(attributes, options) {
      if (options && options.credentials) {
        options.credentials.addAuthorizationToAjaxOptions(options);
      }
      Backbone.Collection.prototype.save.call(this, attributes, options);
    },

    create: function(attributes, options) {
      if (options && options.credentials) {
        options.credentials.addAuthorizationToAjaxOptions(options);
      }
      return Backbone.Collection.prototype.create.call(this, attributes, options);
    },

    _adjustOptions: function(options) {
      if (options && options.credentials) {
        return _.extend(options, credentials.asAjaxOptions());
      } else {
        return options;
      }
    }
  });

  return CollectionBase;
});
