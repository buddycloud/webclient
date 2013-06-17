buddycloud webclient
====================

This is the buddycloud web software for [buddycloud](http://buddycloud.com/).
This software uses the the buddycloud [HTTP API](https://github.com/buddycloud/buddycloud-http-api)

The code is based on 
* [jQuery](http://jquery.com/)
* [Underscore](http://underscorejs.org/) 
* [Backbone.js](http://backbonejs.org/)
* [Jasmine](http://pivotal.github.com/jasmine/) for unit testing

Setup
=====

All setup instructions are avaliable on the [buddycloud wiki](https://buddycloud.org/wiki/Install#buddycloud_webclient_setup)

Building the compressed JavaScript and CSS files
================================================

```
npm i ,
grunt build
```

Development
===========
Install everything with `npm install`. Copy `config.js.example` to `config.js` and modify to match your server, if you don't have one set up just use buddycloud.org. 

To start the server run `grunt debug server` from the project root.
To run the server using compressed JavaScript and CSS files simply run `grunt server`.

Documentation
=============

Project documentation, design guides and general help is avalible on the [webclient project page](https://buddycloud.org/wiki/Buddycloud_web_client)

API Access
==========

Copy `config.js.example` to `config.js` and change it to point it to another buddycloud API server.
* read-write: run a [HTTP API Server](https://github.com/buddycloud/buddycloud-http-api) on your domain
* read-only/testing: use `api.buddycloud.org`

License and Copyright
=====================

This code is Apache 2 licensed and copyright buddycloud.
