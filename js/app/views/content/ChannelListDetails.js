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
  var api = require('util/api');
  var Backbone = require('backbone');
  var l10nBrowser = require('l10n-browser');
  var template = require('text!templates/content/channelListDetails.html')
  var Events = Backbone.Events;

  var ChannelListDetails = Backbone.View.extend({
    className: 'adminAction',
    events: {'click h4': '_navigateToChannel'},
    positions: ['first', 'second', 'third', 'fourth'],

    initialize: function() {
      this.localTemplate = l10nBrowser.localiseHTML(template, {});
      this.$el.addClass(this.positions[this.options.position]);
      this.render();
    },

    render: function() {
      this.$el.html(_.template(this.localTemplate, {
        channel: this.options.channel,
        role: this.options.role
      }));
    },

    _navigateToChannel: function() {
      Events.trigger('navigate', this.options.channel);
    }
  });

  return ChannelListDetails;
});
