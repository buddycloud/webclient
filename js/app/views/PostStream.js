/*
 * Copyright 2012 Denis Washington <denisw@online.de>
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
  var $ = require('jquery');
  var _ = require('underscore');
  var api = require('app/util/api');
  var avatarFallback = require('app/util/avatarFallback');
  var Backbone = require('backbone');
  var template = require('text!templates/PostStream.html');
  
  require('jquery.embedly');
  $.embedly.defaults['key'] = '55bafac9655742c1af02b11cb0bd08e4';

  // Thanks to John Gruber:
  // http://daringfireball.net/2010/07/improved_regex_for_matching_urls
  var URL_REGEX = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/g;

  var PostStream = Backbone.View.extend({
    tagName: 'div',
    className: 'post-stream',

    initialize: function() {
      this.model.bind('reset', this.render, this);
      this.model.bind('add', this.render, this);
      this.model.bind('remove', this.render, this);
      this._renderSpinningIcon();
      var that = this;
      $(window).scroll(function() {
        that.infiniteScroll();  
      })
    },


    render: function() {
      this.$el.html(_.template(template, {
        threads: this.model.byThread(),
        avatarUrlFunc: api.avatarUrl,
        linkUrlsFunc: this._linkUrls
      }));
      this._setupAvatarFallbacks();
    },

    _linkUrls: function(content) {
      content = $('<div/>').text(content).html();
      return content.replace(URL_REGEX, '<a href="$&" target="_blank">$&</a>');
    },

    _setupAvatarFallbacks: function() {
      var toplevelAvatars = this.$('.thread > header .avatar');
      var commentAvatars = this.$('.comment .avatar');
      avatarFallback(toplevelAvatars, 'personal', 48);
      avatarFallback(commentAvatars, 'personal', 32);
    },

    _renderSpinningIcon: function() {
      var icon =
        $('<div class="loading"><img src="img/bc-icon.png"></div>');

      this.$el.html(icon);
      this._startSpinning(icon);
    },

    _startSpinning: function(icon) {
      var rotation = 0;

      var spin = setInterval(function() {
        var rotate = 'rotate(' + rotation + 'deg)';
        icon.find('img').css({
          'transform': rotate,
          '-moz-transform': rotate,
          '-webkit-transform': rotate
        });
        rotation = (rotation + 10) % 360;
      }, 50);

      this.model.on('reset', function() {
        clearTimeout(spin);
      });
    },
    
    scrollLock: false,
    
    infiniteScroll: function() {
        var rest = document.height - $(document).scrollTop() - window.innerHeight
        if (rest < 500 && !this.scrollLock) {
            console.log("new batch")
        }
    }
  
  });

  return PostStream;
});
