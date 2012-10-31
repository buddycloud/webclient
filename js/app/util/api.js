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
  var config = require('config');

  function url() {
    var components = _.toArray(arguments);
    components.unshift(config.baseUrl);
    return components.join('/');
  }

  function rootUrl() {
    return url('');
  }

  function avatarUrl(channel, size) {
    var ret = url(channel, 'media', 'avatar');
    if (size) {
      ret += '?maxwidth=' + size + '&maxheight=' + size;
    }
    return ret;
  }

  return {
    url: url,
    rootUrl: rootUrl,
    avatarUrl: avatarUrl
  };
});
