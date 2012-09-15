buddycloud webclient
====================

This is the buddycloud web software for [buddycloud](http://buddycloud.com/).
This software uses the the buddycloud [HTTP API](https://github.com/buddycloud/buddycloud-http-api)

The code is based on 
* [jQuery](http://jquery.com/),
* [Underscore](http://underscorejs.org/) and, 
* [Backbone.js](http://backbonejs.org/).
* Unit tests are written with the [Jasmine](http://pivotal.github.com/jasmine/) framework.

Setup
=====

All setup instructions are avaliable on the [buddycloud wiki](https://buddycloud.org/wiki/Install#buddycloud_webclient_setup)

Documentation
=============

Project documentation, design guides and general help is avalible on the [webclient project page](https://buddycloud.org/wiki/Buddycloud_web_client)

API Access
==========
You can change `config.js` to point it to another buddycloud API server.
* ideally you will run your own API server
* for read-only API access you can use api.buddycloud.org
* for read-write API access you will need to install the buddycloud [HTTP API](https://github.com/buddycloud/buddycloud-http-api) 
on your own domain

Testing
=======

Testing the client is easy. Download the source and open `index.html` in
your favorite browser. It will then load the *lounge@topics.buddycloud.org*
channel and display it. To view another channel, append `/<channel-id>`
to the URL. By default, the client uses *https://api.buddycloud.org/* as its
HTTP API endpoint; 

License and Copyright
=====================

This code is Apache 2 licensed and copyright buddycloud.