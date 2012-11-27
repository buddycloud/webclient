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
  var _ = require('underscore');
  var avatarFallback = require('util/avatarFallback');
  var Backbone = require('backbone');
  var Events = Backbone.Events;
  var l10nBrowser = require('l10n-browser');
  var template = require('text!templates/content/editHeader.html')

  var ChannelHeader = Backbone.View.extend({
    className: 'channelHeader justify',

    initialize: function() {
      this.localTemplate = l10nBrowser.localiseHTML(template, {});
      this.model.bind('change', this.render, this);
      this.model.fetch();

      // Avatar changed event
      Events.on('avatarChanged', this.render, this);
    },

    render: function() {
      this.$el.html(_.template(this.localTemplate, {metadata: this.model}));
      avatarFallback(this.$('.avatar'), this.model.channelType(), 75);
    }
  });

  return ChannelHeader;
});
