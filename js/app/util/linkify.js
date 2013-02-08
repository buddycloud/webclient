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
  var _ = require('underscore');

  var LINKS_REGEX = new RegExp([
    '^(.*?)',
    '(?:',
    // Thanks to John Gruber:
    // http://daringfireball.net/2010/07/improved_regex_for_matching_urls
    // (with '(?:' for included groups).
    '\\b((?:[a-z][\\w-]+:(?:/{1,3}|[a-z0-9%])|www\\d{0,3}[.]|[a-z0-9.\\-]+[.][a-z]{2,4}/)(?:[^\\s()<>]+|\\((?:[^\\s()<>]+|(?:\\([^\\s()<>]+\\)))*\\))+(?:\\((?:[^\\s()<>]+|(?:\\([^\\s()<>]+\\)))*\\)|[^\\s`!()\\[\\]{};:\'".,<>?«»“”‘’]))\\b',
    '|',
    // Channel regex.
    '\\b([\\w\\d][\\w\\d-_%&<>.]+@[\\w\\d-]{3,}\\.[\\w\\d-]{2,}(?:\\.[\\w]{2,6})?)\\b',
    ')',
    '(.*)$'
    ].join(''));
  
  function linkify(content) {
    // convert urls and channel refs to hyperlinks.
    // html-escape the rest of the text.
    if (content === undefined) content = "";
    var parts = [];
    content.split('\n').forEach(function(line) {
      var m, lineParts = [];
      while (line.length > 0) {
        if (m = line.match(LINKS_REGEX, "i")) {
          if (m[1]) {
            lineParts.push(_.escape(m[1]));
          }
          if (m[2]) {
            lineParts.push('<a href="' + m[2] + '" target="_blank" rel="nofollow">' + m[2] + '</a>');
          }
          if (m[3]) {
            lineParts.push('<a class="internal" href="/#' + m[3] +'">' + m[3] + '</a>');
          }
          line = m[4] || "";
        } else {
          lineParts.push(_.escape(line));
          line = "";
        }
      }
      parts.push(lineParts.join(''));
    });
    return parts.join('\n');
  }

  function urls(content) {
    var urls = [];
    content.split('\n').forEach(function(line) {
      var m;
      while (line.length > 0) {
        if (m = line.match(LINKS_REGEX, "i")) {
          if (m[2]) urls.push(m[2]);
          line = m[4] || "";
        } else {
          line = "";
        }
      }
    });
    if (urls.length > 0)
        return urls;
    else
        return null;
  }

  return {
    linkify: linkify,
    urls: urls
  };
});
