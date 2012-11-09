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
  var AbstractEditStream = require('views/content/AbstractEditStream');
  var ChannelMetadata = require('models/ChannelMetadata');
  var template = require('text!templates/content/createChannel.html');

  var CreateChannelStream = AbstractEditStream.extend({

    events: {
      'click .save': 'save',
      'click .discard': 'render',
    },

    initialize: function() {
      this._initialize();
      this.render();
    },

    render: function() {
      this.$el.html(_.template(template));
    },

    save: function() {
      var channel = this._getChannel();
      if (channel) {
        this.model = new ChannelMetadata(channel);
        this._save();
      }
    },

    _getChannel: function() {
      return this.$('#channel_jid').val();
    },

    _check: function(element, value) {
      if (element) {
        element.attr('checked', value);
      }
    }
  });

  return CreateChannelStream;
});
