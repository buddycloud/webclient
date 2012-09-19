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
  var Backbone = require('backbone');
  var Post = require('models/Post');
  var PostView = require('views/content/PostView');
  var template = require('text!templates/content/stream.html')

  var ChannelStream = Backbone.View.extend({
    className: 'stream clearfix',
    events: {
      'click .newTopic': '_expandNewTopicArea',
      'click .createComment': '_post',
    },

    initialize: function() {
      this._posts = [];
      this.model.posts.bind('reset', this._preRenderPosts, this);
    },

    _preRenderPosts: function() {
      var posts = this.model.posts.byThread();
      var self = this;
      _.each(posts, function(post) {
        var view = new PostView({
          model: post,
          channel: self.model,
          user: self.options.user
        });
        view.render();
        self._posts.push(view);
      });
    },

    render: function() {
      this.$el.html(_.template(template));
      if (!this._userCanPost()) {
        this.$('.newTopic').remove();
      }
      this._appendPosts();
    },

    _userCanPost: function() {
      var user = this.options.user;
      if (user.isAnonymous()) {
        return false;
      } else {
        return user.subscribedChannels.isPostingAllowed(this.model.name);
      }
    },

    _appendPosts: function() {
      var self = this;
      _.each(this._posts, function(post) {
        self.$('.posts').append(post.el);
      });
    },

    _expandNewTopicArea: function(event) {
      event.stopPropagation();
      var newTopicArea = this.$('.newTopic');
      if(!newTopicArea.hasClass('write')){
        newTopicArea.addClass('write');
        $(document).one('click', {self: this}, this._collapseNewTopicArea);
      }
    },

    _collapseNewTopicArea: function(event) {
      var newTopicArea = event.data.self.$('.newTopic');
      var textArea = newTopicArea.find('textarea');
      if(textArea.val() === ""){
        newTopicArea.removeClass('write');
      }
    },

    _post: function() {
      var content = this.$('textarea').val();
      var self = this;
      var post = this.model.posts.create({content: content}, {
        credentials: this.options.user.credentials,
        success: function() { self._showPost(post); }
      });
    },

    _showPost: function(post) {
      // FIXME: This function is only temporary and will disappear
      // when real-time support arrives.
      var view = new PostView({
        model: [post],
        channel: this.model,
        user: this.options.user
      });
      console.log(post);
      this._posts.unshift(view);
      view.render();
      this.$('.posts').prepend(view.el);
    }
  });

  return ChannelStream;
});
