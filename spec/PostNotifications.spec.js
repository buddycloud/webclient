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
  var PostNotifications = require('models/PostNotifications');

  describe('PostNotifications', function() {
    var notifications;

    beforeEach(function() {
      notifications = new PostNotifications;
    });

    it('should have URL /notifications/posts', function() {
      var url = 'https://example.com/notifications/posts';
      expect(notifications.url()).toBe(url);
    });

    describe('fetch()', function() {
      it('should include "Accept: application/json" header', function() {
        spyOn($, 'ajax').andCallFake(function(options) {
          expect(options.headers['Accept']).toBe('application/json');
        });
        notifications.fetch();
        expect($.ajax).toHaveBeenCalled();
      });
    });
  });

});
