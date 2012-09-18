/*
 * Copyright 2012 Denis Washington <denisw@online.de>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

define(function(require) {
  var Backbone = require('backbone');
  var DiscoverView = require('views/content/DiscoverView');
  var Search = require('models/Search');
  var SearchBar = require('views/content/SearchBar');
  var SearchView = require('views/content/SearchView');

  var ExplorePage = Backbone.View.extend({
    className: 'discoverPage clearfix',

    initialize: function() {
      this.model = new Search();
      this.discover = new DiscoverView();
      this.searchbar = new SearchBar({model: this.model});
      this.search = new SearchView({model: this.model});
      this.model.bind('fetch', this._renderSearch, this);
      this.render();
    },

    render: function() {
      this.searchbar.render();
      this.discover.render();
      this.$el.append(this.searchbar.el);
      this.$el.append(this.discover.el);
      $('.content').append(this.el);
    },

    _renderSearch: function() {
      // Remember: Backbone 0.9.2 stable version has a memory issue on remove()
      this.discover.remove();
      if (!this.$el.find(this.search).length) {
        this.$el.append(this.search.el);
      }
    }
  });

  return ExplorePage;
});
