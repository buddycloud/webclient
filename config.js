define({
  // API address: where you API is hosted. 
  // Note: it is not possible to use self signed certificates for AJAX requests.
  // https://buddycloud.org/wiki/Install#SSL_and_API_requests
  baseUrl: 'https://api.EXAMPLE.COM',
  
  // Domain that you your users live on. For example, if your users' 
  // IDs look like user@example.com then the homeDomain would be example.com.
  homeDomain: 'EXAMPLE.COM',
  
  // To enable Embedly, you must sign up on the http://embed.ly website.
  // If you are not using Embedly, you may see "some content is unencrypted"
  // messages while browsing, which can be solved by changing embedlySecure
  // to "true".
  embedlyKey: '',
  embedlySecure: false,
  release: true
});
