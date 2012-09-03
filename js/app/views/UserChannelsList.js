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
  var _ = require('underscore');
  var api = require('app/util/api');
  var avatarFallback = require('app/util/avatarFallback');
  var Backbone = require('backbone');
  var template = require('text!templates/UserChannelsList.html');

  var UserChannelsList = Backbone.View.extend({
    tagName: 'aside',
    className: 'userchannels-list bordered',

    render: function() {
      var channels = this.model.channels();
      var avatars = this._getAvatars(channels);
      this.$el.html(_.template(template, {
        channels: channels,
        avatars: avatars,
      }));
      avatarFallback(this.$('img'), 'personal', 32);
    },

    _getAvatars: function(channels) {
      return _.map(channels, function(channel) {
        return api.avatarUrl(channel);
      });
    }

  });

  return UserChannelsList;
});
