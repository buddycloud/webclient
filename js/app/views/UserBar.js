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
    '../../../config',
], function($, Backbone, config) {

    var UserBar = Backbone.View.extend({
        tagName: 'div',
        events: {'submit .login': '_login'},

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

    return UserBar;
});
