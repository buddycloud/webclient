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
  var Backbone = require('backbone');
  var ChannelPage = require('views/content/ChannelPage');
  var CreateChannelPage = require('views/content/CreateChannelPage');
  var config = require('config');
  var EditChannelPage = require('views/content/EditChannelPage');
  var ExplorePage = require('views/content/ExplorePage');
  var PreferencesPage = require('views/content/PreferencesPage');
  var ErrorPage = require('views/content/ErrorPage');
  var ForbiddenPage = require('views/content/ForbiddenPage');
  var SidebarPage = require('views/sidebar/SidebarPage');
  var spinner = require('util/spinner');
  var WelcomePage = require('views/overlay/WelcomePage');
  var Events = Backbone.Events;

  var Router = Backbone.Router.extend({
    routes: {
      '(?h=:host)': 'home',
      'home(?h=:host)': 'home',
      'explore': 'explore',
      'prefs': 'preferences',
      'new-channel': 'newChannel',
      ':channel': 'channel',
      ':channel/edit' : 'channelEdit'
    },

    constructor: function(user) {
      Backbone.Router.call(this);
      this.user = user;
    },

    initialize: function() {
      Events.on('navigate', this._navigate, this);
      Events.on('pageError', this._error, this);
      Events.on('forbidden', this._forbidden, this);
    },

    // It would be nice if we could wrap its route function
    // or just use something like https://github.com/boazsender/backbone.routefilter
    _before: function(route) {
      if (this.user.isAnonymous() && this.sidebar) {
        this.sidebar.destroy();
        this.sidebar = null;
      } else if (!this.user.isAnonymous() && !this.sidebar) {
        this.sidebar = new SidebarPage({model: this.user});
      }

      if (this.currentPage) {
        this.currentPage.destroy();
      }

      this._updateCookie();
      spinner.replace($('.content'));
    },

    _updateCookie: function() {
      var credentials = this.user.credentials;
      credentials.updateCookie();
    },

    _navigate: function(path) {
      this.navigate(path, {trigger: true});
    },

    home: function() {
      this._before();
      if (this.user.isAnonymous()) {
        this.currentPage = new WelcomePage({model: this.user});
      } else {
        if (this.user.channels().length <= 5) {
          this.navigate('explore', {trigger: true});
        } else {
          this.navigate(this.user.username(), {trigger: true});
        }
      }
    },

    // Override default method to always use lower case
    navigate: function(fragment, options) {
      if (fragment) {
        fragment.toLowerCase();
      }

      Backbone.Router.prototype.navigate.call(this, fragment, options);
    },

    explore: function() {
      this._before();
      if (this.sidebar) {
        this.sidebar.unSelectChannel();
      }
      this.currentPage = new ExplorePage({user: this.user});
    },

    preferences: function() {
      this._before();
      this.currentPage = new PreferencesPage({user: this.user});
    },

    channel: function(channel) {
      this._before();
      if (this.sidebar) {
        this.sidebar.selectChannel(channel);
      }
      this.currentPage = new ChannelPage({channel: channel, user: this.user});
    },

    channelEdit: function(channel) {
      this._before();
      this.currentPage = new EditChannelPage({channel: channel, user: this.user});
    },

    newChannel: function(channel) {
      this._before();
      this.currentPage = new CreateChannelPage({user: this.user});
    },

    _error: function(domain, error) {
      this._before();
      this.currentPage = new ErrorPage({'domain': domain, 'error': error});
    },

    _forbidden: function() {
      this._before();
      this.currentPage = new ForbiddenPage();
    }
  });

  return Router;
});
