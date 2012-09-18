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
  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');
  var config = require('config');

  var ChannelPage = require('views/content/ChannelPage');
  var ExplorePage = require('views/content/ExplorePage');
  var WelcomePage = require('views/overlay/WelcomePage');

  var Router = Backbone.Router.extend({

    routes: {
      '': 'default',
      'explore': 'explore',
      'prefs': 'preferences',
      ':channel': 'channel',
      ':channel/edit' : 'channelEdit'
    },

    default: function() {
      // if logged in
      new WelcomePage().render()
      // if followed channels < 5
      // this.navigate("explore")
      // else
      // this.navigate("mychannel@example.com")
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
      new ChannelPage({channel: channel, edit: true})
    }
  });

  new Router();
  Backbone.history.start({root: window.location.pathname/*, pushState: true*/});
});

