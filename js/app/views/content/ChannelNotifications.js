/*
 * Copyright 2013 buddycloud
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
  var api = require('util/api');
  var avatarFallback = require('util/avatarFallback');
  var Backbone = require('backbone');
  var ChannelFollowersRequests = require('models/ChannelFollowersRequests');
  var template = require('text!templates/content/notification.html');

  var ChannelNotifications = Backbone.View.extend({
    className: 'notificationsList',

    events: {'click .positive': '_allow',
             'click .negative': '_deny'},

    initialize: function() {
      this.model = new ChannelFollowersRequests(this.options.channel);
      this.listenTo(this.model, 'change', this.render);
      this.model.fetch({
        credentials: this.options.user.credentials
      });
    },

    render: function() {
      var pending = this.model.pending();
      this.$el.html(_.template(template, {
        pending: pending,
        api: api
      }));

      if (pending.length > 0) {
        this.$el.find('.notification').addClass('visible');
        avatarFallback(this.$('.avatar'), 'personal', 75);
      }
    },

    _allow: function(event) {
      var $target = $(event.target).closest('.notification');
      var jid = $target.get(0).id.split('_')[1];
      
      this.listenTo(this.model, 'sync', function() {
        $target.addClass('log granted');
      });
      this._setAction(jid, 'subscribed');
    },

    _deny: function() {
      var $target = $(event.target).closest('.notification');
      var jid = $target.get(0).id.split('_')[1];
      
      this.listenTo(this.model, 'sync', function() {
        $target.addClass('log denied');
      });
      this._setAction(jid, 'none');
    },

    _setAction: function(jid, subscription) {
      this.model.set({'jid': jid, 'subscription': subscription}, {silent: true});
      this.model.save(null, {credentials: this.options.user.credentials});
    }
  });

  return ChannelNotifications;
});
