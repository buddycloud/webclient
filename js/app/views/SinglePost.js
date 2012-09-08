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
  var _ = require('underscore');
  var api = require('app/util/api');
  var avatarFallback = require('app/util/avatarFallback');
  var urlUtil = require('app/util/urlUtil');
  var Backbone = require('backbone');
  var template = require('text!templates/SinglePost.html');

  var SinglePost = Backbone.View.extend({
    tagName: 'article',
    className: 'thread',

    initialize: function() {
      this.render();
    },

    render: function() {
      this.$el.html(_.template(template, {
        thread: this.model,
        avatarUrlFunc: api.avatarUrl,
        linkUrlsFunc: urlUtil.linkUrls,
        canPost: this.options.canPost
      }));
      this._setupAvatarFallbacks();
    },

    _setupAvatarFallbacks: function() {
      var toplevelAvatars = this.$('header .avatar');
      var commentAvatars = this.$('.comment .avatar');
      avatarFallback(toplevelAvatars, 'personal', 48);
      avatarFallback(commentAvatars, 'personal', 32);
    }
  });

  return SinglePost;
});
