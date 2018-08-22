buddycloud webclient
====================

This is the buddycloud web software for [buddycloud](http://buddycloud.com/).
This software uses the the buddycloud [HTTP API](https://github.com/buddycloud/buddycloud-http-api)

The code is based on 
* [jQuery](http://jquery.com/)
* [Underscore](http://underscorejs.org/) 
* [Backbone.js](http://backbonejs.org/)
* [Jasmine](https://jasmine.github.io/) for unit testing

Setup
=====

Setting up your webclient dev environment
```
git clone https://github.com/buddycloud/webclient.git
cd webclient
cp <webroot>/config.js.example <webroot>/config.js
# to work against the buddycloud demo server:
edit <webroot>/config.js and set the baseURL to https://demo.buddycoud.org/api
edit <webroot>/config.js and set the homeDomain to buddycoud.org
# install node.js
npm install
npm install -g grunt-cli
grunt build
grunt default
browse to http://localhost:3000
```

Building the compressed JavaScript and CSS files
================================================

```
cd webclient
npm install
grunt build
```

License and Copyright
=====================
This code is Apache 2 licensed and copyright buddycloud.
