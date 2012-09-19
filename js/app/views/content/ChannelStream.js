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
  var Backbone = require('backbone');
  var PostView = require('views/content/PostView');
  var template = require('text!templates/content/stream.html')

  var ChannelStream = Backbone.View.extend({
    className: 'stream clearfix',

    initialize: function() {
      this._posts = [];
      this.model.posts.bind('reset', this._preRenderPosts, this);
    },

    _preRenderPosts: function() {
      var posts = this.model.posts.byThread();
      var self = this;
      _.each(posts, function(post) {
        var view = new PostView({model: post, user: self.options.user});
        view.render();
        self._posts.push(view);
      });
    },

    render: function() {
      this.$el.html(_.template(template));
      if (!this._userCanPost()) {
        this.$('.newTopic').hide();
      }
      this._appendPosts();
    },

    _userCanPost: function() {
      var user = this.options.user;
      if (user.isAnonymous()) {
        return user;
      } else {
        return  user.subscribedChannels.isPostingAllowed(this.model.name);
      }
    },

    _appendPosts: function() {
      var self = this;
      _.each(this._posts, function(post) {
        self.$('.posts').append(post.el);
      });
    }
  });

  return ChannelStream;
});
