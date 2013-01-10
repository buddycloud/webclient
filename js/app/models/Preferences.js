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
  var api = require('util/api');
  var ModelBase = require('models/ModelBase');

  var Preferences = ModelBase.extend({
    _isTrue: function(attr) {
      return attr ? attr === 'true' : false;
    },

    email: function() {
      return this.get('email') || '';
    },

    newFollowers: function() {
      return this._isTrue(this.get('followRequest')) || 
             this._isTrue(this.get('followMyChannel'))
    },

    mentions: function() {
      return this._isTrue(this.get('postMentionedMe'));
    },

    ownChannel: function() {
      return this._isTrue(this.get('postOnMyChannel'));
    },

    followedChannels: function() {
      return this._isTrue(this.get('postOnSubscribedChannel'));
    },

    threads: function() {
      return this._isTrue(this.get('postAfterMe'));
    },

    url: function() {
      return api.url('user_settings');
    },

    parse: function(resp, xhr) {
      if (!resp.email) {
        // Workaround for old accounts (without email)
        this.trigger('change');  
      }

      return resp;
    },

    sync: function(method, model, options) {
      if (method === 'update') {
        // always POST
        method = 'create';
      }
      Backbone.sync.call(this, method, model, options);
    }
  });

  return Preferences;
});
