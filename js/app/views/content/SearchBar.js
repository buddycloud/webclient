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
  var Events = Backbone.Events;
  var l10n = require('l10n');
  var template = require('text!templates/content/searchBar.html')

  var SearchBar = Backbone.View.extend({
    className: 'searchbar',

    events: {'submit form': 'search'},

    search: function(e) {
      var q = this.$el.find('input[type=search]').val();
      e.preventDefault();
      this.model.doSearch({q: q});
      Events.trigger('startSearch');
    },

    render: function() {
      this.$el.html(_.template(template, {l: l10n.get}));
    }
  });

  return SearchBar;
});
