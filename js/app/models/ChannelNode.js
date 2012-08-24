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
    'backbone',
    'app/models/util'
], function(Backbone, util) {

    var ChannelItem = Backbone.Model.extend({
    });

    var ChannelNode = Backbone.Collection.extend({
        model: ChannelItem,

        url: function() {
            return util.apiUrl(this.channel.get('channel'), 'content', this.name);
        },

        fetch: function(options) {
            // Explicitly set "Accept: application/json" so that we get the
            // JSON representation instead of an Atom feed.
            options = options || {};
            options.headers = {'Accept': 'application/json'};
            Backbone.Collection.prototype.fetch.call(this, options);
        },
    });


    return ChannelNode;
});