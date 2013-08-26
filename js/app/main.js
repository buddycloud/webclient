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

require.config({
  baseUrl: '/js/app',
  paths: {
    'dropzone': '../vendor/dropzone',
    'backbone': '../vendor/backbone',
    'underscore': '../vendor/underscore',
    'config': '../../config',
    'templates': '../../templates',
    'models': '../app/models',
    'Router': '../app/Router',
    'util': '../app/util',
    'views': '../app/views',
    'jquery.cookie': '../vendor/jquery.cookie',
    'modernizr': '../vendor/modernizr',
    'jquery': '../vendor/jquery',
    'l10n': '../vendor/l10n',
    'l10n-browser': '../vendor/l10n-browser',
    'text': '../vendor/text',
    'backbone-indexeddb': '../vendor/backbone-indexeddb',
    'pollymer': '../vendor/pollymer',
    'timeago': '../vendor/timeago',
    'jquery.embedly': '../vendor/jquery.embedly'
  },

  shim: {
    'modernizr': {
      exports: 'Modernizr'
    },
    'backbone-indexeddb': {
      deps: ['backbone'],
      exports: 'Backbone'
    },
    'jquery.cookie': {
      deps: ['jquery']
    },
    'underscore': {
      exports: '_'
    },
    'jquery': {
      exports: '$'
    },
    'backbone' : {
      deps: ['jquery', 'underscore'],
      exports: 'Backbone'
    },
    'Router': {
      deps: ['backbone']
    },
    'l10n': {
      deps: ['backbone']
    },
    'jquery.embedly': {
      deps: ['jquery']
    }
  }
});

require(['l10n', 'l10n-browser', 'Router', 'models/User', 'modernizr', 'jquery.cookie', 'jquery.embedly', 'timeago', 'util/autoResize'],
    function(l10n, l10nBrowser, Router, User) {

  var lang, initialized;

  function initialize() {
    var user = new User();
    Backbone.Events.on('syncSuccess', function() {
      route(user);
    });

    user.start();
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
  );

  // Cookies
  $.cookie.path = '/';
});
