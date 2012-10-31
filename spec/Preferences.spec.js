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
  var Preferences = require('models/Preferences');

  describe('Preferences', function() {
    var preferences;

    beforeEach(function() {
      preferences = new Preferences();
      preferences.set({
        'email': 'alice@example.com',
        'postAfterMe': 'true',
        'postMentionedMe': 'false',
        'postOnMyChannel': 'false',
        'postOnSubscribedChannel': 'false',
        'followMyChannel': 'true',
        'followRequest': 'true'
      });
    });

    it('should have URL /notifications', function() {
      var url = 'https://example.com/notifications';
      expect(preferences.url()).toBe(url);
    });

    describe('email()', function() {
      it('should return user email', function() {
        var email = preferences.email();
        expect(email).toBe('alice@example.com');
      });
    });

    describe('newFollowers()', function() {
      it('should return correct boolean value', function() {
        var newFollowers = preferences.newFollowers();
        expect(newFollowers).toBe(true);
      });
    });

    describe('mentions()', function() {
      it('should return correct boolean value', function() {
        var mentions = preferences.mentions();
        expect(mentions).toBe(false);
      });
    });

    describe('ownChannel()', function() {
      it('should return correct boolean value', function() {
        var ownChannel = preferences.ownChannel();
        expect(ownChannel).toBe(false);
      });
    });

    describe('followedChannels()', function() {
      it('should return correct boolean value', function() {
        var followedChannels = preferences.followedChannels();
        expect(followedChannels).toBe(false);
      });
    });

    describe('threads()', function() {
      it('should return correct boolean value', function() {
        var threads = preferences.threads();
        expect(threads).toBe(true);
      });
    });
  });

});
