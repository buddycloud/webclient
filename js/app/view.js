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

define(['jquery', 'backbone', '../../config'], function($, Backbone, config) {

    // Thanks to John Gruber:
    // http://daringfireball.net/2010/07/improved_regex_for_matching_urls
    var URL_REGEX =
        /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/;

    ///// UserBar //////////////////////////////////////////////////////////

    var UserBar = Backbone.View.extend({
        tagName: 'div',

        events: {
            'submit .login': '_login'
        },

        initialize: function() {
            this.render();
        },

        render: function() {
            this.$el.empty();

            if (this.model.get('username')) {
                this._renderUserActions();
            } else {
                this._renderLoginForm();
            }
        },

        _renderLoginForm: function() {
            var loginForm = $(this.make('form', {'class': 'login'}));

            loginForm.append(this.make('input', {
                'class': 'username',
                'type': 'text',
                'placeholder': 'Username',
                'size': '15'
            }));
            loginForm.append(this.make('input', {
                'class': 'password',
                'type': 'password',
                'placeholder': 'Password',
                'size': '15'
            }));
            loginForm.append(this.make('input', {
                'class': 'login-button',
                'type': 'submit',
                'value': 'Login'
            }));

            this.$el.append(loginForm);
        },

        _renderUserActions: function() {
            var title = this.make('span', {}, this.model.get('username'));
            this.$el.append(title);
        },

        _login: function() {
            this.$('input').attr('disabled', true);
            this.$('.login-button').attr('value', 'Logging in…');

            var username = this.$('.username').attr('value');
            var password = this.$('.password').attr('value');

            var self = this;

            var xhr = $.ajax(config.baseUrl, {
                method: 'GET',
                beforeSend: function(xhr) {
                    var auth = 'Basic ' + btoa(username + ':' + password);
                    xhr.setRequestHeader('Authorization', auth);
                    xhr.withCredentials = true;
                },
                success: function() {
                    self.model.set({
                        username: username,
                        password: password
                    });
                    self.render();
                },
                error: function(__, xhr) {
                    alert('Login failed');
                    self.render();
                }
            })

            return false;
        }
    });

    ///// ChannelMetadataView //////////////////////////////////////////////

    var ChannelMetadataView = Backbone.View.extend({
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
                attr('height', '64').
                attr('src', iconUrl);

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
        }
    });

    ///// ChannelFollowerView //////////////////////////////////////////////

    var ChannelFollowersView = Backbone.View.extend({
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

    ///// ChannelPostsView /////////////////////////////////////////////////

    var ChannelPostsView = Backbone.View.extend({
        tagName: 'div',
        id: 'channel-posts',

        initialize: function() {
            this.model.bind('reset', this._update, this);
            this.model.bind('add', this._update, this);
            this.model.bind('remove', this._update, this);

            this._credentials = this.options.credentials;
            this._credentials.bind('change', this._reset, this);

            this.render();
        },

        _reset: function() {
            this.model.reset();
            this.model.fetch({
                beforeSend: this._credentials.authSetup()
            });

            this._threads = null;
            this.render();
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
            if (this._threads) {
                this._renderThreads();
            } else {
                this._renderSpinningIcon();
            }
        },

        _renderSpinningIcon: function() {
            var icon =
                $('<div class="loading">\
                     <img src="img/bc-icon.png">\
                   </div>');

            $(this.el).html(icon);
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
        },

        _renderThreads: function() {
            $(this.el).empty();
            var self = this;
            _.each(this._threads, function(thread) {
                self._renderThread(thread);
            });
        },

        _renderThread: function(thread) {
            var toplevel = _.first(thread);
            var comments = _.rest(thread);

            var threadEl = $(document.createElement('article'))
                .addClass('thread');

            this._renderPost(threadEl, toplevel, 'toplevel');
            this._renderComments(threadEl, comments);
            $(this.el).append(threadEl);
        },

        _renderPost: function(threadEl, post, type) {
            var postEl = $(document.createElement('article')).addClass(type);
            this._renderPostHeader(postEl, post);
            this._renderPostBody(postEl, post);
            threadEl.append(postEl);
        },

        _renderPostHeader: function(postEl, post) {
            var authorId = post.get('author');
            var authorName = authorId.split('@', 2)[0];

            var authorNameEl = $(document.createElement('span')).
                addClass('author-name').
                text(authorName);
            var authorIdEl = $(document.createElement('span')).
                addClass('author-id').
                text('(' + authorId + ')');
            var headerEl = $(document.createElement('header')).
                append(authorNameEl).
                append(' ').
                append(authorIdEl);

            postEl.append(headerEl);
        },

        _renderPostBody: function(postEl, post) {
            var bodyEl = $(document.createElement('pre')).
                text(post.get('content'));

            // Make all URLs proper links
            bodyEl.html(bodyEl.text().replace(URL_REGEX, '<a href="$1">$1</a>'));

            postEl.append(bodyEl);
        },

        _renderComments: function(threadEl, comments) {
            var self = this;
            _.each(comments, function(c) {
                self._renderPost(threadEl, c, 'comment');
            });
        }
    });

    ///// (Exports) ////////////////////////////////////////////////////////

    return {
        UserBar: UserBar,
        ChannelMetadataView: ChannelMetadataView,
        ChannelFollowersView: ChannelFollowersView,
        ChannelPostsView: ChannelPostsView
    };
});
