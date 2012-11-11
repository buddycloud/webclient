define(['jquery'], function($) {

  // thanks to http://www.alistapart.com/articles/expanding-text-areas-made-elegant/
  $.fn.autoResize = function() {

    this.filter('.expandingArea').each(function() {

      var $this = $(this);
      var $textarea = $this.find('textarea');
      var $span = $this.find('span');
      var textarea = $textarea[0];
      var span = $span[0];

      if (textarea.addEventListener) {
        textarea.addEventListener('input', function() {
          span.textContent = textarea.value;
        }, false);
        span.textContent = textarea.value;
      } else if (textarea.attachEvent) {
        // IE8 compatibility
        textarea.attachEvent('onpropertychange', function() {
          span.innerText = textarea.value;
        });
        span.innerText = textarea.value;
      }
      // Enable extra CSS
      $this.addClass('active');

    });
  }
});