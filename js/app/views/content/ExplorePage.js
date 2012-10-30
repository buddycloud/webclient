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
  var Discover = require('models/Discover');
  var DiscoverView = require('views/content/DiscoverView');
  var Search = require('models/Search');
  var SearchBar = require('views/content/SearchBar');
  var SearchView = require('views/content/SearchView');

  var ExplorePage = Backbone.View.extend({
    className: 'discoverPage clearfix',

    initialize: function() {
      this._initDiscover();
      this._initSearch();
      this.render();
    },

    _initDiscover: function() {
      this.discoverModel = new Discover();
      this.discoverView = new DiscoverView({model: this.discoverModel, user: this.options.user});
    },

    _initSearch: function() {
      this.searchModel = new Search();
      this.searchbar = new SearchBar({model: this.searchModel});
      this.searchView = new SearchView({model: this.searchModel, user: this.options.user});
      this.searchModel.bind('fetch', this._renderSearch, this);
    },

    render: function() {
      this.searchbar.render();
      this.$el.append(this.searchbar.el);
      this.$el.append(this.discoverView.el);
      $('.content').html(this.el);
    },

    destroy: function() {
      this.searchbar.remove();
      this.discover.remove();
      this.remove();
    },

    _renderSearch: function() {
      this.discoverView.remove();
      if (!this.$el.find(this.searchView).length) {
        this.$el.append(this.searchView.el);
      }
    }
  });

  return ExplorePage;
});
