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
  var transition = Modernizr.prefixed('transition');
  var transform = Modernizr.prefixed('transform');
  var transEndEventNames = {
    'WebkitTransition' : 'webkitTransitionEnd',
    'MozTransition'    : 'transitionend',
    'OTransition'      : 'oTransitionEnd',
    'msTransition'     : 'msTransitionEnd', // maybe?
    'transition'       : 'transitionend'
  }

  function transitionsEndEvent() {
    return transEndEventNames[transition];
  }

  // (C) WebReflection (As It Is) - Mit Style
  // redraw function to make sure that transitions are triggered
  // ideally an Object.defineProperty
  // unfortunately some engine will complain
  // if used against DOM objects
  document.redraw = function() {
    // clientHeight returns 0 if not present in the DOM
    // e.g. document.removeChild(document.documentElement);
    // also some crazy guy may swap runtime the whole HTML element
    // this is why the documentElement should be always discovered
    // and if present, it should be a node of the document
    // In all these cases the returned value is true
    // otherwise what is there cannot really be considered as painted
    return !!(document.documentElement || 0).clientHeight;
  };

  return {
    transitionsEndEvent: transitionsEndEvent
  }

});