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
    'text!templates/LoginSidebar.html'
], function(Backbone, template) {

    var LoginSidebar = Backbone.View.extend({
        tagName: 'aside',
        className: 'login-sidebar bordered',
        events: {'click input[type=submit]': '_login'},

        render: function() {
            this.$el.html(_.template(template));
        },

        _login: function(event) {
            event.preventDefault();
            var username = this.$('input[name=username]').attr('value');
            var password = this.$('input[name=password]').attr('value');
            this.model.save({username: username, password: password});
            location.reload();
        }
    });

    return LoginSidebar;
});