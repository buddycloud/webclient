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
  var api = require('util/api');
  var Backbone = require('backbone');
  var avatarFallback = require('util/avatarFallback');
  var l10nBrowser = require('l10n-browser');
  var Events = Backbone.Events;
  var footer = require('text!templates/overlay/footer.html');
  var DiscoverCollection = require('models/DiscoverCollection');
  var template = require('text!templates/overlay/discover.html');
  var localTemplate;
  var localFooter;

  var DiscoverOverlay = Backbone.View.extend({

    events: {
      'click .channel': '_redirect'
    },

    initialize: function() {
      if (!localTemplate) localTemplate = l10nBrowser.localiseHTML(template, {})
      if (!localFooter) localFooter = l10nBrowser.localiseHTML(footer, {})

      this.mostActive = new DiscoverCollection(api.url('most_active'))
      this.popular = new DiscoverCollection(api.url('most_active'))

      var callback = this._triggerRenderCallback([this.mostActive, this.popular])
      this.listenTo(this.mostActive, 'reset', callback)
      this.listenTo(this.popular, 'reset', callback)

      this.mostActive.fetch({data: {max: 5, period: 7}, reset: true})
      this.popular.fetch({data: {max: 5, period: 30}, reset: true})
    },

    _triggerRenderCallback: function(models) {
      var self = this
        , fetched = 0
      return function() {
        fetched++
        if (fetched === models.length) {
          self.render()
        }
      }
    },

    render: function() {
      this.$el.html(_.template(localTemplate, {
        mostActive: this.mostActive.models,
        popular: this.popular.models
      }))

      // Add footer
      $('.content').append(_.template(localFooter))
      avatarFallback(this.$('.avatar'), undefined, 50)
    },

    _redirect: function(event) {
      var jid = this.$(event.currentTarget).attr('id')
      Events.trigger('navigate', jid)
    }
  });

  return DiscoverOverlay;
});
