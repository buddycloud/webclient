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
  var Channel = require('models/Channel');
  var ChannelMetadata = require('models/ChannelMetadata');
  var config = require('config');
  var l10nBrowser = require('l10n-browser');
  var Events = Backbone.Events;
  var template = require('text!templates/content/createChannel.html');

  var CreateChannelStream = AbstractEditStream.extend({

    events: {
      'click .save': 'create',
      'click .discard': 'render'
    },

    initialize: function() {
      this._initialize();
      this.localTemplate = l10nBrowser.localiseHTML(template, {});
      this.render();
    },

    render: function() {
      this.$el.html(_.template(this.localTemplate, {
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
        this.model = new Channel(channel);
        this.model.save({}, {
          credentials: this.options.user.credentials,
          complete: function() {
            self.saveMetadata();
          }
        });

        this._disableCreateButton();
      }
    },

    saveMetadata: function() {
      this._save(this.model.metadata, this.redirectToChannel());
    },

    redirectToChannel: function() {
      var self = this;
      return function() {
        Events.trigger('subscriptionSync', 'subscribedChannel', self.model.name);
        Events.trigger('navigate', self.model.name);  
      }
    },

    _disableCreateButton: function() {
      this.$('.save').addClass('disabled').text('Creating...');
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
