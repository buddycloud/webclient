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
  var Channel = require('models/Channel');
  var ChannelFollowers = require('models/ChannelFollowers');
  var ChannelItems = require('models/ChannelItems');
  var ChannelMetadata = require('models/ChannelMetadata');

  describe('Channel', function() {
    var channel;

    beforeEach(function() {
      channel = new Channel('eve@example.com');
    });

    it('should initialize submodels correctly', function() {
      expect(channel.name).toBe('eve@example.com');
      expect(channel.followers instanceof ChannelFollowers).toBeTruthy();
      expect(channel.metadata instanceof ChannelMetadata).toBeTruthy();
      expect(channel.items instanceof ChannelItems).toBeTruthy();
      expect(channel.followers.channel).toBe(channel.name);
      expect(channel.metadata.channel).toBe(channel.name);
      expect(channel.items.channel).toBe(channel.name);
    });

    describe('fetch()', function() {
      it('should call fetch() on each submodel', function() {
        spyOn(channel.followers, 'fetch');
        spyOn(channel.metadata, 'fetch');
        spyOn(channel.items, 'fetch');
        channel.fetch();
        expect(channel.followers.fetch).toHaveBeenCalled();
        expect(channel.metadata.fetch).toHaveBeenCalled();
        expect(channel.items.fetch).toHaveBeenCalled();
      });

      it('should trigger "fetch" if all submodels are fetched', function() {
        spyOn(channel.followers, 'fetch').andCallFake(function(options) {
          options.success(channel.followers);
        });
        spyOn(channel.metadata, 'fetch').andCallFake(function(options) {
          options.success(channel.metadata);
        });
        spyOn(channel.items, 'fetch').andCallFake(function(options) {
          options.success(channel.items);
        });
        spyOn(channel, 'trigger');
        channel.fetch();
        expect(channel.trigger).toHaveBeenCalledWith('fetch');
      });
    });
  });
});
