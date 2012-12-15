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
  var AbstractExploreView = require('views/content/AbstractExploreView');
  var spinner = require('util/spinner');
  var l10nBrowser = require('l10n-browser');
  var template = require('text!templates/content/searchResults.html')
  var localTemplate;

  var SearchView = AbstractExploreView.extend({
    className: 'discoverChannels clearfix',

    events: {
      'click .callToAction': '_follow',
      'click .info,.avatar': '_redirect'
    },

    initialize: function() {
      if (!localTemplate) localTemplate = l10nBrowser.localiseHTML(template, {});
      this._defineGetter('channels', function() {
        return this.model.channels.models;
      });

      this.model.bind('fetch', this.render, this);
      spinner.replace(this.$el);
    },

    render: function() {
      this.$el.html(_.template(localTemplate, {
        channels: this.channels,
        posts: this.model.posts.models
      }));
      this._render();
    }
  });

  return SearchView;
});
