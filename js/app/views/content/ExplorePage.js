/*
 * Copyright 2012 buddycloud
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
  var Events = Backbone.Events;
  var Search = require('models/Search');
  var SearchBar = require('views/content/SearchBar');
  var SearchView = require('views/content/SearchView');
  var spinner = require('util/spinner');

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
      Events.on('startSearch', this._removeDiscover, this);
    },

    _removeDiscover: function() {
      if (this.discoverView) {
        this.discoverView.remove();
      }

      this.$el.append(this.searchView.el);
    },

    render: function() {
      this.searchbar.render();
      this.$el.append(this.searchbar.el);
      this.$el.append(this.discoverView.el);
      $('.content').html(this.el);
    },

    destroy: function() {
      this.searchbar.remove();
      if (this.discoverView) {
        this.discoverView.remove();
      }
      if (this.searchView) {
        this.searchView.remove();
      }
      this.remove();
    }
  });

  return ExplorePage;
});
