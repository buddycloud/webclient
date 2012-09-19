/*
 * Copyright 2012 Denis Washington <denisw@online.de>
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
  var $ = require('jquery');
  var _ = require('underscore')
  var avatarFallback = require('util/avatarFallback');
  var Backbone = require('backbone');
  var linkify = require('util/linkify');
  var template = require('text!templates/content/post.html')

  var PostView = Backbone.View.extend({
    tagName: 'article',
    className: 'post',

    render: function() {
      this.$el.html(_.template(template, {
        post: this.model,
        linkify: linkify
      }));
      avatarFallback(this.$('.avatar'), 'personal', 50);
      if (!this.options.credentials.username) {
        this.$('.answer').hide();
      }
    }
  });

  return PostView;
});
