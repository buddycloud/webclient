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
    'Router': '../app/Router',
    'util': '../app/util',
    'views': '../app/views'
  }
});

define(function(require) {
  var Router = require('Router');
  var User = require('models/User');

  var config = require('config');

  function initialize() {
    var user = new User;
    user.credentials.fetch();
    user.on('loginSuccess', function() {
      route(user);
    });
    user.on('loginError', function() {
      alert('Wrong username or password.');
      user.credentials.set({username: null, password: null});
      user.credentials.save();
      route(user);
    });
    user.login();
  }

  function route(user) {
    var router = new Router(user);
    Backbone.history.start({root: window.location.pathname, pushState: config.release);
  }

  initialize();
});

