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
  require(['jquery', 'timeago', 'jquery.embedly', 'util/autoResize']);
  var _ = require('underscore');
  var avatarFallback = require('util/avatarFallback');
  var config = require('config');
  var Backbone = require('backbone');
  var Events = Backbone.Events;
  var l10n = require('l10n');
  var l10nBrowser = require('l10n-browser');
  var linkify = require('util/linkify');
  var template = require('text!templates/content/post.html');
  var embedTemplate = require('text!templates/content/embed.html');
  var localTemplate;

  var PostView = Backbone.View.extend({
    tagName: 'article',
    className: 'post',
    events: {
      'click .answer': '_expandAnswerArea',
      'click .createComment': '_comment',
      'click .avatar': '_redirect'
    },

    initialize: function() {
      if (!localTemplate) localTemplate = l10nBrowser.localiseHTML(template, {});
      this.channelName = this.options.items.channel;
      this.model.bind('addComment', this._addComment, this);
    },

    _addComment: function(item, post) {
      if (this._needsBubbling()) {
        this.remove();
        Events.trigger('postBubble', post);
      } else {
        this.render();
      }
    },

    _needsBubbling: function() {
      return !this.$el.is(':first-child');
    },

    render: function() {
      this.$el.html(_.template(localTemplate, {
        post: this.model,
        user: this.options.user,
        roleTag: this._roleTag.bind(this),
        linkify: linkify,
        l: l10n.get
      }));
      avatarFallback(this.$('.avatar'), 'personal', 50);
      this._showPostTime();
      this._embedly();
      this._addNoCommentsClassIfNeeded();
      this._adjustCommentAreaVisibility();
      this._commentOnCtrlEnter();
      this.$('.expandingArea').autoResize();
    },

    _showPostTime: function() {
      this.$('.postmeta').timeago();
    },

    _embedly: function() {
      this.$('p').embedly({
        maxWidth: 400,
        key: config.embedlyKey,
        secure: config.embedlySecure,
        success: function(oembed, dict) {
          // If is not a link or if the link has an image
          if (oembed.type !== 'link' || oembed.thumbnail_url) {
            var html = _.template(embedTemplate, {
              maxWidth: 400,
              url: oembed.url || dict.url,
              title: (oembed.type !== 'photo') ? (oembed.title || dict.url) : undefined,
              img:   (oembed.type === 'photo') ? oembed.url : oembed.thumbnail_url,
              width: (oembed.type === 'photo') ? oembed.width : oembed.thumbnail_width,
              html: oembed.html,
              description: oembed.description
            });
            dict.node.parent().after(html);
          }
        }
      });
    },

    _roleTag: function() {
      var subscribedChannels = this.options.user.subscribedChannels;

      if (subscribedChannels) {
        var role = subscribedChannels.role(this.channelName);
        if (role === 'owner' || role === 'moderator') {
          return role;
        }
      }

      return '';
    },

    _addNoCommentsClassIfNeeded: function() {
      if (this.model.length == 1) {
        this.$el.addClass('noComments');
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
        return user.subscribedChannels.isPostingAllowed(this.channelName);
      }
    },

    _commentOnCtrlEnter: function() {
      var self = this;
      this.$('.answer textarea').keyup(function(event) {
        if (event.ctrlKey && event.keyCode == 13 /* Enter */) {
          self._comment(event);
        }
      });
    },

    _expandAnswerArea: function(event) {
      event.stopPropagation();
      var area = this.$('.answer');
      var collapseAnswerArea = $.proxy(this._collapseAnswerArea, this);
      if (!area.hasClass('write')) {
        area.addClass('write');
        $(document).one('click', collapseAnswerArea);
      }
    },

    _collapseAnswerArea: function(event) {
      var area = this.$('.answer');
      var textArea = area.find('textarea');
      if (textArea.val() === "") {
        area.removeClass('write');
      }
    },

    _redirect: function(event) {
      var jid = this.$(event.currentTarget).parent().find('.jid').text();
      Events.trigger('navigate', jid);
    },

    _enableButton: function() {
      this.$('.createComment').removeClass('disabled').text('Post');
    },

    _disableButton: function() {
      this.$('.createComment').addClass('disabled').text('Posting...');
    },

    _comment: function(event) {
      event.stopPropagation();
      var textArea = this.$('.answer textarea');
      var content = textArea.val();
      var self = this;

      this._disableButton();

      var comment = this.options.items.create({
        content: content,
        replyTo: this.model.id
      }, {
        credentials: this.options.user.credentials,
        wait: true,
        success: function() {
          textArea.val('');
          self._collapseAnswerArea();
          self._enableButton();
        }
      });
    }
  });

  return PostView;
});
