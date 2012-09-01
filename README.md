buddycloud HTTP Client
======================

This is an alternative web client for [buddycloud](http://buddycloud.com/),
the decentralized social network based on [XMPP](http://xmpp.org/). Instead
of communicating directly with the server via XMPP like the official client,
it uses buddycloud's [HTTP API](https://github.com/buddycloud/buddycloud-http-api)
to do its job. This makes it also a good demonstration of how the API is used.

The client is still missing many features that the official client has. In the
future, it will be extended to include real-time updates, posting / commenting
and other goodies that the HTTP interface offers (or is going to offer).

The code is based on [jQuery](http://jquery.com/),
[Underscore](http://underscorejs.org/) and [Backbone.js](http://backbonejs.org/).
It also includes tests written with the [Jasmine](http://pivotal.github.com/jasmine/)
framework.

Testing the client is easy. Just download the source and open `index.html` in
your favorite browser. It will then load the *lounge@topics.buddycloud.org*
channel and display it. To view another channel, append `?channel=<channel-id>`
to the URL. By default, the client uses *https://api.buddycloud.org/* as its
HTTP API endpoint; you can change `config.js` to point it to another buddycloud
API server. *****Note:*** Due to cross-origin restrictions in browsers, some
features (such as login) require the client to be served from a server.**