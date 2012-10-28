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
  var Channel = require('models/Channel');
  var ChannelView = require('views/content/ChannelView');

  var ChannelPage = Backbone.View.extend({
    className: 'channelView clearfix',

    initialize: function() {
      this.model = new Channel(this.options.channel);
      this.view = new ChannelView({
        model: this.model,
        user: this.options.user
      });
      this.model.bind('fetch', this._begin, this);
      this.model.fetch({credentials: this.options.user.credentials});
    },

    _begin: function() {
      this.render();
      this._listenForNewPosts();
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
      $('.content').html(this.view.el);
    },

    destroy: function() {
      this.view.destroy();
      this.remove();
    }
  });

  return ChannelPage;
});
