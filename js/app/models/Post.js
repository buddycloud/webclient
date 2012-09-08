/*
 * Copyright 2012 Denis Washington <denisw@online.de>
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

define(function(require) {
  var Backbone = require('backbone');

  var Post = Backbone.Model.extend({
    author: function() {
      return this.get('author');
    },

    published: function() {
      return this.get('published');
    },

    updated: function() {
      return this.get('updated') || this.get('published');
    },

    replyTo: function() {
      return this.get('replyTo');
    },

    content: function() {
      return this.get('content');
    },

    parse: function(resp, xhr) {
      var location;
      if (xhr && (location = xhr.getResponseHeader('Location'))) {
        this.set('id', location.substr(location.lastIndexOf('/')+1));
        this.set('author', sessionStorage.username);
      }
      return resp;
    }
  });

  return Post;
});