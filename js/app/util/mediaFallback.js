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
  var template = require('text!templates/content/mediaFallback.html');

  function mediaFallback(imgElements) {
    $(imgElements).one('error', function(event) {
      var $target = $(event.target);
      var url = $target.parent().attr('href');
      var $mediaDiv = $target.parents('.media');
      $mediaDiv.html(_.template(template, {
        title: "Click to download the file",
        url: url,
        img: 'img/media-download.png'
      }));
    });
  }

  return mediaFallback;
});
