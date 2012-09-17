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
  var avatarFallback = require('util/avatarFallback');
  var Backbone = require('backbone');
  var template = require('text!templates/TopicView.html');

  var TopicView = Backbone.View.extend({
    tagName: 'article',
    className: 'post',

    render: function() {
      this.$el.html(_.template(template, {topic: this.model}));
      avatarFallback(this.$('.avatar'));
      this._addNoCommentsClassIfNeeded();
    },

    _addNoCommentsClassIfNeeded: function() {
      if (this.model.length == 1) {
        this.$el.addClass('noComments');
      } else {
        this.$el.removeClass('noComments');
      }
    }
  });

  return TopicView;
});
