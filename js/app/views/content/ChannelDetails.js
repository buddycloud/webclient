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
  var ChannelList = require('views/content/ChannelList');
  var template = require('text!templates/content/channelDetails.html')

  var ChannelDetails = Backbone.View.extend({
    className: 'channelDetails',
    events: {'click .infoToggle': '_toggleInfo'},

    initialize: function() {
      this.moderatorsList = new ChannelList({title: 'moderators'});
      this.followersList = new ChannelList({title: 'followers'});
    },

    render: function() {
      var metadata = this.model.metadata;
      this.$el.html(_.template(template, {metadata: metadata}));
      this._renderChannelLists();
    },

    _renderChannelLists: function() {
      this._populateChannelLists();
      this.moderatorsList.render();
      this.followersList.render();
      this.$('.holder').append(this.moderatorsList.el);
      this.$('.holder').append(this.followersList.el);
    },

    _populateChannelLists: function() {
      var types = this.model.followers.byType();
      var moderators = (types['owner'] || []).concat(types['moderator'] || []);
      var followers = (types['publisher'] || []).concat(types['member'] || []);
      this.moderatorsList.model = moderators;
      this.followersList.model = followers;
    },

    _toggleInfo: function() {
      this.$el.toggleClass('hidden');
    }
  });

  return ChannelDetails;
});
