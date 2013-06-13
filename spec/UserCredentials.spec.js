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
  var UserCredentials = require('models/UserCredentials');

  describe('UserCredentials', function() {
    var credentials;
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

      credentials = new UserCredentials();
    });

    describe('set()', function() {
      it('should set "username" and "credentials" attributes', function() {
        credentials.set({username: username, credentials: cred});
        expect(credentials.username).toBe(username);
        expect(credentials.credentials).toBe(cred);
      });
    });

    describe('fetch()', function() {
      it('should get credentials from cookies', function() {
        localStorage.username = username;
        $.cookie('credentials', cred);
        credentials.fetch();
        expect(credentials.username).toBe(username);
        expect(credentials.credentials).toBe(cred);
      });

      it('should store credentials using cookies', function() {
        localStorage.username = username;
        $.cookie('credentials', cred);
        credentials.fetch();
        expect(credentials.username).toBe(username);
        expect(credentials.credentials).toBe(cred);
      });

      it('should only store username and credentials if both are set', function() {
        localStorage.username = 'bob@example.com';
        credentials.fetch();
        expect(credentials.username).toBeUndefined();
        expect(credentials.credentials).toBeUndefined();
      });

      it('should call success callback if supplied', function() {
        var success = jasmine.createSpy('success');
        localStorage.username = username;
        $.cookie('credentials', cred);
        credentials.fetch({success: success});
        expect(success).toHaveBeenCalled();
      });
    });

    describe('save()', function() {
      it('should store credentials into cookie and username into localStorage', function() {
        credentials.save({username: username, password: password});
        expect(localStorage.username).toBe('bob@example.com');
        expect($.cookie('credentials')).toBe(cred);
      });

      it('should store permanent login', function() {
        credentials.save({username: username, password: password}, {permanent: true});
        expect(localStorage.username).toBe('bob@example.com');
        expect($.cookie('credentials')).toBe(cred);
        expect(Boolean(localStorage.loginPermanent)).toBe(true);
      });

      it('should keep storage if save is called with null attributes', function() {
        credentials.save({username: 'bob@example.com', password: 'bob'});
        credentials.save({username: null, password: null});
        expect(localStorage.username).toBe(username);
        expect($.cookie('credentials')).toBe(cred);
      });

      it('should append the home domain to username if none is specified', function() {
        credentials.save({username: 'bob', password: 'bob'});
        expect(credentials.username).toBe('bob@example.com');
      });
    });

    describe('clear()', function() {
      it('should delete storage after clear', function() {
        credentials.save({username: 'bob@example.com', password: 'bob'});
        credentials.clear();
        expect(localStorage.username).toBeUndefined();
        expect($.cookie('credentials')).toBeUndefined();
      });
    });

    describe('addAuthorizationToAjaxOptions()', function() {
      it('should add "withCredentials: true" to options', function() {
        var options = {};
        credentials.addAuthorizationToAjaxOptions(options);
        expect(options.xhrFields.withCredentials).toBe(true);
      });

      it('should add HTTP Basic Authorization header to options', function() {
        var auth = 'Basic ' + cred;
        credentials.set({username: 'bob@example.com', credentials: cred});
        var options = {};
        credentials.addAuthorizationToAjaxOptions(options);
        expect(options.headers['Authorization']).toBe(auth);
      });

    });
  });

});
