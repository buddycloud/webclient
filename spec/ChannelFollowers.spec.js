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
  var ChannelFollowers = require('app/models/ChannelFollowers');

  describe('ChannelFollowers', function() {
    var followers;

    beforeEach(function() {
      followers = new ChannelFollowers('alice@example.com');
      followers.set({
        'alice@example.com': 'owner',
        'bob@example.com': 'publisher',
        'ron@example.com': 'publisher',
        'eve@example.com': 'member'
      });
    });

    it('should initialize correctly', function() {
      expect(followers.channel).toBe('alice@example.com');
    });

    it('should have URL /<channel>/subscribers/<node>', function() {
      var url = 'https://example.com/alice@example.com/subscribers/posts';
      expect(followers.url()).toBe(url);
    });

    describe('usernames()', function() {
      it('should return followers without affiliations', function() {
        var usernames = followers.usernames();
        expect(usernames.length).toBe(4);
        expect(usernames).toContain('alice@example.com');
        expect(usernames).toContain('bob@example.com');
        expect(usernames).toContain('ron@example.com');
        expect(usernames).toContain('eve@example.com');
      });
    });
  });

});