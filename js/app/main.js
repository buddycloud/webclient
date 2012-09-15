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
  baseUrl: 'js/vendor',
  paths: {
    'config': '../../config',
    'templates': '../../templates',
    'models': '../app/models',
    'views': '../app/views',
    'util': '../app/util'
  }
});

define(function(require) {
  var $ = require('jquery');

  var config = require('config');
  
  var Channel = require('models/Channel');
  var SubscribedChannels = require('models/SubscribedChannels');
  var UserCredentials = require('models/UserCredentials');
  
  var Sidebar = require('views/Sidebar');

  function initialize() {
    var channel = getRequestedChannel();
    var subscribedChannels = new SubscribedChannels();
    getUserCredentials(function(credentials) {
      setupChannelUI(channel, subscribedChannels, credentials);
      channel.fetch({credentials: credentials});
      if (credentials.username) {
        subscribedChannels.fetch({credentials: credentials});
      }
    });
  }

  function getRequestedChannel() {
    var name = document.location.search.slice(1) || config.defaultChannel;
    return new Channel(name);
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

  function setupChannelUI(channel, subscribedChannels, credentials) {
<<<<<<< HEAD
      $('#content').append(new MetadataPane({
        model: channel,
        credentials: credentials,
        subscribed: subscribedChannels}).el)
    $('#content').append(new PostStream({model: channel, credentials: credentials}).el);
      //logged in?
      if (credentials.username) {
        var userMenu = new UserMenu({model: credentials});
        var channelsList = new SubscribedChannelsList({model: subscribedChannels, credentials: credentials});
        $('#center').append(userMenu.el);
        $('#left').append(channelsList.el);
        userMenu.render();
      } else {
        var sidebar = new Sidebar({model: subscribedChannels});
        $('#left').append(sidebar.el);
        sidebar.render();
      }
=======
    $('#content').append(new MetadataPane({
      model: channel,
      credentials: credentials,
      subscribed: subscribedChannels}).el);
    $('#content').append(new PostStream({model: channel, credentials: credentials}).el);
    $('#right').append(new FollowerList({model: channel}).el);
    if (credentials.username) {
      var userMenu = new UserMenu({model: credentials});
      var channelsList = new SubscribedChannelsList({model: subscribedChannels, credentials: credentials});
      $('#toolbar-right').append(userMenu.el);
      $('#left').append(channelsList.el);
      userMenu.render();
    } else {
      var sidebar = new LoginSidebar({model: credentials});
      $('#left').append(sidebar.el);
      sidebar.render();
    }
>>>>>>> master
  }

  initialize();
});

