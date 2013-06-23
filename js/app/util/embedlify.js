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
  var config = require('config');
  var template = require('text!templates/content/embed.html');

  function embedlify(success) {
    return {
      maxWidth: 400,
      key: config.embedlyKey,
      secure: config.embedlySecure,
      success: function(oembed, dict) {
        // If is not a link or if the link has an image
        if (oembed.type !== 'link' || oembed.thumbnail_url) {
          var html = _.template(template, {
            maxWidth: 400,
            url: oembed.url || dict.url,
            title: (oembed.type !== 'photo') ? (oembed.title || dict.url) : undefined,
            img:   (oembed.type === 'photo') ? oembed.url : oembed.thumbnail_url,
            width: (oembed.type === 'photo') ? oembed.width : oembed.thumbnail_width,
            html: oembed.html,
            description: oembed.description
          });
          success(dict.node, html);
        }
      }
    };
  }

  return embedlify;
});
