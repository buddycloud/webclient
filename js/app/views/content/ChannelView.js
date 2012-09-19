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
  var ChannelHeader = require('views/content/ChannelHeader');
  var ChannelStream = require('views/content/ChannelStream');

  var ChannelView = Backbone.View.extend({
    className: 'channelView clearfix',

    initialize: function() {
      var credentials = this.options.credentials;
      this.header = new ChannelHeader({
        model: this.model,
        credentials: credentials
      });
      this.stream = new ChannelStream({
        model: this.model,
        credentials: credentials
      });
    },

    render: function() {
      this.header.render();
      this.stream.render();
      this.$el.append(this.header.el);
      this.$el.append(this.stream.el);
    }
  });

  return ChannelView;
});
