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
  var ChannelFollowers = require('app/models/ChannelFollowers');
  var ChannelMetadata = require('app/models/ChannelMetadata');
  var ChannelPosts = require('app/models/ChannelPosts');

  var Channel = Backbone.Model.extend({
    constructor: function(name) {
      Backbone.Model.call(this);
      this.name = name;
      this.followers = new ChannelFollowers(name);
      this.metadata = new ChannelMetadata(name);
      this.posts = new ChannelPosts(name);
    }
  });

  return Channel;
});
