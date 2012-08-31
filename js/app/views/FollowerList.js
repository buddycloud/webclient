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
    'app/models/util',
    'app/views/util',
    'text!templates/FollowerList.html'
], function($, Backbone, modelUtil, viewUtil, template) {

    var FollowerList = Backbone.View.extend({
        tagName: 'aside',
        className: 'follower-list bordered',

        initialize: function() {
            this.model.bind('change', this.render, this);
        },

        render: function() {
            var followerIds = this.model.usernames();
            this.$el.html(_.template(template, {
                followerIds: followerIds,
                avatarUrlFunc: modelUtil.avatarUrl
            }));
            viewUtil.setupAvatarFallback(this.$('img'), 'personal', 32);
        }
    });

    return FollowerList;
});