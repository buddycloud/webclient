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
  var l10nBrowser = require('l10n-browser');
  var localTemplate;
  var template = require('text!templates/content/anonBar.html');

  var AnonBar = Backbone.View.extend({
    className: 'navigation clearfix',

    events: {'click .findChannels': 'explore',
             'click .home': 'home'},

    initialize: function() {
      if (!localTemplate) localTemplate = l10nBrowser.localiseHTML(template, {});
      this.render();
    },

    explore: function() {
      Events.trigger('navigate', 'explore');
    },

    home: function() {
      Events.trigger('navigate', '/');
    },

    render: function() {
      this.$el.html(_.template(localTemplate));
    }
  });

  return AnonBar;
});
