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
        'templates': '../templates'
    }
});

define([
    'jquery',
    'app/models/Channel',
    'app/models/UserCredentials',
    'app/views/FollowerList',
    'app/views/LoginSidebar',
    'app/views/MetadataPane',
    'app/views/PostStream'
], function(
    $,
    Channel,
    UserCredentials,
    FollowerList,
    LoginSidebar,
    MetadataPane,
    PostStream
) {
    var channelArg = location.search.match(/[\?\&]channel=([^\&]*)/);
    var channelId = channelArg ? channelArg[1] : 'lounge@topics.buddycloud.org';

    var credentials = new UserCredentials({});
    var channel = new Channel({
        channel: channelId,
        node: 'posts'
    });

    var metadataPane = new MetadataPane({model: channel});
    var postStream = new PostStream({model: channel.posts, credentials: credentials});
    var followerList = new FollowerList({model: channel.followers});
    var loginSidebar = new LoginSidebar({model: credentials});

    $('#content').append(metadataPane.el);
    $('#content').append(postStream.el);
    $('#left').append(loginSidebar.el);
    $('#right').append(followerList.el);

    channel.fetch();
    channel.followers.fetch();
    channel.posts.fetch();
});
