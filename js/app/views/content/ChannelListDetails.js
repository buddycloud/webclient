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
  var ChannelFollowers = require('models/ChannelFollowers');
  var l10nBrowser = require('l10n-browser');
  var template = require('text!templates/content/channelListDetails.html');
  var Events = Backbone.Events;
  var localTemplate;

  var ChannelListDetails = Backbone.View.extend({
    className: 'adminAction',
    positions: ['first', 'second', 'third', 'fourth'],
    classToRoles: {
      'moderator': 'moderator',
      'follower': 'member',
      'followerPlus': 'publisher',
    },
    rolesToClass: {
      'moderator': 'moderator',
      'member': 'follower',
      'publisher': 'followerPlus'
    },
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

    _loggedUserAffiliation: function() {
      var user = this.options.user;
      var channel = this.model.channel;

      return user.subscribedChannels.role(channel);
    },

    render: function() {
      this.$el.html(_.template(localTemplate, {
        channel: this.options.title,
        role: this.options.role
      }));

      if (this.model && this.options.user) {
        var affiliation = this._loggedUserAffiliation();
        // Only producers and moderators can change roles
        if (affiliation === 'owner' || affiliation === 'moderator') {
          this.$('.action').show();
          this.$('.actionRow.choose').show();

          var role = this.model.userRole(this.options.title);
          if (role === 'outcast') {
            this.$('.banUser').hide();
            this.$('.banUserButton').hide();
          } else {
            var roleClass = this.rolesToClass[role];
            this.$('#selectRights > option').each(function() {
              var value = $(this).val();
              if (value === roleClass) {
                $(this).remove();
              } else if (affiliation === 'moderator' && value === 'moderator') {
              // Moderators can't set moderators
                $(this).remove();
              }
            });
          }


          this._selectRights();
        }
      }
    },

    _navigateToChannel: function() {
      Events.trigger('navigate', this.options.title);
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
      this._onClickOK('outcast');
    },

    _changeRole: function() {
      this._showConfirm();
      var value = this.$('#selectRights').val();
      this._onClickOK(this.classToRoles[value]);
    },

    _cancelAction: function() {
      this.$('.actionRow.choose').show();
      this.$('.actionRow.confirm').hide();
    },

    _onClickOK: function(newRole) {
      this.$('.okButton').one('click', this._changeRoleRequest(newRole));
    },

    _changeRoleRequest: function(newRole) {
      var self = this;
      var channel = this.options.title;
      var credentials = this.options.user.credentials;

      return function() {
        self.listenToOnce(self.model, 'error', self._requestError);
        self.listenToOnce(self.model, 'sync', self._updateRole(channel, newRole));

        self.$('.actionRow.choose').show();
        self.$('.actionRow.choose').prop('disabled', true);
        self.$('.actionRow.confirm').hide();

        self.model.changeRole(channel, newRole, credentials);
      };
    },

    _requestError: function() {
      // FIXME: better error handling
      this.$('.actionRow.choose').removeProp('disabled');
      alert('Something went wrong =(');
    },

    _updateRole: function(channel, newRole) {
      var self = this;
      return function() {
        Events.trigger('roleChanged', channel, newRole);
        self.render();
        self.$('.actionRow.choose').removeProp('disabled');
      };
    }
  });

  return ChannelListDetails;
});
