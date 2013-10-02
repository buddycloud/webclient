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
  var Events = Backbone.Events;
  var l10nBrowser = require('l10n-browser');
  var template = require('text!templates/content/anonOverlay.html');
  var localTemplate;

  var AnonChannelOverlay = Backbone.View.extend({
    className: 'overlay',

    events: {'click .close': '_removeOverlay',
             'submit form.login': 'login'},

    initialize: function() {
      if (!localTemplate) localTemplate = l10nBrowser.localiseHTML(template, {});
      this.listenTo(this.model, 'loginSuccess', this._successfullLogin);
      this.listenTo(this.model, 'loginError', this._invalidLogin);
    },

    destroy: function() {
      this.remove();
    },

    render: function() {
      this.$el.html(_.template(localTemplate));
    },

    _invalidLogin: function() {
      $('.error').show();
      this._enableButton();
    },

    _successfullLogin: function() {
      // Remove overlay
      this._removeOverlay(function() {
        Events.trigger('navigate', 'home');
      });
    },

    _disableButton: function() {
      this.$('#auth_submit').attr('disabled', true);
    },

    _enableButton: function() {
      this.$('#auth_submit').attr('disabled', false);
    },

    login: function(event) {
      event.preventDefault();
      this._disableButton();
      var username = $('#auth_name').val().toLowerCase(); // Ensure lower case
      var password = $('#auth_pwd').val();
      var permanent = $('#store_local').is(':checked');

      var loginInfo = {'username': username, 'password': password};
      this.model.login(loginInfo, {'permanent': permanent});
    },

    _removeOverlay: function(callback) {
      var self = this;
      this.$('.modal').one(animations.transitionsEndEvent(), function() {
        self.$el.hide();
        self.destroy();
        if (callback) {
          callback();
        }
      });
      this.$el.removeClass('visible');
    }
  });

  return AnonChannelOverlay;
});
