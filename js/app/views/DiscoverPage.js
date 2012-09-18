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
  var Search = require('models/Search');
  var SearchBar = require('views/SearchBar');

  var DiscoverPage = Backbone.View.extend({
    className: 'discoverPage clearfix',

    initialize: function() {
      this.model = new Search();
      this.searchbar = new SearchBar();
      this.render();
    },

    render: function() {
    	this.searchbar.render();
    	this.$el.append(this.searchbar.el);
      $('.content').append(this.el);
    }
  });

  return DiscoverPage;
});
