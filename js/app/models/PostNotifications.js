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
  var dateUtils = require('util/dateUtils');
  var Item = require('models/Item');
  var ModelBase = require('models/ModelBase');
  var Backbone = require('backbone');
  var Events = Backbone.Events;
  var Pollymer = require('pollymer');

  var PostNotifications = ModelBase.extend({
    initialize: function() {
      this._request = new Pollymer.Request({maxTries: -1, rawResponse: true});
      this._last = null;
      this.listenTo(this, 'sync', this._triggerNewItem);
    },

    _request: null,

    _triggerNewItem: function() {
      var mostRecent;

      for (var i in this.attributes) {
        var val = this.attributes[i];
        if (val.source) {
          val.source = val.source.split('/')[0];
        }

        var item = new Item(val);

        var updated = dateUtils.utcDate(item.updated || item.published);
        if (!mostRecent || updated > mostRecent) {
          mostRecent = updated;
        }

        this.trigger('new', item);
      }

      if (mostRecent) {
        Events.trigger('updateLastSession', mostRecent.toISOString());
      }
    },

    url: function() {
      var baseUrl = api.url('notifications', 'posts');
      // Parameters need to be manually added
      if (this._last) {
        baseUrl += '?since=' + this._last;
      }
      return baseUrl;
    },

    fetch: function(options) {
      // Explicitly set "Accept: application/json"
      // so that we get the JSON representation.
      options = options || {};
      options.headers = options.headers || {};
      options.headers['Accept'] = 'application/json';
      ModelBase.prototype.fetch.call(this, options);
    },

    // Implementation of Model.sync using Pollymer
    // instead of jqXHR.
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
      var promise = dfd.promise();

      var self = this;

      // This is where Pollymer makes things interesting.
      // We use Pollymer to repoll instead of ever reporting
      // an error.
      // The options hash contains success, error, and
      // complete methods, but since we never error, we just
      // call the success and complete methods.
      var onFinished = function(code, result) {
        // If our return code was outside the 2xx range,
        // retry.
        if (code < 200 || code >= 300) {
          this.retry();
          return;
        }
        // If we can't parse the return object as JSON,
        // retry.
        var obj;
        try {
          obj = JSON.parse(result);
        } catch(e) {
          this.retry();
          return;
        }

        // Try running the options.success method.
        // At this point, this method is provided by
        // backbone.  It tries to update the model with
        // the object just received from ajax.
        // On success it will return undefined,
        // and on failure, it will return false.
        if (typeof options.success(obj.items, "success", promise) !== "undefined") {
          this.retry();
          return;
        }

        // Try running the options.complete method.
        if (options.complete) {
          options.complete(promise, "success");
        }

        self._last = obj.last;

        this.off('finished', onFinished);
        dfd.resolve();
        //model.trigger('sync', model, obj, options);
      };
      this._request.on('finished', onFinished);

      if (options.xhrFields && options.xhrFields.withCredentials) {
        this._request.withCredentials = options.xhrFields.withCredentials;
      } else {
        this._request.withCredentials = false;
      }
      this._request.start('GET', p.url, p.headers);
      model.trigger('request', model, null, options);

      return promise;
    },

    listen: function(options) {
      if (!this._listening) {
        this._listening = true;
        if (!options.credentials.username) {
          delete options["credentials"];
        }
        this._doListen(options);
      }
    },

    _doListen: function(options) {
      options = options || {};
      var self = this;
      options.complete = function() {
        setTimeout(self._doListen.bind(self, options), 0);
      };
      this.fetch(options);
    }
  });

  return PostNotifications;
});
