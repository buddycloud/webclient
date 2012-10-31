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
  // Thanks to John Gruber:
  // http://daringfireball.net/2010/07/improved_regex_for_matching_urls
  var URL_REGEX = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/g;

  var CHANNEL_REGEX = /[\w\d][\w\d-_%&<>.]+@[\w\d-]{3,}\.[\w\d-]{2,}(\.[\w]{2,6})?/g;

  function linkify(content) {
    return linkMentions(linkUrls(content));
  }

  function safeString(content) {
    return $('<div/>').text(content).html();
  }

  function linkUrls(content) {
    return content.replace(
      URL_REGEX,
      '<a href="$&" target="_blank" rel="nofollow">$&</a>'
    );
  }

  function linkMentions(content) {
    return content.replace(
      CHANNEL_REGEX,
      '<a class="internal" href="/#\$&">\$&</a>'
    );
  }

  return linkify;
});
