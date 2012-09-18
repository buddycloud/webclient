define(function(require) {
  var $ = require('jquery');
  var _ = require('underscore')
  var Backbone = require('backbone');
  var template = require('text!templates/overlay/welcome.html')

  var WelcomePage = Backbone.View.extend({
    className: 'discoverChannels middle clearfix',

    events: {
      'click form.login': '_login',
      'click form.register': '_register'
    },

    _login: function() {
      event.preventDefault();
      var username = this.$('#login_name').attr('value');
      var password = this.$('#ligon').attr('value');
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
    },

    remove: function() {
      $('.content').removeClass('homepage')
      Backbone.Model.prototype.fetch.call(this);
    }
  });

  return WelcomePage;
});
