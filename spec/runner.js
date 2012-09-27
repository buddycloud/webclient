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

requirejs.config({
  baseUrl: 'js/vendor',
  paths: {
    'config': '../../spec/config',
    'spec': '../../spec',
    'models': '../app/models',
    'util': '../app/util'
  }
});

define(function(require) {
  require('spec/Channel.spec');
  require('spec/ChannelFollowers.spec');
  require('spec/ChannelItems.spec');
  require('spec/ChannelMetadata.spec');
  require('spec/Item.spec');
  require('spec/Search.spec');
  require('spec/SubscribedChannels.spec');
  require('spec/User.spec');
  require('spec/UserCredentials.spec');
  require('spec/util_api.spec');
  require('spec/util_avatarFallback.spec');
  require('spec/util_linkify.spec');

  jasmine.getEnv().addReporter(new jasmine.HtmlReporter());
  jasmine.getEnv().execute();
});
