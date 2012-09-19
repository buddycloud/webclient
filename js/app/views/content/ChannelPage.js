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
  var ChannelDetails = require('views/content/ChannelDetails');
  var ChannelView = require('views/content/ChannelView');

  var ChannelPage = Backbone.View.extend({
    className: 'channelView clearfix',

    initialize: function() {
      this.model = new Channel(this.options.channel);
      this.view = new ChannelView({
        model: this.model,
        user: this.options.user
      });
      this.details = new ChannelDetails({
        model: this.model,
        user: this.options.user
      });
      this.model.bind('fetch', this.render, this);
      this.model.fetch()
    },

    render: function() {
      this.view.render();
      this.details.render();
      this.$el.append(this.view.el);
      this.$el.append(this.details.el);
      $('.content').append(this.el);
    }
  });

  return ChannelPage;
});
