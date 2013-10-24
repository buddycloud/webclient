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
  var Backbone = require('backbone');
  var l10nBrowser = require('l10n-browser');
  var template = require('text!templates/content/channelListDetails.html');
  var Events = Backbone.Events;
  var localTemplate;

  var ChannelListDetails = Backbone.View.extend({
    className: 'adminAction',
    positions: ['first', 'second', 'third', 'fourth'],
    events: {
      'click h4': '_navigateToChannel',
      'click .changeRoleButton': '_changeRole',
      'click .banUserButton': '_banUser',
      'click .cancelButton': '_cancelAction',
      'change #selectRights': '_selectRights'
    },

    initialize: function() {
      if (!localTemplate) localTemplate = l10nBrowser.localiseHTML(template, {});
      this.$el.addClass(this.positions[this.options.position]);
      this.render();
    },

    render: function() {
      this.$el.html(_.template(localTemplate, {
        channel: this.options.channel,
        role: this.options.role
      }));

      var affiliation = this.options.affiliation;
      if (affiliation && affiliation === 'owner' || affiliation === 'moderator') {
        this.$('.action').show();
        this.$('.actionRow.choose').show();

        if (affiliation === 'moderator') {
          // Moderators can't set moderators
          this.$('#selectRights').each(function() {
            if ($(this).val() === 'moderator') {
              $(this).remove();
            }
          });
        }

        this._selectRights();
      }
    },

    _navigateToChannel: function() {
      Events.trigger('navigate', this.options.channel);
    },

    _selectRights: function() {
      var value = this.$('#selectRights').val();
      switch (value) {
        case 'moderator':
          this.$('.follower').hide();
          this.$('.followerPlus').hide();
          this.$('.moderator').show();
          break;
        case 'follower':
          this.$('.followerPlus').hide();
          this.$('.moderator').hide();
          this.$('.follower').show();
          break;
        case 'followerPlus':
          this.$('.follower').hide();
          this.$('.moderator').hide();
          this.$('.followerPlus').show();
          break;
      }
    },

    _showConfirm: function() {
      this.$('.actionRow.choose').hide();
      this.$('.actionRow.confirm').show();
    },

    _banUser: function() {
      this._showConfirm();
      this._onClickOK(function() {
        console.log("BAN!!!")
      });
    },

    _changeRole: function() {
      this._showConfirm();
      this._onClickOK(function() {
        console.log("change role")
      });
    },

    _cancelAction: function() {
      this.$('.actionRow.choose').show();
      this.$('.actionRow.confirm').hide();
    },

    _onClickOK: function(action) {
      this.$('.okButton').one('click', action);
    }
  });

  return ChannelListDetails;
});
