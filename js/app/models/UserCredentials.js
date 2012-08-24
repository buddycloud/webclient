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
    'underscore',
    'backbone',
    'app/models/util'
], function($, _, Backbone, util) {

    var UserCredentials = Backbone.Model.extend({
        defaults: {
            username: null,
            password: null
        },

        set: function(attributes, options) {
            if (_.has(attributes, 'username') || _.has(attributes, 'password')) {
                var username = attributes.username || this.get('username');
                var password = attributes.password || this.get('password');
                var onerror = options ? options.error : null;
                this._checkCredentialsAndSet(username, password, onerror);
            } else {
                Backbone.Model.prototype.set.call(this, attributes, options);
            }
        },

        _checkCredentialsAndSet: function(username, password, onerror) {
            // We check the credentials by using them to GETthe API's root,
            // which returns 204 (No Content) if the credentials are correct.
            var self = this;
            var xhr = $.ajax(util.apiUrl(''), {
                method: 'GET',
                username: username,
                password: password,
                success: function() {
                    Backbone.Model.prototype.set.call(self, {
                        username: username,
                        password: password
                    });
                },
                error: function(__, xhr) {
                    self._triggerSetError(onerror);
                }
            });
        },

        _triggerSetError: function(onerror) {
            if (onerror) {
                onerror();
            } else {
                this.trigger(error);
            }
        }
    });

    return UserCredentials;
});