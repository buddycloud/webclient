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
    var Backbone = require('backbone');
    var util = require('app/models/util');

    var ChannelItem = Backbone.Model.extend({
    });

    return ChannelNode = Backbone.Collection.extend({
        model: ChannelItem,

        constructor: function(channel, name) {
            Backbone.Collection.call(this);
            this.channel = channel;
            this.name = name;
        },

        url: function() {
            return util.apiUrl(this.channel, 'content', this.name);
        },

        fetch: function(options) {
            // Explicitly set "Accept: application/json" so that we get the
            // JSON representation instead of an Atom feed.
            options = options || {};
            options.headers = {'Accept': 'application/json'};
            Backbone.Collection.prototype.fetch.call(this, options);
        },

        threads: function() {
            var incompleteThreads = {};
            var completeThreads = [];

            // Note that the items returned by the buddycloud
            // API are sorted from newest to oldest.
            this.models.forEach(function(item) {
                var threadId = item.get('replyTo') || item.get('id');
                var thread = incompleteThreads[threadId];
                if (!thread) {
                    thread = incompleteThreads[threadId] = [];
                }
                thread.unshift(item);
                if (!item.get('replyTo')) { // is top-level post
                    completeThreads.push(thread);
                    delete incompleteThreads[threadId];
                }
            });

            return completeThreads;
        }
    });


    return ChannelNode;
});