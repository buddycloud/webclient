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
  var $ = require('jquery');
  var avatarFallback = require('util/avatarFallback');

  describe('util/avatarFallback', function() {
    var image;

    beforeEach(function() {
      image = new Image;
    });

    it('should set fallback URL on DOM image if avatar fails to load', function() {
      avatarFallback(image, 'personal', 32);
      $(image).trigger('error');
      expect(image.src).toContain('img/fallback-personal-32px.png');
    });

    it('should not change the passed DOM image before an "error" event', function() {
      avatarFallback(image, 'personal', 32);
      expect(image.src).toBe('');
    });

    it('should accept jQuery selectors', function() {
      var image2 = new Image;
      avatarFallback($([image, image2]), 'topic', 64);
      $(image).trigger('error');
      $(image2).trigger('error');
      expect(image.src).toContain('img/fallback-topic-64px.png');
      expect(image2.src).toContain('img/fallback-topic-64px.png');
    });
  });

});
