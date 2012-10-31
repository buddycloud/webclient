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
  var ChannelFollowers = require('models/ChannelFollowers');

  describe('ChannelFollowers', function() {
    var followers;

    beforeEach(function() {
      followers = new ChannelFollowers('alice@example.com');
      followers.set({
        'alice@example.com': 'owner',
        'bob@example.com': 'publisher',
        'ron@example.com': 'publisher',
        'joe@example.com': 'moderator',
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
        expect(usernames.length).toBe(5);
        expect(usernames).toContain('alice@example.com');
        expect(usernames).toContain('bob@example.com');
        expect(usernames).toContain('ron@example.com');
        expect(usernames).toContain('joe@example.com');
        expect(usernames).toContain('eve@example.com');
      });
    });

    describe('byType()', function() {
      it('should return followers grouped by type', function() {
        var followersGroupedBy = followers.byType();
        expect(followersGroupedBy.owner.length).toBe(1);
        expect(followersGroupedBy.moderator.length).toBe(1);
        expect(followersGroupedBy.publisher.length).toBe(2);
        expect(followersGroupedBy.member.length).toBe(1);
        expect(followersGroupedBy.owner).toContain('alice@example.com');
        expect(followersGroupedBy.moderator).toContain('joe@example.com');
        expect(followersGroupedBy.publisher).toContain('bob@example.com');
        expect(followersGroupedBy.publisher).toContain('ron@example.com');
        expect(followersGroupedBy.member).toContain('eve@example.com');
      });
    });

    describe('isPublisher()', function() {
      it('should verify if an username is a publisher', function() {
        expect(followers.isPublisher('alice@example.com')).toBeTruthy();
        expect(followers.isPublisher('joe@example.com')).toBeTruthy();
        expect(followers.isPublisher('ron@example.com')).toBeTruthy();
        expect(followers.isPublisher('eve@example.com')).toBeFalsy();
      });
    });

    describe('isOwner()', function() {
      it('should verify if an username is the channel owner', function() {
        expect(followers.isOwner('alice@example.com')).toBeTruthy();
        expect(followers.isOwner('joe@example.com')).toBeFalsy();
        expect(followers.isOwner('ron@example.com')).toBeFalsy();
        expect(followers.isOwner('eve@example.com')).toBeFalsy();
      });
    });

    describe('parse()', function() {
      var fixedFollowers, resp;

      beforeEach(function() {
        resp = {
          'bob@example.com': 'publisher',
          'ron@example.com': 'publisher',
          'eve@example.com': 'member',
          '123@anon.buddyclourg.org': 'member',
          'vic@example.com': 'follower',
          'joe@example.com': 'follower+post',
          'jon@example.com': 'member'
        };
        fixedFollowers = followers.parse(resp);
      });

      it('should remove *@anon.* followers that may exists', function() {
        expect(fixedFollowers['123@anon.buddyclourg.org']).toBe(undefined);
      });

      it('should normalize the follower roles', function() {
        expect(fixedFollowers['joe@example.com']).toBe('publisher');
        expect(fixedFollowers['jon@example.com']).toBe('member');
      });
    });
  });

});
