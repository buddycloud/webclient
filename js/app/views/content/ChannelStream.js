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
  var Backbone = require('backbone');
  var Events = Backbone.Events;
  var PostView = require('views/content/PostView');
  var template = require('text!templates/content/stream.html')

  var ChannelStream = Backbone.View.extend({
    className: 'stream clearfix',
    events: {
      'click .newTopic': '_expandNewTopicArea',
      'click .createComment': '_post'
    },

    initialize: function() {
      this.isLoading = false;
      this._postViews = [];
      this.model.items.bind('reset', this._getAndRenderPosts, this);
      this.model.items.bind('addPost', this._prependNewPost, this);

      if (this.options.user.subscribedChannels) {
        this.options.user.subscribedChannels.bind('subscriptionSync', this._subscribeAction, this);
      }

      // Scroll event
      _.bindAll(this, 'checkScroll');
      $('.content').scroll(this.checkScroll);
    },

    destroy: function() {
      this.options.user.subscribedChannels.unbind('subscriptionSync', this._subscribeAction, this);
      this.remove();
    },

    // Thanks to Thomas Davis
    // http://backbonetutorials.com/infinite-scrolling/

    checkScroll: function() {
      var content = $('.content');
      var triggerPoint = 200; // 200px from the bottom

      if(!this.isLoading && (content.scrollTop() + content.prop('clientHeight') + triggerPoint > content.prop('scrollHeight'))) {
        var self = this;
        this.isLoading = true;

        // Last loaded post id
        var lastItem = this.model.items.lastItem();

        if (lastItem) {
          this._showSpinner();
          this.model.items.fetch({
            data: {after: lastItem},
            silent: true,
            success: function() {
              self._appendPosts();
              self._hideSpinner();
              self.isLoading = false;
            }
          });
        }
      }
    },

    _hideSpinner: function() {
      this.$('.loader').hide();
    },

    _showSpinner: function() {
      this.$('.loader').show();
    },

    _subscribeAction: function(action) {
      if (action === 'subscribedChannel') {
        // Followed the channel
        var defaultRole = this.model.metadata.defaultAffiliation();
        if (defaultRole === 'publisher') {
          this.$('.newTopic').show();
        }
      } else {
        // Unfollowed the channel
        this.$('.newTopic').hide();
      }

      this._renderPosts();
    },

    _renderPosts: function() {
      _.each(this._postViews, function(view) {
        view.render();
      });
    },

    _getAndRenderPosts: function() {
      var posts = this.model.items.posts();
      var self = this;
      _.each(posts, function(post) {
        var view = self._viewForPost(post);
        self._postViews.push(view);
      });
      this._renderPosts();
    },

    _appendPosts: function() {
      var posts = this.model.items.posts();
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
        channel: this.model,
        user: this.options.user
      });
      return view;
    },

    _prependNewPost: function(post) {
      var view = this._viewForPost(post);
      this._postViews.unshift(view);
      view.render();
      this.$('.posts').prepend(view.el);
    },

    render: function() {
      this.$el.html(_.template(template, {user: this.options.user}));
      if (!this._userCanPost()) {
        this.$('.newTopic').hide();
      }
      this._showPosts();
      this._postOnCtrlEnter();
      this._hideSpinner();
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

    _enableButton: function() {
      this.$('.createComment').removeClass('disabled').text('Post');
    },

    _disableButton: function() {
      this.$('.createComment').addClass('disabled').text('Posting...');
    },

    _post: function() {
      this._disableButton();
      var textArea = this.$('.newTopic textarea');
      var content = textArea.val();
      var self = this;
      this.model.items.create({content: content}, {
        credentials: this.options.user.credentials,
        wait: true,
        success: function() {
          textArea.val('');
          self._collapseNewTopicArea({data: {self: self}});
          self._enableButton();
        }
      });
    }
  });

  return ChannelStream;
});
