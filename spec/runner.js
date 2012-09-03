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
  baseUrl: 'js',
  paths: {
    'config': '../spec/config',
    'spec': '../spec'
  }
});

define(function(require) {
  require('spec/ChannelFollowers.spec');
  require('spec/ChannelMetadata.spec');
  require('spec/ChannelPosts.spec');
  require('spec/Post.spec');
  require('spec/UserCredentials.spec');
  require('spec/util_api.spec');
  require('spec/util_avatarFallback.spec');

  jasmine.getEnv().addReporter(new jasmine.HtmlReporter());
  jasmine.getEnv().execute();
});