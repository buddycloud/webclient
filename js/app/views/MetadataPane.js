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
  var avatarFallback = require('app/util/avatarFallback');
  var Backbone = require('backbone');
  var template = require('text!templates/MetadataPane.html');
  var urlUtil = require('app/util/urlUtil');

  var MetadataPane = Backbone.View.extend({
    tagName: 'header',
    className: 'metadata-pane',
    events: {
      'click .follow': '_follow',
      'click .unfollow': '_unfollow'},

    initialize: function() {
      this.model.bind('fetch', this.render, this);
      this.options.subscribed.bind('sync', this.render, this);
    },

    render: function() {
      this.$el.html(_.template(template, {
        metadata: this.model.metadata,
        linkUrlsFunc: urlUtil.linkUrls
      }));
      if (this._isLoggedIn()) {
        this._renderButton();
      }
      avatarFallback(this.$('img'), this.model.metadata.channelType(), 64);
    },

    _isLoggedIn: function() {
      return !!this.options.credentials.username;
    },

    _renderButton: function() {
      var followers = this.model.followers.usernames();
      var button = this._userIsFollowing() ?
        $('<button class="unfollow">Unfollow</button>') :
        $('<button class="follow">Follow</button>');
      this.$el.append(button);
    },

    _userIsFollowing: function() {
      var username = this.options.credentials.username;
      var followers = this.model.followers.usernames();
      return _.include(followers, username);
    },

    _follow: function() {
      this.options.subscribed.subscribe(
        this.model.name, 'posts', this.options.credentials); 
    },

    _unfollow: function() {
      this.options.subscribed.unsubscribe(
        this.model.name, 'posts', this.options.credentials); 
    }
  });

  return MetadataPane;
});
