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
  var api = require('util/api');
  var avatarFallback = require('util/avatarFallback');
  var parseUtil = require('util/parseUtil');
  var Backbone = require('backbone');
  var Post = require('app/models/Post');
  var template = require('text!templates/SinglePost.html');
  var commentTemplate = require('text!templates/PostComment.html');
  var Events = Backbone.Events;

  var SinglePost = Backbone.View.extend({
    tagName: 'article',
    className: 'thread',
    events: {
      'click .new-comment button': 'addComment'
    },

    initialize: function() {
      Events.bind('subscribedChannel', this._enablePosting, this);
      Events.bind('unsubscribedChannel', this._disablePosting, this);
      this.render();
    },

    addComment: function() {
      var content = this.$('.new-comment').find('textarea').val();
      if (content.length) {
        var comment = new Post({content: content, replyTo: this.model[0].id});
        comment.save({}, {
          url: this._getCollecetionUrl(),
          headers: {'Content-type': 'application/json'},
          wait: true,
          dataType: 'text'
        });
        comment.bind('sync', this.renderComment, this);
        comment.bind('sync', this._clearTextarea, this);
      }
    },

    render: function() {
      this.$el.html(_.template(template, {
        thread: this.model,
        avatarUrlFunc: api.avatarUrl,
        linkUrlsFunc: parseUtil.linkUrls,
        linkMentionsFunc: parseUtil.linkMentions,
        safeString: parseUtil.safeString,
        canPost: this.options.canPost
      }));
      this._setupAvatarFallbacks();
    },

    renderComment: function(comment) {
      this.$('.comments').append(_.template(commentTemplate, {
        comment: comment,
        avatarUrlFunc: api.avatarUrl,
        linkUrlsFunc: parseUtil.linkUrls,
        linkMentionsFunc: parseUtil.linkMentions,
        safeString: parseUtil.safeString
      }));
      avatarFallback(this.$('.comment').find('.avatar'), 'personal', 32);
    },

    _clearTextarea: function() {
      this.$('.new-comment').find('textarea').val('');
    },

    _enablePosting: function(channel, role) {
      if (role === 'publisher') {
        this.$el.append('<section class="new-comment"> \
          <textarea placeholder="Add comment..." autocomplete="off"></textarea> \
          <div class="controls"> \
            <button>Post</button> \
          </div> \
        </section>');
      }
    },

    _disablePosting: function()  {
      this.$('.new-comment').remove();
    },

    _getCollecetionUrl: function() {
      return this.model[0].collection.url();
    },

    _setupAvatarFallbacks: function() {
      var toplevelAvatars = this.$('header').find('.avatar');
      var commentAvatars = this.$('.comment').find('.avatar');
      avatarFallback(toplevelAvatars, 'personal', 48);
      avatarFallback(commentAvatars, 'personal', 32);
    }
  });

  return SinglePost;
});
