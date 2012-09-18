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
  var $ = require('jquery');
  var _ = require('underscore')
  var Backbone = require('backbone');
  var Channel = require('models/Channel');
  var ChannelHeader = require('views/content/ChannelHeader');
  var ChannelStream = require('views/content/ChannelStream');

  var ChannelView = Backbone.View.extend({
    className: 'channelView clearfix',

    initialize: function() {
      this.model = new Channel(this.options.channel);
      this.header = new ChannelHeader({model: this.model});
      this.stream = new ChannelStream({model: this.model});
      this.model.bind('fetch', this.render, this);
      this.model.fetch()
    },

    render: function() {
      this.header.render();
      this.stream.render();
      this.$el.append(this.header.el);
      this.$el.append(this.stream.el);
      $('.content').append(this.el);
    },

    appendPosts: function(num) {
      that = this;
      var posts = that.model.posts.models;
      _.each(posts, function(element, index) {
        var post = new PostView({model: element})
        post.render()
        that.$el.append(post.el);
      })
    }
  });

  return ChannelView;
});
