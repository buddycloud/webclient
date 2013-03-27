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
  var $ = require('jquery');
  var api = require('util/api');
  var avatarFallback = require('util/avatarFallback');
  var Backbone = require('backbone');
  var Events = Backbone.Events;
  var embedlify = require('util/embedlify');
  var l10n = require('l10n');
  var l10nBrowser = require('l10n-browser');
  var linkify = require('util/linkify');
  var mediaServer = require('util/mediaServer');
  var template = require('text!templates/content/post.html');
  var embedTemplate = require('text!templates/content/embed.html');
  var localTemplate;

  var PostView = Backbone.View.extend({
    tagName: 'article',
    className: 'post',
    events: {
      'focusin .answer': '_expandAnswerArea',
      'focusout .answer': '_collapseAnswerArea',
      'click .createComment': '_comment',
      'click .avatar': '_redirect',
      'click .action': '_popup',
      'click .deletePost': '_deletePost'
    },

    initialize: function() {
      if (!localTemplate) localTemplate = l10nBrowser.localiseHTML(template, {});
      this.channelName = this.options.items.channel;
      this.model.bind('addComment', this._addComment, this);
    },

    destroy: function() {
      this.model.unbind('addComment', this._addComment, this);
      this.remove();
    },

    dndFileStart: function(evt) {
      evt.stopPropagation();
      evt.preventDefault();

      var area = $(this).find('.answer');
      if (!area.hasClass('write')) {
        area.addClass('write');
      }
    },

    dndFileLeave: function() {
      var area = $(this).find('.answer');
      if (area.hasClass('write')) {
        area.removeClass('write');
      }
    },

    _dragAndDropEvent: function() {
      // Global file drag and drop event
      var self = this;
      this.$el.on('dragover', this.dndFileStart);
      this.$el.on('dragleave', this.dndFileLeave);
      this.$el.on('drop', function(evt){
        evt.stopPropagation();
        evt.preventDefault();

        var file = evt.originalEvent.dataTransfer.files[0];
        if (file) {
          self._uploadFile(file);
        }
      }); //maybe something to put global if people get used to it.
    },

    _uploadFile: function(file) {
      // newTopic area feedback
      this._disableButton();
      this._disablePreview();

      var channel = this.options.items.channel;
      var authHeader = this.options.user.credentials.authorizationHeader();
      mediaServer.uploadMedia(file, channel, { 201: this._commentMedia() }, authHeader);
    },

    _commentMedia: function() {
      var self = this;
      var channel = this.options.items.channel;
      var textArea = this.$('.answer textarea');
      var text = textArea.val().trim();

      return function(data) {
        var content = text + ' ' + api.url(channel, 'media', data.id);
        self.options.items.create({
          content: content,
          replyTo: self.model.id
        }, {
          credentials: self.options.user.credentials,
          wait: true,
          success: function() {
            textArea.val('');
            self._collapseAnswerArea();
            self._enableButton();
          }
        });
      }
    },

    _addComment: function(post) {
      if (this._needsBubbling()) {
        this.destroy();
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
        linkify: linkify.linkify,
        l: l10n.get
      }));
      avatarFallback(this.$('.avatar'), 'personal', 50);
      this._actionButton();
      this._showPostTime();
      this._embedly();
      this._addNoCommentsClassIfNeeded();
      this._adjustCommentAreaVisibility();
      this._commentOnCtrlEnter();
      this._previewEmbed();
      this.$('.expandingArea').autoResize();
      this._dragAndDropEvent();
    },

    _actionButton: function() {
      var subscribedChannels = this.options.user.subscribedChannels;
      var channel = this.options.items.channel;
      if (subscribedChannels && !subscribedChannels.isDeletingAllowed(channel)) {
        this.$('.action').remove();
      }
    },

    _showPostTime: function() {
      this.$('.postmeta').timeago();
    },

    _embedly: function() {
      this.$('p').embedly(embedlify(function(node, html) {
        node.parent().after(html);
      }));
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

    _previewEmbed: function() {
      var self = this;
      this.previewTimeout = null;
      this.$('.answer textarea').keydown(function(event) {
        if (self.previewTimeout) {
          clearTimeout(self.previewTimeout);
        }
        self.previewTimeout = setTimeout(function() { self._addPreview(); }, 500);
      });
    },

    _addPreview: function() {
      var preview = this.$('.preview');
      var content = this.$('.answer textarea').val();
      var urls = linkify.urls(content);
      preview.empty();
      if (urls) {
        $.embedly(urls, embedlify(function(node, html) {
          preview.append(html);
        }));
      }
    },

    _disablePreview: function() {
      if (this.previewTimeout) {
        clearTimeout(this.previewTimeout);
        this.previewTimeout = null;
      }
      this.$('.preview').empty()
    },

    _expandAnswerArea: function(event) {
      var area = this.$('.answer');
      var collapseAnswerArea = $.proxy(this._collapseAnswerArea, this);
      if (!area.hasClass('write')) {
        area.addClass('write');
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
    },

    _popup: function(event) {
      event.stopPropagation();
      var $popup = this.$('.popup');

      if($popup.hasClass('visible')){
        // close popup
        $popup.removeClass('visible');
      } else {
        // open popup
        $popup.addClass('visible');
        $('body, html').one('click', { popup: $popup }, this.hidePopup);
      }
    },

    hidePopup: function(event) {
      $(event.data.popup).removeClass('visible');
    },

    _deletePost: function() {
      //FIXME: give feedback during request processing
      var channel = this.options.items.channel;
      var id = this.model.get('id');
      var options = {
        type: 'DELETE',
        url: api.url(channel, 'content', id),
        success: this.remove
      };
      $.ajax(options);
    }
  });

  return PostView;
});
