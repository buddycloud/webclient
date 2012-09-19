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
    'util': '../app/util',
    'views': '../app/views'
  }
});

define(function(require) {
  var Backbone = require('backbone');
  var ChannelPage = require('views/content/ChannelPage');
  var config = require('config');
  var ExplorePage = require('views/content/ExplorePage');
  var WelcomePage = require('views/overlay/WelcomePage');
  var UserCredentials = require('models/UserCredentials');

  var Router = Backbone.Router.extend({
    routes: {
      '': 'default',
      'explore': 'explore',
      'prefs': 'preferences',
      ':channel': 'channel',
      ':channel/edit' : 'channelEdit'
    },

    constructor: function(credentials) {
      Backbone.Router.call(this);
      this.credentials = credentials;
    },

    default: function() {
      if (this.credentials.username) {
        this.navigate(config.defaultChannel, {trigger: true});
      } else {
        new WelcomePage({model: this.credentials}).render();
      }
    },

    explore: function() {
      new ExplorePage();
    },

    preferences: function() {

    },

    channel: function(channel) {
      new ChannelPage({channel: channel});
    },

    channelEdit: function(channel) {
      new ChannelPage({channel: channel, edit: true});
    }
  });

  function initialize() {
    var credentials = new UserCredentials();
    credentials.fetch();
    credentials.on('accepted', function() {
      route(credentials);
    });
    credentials.on('alert', function() {
      alert('Wrong username or password.');
      credentials.set({username: null, password: null});
      credentials.save();
      route(credentials);
    });
    credentials.verify();
  }

  function route(credentials) {
    var router = new Router(credentials);
    Backbone.history.start({root: window.location.pathname});
  }

  initialize();
});

