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
  var Item = require('models/Item')
  var ModelBase = require('models/ModelBase')
  var _ = require('underscore');
  var Pollymer = require('pollymer');
  var $ = require('jquery');

  var PostNotifications = ModelBase.extend({
    initialize: function() {
      this._request = new Pollymer.Request({maxTries: -1, rawResponse: true});
      this.bind('change', this._triggerNewItem);
    },

    _request: null,
    
    _triggerNewItem: function() {
      var item = new Item(this.attributes);
      this.trigger('new', item);
    },

    url: function() {
      return api.url('notifications', 'posts');
    },

    fetch: function(options) {
      // Explicitly set "Accept: application/json"
      // so that we get the JSON representation.
      options = options || {};
      options.headers = options.headers || {};
      options.headers['Accept'] = 'application/json';
      ModelBase.prototype.fetch.call(this, options);
    },

    sync: function(method, model, options) {
      if (method != 'read') {
        return ModelBase.prototype.sync.call(this, method, model, options);
      }

      var p = _.extend({}, options);
      if (!p.url) {
        p.url = _.result(model, 'url');
      }
      if (!p.url) {
        throw new Error('A "url" property or function must be specified');
      }

      var dfd = $.Deferred();
      var onFinished = function(code, result) {
        if (code < 200 || code >= 300) {
          this.retry();
          return;
        }
        var obj;
        try {
          obj = JSON.parse(result);
        } catch(e) {
          this.retry();
          return;
        }
        if (!options.success(obj)) {
          this.retry();
          return;
        }
        this.off('finished', onFinished);
        dfd.resolve();
        model.trigger('sync', model, obj, options);
      };
      this._request.on('finished', onFinished);

      if ("withCredentials" in options.xhrFields) {
        this._request.withCredentials = options.xhrFields.withCredentials;
      } else {
        this._request.withCredentials = false;
      }

      this._request.start('GET', p.url, p.headers);
      model.trigger('request', model, null, options);
      return dfd.promise();
    },

    listen: function(options) {
      if (!this._listening) {
        this._listening = true;
        this._doListen(options);
      }
    },

    _doListen: function(options) {
      options = options || {};
      if (options.credentials && options.credentials.username) {
        var self = this;
        options.complete = function() {
          setTimeout(self._doListen.bind(self, options), 0);
        };
        this.fetch(options);
      }
    }
  });

  return PostNotifications;
});
