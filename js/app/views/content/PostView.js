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
    events: {
      'click .answer': '_expandAnswerArea',
      'click .createComment': '_comment'
    },

    render: function() {
      this.$el.html(_.template(template, {
        post: this.model,
        user: this.options.user,
        roleTag: this._roleTag.bind(this),
        linkify: linkify
      }));
      avatarFallback(this.$('.avatar'), 'personal', 50);
      this._adjustCommentAreaVisibility();
    },

    _roleTag: function(username) {
      var role = this.options.channel.followers.get(username);
      if (role == 'owner' || role == 'moderator') {
        return role;
      } else {
        return '';
      }
    },

    _adjustCommentAreaVisibility: function() {
      if (!this._userCanPost()) {
        this.$('.answer').remove();
      }
    },

    _userCanPost: function() {
      var user = this.options.user;
      if (user.isAnonymous()) {
        return false;
      } else {
        var channelName = this.options.channel.name;
        return user.subscribedChannels.isPostingAllowed(channelName);
      }
    },

    _expandAnswerArea: function(event) {
      event.stopPropagation();
      var area = this.$('.answer');
      if(!area.hasClass('write')){
        area.addClass('write');
        $(document).one('click', {self: this}, this._collapseAnswerArea);
      }
    },

    _collapseAnswerArea: function(event) {
      var area = event.data.self.$('.answer');
      var textArea = area.find('textarea');
      if(textArea.val() === ""){
        area.removeClass('write');
      }
    },

    _comment: function(event) {
      event.stopPropagation();
      var content = this.$('textarea').val();
      var self = this;
      var comment = this.options.channel.posts.create({
        content: content,
        replyTo: this.model[0].id
      }, {
        credentials: this.options.user.credentials,
        success: function() { self._showComment(comment); }
      });
    },

    _showComment: function(comment) {
      // FIXME: This function is only temporary and will disappear
      // when real-time support arrives.
      this.model.push(comment);
      this.render();
    }
  });

  return PostView;
});
