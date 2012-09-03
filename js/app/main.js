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

requirejs.config({
  baseUrl: 'js',
  paths: {
    'config': '../config',
    'templates': '../templates'
  }
});

define(function(require) {
  var $ = require('jquery');
  var ChannelFollowers = require('app/models/ChannelFollowers');
  var ChannelMetadata = require('app/models/ChannelMetadata');
  var ChannelPosts = require('app/models/ChannelPosts');
  var config = require('config');
  var FollowerList = require('app/views/FollowerList');
  var LoginSidebar = require('app/views/LoginSidebar');
  var MetadataPane = require('app/views/MetadataPane');
  var PostStream = require('app/views/PostStream');
  var UserChannels = require('app/models/UserChannels');
  var UserChannelsList = require('app/views/UserChannelsList');
  var UserCredentials = require('app/models/UserCredentials');
  var UserMenu = require('app/views/UserMenu');

  function initialize() {
    var channel = getRequestedChannel();
    var metadata = new ChannelMetadata(channel);
    var posts = new ChannelPosts(channel);
    var followers = new ChannelFollowers(channel);
    var userChannels = new UserChannels();
    getUserCredentials(function(credentials) {
      setupChannelUI(metadata, posts, followers, userChannels, credentials);
      fetch(metadata, credentials);
      fetch(posts, credentials);
      fetch(followers, credentials);
      fetch(userChannels, credentials);
    });
  }

  function getRequestedChannel() {
    return document.location.search.slice(1) || config.defaultChannel;
  }

  function getUserCredentials(callback) {
    var credentials = new UserCredentials;
    credentials.fetch();
    credentials.on('accepted', function() {
      callback(credentials);
    });
    credentials.on('rejected', function() {
      alert('Authentication failed');
      credentials.set({username: null, password: null});
      credentials.verify();
    });
    credentials.verify();
  }

  function setupChannelUI(metadata, posts, followers, userChannels, credentials) {
    $('#content').append(new MetadataPane({model: metadata}).el);
    $('#content').append(new PostStream({model: posts}).el);
    $('#right').append(new FollowerList({model: followers}).el);
    if (credentials.username) {
      var userMenu = new UserMenu({model: credentials});
      $('#toolbar-right').append(userMenu.el);
      userMenu.render();

      var userChannelsList = new UserChannelsList({model: userChannels});
      $('#left').append(userChannelsList.el);
      userChannelsList.render();
    } else {
      var sidebar = new LoginSidebar({model: credentials});
      $('#left').append(sidebar.el);
      sidebar.render();
    }
  }

  function fetch(model, credentials) {
    model.fetch({
      headers: {'Authorization': credentials.toAuthorizationHeader()},
      xhrFields: {withCredentials: true}
    });
  }

  initialize();
});
