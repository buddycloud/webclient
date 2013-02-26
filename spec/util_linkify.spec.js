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
  var linkify = require('util/linkify');

  describe('util/linkify', function() {
    describe('linkify()', function() {
      it('should return the channels mentions inline as HTML anchors', function() {
        var mention1 = linkify.linkify('testing channel@domain.tld');
        var mention2 = linkify.linkify('testing channel@domain.tld testing');
        var mention3 = linkify.linkify('channel@domain.tld testing');
        var mention4 = linkify.linkify('testing channel@domain.tld channel@domain.tld');
        var mention5 = linkify.linkify('testing channel@domain.tld channel@domain.tld testing');
        var mention6 = linkify.linkify('channel@domain.tld channel@domain.tld testing');
        var mention7 = linkify.linkify('c%hannel@domain.tld');
        var mention8 = linkify.linkify('chan&nel@domain.tld');
        var mention9 = linkify.linkify('channel@domain-ww.tld');
        var mention10 = linkify.linkify('%channel@domain-ww.tld');
        expect(mention1).toBe('testing <a class="internal" href="/#channel@domain.tld">channel@domain.tld</a>');
        expect(mention2).toBe('testing <a class="internal" href="/#channel@domain.tld">channel@domain.tld</a> testing');
        expect(mention3).toBe('<a class="internal" href="/#channel@domain.tld">channel@domain.tld</a> testing');
        expect(mention4).toBe('testing <a class="internal" href="/#channel@domain.tld">channel@domain.tld</a> <a class="internal" href="/#channel@domain.tld">channel@domain.tld</a>');
        expect(mention5).toBe('testing <a class="internal" href="/#channel@domain.tld">channel@domain.tld</a> <a class="internal" href="/#channel@domain.tld">channel@domain.tld</a> testing');
        expect(mention6).toBe('<a class="internal" href="/#channel@domain.tld">channel@domain.tld</a> <a class="internal" href="/#channel@domain.tld">channel@domain.tld</a> testing');
        expect(mention7).toBe('<a class="internal" href="/#c%hannel@domain.tld">c%hannel@domain.tld</a>');
        expect(mention8).toBe('<a class="internal" href="/#chan&nel@domain.tld">chan&nel@domain.tld</a>');
        expect(mention9).toBe('<a class="internal" href="/#channel@domain-ww.tld">channel@domain-ww.tld</a>');
        expect(mention10).toBe('%<a class="internal" href="/#channel@domain-ww.tld">channel@domain-ww.tld</a>');
      });
    });

    describe('urls()', function() {
      it('should return an array of URLs', function() {
        var urls1 = linkify.urls('Hello http://google.com/ world');
        var urls2 = linkify.urls('https://www.example.org/ http://example.com/abc');
        var urls3 = linkify.urls('channel@domain.tld ftp://domain.tld');
        var urls4 = linkify.urls('No URL here');
        expect(urls1).toEqual(['http://google.com']);
        expect(urls2).toEqual(['https://www.example.org', 'http://example.com/abc']);
        expect(urls3).toEqual(['ftp://domain.tld']);
        expect(urls4).toBe(null);
      });
    });
  });
});
