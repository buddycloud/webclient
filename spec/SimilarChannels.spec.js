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
  var SimilarChannels = require('models/SimilarChannels');
  var MetadataSearchResult = require('models/MetadataSearchResult');

  describe('SimilarChannels', function() {
    var similarChannels;
    var similarChannelsData = [{
      'jid': 'alice@example.com',
      'title': 'Alice\'s channel',
      'channelType': 'personal',
      'description': 'Alice\'s channel description',
      'published': '2012-01-01',
      'defaultAffiliation': 'member'
    }, {
      'jid': 'bob@example.com',
      'title': 'Bob\'s channel',
      'channelType': 'personal',
      'description': 'Bob\'s channel description',
      'published': '2012-01-02',
      'defaultAffiliation': 'publisher'      
    }, {
      'jid': 'lounge@topics.example.com',
      'title': 'Lounge channel',
      'channelType': 'topic',
      'description': 'Lounge channel description',
      'published': '2012-01-03',
      'defaultAffiliation': 'publisher'       
    }];

    beforeEach(function() {
      similarChannels = new SimilarChannels('ron@example.com');
      similarChannels.reset(similarChannels.parse(similarChannelsData));
    });

    it('should initialize correctly', function() {
      expect(similarChannels.channel).toBe('ron@example.com');
    });

    it('should have URL /<channel>/similar', function() {
      var url = 'https://example.com/ron@example.com/similar';
      expect(similarChannels.url()).toBe(url);
    });

    describe('usernames()', function() {
      it('should return similar channels jids', function() {
        var usernames = similarChannels.usernames();
        expect(usernames.length).toBe(3);
        expect(usernames).toContain('alice@example.com');
        expect(usernames).toContain('bob@example.com');
        expect(usernames).toContain('lounge@topics.example.com');
      });
    });
  });

});
