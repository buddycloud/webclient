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

define([
    'jquery',
    'backbone',
], function($, Backbone) {

    var MetadataPane = Backbone.View.extend({
        tagName: 'header',

        initialize: function() {
            this.model.bind('change', this.render, this);
        },

        render: function() {
            $(this.el).empty();

            var iconUrl = this.model.iconUrl() + '?maxwidth=64&maxheight=64';
            var iconEl = $(document.createElement('img')).
                addClass('channel-icon').
                attr('width', '64').
                attr('height', '64');

            this._setupIconFallback(iconEl);
            iconEl.attr('src', iconUrl)

            var titleEl = $(document.createElement('h1')).
                addClass('channel-title').
                text(this.model.get('title') + ' ');

            var nameEl = $(document.createElement('span')).
                addClass('channel-name').
                text('(' + this.model.get('channel') + ')');

            var descriptionEl = $(document.createElement('p')).
                addClass('channel-description').
                text(this.model.get('description'));

            $(this.el).append(iconEl);
            $(this.el).append(titleEl.append(nameEl));
            $(this.el).append(descriptionEl);
        },

        _setupIconFallback: function(iconEl) {
            var self = this;
            iconEl.one('error', function() {
                if (self.model.get('channel_type') == 'personal')
                    iconEl.attr('src', 'img/user-avatar-default64.png');
                else
                    iconEl.attr('src', 'img/topic-avatar-default64.png');
            });
        }
    });

    return MetadataPane;
});