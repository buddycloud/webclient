buddycloud HTTP Demo Client
===========================

This little web client demonstrates how to use the
[HTTP API](https://github.com/buddycloud/buddycloud-http-api) of
[buddycloud](http://buddycloud.com/), the decentralized social network
based on [XMPP](http://xmpp.org/). It shows how to get the posts of a
buddycloud channel and present them in a nice way. In the future, it will be
extended to include real-time updates, posting / commenting and other goodies
that the HTTP interface offers (or is going to offer).

The code uses [jQuery](http://jquery.com/),
[Underscore](http://underscorejs.org/) and [Backbone.js](http://backbonejs.org/)
to keep boilerplate to a minimum. All of the code dealing with the code is
located in `js/app/model.js`.

Testing the client is easy. Just download the source and open `index.html` in
your favorite browser. It will then load the *lounge@topics.buddycloud.org*
channel and display it. To view another channel, append `?channel=<channel-id>`
to the URL. By default, the client uses *https://api.buddycloud.org/* as its
HTTP API endpoint; you can change `config.js` to point it to another buddycloud
API server.
