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
            return url('channels', this.get('channel'), 'posts', 'metadata');
        }
    });

    ///// ChannelFollowers /////////////////////////////////////////////////

    var ChannelFollowers = Backbone.Model.extend({

        url: function() {
            return url(
                'channels',
                this.channel.get('channel'),
                'posts',
                'subscriptions'
            );
        }
    });

    ///// ChannelItem //////////////////////////////////////////////////////

    var ChannelItem = Backbone.Model.extend({});

    ///// ChannelNode //////////////////////////////////////////////////////

    var ChannelNode = Backbone.Collection.extend({
        model: ChannelItem,

        url: function() {
            return url('channels', this.channel.get('channel'), this.name);
        },

        fetch: function(options) {
            // Backbone assumes data coming from the server to be JSON,
            // but we expect Atom feeds here.
            options = options || {};
            options.dataType = 'xml';
            Backbone.Collection.prototype.fetch.call(this, options);
        },

        parse: function(data) {
            items = [];

             $(data).find('entry').each(function() {
                items.push({
                    id: $(this).find('id').text(),
                    author: $(this).find('author>name').text(),
                    content: $(this).find('content').text(),
                    replyTo: $(this).find('in-reply-to').attr('ref')
                });
            });

            return items;
        }
    });

    ///// (Exports) ////////////////////////////////////////////////////////

    return {
        Channel: Channel
    };
});
