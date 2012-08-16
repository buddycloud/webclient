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


define(['jquery', 'underscore', 'backbone', '../../config'],
function($, _, Backbone, config) {

    function url() {
        var components = _.toArray(arguments);
        components.unshift(config.baseUrl);
        return components.join('/');
    }

    ///// Channel //////////////////////////////////////////////////////////

    var Channel = Backbone.Model.extend({

        initialize: function() {
            this.posts = new ChannelNode();
            this.posts.channel = this;
            this.posts.name = 'posts';

            this.followers = new ChannelFollowers();
            this.followers.channel = this;
        },

        url: function() {
            return url(this.get('channel'), 'metadata', 'posts');
        },

        iconUrl: function() {
            return url(this.get('channel'), 'media', 'avatar');
        }
    });

    ///// ChannelFollowers /////////////////////////////////////////////////

    var ChannelFollowers = Backbone.Model.extend({

        url: function() {
            return url(this.channel.get('channel'), 'subscribers', 'posts');
        }
    });

    ///// ChannelItem //////////////////////////////////////////////////////

    var ChannelItem = Backbone.Model.extend({});

    ///// ChannelNode //////////////////////////////////////////////////////

    var ChannelNode = Backbone.Collection.extend({
        model: ChannelItem,

        url: function() {
            return url(this.channel.get('channel'), 'content', this.name);
        },

        fetch: function(options) {
            // Explicitly set "Accept: application/json" so that we get the
            // JSON representation instead of an Atom feed.
            options = options || {};
            options.headers = {'Accept': 'application/json'};
            Backbone.Collection.prototype.fetch.call(this, options);
        },
    });

    ///// UserCredentials //////////////////////////////////////////////////

    var UserCredentials = Backbone.Model.extend({

        authSetup: function() {
            var self = this;
            return function(xhr) {
                var user = self.get('username');
                var passwd = self.get('password');

                var auth = 'Basic ' + btoa(user + ':' + passwd);
                xhr.setRequestHeader('Authorization', auth);

                xhr.withCredentials = true;
            };
        }
    });

    ///// (Exports) ////////////////////////////////////////////////////////

    return {
        Channel: Channel,
        UserCredentials: UserCredentials
    };
});
