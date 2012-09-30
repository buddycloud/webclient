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
  var EditHeader = require('views/content/EditHeader');
  var PreferencesView = require('views/content/PreferencesView');

  var PreferencesPage = Backbone.View.extend({
    className: 'channelView',

    initialize: function() {
      this.header = new EditHeader({
        model: this.options.user
      });
      this.stream = new PreferencesView({
        user: this.options.user
      });
      this.render();
    },

    render: function() {
      var content = $('.content');
      content.append(this.header.el);
      content.append(this.stream.el);
    }
  });

  return PreferencesPage;
});
