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
  var _ = require('underscore');
  var Backbone = require('backbone');
  var l10nBrowser = require('l10n-browser');
  var DiscoverOverlay = require('views/overlay/DiscoverOverlay');
  var template = require('text!templates/overlay/welcome.html');
  var loadingTemplate = require('text!templates/overlay/loading.html');
  var Events = Backbone.Events;
  var localTemplate;

  var WelcomePage = Backbone.View.extend({
    className: 'discoverChannels middle clearfix',

    events: {
      'submit form.login': 'login',
      'submit form.register': 'register'
    },

    initialize: function() {
      _.bindAll(this, 'login');
      if (!localTemplate) localTemplate = l10nBrowser.localiseHTML(template, {});
      this._attachModelEvents();
      this.discover = new DiscoverOverlay();
      this.render();
    },

    _attachModelEvents: function() {
      // registration
      this.listenTo(this.model, 'registrationSuccess', this._successfullRegistration);
      this.listenTo(this.model, 'registrationError', this._invalidRegistration);

      // login
      this.listenTo(this.model, 'loginSuccess', this._successfullLogin);
      this.listenTo(this.model, 'loginError', this._invalidLogin);
    },

    _invalidLogin: function() {
      $('.error').show();
      this._enableButton('#login_submit');
    },

    _successfullLogin: function(jid) {
      // sync
      Events.on('syncSuccess', this._successfullSync, this);
      
      // loading template
      this.$el.html(_.template(loadingTemplate, {jid: jid}));
    },

    _successfullSync: function() {
      Events.trigger('navigate', 'home');
    },

    _successfullRegistration: function() {
      this.model.login({permanent: true});
    },

    _invalidRegistration: function(message) {
      alert(message);
      this._enableButton('#register_submit');
    },

    _disableButton: function(selector) {
      this.$(selector).attr('disabled', true);
    },

    _enableButton: function(selector) {
      this.$(selector).attr('disabled', false);
    },
 
    login: function(event) {
      event.preventDefault();
      this._disableButton('#login_submit');
      $('.error').hide();
      var username = this.$('#login_name').val().toLowerCase(); // Ensure lower case
      var password = this.$('#login_password').val();
      var permanent = $('#store_local').is(':checked');

      var loginInfo = {'username': username, 'password': password};
      this.model.login(loginInfo, {'permanent': permanent});
    },

    register: function(event) {
      event.preventDefault();
      this._disableButton('#register_submit');
      var username = this.$('#register_name').val();
      var password = this.$('#register_password').val();
      var email = this.$('#register_email').val();
      this.model.register(username, password, email);
    },

    render: function() {
      this.$el.html(_.template(localTemplate));
      this.$el.append(this.discover.el);
      $('.content').addClass('homepage').html(this.el);

      var formHolder = $('.formHolder');
      $('nav a.login').click(function(event){ return toggleView(event, 'Login'); });
      $('nav a.register').click(function(event){ return toggleView(event, 'Register'); });
      formHolder.find('form').click(function(event){ event.stopPropagation(); });

      var previousUsername = localStorage.username;
      if (previousUsername) {
        this.$('#login_name').val(previousUsername);
      }

      function toggleView(event, form){
        event.stopPropagation();
        var className = 'show'+form;

        if(formHolder.hasClass(className)){
          // hide form if its already visible
          formHolder.removeClass(className);
        } else {
          // hide possibly open forms
          hideForm();
          // show this form
          formHolder.addClass(className);
          // focus first input field
          formHolder.find('form:visible input').first().focus();
          // hide if the user clickes into empty space
          $(document).one('click', hideForm);
        }
      }

      function hideForm(){
        formHolder.removeClass('showLogin showRegister');
      }
    },

    destroy: function() {
      $('.content').removeClass('homepage');
      this.model.off('registrationSuccess', this._successfullRegistration, this);
      this.model.off('registrationError', this._invalidRegistration, this);
      this.model.off('loginSuccess', this._successfullLogin, this);
      this.model.off('loginError', this._invalidLogin, this);
      this.discover.remove();
      this.remove();
    }

    //remove: function() {
    //  $('.content').removeClass('homepage')
    //  Backbone.Model.prototype.fetch.call(this);
    //}
  });

  return WelcomePage;
});
