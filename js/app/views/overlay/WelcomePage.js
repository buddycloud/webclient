define(function(require) {
  var $ = require('jquery');
  var _ = require('underscore')
  var Backbone = require('backbone');
  var template = require('text!templates/overlay/welcome.html')

  var WelcomePage = Backbone.View.extend({
    className: 'discoverChannels middle clearfix',

    events: {
      'click form.login [type=submit]': '_login'/*,
      'click form.register': '_register'*/
    },

    _login: function() {
      event.preventDefault();
      var username = this.$('#login_name').attr('value');
      var password = this.$('#login_password').attr('value');
      this.model.save({username: username, password: password});
      location.reload();
    },
/*
    _register: function() {
      event.preventDefault();
      var username = this.$('#register_name').attr('value');
      var password = this.$('#register_password').attr('value');
      var email = this.$('#register_email').attr('value');
      this.model.save({username: username, password: password, email: email});
      location.reload();
    },
*/
    render: function() {
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
      }
      
      function hideForm(){
        formHolder.removeClass('showLogin showRegister');
      }
    },


    remove: function() {
      $('.content').removeClass('homepage')
      Backbone.Model.prototype.fetch.call(this);
    }
  });

  return WelcomePage;
});
