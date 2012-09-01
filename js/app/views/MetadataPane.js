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
  var Backbone = require('backbone');
  var template = require('text!templates/MetadataPane.html');
  var util = require('app/views/util');

  var MetadataPane = Backbone.View.extend({
    tagName: 'header',
    className: 'metadata-pane',

    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.fetch();
    },

    render: function() {
      console.error('render:');
      console.error(this);
      this.$el.html(_.template(template, {metadata: this.model}));
      util.setupAvatarFallback(
        this.$('img'),
        this.model.get('channel_type'),
        64
      );
    },

    _setupAvatarFallback: function() {
      var avatar = this.$('img');
      var channelType = this.model.get('channel_type');
      avatar.one('error', function() {
        var fallbackUrl =
          (channelType == 'personal') ?
          'img/user-fallback-64px.png' :
          'img/topic-fallback-64px.png';
        avatar.attr('src', fallbackUrl);
      });
    }
  });

  return MetadataPane;
});