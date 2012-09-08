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
  var template = require('text!templates/SubscribedChannelsList.html');
  var subscribedChannelTemplate = require('text!templates/SubscribedChannel.html');
  var mediator = Backbone.Events;

  var SubscribedChannelsList = Backbone.View.extend({
    tagName: 'aside',
    className: 'subscribedchannels-list bordered',

    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('sync', this._triggerUpdate, this);
      mediator.bind('subscribeChannel', this._subscribe, this);
      mediator.bind('unsubscribeChannel', this._unsubscribe, this);
    },

    render: function() {
      if (!this.rendered) {
        var channels = this.model.channels();
        var avatars = this._getAvatars(channels);
        this.$el.html(_.template(template, {
          channels: channels,
          avatars: avatars
        }));
        avatarFallback(this.$('img'), 'personal', 32);
        this.rendered = true;
      }
    },

    _renderSubscribedChannel: function(channel) {
      this.$('ul').append(_.template(subscribedChannelTemplate, {
        channel: channel,
        avatar: api.avatarUrl(channel)
      }));
      avatarFallback(this.$('img'), 'personal', 32);
    },

    _subscribe: function(channel, node, role) {
      this.model.subscribe(channel, node, role, this.options.credentials);
    },

    _unsubscribe: function(channel, node) {
      this.model.unsubscribe(channel, node, this.options.credentials);
    },

    _getAvatars: function(channels) {
      return _.map(channels, function(channel) {
        return api.avatarUrl(channel);
      });
    },

    _triggerUpdate: function(eventType, channel, role) {
      if (eventType === 'subscribedChannel') {
        this._renderSubscribedChannel(channel);
      } else if (eventType === 'unsubscribedChannel') {
        this.$('.' + channel.split('@', 2)[0]).remove();
      }
      mediator.trigger(eventType, channel, role);
    }
  });

  return SubscribedChannelsList;
});
