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
  var Backbone = require('backbone');
  var ChannelPage = require('views/content/ChannelPage');
  var config = require('config');
  var EditChannelPage = require('views/content/EditChannelPage');
  var ExplorePage = require('views/content/ExplorePage');
  var PreferencesPage = require('views/content/PreferencesPage');
  var SidebarPage = require('views/sidebar/SidebarPage');
  var WelcomePage = require('views/overlay/WelcomePage');
  var Events = Backbone.Events;

  var Router = Backbone.Router.extend({
    routes: {
      '': 'default',
      'explore': 'explore',
      'prefs': 'preferences',
      ':channel': 'channel',
      ':channel/edit' : 'channelEdit'
    },

    constructor: function(user) {
      Backbone.Router.call(this);
      this.user = user;
    },

    initialize: function() {
      Events.on('navigate', this._navigate, this);
    },

    // It would be nice if we could wrap its route function
    // or just use something like https://github.com/boazsender/backbone.routefilter
    _before: function(route) {
      if (!this.user.isAnonymous() && !this.sidebar) {
        this.sidebar = new SidebarPage({model: this.user});
      }
    },

    _navigate: function(path) {
      this.navigate(path, {trigger: true});
    },

    default: function() {
      this._before();
      if (this.user.isAnonymous()) {
        new WelcomePage({model: this.user}).render();
      } else {
        if (this.user.channels().length < 5) {
          this.navigate('explore', {trigger: true});
        } else {
          this.navigate(this.user.username(), {trigger: true});
        }
      }
    },

    explore: function() {
      this._before();
      new ExplorePage({user: this.user});
    },

    preferences: function() {
      this._before();
      new PreferencesPage({user: this.user});
    },

    channel: function(channel) {
      this._before();
      if (this.sidebar) {
        this.sidebar.selectChannel(channel);
      }
      new ChannelPage({channel: channel, user: this.user});
    },

    channelEdit: function(channel) {
      this._before();
      new EditChannelPage({channel: channel, user: this.user});
    }
  });

  return Router;
});
