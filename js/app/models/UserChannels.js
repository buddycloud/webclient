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
  var Backbone = require('backbone');

  var UserChannels = Backbone.Model.extend({
    constructor: function() {
      Backbone.Model.call(this);
    },

    url: function() {
      return api.url('subscribed');
    },

    channels: function() {
      var nodes = _.keys(this.attributes);
      var channelsList = [];

      for (var i = 0; i < nodes.length; i++) {
	channelsList.push(nodes[i].split("/")[0]);
      }

      return _.uniq(channelsList);
    }
  });

  return UserChannels;
});
