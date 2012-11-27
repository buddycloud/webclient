/*
 * Copyright 2012 buddycloud
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
  var $ = require('jquery');
  var animations = require('util/animations');
  var Backbone = require('backbone');
  var l10nBrowser = require('l10n-browser');
  var template = require('text!templates/content/anonOverlay.html')

  var AnonChannelOverlay = Backbone.View.extend({
    className: 'overlay',

    events: {'click .close': '_removeOverlay',
             'submit form.login': 'login'},

    initialize: function() {
      this.localTemplate = l10nBrowser.localiseHTML(template, {});
    },

    render: function() {
      this.$el.html(_.template(this.localTemplate));
    },

    login: function(event) {
      event.preventDefault();
      var username = $('#auth_name').attr('value');
      var password = $('#auth_pwd').attr('value');
      localStorage.loginPermanent = $('#store_local').is(':checked')
      this.model.credentials.save({username: username, password: password});

      // Remove overlay
      this._removeOverlay(function() {
        location.reload();
      });
    },

    _removeOverlay: function(callback) {
      var self = this;
      this.$('.modal').one(animations.transitionsEndEvent(), function() {
        self.$el.hide();
        
        if (callback) {
          callback();
        }
      });
      this.$el.removeClass('visible');
    }
  });

  return AnonChannelOverlay;
});
