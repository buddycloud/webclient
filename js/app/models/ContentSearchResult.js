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

  var ContentSearchResult = ModelBase.extend({
    authorAvatarUrl: function(size) {
      return api.avatarUrl(this.author(), size);
    },

    author: function() {
      return this.get('author');
    },

    content: function() {
      return this.get('content');
    },

    published: function() {
      return this.get('published');
    },

    updated: function() {
      return this.get('updated') || this.get('published');
    }
  });

  return ContentSearchResult;
});
