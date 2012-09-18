define(function(require) {
  var $ = require('jquery');
  var _ = require('underscore')
  var Backbone = require('backbone');
  var template = require('text!templates/overlay/welcome.html')

  var WelcomePage = Backbone.View.extend({
    className: 'discoverChannels middle clearfix',

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
