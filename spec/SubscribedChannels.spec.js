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
  var SubscribedChannels = require('models/SubscribedChannels');

  describe('SubscribedChannels', function() {
    var subscribedChannels;

    beforeEach(function() {
      subscribedChannels = new SubscribedChannels();
      subscribedChannels.set({
        'alice@example.com/posts': 'owner',
        'alice@example.com/status': 'owner',
        'bob@example.com/geo': 'publisher',
        'ron@example.com/status': 'publisher',
        'alice@example2.com/posts': 'member'
      });
    });

    it('should have URL /<channel>/subscribers/<node>', function() {
      var url = 'https://example.com/subscribed';
      expect(subscribedChannels.url()).toBe(url);
    });

    describe('channels()', function() {
      it('should return subscribedChannels without affiliations', function() {
        var channels = subscribedChannels.channels();
        expect(channels.length).toBe(4);
        expect(channels).toContain('alice@example.com');
        expect(channels).toContain('alice@example2.com');
        expect(channels).toContain('bob@example.com');
        expect(channels).toContain('ron@example.com');
      });
    });

    describe('parse()', function() {
      it('should return only the channels that refers to posts node', function() {
        var fixedChannels = subscribedChannels.parse({
          'alice@example.com/posts': 'owner',
          'alice@example.com/status': 'owner',
          'bob@example.com/geo': 'publisher',
          'ron@example.com/status': 'publisher',
          'alice@example2.com/posts': 'member'
        });
        expect(fixedChannels['alice@example.com/posts']).toBe('owner');
        expect(fixedChannels['alice@example.com/statis']).toBe(undefined);
        expect(fixedChannels['bob@example.com/geo']).toBe(undefined);
        expect(fixedChannels['ron@example.com/status']).toBe(undefined);
        expect(fixedChannels['alice@example2.com/posts']).toBe('member');
      });
    });
  });

});
