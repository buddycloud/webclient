requirejs.config({
  baseUrl: '/base/js/vendor',
  paths: {
    'config': '../../spec/config',
    'spec': '../../spec',
    'models': '../app/models',
    'util': '../app/util'
  }
});

require([
  'spec/Item.spec',
  'spec/Channel.spec',
  'spec/ChannelFollowers.spec',
  'spec/ChannelItems.spec',
  'spec/ChannelMetadata.spec',
  'spec/Discover.spec',
  'spec/Item.spec',
  'spec/PostNotifications.spec',
  'spec/Search.spec',
  'spec/SimilarChannels.spec',
  'spec/SubscribedChannels.spec',
  'spec/User.spec',
  'spec/UserCredentials.spec',
  'spec/util_api.spec',
  'spec/util_avatarFallback.spec',
  'spec/util_linkify.spec'
], function() {
  window.__testacular__.start();
});

