var requirejs = require('requirejs')
var config    = requirejs('./config.js')
var debug     = false

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    testacular: {
      unit: {
        configFile: 'testacular.conf.js',
        singleRun: true,
        browsers: ['PhantomJS']
      }
    },

    watch: {}
  });

  // Plug-ins
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('gruntacular');

  // Tasks
  grunt.registerTask('default', ['server']);
  grunt.registerTask('server', ['_server', 'watch']);
  grunt.registerTask('test', ['testacular']);

  // Set debug mode
  grunt.registerTask('debug', function() {
	  debug = true
  })
  
  // Development Server
  grunt.registerTask('_server', 'Start a custom static web server.', function() {
    var express = require('express');
    var fs = require('fs');

    var mdir = __dirname;
    var app = express();

    app.use('/js', express.static(mdir + '/js'));
    app.use(function(req, res, next) {
    	if (false == debug) return next()
    	if ('/css/style.min.css' != req.url) return next()
    	res.redirect('/css/main.css')
    })
    app.use('/css', express.static(mdir + '/css'));
    app.use('/img', express.static(mdir + '/img'));
    app.use('/locales', express.static(mdir + '/locales'));
    app.use('/templates', express.static(mdir + '/templates'));
    app.get('/config.js', function(req, res) {
    fs.readFile(mdir + '/config.js', 'utf8', function(error, file) {
        res.contentType('application/javascript');
        res.send(file);
      });
    });
    app.get('*', function(req, res) {
    fs.readFile(mdir + '/index.html', 'utf8', function(error, file) {
        res.send(file);
      });
    });
    var port = config.port || 3000;
    app.listen(port);
    console.log('Listening on port ' + port + '...');
  });

  // Build server
  grunt.registerTask('build', 'Build the compressed javascript and CSS files', function() {
	var requirejs = require('requirejs')
	var cssConfig = {
	  cssIn: './css/main.css',
      out: './css/style.min.css',
	  optimizeCss: 'standard'
	}
	requirejs.optimize(cssConfig, function(log) {
	  console.log(("\nApplication CSS optimisation complete").green);
	  console.log((log).cyan);
	}, function(error) {
	  console.log(("Error optimizing CSS: " + error).red);
	})
  })
}
