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
      'submit form.login': 'login'//,
      //'submit form.register': '_register'
    },

    login: function(event) {
      event.preventDefault();
      var username = $('#login_name').attr('value');
      var password = $('#login_password').attr('value');
      this.model.save({username: username, password: password});
      location.reload();
    },
/*
    _register: function(event) {
      event.preventDefault();
      var username = this.$('#register_name').attr('value');
      var password = this.$('#register_password').attr('value');
      var email = this.$('#register_email').attr('value');
      this.model.save({username: username, password: password, email: email});
      location.reload();
    },
*/
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
      }
      
      function hideForm(){
        formHolder.removeClass('showLogin showRegister');
      }
      
      $('.content').append(_.template(footer));
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
