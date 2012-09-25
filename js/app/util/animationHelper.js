define(function(require) {
  //var Modernizr = require('modernizr');
  var transition = 'WebkitTransition'; //Modernizr.prefixed('transition');
  var transform = 'WebkitTransform';  //Modernizr.prefixed('transform');
  var transEndEventNames = {
    'WebkitTransition' : 'webkitTransitionEnd',
    'MozTransition'    : 'transitionend',
    'OTransition'      : 'oTransitionEnd',
    'msTransition'     : 'msTransitionEnd', // maybe?
    'transition'       : 'transitionEnd'
  }

  function getTransitionsEndEvent() {
    return transEndEventNames[transition];
  }

  /* ###
    redraw function to make sure that transitions are triggered
  ### */
  !function(document){
    // (C) WebReflection (As It Is) - Mit Style

    // we all love function declarations
    function redraw() {
      // clientHeight returns 0 if not present in the DOM
      // e.g. document.removeChild(document.documentElement);
      // also some crazy guy may swap runtime the whole HTML element
      // this is why the documentElement should be always discovered
      // and if present, it should be a node of the document
      // In all these cases the returned value is true
      // otherwise what is there cannot really be considered as painted
      return !!(document.documentElement || 0).clientHeight;
    }

    // ideally an Object.defineProperty
    // unfortunately some engine will complain
    // if used against DOM objects
    document.redraw = redraw;
  }(document);

  return {
    getTransitionsEndEvent: getTransitionsEndEvent
  }

});