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

requirejs.config({
  baseUrl: '/js/vendor',
  paths: {
    'config': '../../config',
    'templates': '../../templates',
    'models': '../app/models',
    'Router': '../app/Router',
    'util': '../app/util',
    'views': '../app/views'
  },

  shim: {
    'modernizr': {
      exports: 'Modernizr'
    }
  }
});

define(function(require) {
  var l10n = require('l10n');
  var l10nBrowser = require('l10n-browser');
  var Router = require('Router');
  var User = require('models/User');
  var lang, initialized;

  function initialize() {
    var user = new User;
    user.credentials.fetch();
    user.on('loginSuccess', function() {
      route(user);
    });
    user.on('loginError', function() {
      user.logout();
      route(user);
    });
    user.login({permanent: localStorage.loginPermanent === 'true'});
  }

  function route(user) {
    if (!initialized) {
      new Router(user);
      Backbone.history.start({pushState: true});
      initialized = true;
    }
  }

  if (typeof(navigator.browserLanguage) !== 'undefined') {
    // handle IE.
    lang = navigator.browserLanguage;
  } else {
    // everyone else
    lang = navigator.language;
  }
  l10n.setAdapter(l10nBrowser, {baseURL: '/locales/'});
  // uncomment the following line to mark all localised strings in the rendered interface (useful for debugging localisation code).
  //l10n.setMarkStrings();
  l10n.loadResource('data.properties', lang,
      initialize, // do this once the locale data has loaded
      function(err) {
        console.log('Failed to load locale data');
      }
      )
});

