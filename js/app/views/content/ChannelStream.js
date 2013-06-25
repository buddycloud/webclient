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
  var $ = require('jquery');
  var animations = require('util/animations');
  var api = require('util/api');
  var avatarFallback = require('util/avatarFallback');
  var Backbone = require('backbone');
  var ChannelItems = require('models/ChannelItems');
  var config = require('config');
  var Dropzone = require('dropzone');
  var Events = Backbone.Events;
  var PostView = require('views/content/PostView');
  var embedlify = require('util/embedlify');
  var l10n = require('l10n');
  var l10nBrowser = require('l10n-browser');
  var linkify = require('util/linkify');
  var template = require('text!templates/content/stream.html');
  var mediaServer = require('util/mediaServer');
  var privateTemplate = require('text!templates/content/private.html');
  require(['jquery.embedly', 'util/autoResize']);
  var localTemplate;

  var ChannelStream = Backbone.View.extend({
    className: 'stream clearfix',
    events: {
      'focusin .newTopic': '_expandNewTopicArea',
      'focusout .newTopic': '_collapseNewTopicArea',
      'click .createComment': '_post'
    },

    initialize: function() {
      if (!localTemplate) localTemplate = l10nBrowser.localiseHTML(template, {});
      this._initModel();

      this.isLoading = true;
      this._postViews = [];
      this.model.bind('addPost', this._prependPost, this);
      this.mediaToPost = [];

      var user = this.options.user;
      if (user.subscribedChannels) {
        user.subscribedChannels.bind('subscriptionSync', this._subscribeAction, this);
      }

      _.bindAll(this, 'checkScroll', '_dndFileStart', '_dndFileLeave');

      // Scroll event
      $('.content').scroll(this.checkScroll);

      // Bubble up post
      Events.on('postBubble', this._bubble, this);
    },

    destroy: function() {
      // Scrolling event
      $('.content').off('scroll', this.checkScroll);

      // (Un)follow event
      var user = this.options.user;
      if (user.subscribedChannels) {
        user.subscribedChannels.unbind('subscriptionSync', this._subscribeAction, this);
      }

      // Bubble a post event
      Events.unbind('postBubble', this._bubble, this);

      // Destroy posts views
      this._destroyPostsViews();

      // Remove
      this.remove();
    },

    _initializeDropzone: function() {
      if (!this.dropzone) {
        var mediaUrl = api.mediaUrl(this.model.channel);
        var authHeader = this.options.user.credentials.authorizationHeader();

        this.dropzone = new Dropzone(this.$newTopic[0], {
          previewsContainer: this.$newTopic.find('.dropzone-previews')[0],
          url: mediaUrl,
          clickable: false,
          paramName: 'data',
          sending: function(file, xhr, formData){
            xhr.withCredentials = true;
            xhr.setRequestHeader('Authorization', authHeader);
          },
          success: this._addMedia()
        });

        this._dragAndDropEvent();
      }
    },

    _destroyPostsViews: function() {
      _.each(this._postViews, function(view) {
        view.destroy();
      });
    },

    _dragAndDropEvent: function() {
      this.$newTopic.on('dragover', this._dndFileStart);
      this.$newTopic.on('dragleave', this._dndFileLeave);
    },

    _addMedia: function() {
      var self = this;
      return function(file, data) {
        self.mediaToPost.push({id: data.id, channel: data.entityId});
        return file.previewElement.classList.add('dz-success');
      };
    },

    _enableButtonWithError: function() {
      var self = this;
      this.$('.createComment').removeClass('disabled').addClass('completed').text('Error');
      setTimeout(function() {
        self._enableButton();
        self._collapseNewTopicArea();
      }, 3500);
    },

    _initModel: function() {
      this.model = new ChannelItems(this.options.channel);
      this.model.bind('reset', this._begin, this);
      this.model.bind('error', this._error, this);
      this.model.fetch({data: {max: 51}, credentials: this.options.user.credentials, reset: true});
    },

    _begin: function() {
      this._getAndRenderPosts();
      this.render();
      this._listenForNewPosts();
    },

    _error: function(e, xhr) {
      if (xhr && xhr.status === 403) {
        this._renderPrivateChannel();
      } else {
        this.destroy();
        Events.trigger('pageError', config.homeDomain, e);
      }
    },

    _renderPrivateChannel: function() {
      this.$el.html(_.template(privateTemplate));
    },

    _listenForNewPosts: function() {
      var user = this.options.user;
      var items = this.model;
      user.notifications.on('new', function(item) {
        if (item.source === items.channel) {
          items.add(item);
        }
      });
      user.notifications.listen({credentials: user.credentials});
    },

    // Thanks to Thomas Davis
    // http://backbonetutorials.com/infinite-scrolling/

    checkScroll: function() {
      var content = $('.content');
      var triggerPoint = 200; // 200px from the bottom
      var offset = content.scrollTop() + content.prop('clientHeight') + triggerPoint;

      if(!this.isLoading && (offset > content.prop('scrollHeight'))) {
        var self = this;

        // Last loaded post id
        var lastItem = this.model.lastItem();

        if (lastItem) {
          this._showSpinner();
          this.model.fetch({
            data: {after: lastItem, max: 51},
            credentials: this.options.user.credentials,
            silent: true,
            success: function() {
              self._appendPosts();
              self._hideSpinner();
            }
          });
        }
      }
    },

    _dndFileStart: function(evt) {
      evt.stopPropagation();
      evt.preventDefault();

      if(!this.$newTopic.hasClass('write')){
        this.$newTopic.addClass('write');
      }
    },

    _dndFileLeave: function() {
      if(this.$newTopic.hasClass('write')){
        this.$newTopic.removeClass('write');
      }
    },

    _hideSpinner: function() {
      this.isLoading = false;
      this.$('.loader').hide();
    },

    _showSpinner: function() {
      this.isLoading = true;
      this.$('.loader').show();
    },

    _subscribeAction: function(action) {
      if (action === 'subscribedChannel') {
        // Followed the channel
        if (this._userCanPost()) {
          this.$el.prepend(this.$newTopic);
        }
      } else {
        // Unfollowed the channel
        this.$newTopic.detach();
      }

      this._renderPosts();
    },

    _renderPosts: function() {
      _.each(this._postViews, function(view) {
        view.render();
      });
    },

    _getAndRenderPosts: function() {
      var posts = this.model.posts();
      var self = this;
      _.each(posts, function(post) {
        var view = self._viewForPost(post);
        self._postViews.push(view);
      });
      this._renderPosts();
    },

    _appendPosts: function() {
      var posts = this.model.posts();
      var self = this;
      _.each(posts, function(post) {
        var view = self._viewForPost(post);
        self._postViews.push(view);
        view.render();
        this.$('.posts').append(view.el);
      });
    },

    _viewForPost: function(post) {
      var view = new PostView({
        model: post,
        items: this.model,
        user: this.options.user
      });
      return view;
    },

    _prependPost: function(post) {
      var view = this._viewForPost(post);
      this._postViews.unshift(view);
      view.render();
      this.$('.posts').prepend(view.el);
    },

    render: function() {
      this.$el.html(_.template(localTemplate, {user: this.options.user, l: l10n.get}));
      this._prepareNewTopic();
      this._showPosts();
      this._postOnCtrlEnter();
      this._previewEmbed();
      this._hideSpinner();
      this._initializeDropzone();
    },

    _prepareNewTopic: function() {
      avatarFallback(this.$('.newTopic .avatar'), 'personal', 50);
      this.$('.newTopic .expandingArea').autoResize();

      this.$newTopic = this.$('.newTopic');
      if (!this._userCanPost()) {
        this.$newTopic.detach();
      }
    },

    _userCanPost: function() {
      var user = this.options.user;
      if (user.isAnonymous()) {
        return false;
      } else {
        return user.subscribedChannels.isPostingAllowed(this.model.channel);
      }
    },

    _showPosts: function() {
      var self = this;
      _.each(this._postViews, function(view) {
        self.$('.posts').append(view.el);
      });
      document.redraw();
    },

    _postOnCtrlEnter: function() {
      var self = this;
      this.$('.newTopic textarea').keydown(function(event) {
        if (event.ctrlKey && event.keyCode == 13 /* Enter */) {
          self._post();
          event.preventDefault();
        }
      });
    },

    _previewEmbed: function() {
      var self = this;
      this.previewTimeout = null;
      this.$('.newTopic textarea').keydown(function(event) {
        if (self.previewTimeout) {
          clearTimeout(self.previewTimeout);
        }
        self.previewTimeout = setTimeout(function() { self._addPreview(); }, 500);
      });
    },

    _addPreview: function() {
      var preview = this.$('.newTopic + .preview');
      var content = this.$('.newTopic textarea').val();
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
      this.$('.newTopic + .preview').empty();
    },

    _expandNewTopicArea: function(event) {
      var collapseNewTopicArea = $.proxy(this._collapseNewTopicArea, this);
      if(!this.$newTopic.hasClass('write')){
        this.$newTopic.addClass('write');
      }
    },

    _collapseNewTopicArea: function(event) {
      var textArea = this.$newTopic.find('textarea');
      if(textArea.val() === ""){
        this.$newTopic.removeClass('write');
      }
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

    _disableButton: function() {
      this.$('.createComment').addClass('disabled').text('Posting...');
    },

    _post: function() {
      var expandingArea = this.$('.newTopic .expandingArea');
      var content = expandingArea.find('textarea').val();
      var previewsContainer = this.$newTopic.find('.dropzone-previews');

      if (content.trim() || this.mediaToPost.length > 0) {
        this._disableButton();
        this._disablePreview();

        var self = this;
        var item = {};

        if (content) {
          item.content = content;
        }

        if (this.mediaToPost.length > 0) {
          item.media = this.mediaToPost;
        }

        this.model.create(item, {
          credentials: this.options.user.credentials,
          wait: true,
          complete: function() {
            expandingArea.find('textarea').val('').blur();
            expandingArea.find('span').text('');
            previewsContainer.empty();
            self.mediaToPost = [];
          },
          success: function() {
            self._collapseNewTopicArea();
            self._enableButton();
          },
          error: function() {
            self._enableButtonWithError();
          }
        });
      }
    },

    _bubble: function(post) {
      // FIXME: Primitive version from bubbling
      this._prependPost(post);
      $('.content').scrollTop(0);
    }
  });

  return ChannelStream;
});
