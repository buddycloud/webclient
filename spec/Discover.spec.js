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
  var DiscoverCollection = require('models/DiscoverCollection');
  var Discover = require('models/Discover');

  describe('Discover', function() {
    var discover;

    beforeEach(function() {
      discover = new Discover('alice@example.com');
    });

    it('should initialize submodels correctly', function() {
      expect(discover.mostActive instanceof DiscoverCollection).toBeTruthy();
      expect(discover.recommendations instanceof DiscoverCollection).toBeTruthy();
    });

    describe('doDiscover()', function() {
      it('should call fetch() on each submodel', function() {
        spyOn(discover.mostActive, 'fetch');
        spyOn(discover.recommendations, 'fetch');
        discover.doDiscover();
        expect(discover.mostActive.fetch).toHaveBeenCalled();
        expect(discover.recommendations.fetch).toHaveBeenCalled();
      });
    });
  });
});
