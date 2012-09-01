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
  var ChannelMetadata = require('app/models/ChannelMetadata');

  describe('ChannelMetadata', function() {
    var metadata;

    beforeEach(function() {
      metadata = new ChannelMetadata('alice@example.com');
    });

    it('should initialize correctly', function() {
      expect(metadata.channel).toBe('alice@example.com');
    });

    it('should have URL /<channel>/metadata/posts', function() {
      var url = 'https://example.com/alice@example.com/metadata/posts';
      expect(metadata.url()).toBe(url);
    });

    describe('avatarUrl()', function() {
      it('should return /<channel>/media/avatar', function() {
        var url = 'https://example.com/alice@example.com/media/avatar';
        expect(metadata.avatarUrl()).toBe(url);
      });
    });

    describe('set()', function() {
      it('should set attributes directly on object', function() {
        metadata.set({
          title: 'Alice',
          description: 'Your favorite persona',
          creation_date: '2012-01-01',
          channel_type: 'personal',
          access_model: 'authorize'
        });
        expect(metadata.title).toBe('Alice');
        expect(metadata.description).toBe('Your favorite persona');
        expect(metadata.creationDate).toBe('2012-01-01');
        expect(metadata.channelType).toBe('personal');
        expect(metadata.accessModel).toBe('authorize');
      });

      it('should set attributes before triggering "change"', function() {
        spyOn(metadata, 'trigger').andCallThrough();
        metadata.on('change:title', function() {
          expect(metadata.title).toBe('Alice');
        });
        metadata.set({
          title: 'Alice',
          description: 'Your favorite persona',
          creation_date: '2012-01-01',
          channel_type: 'personal',
          access_model: 'authorize'
        });
        expect(metadata.trigger).toHaveBeenCalled();
      });

    });
  });

});