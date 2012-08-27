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
        anonymous: function() {
            return !this.get('username');
        },

        save: function(attributes) {
            this.set(attributes);
            this._setSessionStorage('username', this.get('username'));
            this._setSessionStorage('password', this.get('password'));
        },

        _setSessionStorage: function(key, value) {
            if (value) {
                sessionStorage[key] = value;
            } else {
                delete sessionStorage[key];
            }
        },

        fetch: function(options) {
            var username = sessionStorage.username;
            var password = sessionStorage.password;
            this._checkCredentialsAndSet(username, password, options);
        },

        _checkCredentialsAndSet: function(username, password, callbacks) {
            var self = this;
            this._checkCredentials(username, password, {
                success: function() {
                    Backbone.Model.prototype.set.call(self, {
                        username: username,
                        password: password
                    });
                    if (callbacks.success) {
                        callbacks.success();
                    }
                },
                error: callbacks.error
            });
        },

        _checkCredentials: function(username, password, callbacks) {
            if (!username) {
                if (callbacks.success) {
                    callbacks.success();
                }
            } else {
                // We check the credentials by using them to GET the API's
                // root, which returns a 2xx status code if the credentials
                // are correct.
                var xhr = $.ajax(util.apiUrl(''), {
                    method: 'GET',
                    beforeSend: this._setupAuthFunction(username, password),
                    success: callbacks.success,
                    error: callbacks.error
                });
            }
        },

        fetchOptions: function() {
            if (!this.anonymous()) {
                var username = this.get('username');
                var password = this.get('password');
                return {
                    beforeSend: this._setupAuthFunction(username, password)
                };
            }
        },

        _setupAuthFunction: function(username, password) {
            return function(xhr) {
                var auth = 'Basic ' + btoa(username + ':' + password);
                xhr.setRequestHeader('Authorization', auth);
                xhr.withCredentials = true;
            };
        }
    });

    return UserCredentials;
});