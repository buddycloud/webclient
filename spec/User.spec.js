/*
 * Copyright 2012 Denis Washington <denisw@online.de>
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
  var User = require('models/User');

  describe('User', function() {
    var user;
    var realLocalStorage = localStorage;

    beforeEach(function() {
      user = new User;
      Object.defineProperty(window, 'localStorage', {
        value: {},
        writable: true
      });
    });

    afterEach(function() {
      window.localStorage = realLocalStorage;
    });

    describe('login()', function() {
      it('should send authorized request to URL /subscribed', function() {
        spyOn($, 'ajax').andCallFake(function(options) {
          expect(options.url).toBe('https://example.com/subscribed');
          var auth = 'Basic ' + btoa('bob@example.com:bob');
          expect(options.headers['Authorization']).toBe(auth);
          expect(options.xhrFields.withCredentials).toBe(true);
        });
        user.credentials.set({username: 'bob@example.com', password: 'bob'});
        user.login();
        expect($.ajax).toHaveBeenCalled();
      });

      it('should not send request if user is anonymous', function() {
        spyOn($, 'ajax');
        user.login();
        expect($.ajax).not.toHaveBeenCalled();
      });

      it('should trigger "loginSuccess" on success response', function() {
        spyOn($, 'ajax').andCallFake(function(options) {
          options.success();
        });
        spyOn(user, 'trigger');
        user.credentials.set({username: 'bob@example.com', password: 'bob'});
        user.login();
        expect(user.trigger).toHaveBeenCalledWith('loginSuccess');
      });

      it('should trigger "loginSuccess" if user is anonymous', function() {
        spyOn(user, 'trigger');
        user.credentials.set({username: null, password: null});
        user.login();
        expect(user.trigger).toHaveBeenCalledWith('loginSuccess');
      });

      it('should trigger "loginError" on error response', function() {
        spyOn($, 'ajax').andCallFake(function(options) {
          options.error();
        });
        spyOn(user, 'trigger');

        user.credentials.set({username: 'bob@example.com', password: 'bob'});
        user.login();
        expect(user.trigger).toHaveBeenCalledWith('loginError');
      });

      it('should increase localStorage.loginCount on success', function() {
        spyOn($, 'ajax').andCallFake(function(options) {
          options.success();
        });
        user.credentials.set({username: 'bob@example.com', password: 'bob'});
        localStorage.loginCount = '3';
        user.login();
        expect(localStorage.loginCount).toBe('4');
      });

      it('should not increase loginCount if {permanent: true} is passed', function() {
        spyOn($, 'ajax').andCallFake(function(options) {
          options.success();
        });
        user.credentials.set({username: 'bob@example.com', password: 'bob'});
        localStorage.loginCount = '3';
        user.login({permanent: true});
        expect(localStorage.loginCount).toBe('3');
      });
    });

    describe('logout()', function() {
      beforeEach(function() {
        user.credentials.set({username: 'bob@example.com', password: 'bob'});
      });

      it('should decrease localStorage.loginCount', function() {
        localStorage.loginCount = '2';
        user.logout();
        expect(localStorage.loginCount).toBe('1');
      });

      it('should not decrease loginCount if user is anonymous', function() {
        user.credentials.set({username: null, password: null});
        localStorage.loginCount = '2';
        user.logout();
        expect(localStorage.loginCount).toBe('2');
      });

      it('should not decrease loginCount if it is already 0', function() {
        localStorage.loginCount = '0';
        user.logout();
        expect(localStorage.loginCount).toBe('0');
      });

      it('should reset credentials if loginCount reaches 0', function() {
        localStorage.loginCount = '1';
        user.logout();
        expect(localStorage.username).toBeUndefined();
        expect(user.password).toBeUndefined();
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
                'username': 'bob@example.com', 
                'password': 'bob',
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
          options.error(new XMLHttpRequest);
        });
        spyOn(user, 'trigger');

        user.register('bob@example.com', 'bob', 'bob@example.com');
        expect(user.trigger).toHaveBeenCalledWith('registrationError', 'Registration error');
      });
    });
  });
});
