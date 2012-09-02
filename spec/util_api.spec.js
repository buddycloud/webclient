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
  var api = require('app/util/api');

  describe('util/api', function() {
    describe('url()', function() {
      it('should return the API root plus supplied components', function() {
        var url = api.url('foo', 'bar', 'baz');
        expect(url).toBe('https://example.com/foo/bar/baz');
      });
    });

    describe('rootUrl()', function() {
      it('should return the API root with trailing slash', function() {
        expect(api.rootUrl()).toBe('https://example.com/');
      });
    });

    describe('avatarUrl()', function() {
      it('should return the URL for a channel\'s avatar', function() {
        var url = api.avatarUrl('alice@example.com');
        expect(url).toBe('https://example.com/alice@example.com/media/avatar');
      });
    });
  });

});