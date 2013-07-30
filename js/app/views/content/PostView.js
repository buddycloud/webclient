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
  var api = require('util/api');
  var avatarFallback = require('util/avatarFallback');
  var Backbone = require('backbone');
  var Dropzone = require('dropzone');
  var Events = Backbone.Events;
  var embedlify = require('util/embedlify');
  var l10n = require('l10n');
  var l10nBrowser = require('l10n-browser');
  var linkify = require('util/linkify');
  var mediaFallback = require('util/mediaFallback');
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
      'click .action': '_popupActions',
      'click .deletePost': '_deletePost'
    },

    initialize: function() {
      if (!localTemplate) localTemplate = l10nBrowser.localiseHTML(template, {});
      this.channelName = this.options.items.channel;
      this.model.bind('addComment', this._addComment, this);
      this.media = [];
    },

    destroy: function() {
      this.model.unbind('addComment', this._addComment, this);
      this.remove();
    },

    _initializeDropzone: function() {
      if (!this.dropzone) {
        var self = this;
        var mediaUrl = api.mediaUrl(this.channelName);
        var authHeader = this.options.user.credentials.authorizationHeader();

        this.dropzone = new Dropzone(this.$el[0], {
          previewsContainer: this.$el.find('.dropzone-previews')[0],
          url: mediaUrl,
          clickable: false,
          paramName: 'data',
          sending: function(file, xhr, formData){
            self._disableButton('Uploading...');
            xhr.withCredentials = true;
            xhr.setRequestHeader('Authorization', authHeader);
          },
          complete: function() {
            self._enableButton();
          },
          success: this._addMedia()
        });

        this._dragAndDropEvent();
      }
    },

    _dndFileStart: function(evt) {
      var area = $(this).find('.answer');
      if (!area.hasClass('write')) {
        area.addClass('write');
      }
    },

    _dndFileLeave: function() {
      var area = $(this).find('.answer');
      if (area.hasClass('write')) {
        area.removeClass('write');
      }
    },

    _dragAndDropEvent: function() {
      this.$el.on('dragover', this._dndFileStart);
      this.$el.on('dragleave', this._dndFileLeave);
    },

    _addMedia: function() {
      var self = this;
      return function(file, response) {
        self.media.push({id: response.id, channel: response.entityId});
        return file.previewElement.classList.add('dz-success');
      };
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
      var post = this.model;
      this.$el.html(_.template(localTemplate, {
        post: post,
        api: api,
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
      this._initializeDropzone();
      mediaFallback(this.$('.media').find('img'));
    },

    _actionButton: function() {
      var subscribedChannels = this.options.user.subscribedChannels;

      if (!subscribedChannels || !subscribedChannels.isDeletingAllowed(this.channelName)) {
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
      this.$('.preview').empty();
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

    _enableButtonWithError: function() {
      var self = this;
      this.$('.createComment').removeClass('disabled').addClass('completed').text('Error');
      setTimeout(function() {
        self._enableButton();
        self._collapseAnswerArea();
      }, 3500);
    },

    _enableButton: function() {
      var $button = this.$('.createComment');
      if ($button.hasClass('disabled')) {
        $button.removeClass('disabled');
      } else {
        $button.removeClass('completed');
      }
      $button.text('Post');
    },

    _disableButton: function(text) {
      this.$('.createComment').addClass('disabled').text(text);
    },

    _follows: function() {
      var followedChannels = this.options.user.subscribedChannels.channels();
      return _.include(followedChannels, this.channelName);
    },

    _comment: function(event) {
      event.stopPropagation();
      var textArea = this.$('.answer textarea');
      var content = textArea.val();

      if (content.trim() || this.media.length > 0) {
        var self = this;

        this._disableButton('Posting...');
        var item = {replyTo: this.model.id};

        if (content) {
          item.content = content;
        }

        if (this.media.length > 0) {
          item.media = this.media;
        }

        item.channel = this.channelName;

        var previewsContainer = this.$el.find('.dropzone-previews');
        var comment = this.options.items.create(item, {
          credentials: this.options.user.credentials,
          wait: true,
          syncWithServer: this._follows(),
          complete: function() {
            textArea.val('');
            previewsContainer.empty();
            self.media = [];
          },
          success: function() {
            self._collapseAnswerArea();
            self._enableButton();
          },
          error: function() {
            self._enableButtonWithError();
          }
        });
      }
    },

    _popupActions: function(event) {
      event.stopPropagation();
      var $target = this.$(event.target);
      var $popup = $target.next();

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

    _deletePost: function(event) {
      var self = this;
      var authHeader = this.options.user.credentials.authorizationHeader();
      var id = event.target.id;
      var model = this.model;
      var options = {
        type: 'DELETE',
        url: api.url(this.channelName, 'content', 'posts', id),
        beforeSend: function(xhr) {
          xhr.setRequestHeader('Authorization', authHeader);
        },
        success: function() {
          if (model.id === id) {
            self.destroy();
          } else {
            model.deleteComment(id);
            self.render();
          }
        }
      };
      $.ajax(options);
    }
  });

  return PostView;
});
