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
  var Channel = require('models/Channel');
  var ChannelView = require('views/content/ChannelView');
  var Events = Backbone.Events;

  var ChannelPage = Backbone.View.extend({
    className: 'channelView clearfix',

    initialize: function() {
      this.model = new Channel(this.options.channel);
      this.view = new ChannelView({
        model: this.model,
        user: this.options.user
      });
      this.model.bind('fetch', this._begin, this);
      this.model.bind('error', this._error, this);
      this.model.fetch({credentials: this.options.user.credentials});

      if (this.options.user.isAnonymous()) {
        this.overlay = new AnonChannelOverlay({model: this.options.user});  
      }
    },

    _begin: function() {
      this.render();
      this._listenForNewPosts();
    },

    _error: function(e) {
      this.view.destroy();
      Events.trigger('pageError', e);
    },

    _listenForNewPosts: function() {
      var user = this.options.user;
      var items = this.model.items;
      user.notifications.on('new', function(item) {
        if (item.source == items.channel) {
          items.add(item);
        }
      });
      user.notifications.listen({credentials: user.credentials});
    },

    render: function() {
      this.view.render();
      var $content = $('.content');

      if (this.overlay) {
        this._renderAnonPage($content);
      } else {
        $content.html(this.view.el);
      }
    },

    _renderAnonPage: function(content) {
      this.overlay.render();
      var $center = $('<div class="stupidFirefoxFlexBoxBug centered stretchWidth stretchHeight">');
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
