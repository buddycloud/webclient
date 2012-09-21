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
  var MetadataSearch = require('models/MetadataSearch');
  var ContentSearch = require('models/ContentSearch');
  var Search = require('models/Search');

  describe('Search', function() {
    var search;

    beforeEach(function() {
      search = new Search('eve@example.com');
    });

    it('should initialize submodels correctly', function() {
      expect(search.channels instanceof MetadataSearch).toBeTruthy();
      expect(search.posts instanceof ContentSearch).toBeTruthy();
    });

    describe('doSearch()', function() {
      it('should call doSearch() on each submodel', function() {
        spyOn(search.channels, 'doSearch');
        spyOn(search.posts, 'doSearch');
        search.doSearch({q: 'test'});
        expect(search.channels.doSearch).toHaveBeenCalled();
        expect(search.posts.doSearch).toHaveBeenCalled();
      });

      it('each submodel should NOT call fetch() on doSearch()', function() {
        spyOn(search.channels, 'fetch');
        spyOn(search.posts, 'fetch');
        search.doSearch({});
        expect(search.channels.fetch).not.toHaveBeenCalled();
        expect(search.posts.fetch).not.toHaveBeenCalled();
      });

      it('should trigger "fetch" if all submodels are fetched', function() {
        spyOn(search.channels, 'fetch').andCallFake(function(options) {
          options.success(search.channels);
        });
        spyOn(search.posts, 'fetch').andCallFake(function(options) {
          options.success(search.posts);
        });
        spyOn(search, 'trigger');
        search.doSearch({q: 'test'});
        expect(search.trigger).toHaveBeenCalledWith('fetch');
      });
    });
  });
});
