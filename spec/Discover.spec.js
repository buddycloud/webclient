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
  var MostActiveDiscover = require('models/MostActiveDiscover');
  var RecommendationsDiscover = require('models/RecommendationsDiscover');
  var Discover = require('models/Discover');

  describe('Discover', function() {
    var discover;

    beforeEach(function() {
      discover = new Discover();
    });

    it('should initialize submodels correctly', function() {
      expect(discover.mostActive instanceof MostActiveDiscover).toBeTruthy();
      expect(discover.recommendations instanceof RecommendationsDiscover).toBeTruthy();
    });

    describe('doDiscover()', function() {
      it('should call doDiscover() on each submodel', function() {
        spyOn(discover.mostActive, 'doDiscover');
        spyOn(discover.recommendations, 'doDiscover');
        discover.doDiscover({user: 'alice@example.com'});
        expect(discover.mostActive.doDiscover).toHaveBeenCalled();
        expect(discover.recommendations.doDiscover).toHaveBeenCalled();
      });

      it('should trigger "fetch" if all submodels are fetched', function() {
        spyOn(discover.mostActive, 'fetch').andCallFake(function(options) {
          options.success(discover.mostActive);
        });
        spyOn(discover.recommendations, 'fetch').andCallFake(function(options) {
          options.success(discover.recommendations);
        });
        spyOn(discover, 'trigger');
        discover.doDiscover({user: 'alice@example.com'});
        expect(discover.trigger).toHaveBeenCalledWith('fetch');
      });
    });
  });
});
