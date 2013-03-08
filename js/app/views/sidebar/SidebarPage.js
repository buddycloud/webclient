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
  var ActionBar = require('views/sidebar/ActionBar');
  var Backbone = require('backbone');
  var Channels = require('views/sidebar/Channels');
  var PersonalChannel = require('views/sidebar/PersonalChannel');

  var SidebarPage = Backbone.View.extend({
    className: 'sidebar hidden',

    initialize: function() {
      this.personalChannel = new PersonalChannel({model: this.model});
      this.actionBar = new ActionBar();
      this.channels = new Channels({model: this.model});
      this.render();
    },

    render: function() {
      var $sidebar = $('.sidebar');
      $sidebar.append(this.personalChannel.el);
      $sidebar.append(this.actionBar.render().el);
      $sidebar.append(this.channels.el);
      $sidebar.removeClass('hidden');
    },

    destroy: function() {
      $('.sidebar').addClass('hidden');
      this.personalChannel.remove();
      this.actionBar.remove();
      this.channels.remove();
      this.remove();
    },

    selectChannel: function(channel) {
      this.personalChannel.selectChannel(channel);
      this.channels.selectChannel(channel);
    },

    unSelectChannel: function() {
      this.personalChannel.selectChannel('');
      this.channels.selectChannel('');
    }
  });

  return SidebarPage;
});
