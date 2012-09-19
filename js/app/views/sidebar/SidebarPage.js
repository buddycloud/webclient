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
  var ActionBar = require('views/sidebar/ActionBar');
  var Backbone = require('backbone');
  var ChannelMetadata = require('models/ChannelMetadata');
  var Channels = require('views/sidebar/Channels');
  var PersonalChannel = require('views/sidebar/PersonalChannel');

  var SidebarPage = Backbone.View.extend({
    className: 'sidebar',

    initialize: function() {
      this.metadata = new ChannelMetadata(this.model.credentials.username);
      this.personalChannel = new PersonalChannel({
        model: this.model,
        metadata: this.metadata
      });
      this.actionBar = new ActionBar();
      this.channels = new Channels({
        model: this.model.subscribedChannels
      });
      this.metadata.bind('change', this.render, this);
      this.metadata.fetch();
    },

    render: function() {
      this.personalChannel.render();
      this.actionBar.render();
      this.channels.render();
      this.$el.append(this.personalChannel.el);
      this.$el.append(this.actionBar.el);
      this.$el.append(this.channels.el);
      $('.sidebar').append(this.el);
    }
  });

  return SidebarPage;
});
