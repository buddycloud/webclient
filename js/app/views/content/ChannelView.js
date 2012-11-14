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
  var animations = require('util/animations');
  var AnonBar = require('views/content/AnonBar');
  var Backbone = require('backbone');
  var ChannelHeader = require('views/content/ChannelHeader');
  var ChannelStream = require('views/content/ChannelStream');
  var ChannelDetails = require('views/content/ChannelDetails');

  var ChannelView = Backbone.View.extend({
    className: 'channelView clearfix',

    events: {'click .join': '_showOverlay'},

    initialize: function() {
      this.header = new ChannelHeader({
        model: this.model,
        user: this.options.user
      });
      this.stream = new ChannelStream({
        model: this.model,
        user: this.options.user
      });
      this.details = new ChannelDetails({
        model: this.model,
        user: this.options.user
      });

      if (this.options.user.isAnonymous()) {
        this.bar = new AnonBar();
      }
    },

    _showOverlay: function() {
      var $overlay = $('.overlay');
      $overlay.show();
      document.redraw();
      $overlay.addClass('visible');
      $overlay.find('input').first().focus();
    },

    render: function() {
      // This was necessary to replicate the same structure of prototype
      var $centered = $('<div class="centered start"></div>');
      this.header.render();
      this.stream.render();
      this.details.render();
      $centered.append(this.stream.el);
      $centered.append(this.details.el);
      
      if (this.bar) {
        this.$el.append(this.bar.el);
      }
      this.$el.append(this.header.el);
      this.$el.append($centered);
    },

    destroy: function() {
      if (this.bar) {
        this.bar.remove();
      }
      this.header.destroy();
      this.stream.destroy();
      this.details.destroy();
    }
  });

  return ChannelView;
});
