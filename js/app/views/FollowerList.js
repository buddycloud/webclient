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
    'backbone'
], function($, Backbone) {

    var FollowerList = Backbone.View.extend({
        tagName: 'aside',
        id: 'channel-followers',

        initialize: function() {
            this.model.bind('change', this.render, this);
            this.render();
        },

        render: function() {
            $(this.el).empty();
            this._renderHeader();
            this._renderFollowerList();
        },

        _renderHeader: function() {
            var titleEl = $(document.createElement('h1')).text('Followers');
            $(this.el).append(titleEl);
        },

        _renderFollowerList: function() {
            var listEl = $(document.createElement('ul')).
                addClass('followers');

            var subscriptions = this.model.toJSON();
            for (var jid in subscriptions) {
                var parts = jid.split('@', 2);
                var user = parts[0];
                var domain = parts[1];

                // FIXME: This is ugly and wrong
                if (domain.indexOf('anon.') === 0) {
                    continue;
                }

                var followerEl =  $(document.createElement('li')).
                    append($(document.createElement('strong')).text(user)).
                    append('@' + domain);

                listEl.append(followerEl);
            }

            $(this.el).append(listEl);
        }
    });

    return FollowerList;
});