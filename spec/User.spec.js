/*
 * Copyright 2012 buddycloud
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

define(function(require) {
  require('jquery.cookie');
  var User = require('models/User');

  describe('User', function() {
    var user;
    var username = 'bob@example.com';
    var password = 'bob';
    var cred = btoa(username + ':' + password);

    beforeEach(function() {
      localStorage.clear();

      $.cookie.path = '/';
      var cookies = $.cookie();
      for (var c in cookies) {
        $.removeCookie(c);
      }

      user = new User();
    });

    describe('login()', function() {
      it('should send authorized request to URL /subscribed', function() {
        spyOn($, 'ajax').andCallFake(function(options) {
          expect(options.url).toBe('https://example.com/subscribed');
          var auth = 'Basic ' + cred;
          expect(options.headers['Authorization']).toBe(auth);
          expect(options.xhrFields.withCredentials).toBe(true);
        });

        user.login({username: username, password: password});
        expect($.ajax).toHaveBeenCalled();
      });

      it('should trigger "loginSuccess" on success response', function() {
        spyOn($, 'ajax').andCallFake(function(options) {
          options.success();
        });
        spyOn(user, 'trigger');

        user.login({username: username, password: password});
        expect(user.trigger).toHaveBeenCalledWith('loginSuccess', username);
      });


      it('should trigger "loginError" on error response', function() {
        spyOn($, 'ajax').andCallFake(function(options) {
          options.error(user.subscribedChannels, new XMLHttpRequest());
        });
        spyOn(user, 'trigger');


        user.login({username: username, password: password});
        expect(user.trigger).toHaveBeenCalledWith('loginError', 'Login error!');
      });
    });

    describe('logout()', function() {
      beforeEach(function() {
        localStorage.username = 'bob@example.com';
        $.cookie('credentials', cred);
      });

      it('should remove session information', function() {
        user.logout();
        expect(localStorage.username).toBeUndefined();
        expect($.cookie('credentials')).toBeUndefined();

        expect(sessionStorage.username).toBeUndefined();
        expect($.cookie('credentials')).toBeUndefined();
      });
    });

    describe('register()', function() {
      it('should send register request to URL /account', function() {
        spyOn($, 'ajax').andCallFake(function(options) {
          expect(options.url).toBe('https://example.com/account');
          expect(options.contentType).toBe('application/json');
          expect(options.type).toBe('POST');
          expect(options.data).toBe(
            JSON.stringify(
              {
                'username': username,
                'password': password,
                'email': 'bob@example.com'
              }));
        });

        user.register('bob@example.com', 'bob', 'bob@example.com');
        expect($.ajax).toHaveBeenCalled();
      });

      it('should not send request if username is unset', function() {
        spyOn($, 'ajax');
        user.register();
        expect($.ajax).not.toHaveBeenCalled();
      });

      it('should trigger "registrationSuccess" on success response', function() {
        spyOn($, 'ajax').andCallFake(function(options) {
          options.success();
        });
        spyOn(user, 'trigger');

        user.register('bob@example.com', 'bob', 'bob@example.com');
        expect(user.trigger).toHaveBeenCalledWith('registrationSuccess');
      });

      it('should trigger "registrationError" on error response', function() {
        spyOn($, 'ajax').andCallFake(function(options) {
          options.error(user.subscribedChannels, new XMLHttpRequest());
        });
        spyOn(user, 'trigger');

        user.register('bob@example.com', 'bob', 'bob@example.com');
        expect(user.trigger).toHaveBeenCalledWith('registrationError', 'Registration error!');
      });
    });
  });
});
