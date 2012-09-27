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
  var PreferencesHeader = require('views/content/PreferencesHeader');
  var PreferencesStream = require('views/content/PreferencesStream');

  var PreferencesView = Backbone.View.extend({
    className: 'channelView',

    initialize: function() {
      this.header = new PreferencesHeader({
        model: this.model,
        user: this.options.user
      });
      this.stream = new PreferencesStream({
        model: this.options.user
      });
    },

    render: function() {
      // This was necessary to replicate the same structure of prototype
      var $centered = $('<div class="centered start"></div>');
      this.header.render();
      this.stream.render();
      $centered.append(this.stream.el);
      this.$el.append(this.header.el);
      this.$el.append($centered);
    }
  });

  return PreferencesView;
});
