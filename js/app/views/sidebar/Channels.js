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
  var _ = require('underscore')
  var avatarFallback = require('util/avatarFallback');
  var routeUrl = require('util/routeUrl');
  var Backbone = require('backbone');
  var ChannelMetadata = require('models/ChannelMetadata');
  var template = require('text!templates/sidebar/channels.html')

  var Channels = Backbone.View.extend({
    className: 'channels antiscroll-wrap',

    initialize: function() {
      this.metadatas = [];
      this._getChannelsMetadata();
    },

    render: function() {
      this.$el.html(_.template(template, {
        metadatas: this.metadatas,
        routeUrl: routeUrl
      }));
      avatarFallback(this.$('.channel img'), undefined, 50);
    },

    _getChannelsMetadata: function() {
      var self = this;
      var callback = this._triggerRenderCallback();

      _.each(this.model.channels(), function(channel, index) {
        var metadata = new ChannelMetadata(channel);
        self.metadatas.push(metadata);
        metadata.fetch({success: callback});
      });
    },

    _triggerRenderCallback: function() {
      var self = this;
      var fetched = [];
      return function(model) {
        fetched.push(model);
        if (fetched.length === self.metadatas.length) {
          self.render();
        }
      }
    }
  });

  return Channels;
});
