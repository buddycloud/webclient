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
  var parseUtil = require('app/util/parseUtil');

  describe('util/parseUtil', function() {
    describe('linkMentions()', function() {
      it('should return the channels mentions inline as html anchors', function() {
        var mention1 = parseUtil.linkMentions('testing channel@domain.tld');
        var mention2 = parseUtil.linkMentions('testing channel@domain.tld testing');
        var mention3 = parseUtil.linkMentions('channel@domain.tld testing');
        var mention4 = parseUtil.linkMentions('testing channel@domain.tld channel@domain.tld');
        var mention5 = parseUtil.linkMentions('testing channel@domain.tld channel@domain.tld testing');
        var mention6 = parseUtil.linkMentions('channel@domain.tld channel@domain.tld testing');
        var mention7 = parseUtil.linkMentions('c%hannel@domain.tld');
        var mention8 = parseUtil.linkMentions('chan&nel@domain.tld');
        var mention9 = parseUtil.linkMentions('channel@domain-ww.tld');
        var mention10 = parseUtil.linkMentions('%channel@domain-ww.tld');
        expect(mention1).toBe('testing <a href="/?channel@domain.tld">channel@domain.tld</a>');
        expect(mention2).toBe('testing <a href="/?channel@domain.tld">channel@domain.tld</a> testing');
        expect(mention3).toBe('<a href="/?channel@domain.tld">channel@domain.tld</a> testing');
        expect(mention4).toBe('testing <a href="/?channel@domain.tld">channel@domain.tld</a> <a href="/?channel@domain.tld">channel@domain.tld</a>');
        expect(mention5).toBe('testing <a href="/?channel@domain.tld">channel@domain.tld</a> <a href="/?channel@domain.tld">channel@domain.tld</a> testing');
        expect(mention6).toBe('<a href="/?channel@domain.tld">channel@domain.tld</a> <a href="/?channel@domain.tld">channel@domain.tld</a> testing');
        expect(mention7).toBe('<a href="/?c%hannel@domain.tld">c%hannel@domain.tld</a>');
        expect(mention8).toBe('<a href="/?chan&nel@domain.tld">chan&nel@domain.tld</a>');
        expect(mention9).toBe('<a href="/?channel@domain-ww.tld">channel@domain-ww.tld</a>');
        expect(mention10).toBe('%<a href="/?channel@domain-ww.tld">channel@domain-ww.tld</a>');
      });
    });
  });

});