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
  var avatarFallback = require('util/avatarFallback');
  var Backbone = require('backbone');
  var ChannelListDetails = require('views/content/ChannelListDetails');
  var l10nBrowser = require('l10n-browser');
  var template = require('text!templates/content/channelList.html');

  var ChannelList = Backbone.View.extend({
    tagName: 'section',
    className: 'channelList',
    events: {
      'click img': '_showDetails',
      'click .showAll': '_showAll'
    },

    initialize: function() {
      this.localTemplate = l10nBrowser.localiseHTML(template, {});
    },

    render: function() {
      if (this.model.length > 0) {
        this.$el.html(_.template(this.localTemplate, {
          title: this.options.title,
          channels: this.model,
          avatarUrl: api.avatarUrl
        }));
        avatarFallback(this.$('img'), 'personal', 50);
      }
    },

    addItem: function(toAdd) {
      if (this.model) {
        this.model.push(toAdd);
      }
    },

    removeItem: function(toRemove) {
      if (this.model) {
        var self = this;
        _.each(this.model, function(item, index) {
          if (item === toRemove) {
            self.model.splice(index, 1);

            // Should not have repeated channels
            return;
          }
        });
      }
    },

    _showAll: function() {
      this.$('img').show();
      this.$('.showAll').remove();
    },

    _showDetails: function(event) {
      var channelPosition = this.model.indexOf(event.target.title);
      var inlinePosition = channelPosition % 4; // 4 = n. channels per line
      var appendPosition = channelPosition + (3 - inlinePosition); // 3 because it starts with 0

      this._removeOpenedView(event.target);
      if (this._selectedTarget === event.target) {
        // this makes possible to close the view if user click on the same target
        this._selectedTarget = null;
        return false;
      }

      this._selectedTarget = event.target;
      this._openedDetailsView = new ChannelListDetails({
        channel: event.target.title,
        role: this.options.role,
        position: inlinePosition
      });
      $(this._selectedTarget).addClass('selected');
      this._appendDetails(appendPosition);
    },

    _appendDetails: function(position) {
      if (this.model.length <= position) {
        this.$el.append(this._openedDetailsView.el);
      } else {
        this.$('img:eq(' + position + ')').after(this._openedDetailsView.el);
      }
    },

    _removeOpenedView: function() {
      if (this._openedDetailsView) {
        this._openedDetailsView.remove();
        this.$('.selected').removeClass('selected');
        this._openedDetailsView = null; // GC
      }
    }
  });

  return ChannelList;
});
