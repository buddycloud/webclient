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
  var Events = Backbone.Events;


  var AbstractExploreView = Backbone.View.extend({

    _render: function() {
      avatarFallback(this.$('.avatar'), undefined, 50);
      this._renderButtons();
    },

    _defineGetter: function(name, getter) {
      getter.bind(this);
      Object.defineProperty(this, name, {get: getter});
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

    _channelDefaultAffiliation: function(jid) {
      for (var i = 0; i < this.channels.length; i++) {
        if (this.channels[i].jid() === jid) {
          return this.channels[i].defaultAffiliation();
        }
      }

      return null;
    },

    _follow: function(event) {
      var $channel = $(event.currentTarget).parent();
      var jid = $channel.attr('id');
      var role = this._channelDefaultAffiliation(jid);
      var credentials = this.options.user.credentials;

      if (jid && role && credentials) {
        var animationClassName = 'rainbow';
        var offset = $channel.offset();

        // Subscribe
        this.options.user.subscribedChannels.subscribe(jid, 'posts', role, credentials, {offset: offset, animationClass: animationClassName});

        // Disable button
        $channel.find('.follow').removeClass('callToAction').addClass('disabled');
      }
    },

    _redirect: function(event) {
      var jid = this.$(event.currentTarget).parent().attr('id');
      Events.trigger('navigate', jid);
    }
  });

  return AbstractExploreView;
});
