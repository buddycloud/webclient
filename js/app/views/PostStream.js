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
    'text!templates/PostStream.html'
], function($, Backbone, modelUtil, viewUtil, template) {

    // Thanks to John Gruber:
    // http://daringfireball.net/2010/07/improved_regex_for_matching_urls
    var URL_REGEX =
        /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/;

    var PostStream = Backbone.View.extend({
        tagName: 'div',
        className: 'post-stream',

        initialize: function() {
            this.model.bind('reset', this._update, this);
            this.model.bind('add', this._update, this);
            this.model.bind('remove', this._update, this);
            this._renderSpinningIcon();
        },

        _update: function() {
            var threadsById = this.model.groupBy(function(item) {
                return item.get('replyTo') || item.get('id');
            });

            this._threads = _.reduce(threadsById, function(t, posts, id) {
                // The posts for each thread are sorted from newest to
                // oldest, so the original post is at the end.
                var toplevel = _.last(posts);

                // Ensure that the thread really has a toplevel post.
                // If it hasn't, it is imcomplete and we ignore it.
                if (!toplevel.get('replyTo')) {
                    t.push(posts.reverse());
                }

                return t;
            }, []);

            this.render();
        },

        render: function() {
            this.$el.html(_.template(template, {
                threads: this._threads,
                avatarUrlFunc: modelUtil.avatarUrl
            }));
            this._setupAvatarFallbacks();
        },

        _setupAvatarFallbacks: function() {
            var toplevelAvatars = this.$('.thread > header .avatar');
            var commentAvatars = this.$('.comment .avatar');
            viewUtil.setupAvatarFallback(toplevelAvatars, 'personal', 48);
            viewUtil.setupAvatarFallback(commentAvatars, 'personal', 32);
        },

        _renderSpinningIcon: function() {
            var icon =
                $('<div class="loading">\
                     <img src="img/bc-icon.png">\
                   </div>');

            this.$el.html(icon);
            this._startSpinning(icon);
        },

        _startSpinning: function(icon) {
            var rotation = 0;

            var spin = setInterval(function() {
                var rotate = 'rotate(' + rotation + 'deg)';
                icon.find('img').css({
                    'transform': rotate,
                    '-moz-transform': rotate,
                    '-webkit-transform': rotate
                });
                rotation = (rotation + 10) % 360;
            }, 50);

            this.model.on('reset', function() {
                clearTimeout(spin);
            });
        }
    });

    return PostStream;
});
