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
  var Backbone = require('backbone');
  var avatarFallback = require('util/avatarFallback');
  var spinner = require('util/spinner');
  var template = require('text!templates/content/searchResults.html');

  var SearchView = Backbone.View.extend({
    className: 'discoverChannels clearfix',

    events: {'click .callToAction': '_follow'},

    initialize: function() {
      this.model.bind('fetch', this.render, this);
      spinner.replace(this.$el);
    },

    render: function() {
      this.$el.html(_.template(template, {
        channels: this.model.channels.models,
        posts: this.model.posts.models
      }));
      avatarFallback(this.$('.avatar'), undefined, 50);
      this._renderButtons();
    },

    _renderButtons: function() {
      var self = this;
      this.$('.channel').each(function() {
        var jid = $(this).attr('id');
        if (self._follows(jid)) {
          $(this).find('.follow').removeClass('callToAction').addClass('disabled');
        }
      });
    },

    _follows: function(jid) {
      var followedChannels = this.options.user.subscribedChannels.channels();
      return _.include(followedChannels, jid);
    },

    _follow: function(event) {
      var jid = this.$(event.currentTarget).parent().find('.owner').text();
      //TODO var role = this._getChannelDefaultAffiliation();
      var credentials = this.options.user.credentials;

      // Subscribe
      //TODO this.options.user.subscribedChannels.subscribe(channel, 'posts', role, credentials);

      // Disable button
      this.$(event.currentTarget).parent().find('.follow').removeClass('callToAction').addClass('disabled');
    }
  });

  return SearchView;
});
