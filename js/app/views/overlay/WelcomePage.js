define(function(require) {
  var $ = require('jquery');
  var _ = require('underscore')
  var Backbone = require('backbone');
  var template = require('text!templates/overlay/welcome.html')

  var WelcomePage = Backbone.View.extend({
    className: 'discoverChannels middle clearfix',

    render: function() {
      this.$el.html(_.template(template));
      $('.content').html(this.el);
    }
  });

  return WelcomePage;
});
