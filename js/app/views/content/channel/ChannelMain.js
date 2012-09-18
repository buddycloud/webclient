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

  var ChannelModel = require('models/Channel')

  var PostView = require('views/content/channel/Post')

  var ChannelTemplate = require('text!templates/content/channel.html')

  var ChannelView = Backbone.View.extend({

    initialize: function() {
      that = this;
      this.model = new ChannelModel(this.options.channel);
      this.model.bind('fetch', this.render, this);
      this.model.fetch()
    },

    render: function() {
      $('.content').html(_.template(ChannelTemplate, this.model))
      console.log(this.model)
      this.appendPosts(80)
    },

    appendPosts: function(num) {
      that = this;
      var newPosts = that.model.fetchPosts(num);
      _.each(newPosts, function(element, index) {
        that.$el.append(new PostView({model: element}));
      })
    }
  });

  return ChannelView;
});
