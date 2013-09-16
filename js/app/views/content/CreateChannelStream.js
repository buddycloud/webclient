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
  var $ = require('jquery');
  var AbstractEditStream = require('views/content/AbstractEditStream');
  var api = require('util/api');
  var Backbone = require('backbone');
  var config = require('config');
  var l10nBrowser = require('l10n-browser');
  var Events = Backbone.Events;
  var template = require('text!templates/content/createChannel.html');
  var localTemplate;

  var CreateChannelStream = AbstractEditStream.extend({

    events: {
      'click .save': 'create',
      'click .discard': 'render'
    },

    initialize: function() {
      if (!localTemplate) localTemplate = l10nBrowser.localiseHTML(template, {});
      this._initialize();
      this.render();
    },

    render: function() {
      this.$el.html(_.template(localTemplate, {
        domain: this._topicsDomain()
      }));
    },

    _topicsDomain: function() {
      return '@topics.' + config.homeDomain;
    },

    create: function() {
      var channel = this._getChannel();
      var self = this;
      if (channel) {
        channel += this._topicsDomain();
        this.model = this.options.user.metadata(channel);
        var options = {
          type: 'POST',
          url: api.url(this.model.channel),
          crossDomain: true,
          xhrFields: {withCredentials: true},
          contentType: false,
          processData: false,
          beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization',
              self.options.user.credentials.authorizationHeader());
          },
          success: function() {
            self.saveMetadata();
          }
        };

        $.ajax(options);
        this._disableCreateButton();
      }
    },

    saveMetadata: function() {
      this.listenTo(this.model, 'sync', this._channelCreated());
      this._save(this.model);
    },

    _channelCreated: function() {
      var channel = this.model.channel;
      var subscribedChannels = this.options.user.subscribedChannels;
      return function() {
        subscribedChannels.set(channel + '/posts', 'owner', {silent: true});
        Events.once('navigate', function(destiny) {
          if (channel === destiny) {
            Events.trigger('channelCreated', channel);
          }
        });
        Events.trigger('navigate', channel);
      };
    },

    _disableCreateButton: function() {
      this.$('.save').addClass('disabled').text('Creating...');
    },

    _getChannel: function() {
      return this.$('#channel_title').val();
    },

    _check: function(element, value) {
      if (element) {
        element.attr('checked', value);
      }
    }
  });

  return CreateChannelStream;
});
