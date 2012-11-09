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
  var AbstractEditStream = require('views/content/AbstractEditStream');
  var template = require('text!templates/content/editChannel.html');

  var EditChannelStream = AbstractEditStream.extend({

    events: {
      'click .save': 'save',
      'click .discard': 'render',
      'click .twoStepConfirmation .stepOne': '_renderConfirmButton',
      'click .twoStepConfirmation .stepTwo': '_deleteAccount'
    },

    initialize: function() {
      this._initialize();
      this.model.bind('change', this.render, this);
      this.model.bind('sync', this.render, this);
    },

    render: function() {
      this.$el.html(_.template(template, {
        metadata: this.model
      }));
      this._fillCheckbox();
      this._selectDefaultRole();
    },

    save: function() {
      this._save();
    },

    _fillCheckbox: function() {
      this._check(this.$('#channel_public_access'), this._hasPublicAccess());
    },

    _hasPublicAccess: function() {
      return this.model.accessModel() === 'open';
    },

    _selectDefaultRole: function() {
      if (this.model.defaultAffiliation() === 'publisher') {
        this.$('#channel_default_role').val('followerPlus');
      }
    },

    _renderConfirmButton: function() {
      this.$('.twoStepConfirmation').toggleClass('confirmed');
    },

    _deleteAccount: function() {
      //TODO delete account
    }
  });

  return EditChannelStream;
});
