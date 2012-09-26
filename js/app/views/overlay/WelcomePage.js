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
  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');
  var template = require('text!templates/overlay/welcome.html');
  var footer = require('text!templates/overlay/footer.html');

  var WelcomePage = Backbone.View.extend({
    className: 'discoverChannels middle clearfix',

   initialize: function() {
        _.bindAll(this, 'login');
    },

    events: {
      'submit form.login': 'login',
      'submit form.register': 'register'
    },

    login: function(event) {
      event.preventDefault();
      var username = $('#login_name').attr('value');
      var password = $('#login_password').attr('value');
      this.model.credentials.save({username: username, password: password});
      location.reload();
    },

    register: function(event) {
      event.preventDefault();
      var username = this.$('#register_name').attr('value');
      var password = this.$('#register_password').attr('value');
      var email = this.$('#register_email').attr('value');
      this.model.on('registrationSuccess', function() {
        location.reload();
      });
      this.model.on('registrationError', function(message) {
        alert(message)
      });

      this.model.register(username, password, email);
    },

    render: function() {
      that = this;
      this.$el.html(_.template(template));
      $('.content').addClass('homepage').html(this.el);

      var formHolder = $('.formHolder');
      $('nav a.login').click(function(event){ return toggleView(event, 'Login'); });  
      $('nav a.register').click(function(event){ return toggleView(event, 'Register'); });
      formHolder.find('form').click(function(event){ event.stopPropagation(); });
  
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
        
        // add footer
        $('.content').append(_.template(footer));
      }
      

      function hideForm(){
        formHolder.removeClass('showLogin showRegister');
      }
/*
      $('#login_submit').click(that._login)
  */},


    remove: function() {
      $('.content').removeClass('homepage')
      Backbone.Model.prototype.fetch.call(this);
    }
  });

  return WelcomePage;
});
