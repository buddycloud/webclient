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
  var AnonChannelOverlay = require('views/content/AnonChannelOverlay');
  var Backbone = require('backbone');
  var ChannelView = require('views/content/ChannelView');
  var Events = Backbone.Events;

  var ChannelPage = Backbone.View.extend({
    className: 'channelView clearfix',

    initialize: function() {
      this.view = new ChannelView({
        channel: this.options.channel,
        user: this.options.user
      });
      /*this.model.bind('fetch', this._begin, this);
      this.model.bind('error', this._error, this);
      this.model.fetch({credentials: this.options.user.credentials});*/
      this.render();

      if (this.options.user.isAnonymous()) {
        this.overlay = new AnonChannelOverlay({model: this.options.user});
      }
    },

    render: function() {
      this.view.render();
      var $content = $('.content');

      if (this.overlay) {
        this._renderAnonPage($content);
      } else {
        $content.html(this.view.el);
        $content.removeClass('full');
      }
    },

    _renderAnonPage: function(content) {
      this.overlay.render();
      var $center = $('<div class="stupidFirefoxFlexBoxBug centered stretchWidth stretchHeight"></div>');
      $center.html(this.view.el);

      content.addClass('anonView');
      content.append(this.overlay.el);
      content.append($center);
    },

    destroy: function() {
      if (this.overlay) {
        this.overlay.remove();
      }
      this.view.destroy();
      this.remove();
    }
  });

  return ChannelPage;
});
