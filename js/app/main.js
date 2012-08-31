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

requirejs.config({
    baseUrl: 'js',
    paths: {
        'config': '../config',
        'templates': '../templates'
    }
});

define([
    'jquery',
    'app/models/ChannelFollowers',
    'app/models/ChannelMetadata',
    'app/models/ChannelNode',
    'app/models/UserCredentials',
    'app/views/FollowerList',
    'app/views/LoginSidebar',
    'app/views/MetadataPane',
    'app/views/PostStream',
    'app/views/UserMenu'
], function(
    $,
    ChannelFollowers,
    ChannelMetadata,
    ChannelNode,
    UserCredentials,
    FollowerList,
    LoginSidebar,
    MetadataPane,
    PostStream,
    UserMenu
) {
    function getRequestedChannel() {
        var channelParam = location.search.match(/[\?\&]channel=([^\&]*)/);
        return channelParam ? channelParam[1] : 'lounge@topics.buddycloud.org';
    }

    function setupChannelUI(metadata, posts, followers) {
        var metadataPane = new MetadataPane({model: metadata});
        var postStream = new PostStream({model: posts});
        var followerList = new FollowerList({model: followers});
        $('#content').append(metadataPane.el);
        $('#content').append(postStream.el);
        $('#right').append(followerList.el);
    }

    function setupUserMenu(credentials) {
        var userMenu = new UserMenu({model: credentials});
        $('#toolbar-right').append(userMenu.el);
        userMenu.render();
    }

    function setupLoginSidebar(credentials) {
        var sidebar = new LoginSidebar({model: credentials});
        $('#left').append(sidebar.el);
        sidebar.render();
    }

    function verifyCredentials(callback) {
        callback();
    }

    function fetchChannel(metadata, posts, followers, credentials) {
        metadata.fetch(credentials.fetchOptions());
        posts.fetch(credentials.fetchOptions());
        followers.fetch(credentials.fetchOptions());
    }

    function fetchWithCredentials(model, credentials) {
        var options;
        if (!credentials.anonymous()) {
            options = {
                username: username,
                password: password,
                xhrFields: {withCredentials: true}
            };
        }
        model.fetch(options);
    }

    var channel = getRequestedChannel();
    var metadata = new ChannelMetadata(channel);
    var posts = new ChannelNode(channel, 'posts');
    var followers = new ChannelFollowers(channel);
    setupChannelUI(metadata, posts, followers);

    var credentials = new UserCredentials;
    credentials.fetch({
        success: function() {
            if (credentials.anonymous()) {
                setupLoginSidebar(credentials);
            } else {
                setupUserMenu(credentials);
            }
            fetchChannel(metadata, posts, followers, credentials);
        },
        error: function(xhr) {
            alert('Login failed');
            setupLoginSidebar(credentials);
            fetchChannel(metadata, posts, followers, credentials);
        }
    });

});
