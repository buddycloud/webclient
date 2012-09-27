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
  var PostView = require('views/content/PostView');
  var template = require('text!templates/content/stream.html')
  var avatarFallback = require('util/avatarFallback');

  var ChannelStream = Backbone.View.extend({
    className: 'stream clearfix',
    events: {
      'click .newTopic': '_expandNewTopicArea',
      'click .createComment': '_post',
    },

    initialize: function() {
      this._postViews = [];
      this.model.items.bind('reset', this._renderPosts, this);
      this.model.items.bind('addPost', this._showPost, this);
    },

    _renderPosts: function() {
      var posts = this.model.items.posts();
      var self = this;
      _.each(posts, function(post) {
        var view = self._viewForPost(post);
        self._postViews.push(view);
      });
    },

    _viewForPost: function(post) {
      var view = new PostView({
        model: post,
        channel: this.model,
        user: this.options.user
      });
      view.render();
      return view;
    },

    _showPost: function(post) {
      var view = this._viewForPost(post);
      this._postViews.unshift(view);
      this.$('.posts').prepend(view.el);
    },

    render: function() {
      this.$el.html(_.template(template, {user: this.options.user}));
      if (!this._userCanPost()) {
        this.$('.newTopic').remove();
      }
      this._showPosts();
      avatarFallback(this.$('.avatar'), 'personal', 50);
      this._postOnCtrlEnter();
    },

    _userCanPost: function() {
      var user = this.options.user;
      if (user.isAnonymous()) {
        return false;
      } else {
        return user.subscribedChannels.isPostingAllowed(this.model.name);
      }
    },

    _showPosts: function() {
      var self = this;
      _.each(this._postViews, function(view) {
        self.$('.posts').append(view.el);
      });
    },

    _postOnCtrlEnter: function() {
      var self = this;
      this.$('.newTopic textarea').keyup(function(event) {
        if (event.ctrlKey && event.keyCode == 13 /* Enter */) {
          self._post();
        }
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
      var textArea = this.$('.newTopic textarea');
      var content = textArea.val();
      var self = this;
      var post = this.model.items.create({content: content}, {
        credentials: this.options.user.credentials,
        wait: true,
        success: function() {
          textArea.val('');
          self._collapseNewTopicArea({data: {self: self}});
        }
      });
    }
  });

  return ChannelStream;
});
