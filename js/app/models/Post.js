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
    set: function(attrs) {
      Backbone.Model.prototype.set.call(this, attrs, {silent: true});
      this.author = attrs.author || this.get('author');
      this.published = attrs.published || this.get('published');
      this.updated = attrs.updated || this.get('updated');
      this.replyTo = attrs.replyTo || this.get('replyTo');
      this.content = attrs.content || this.get('content');
      this.change();
    }
  });

  return Post;
});