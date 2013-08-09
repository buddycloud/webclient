var requirejs = require('requirejs')
  , config    = requirejs('./config.js')
  , debug     = false
  , color     = require('color')

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

    watch: {
      src: {
        files: ['js/app/*.js', 'css/**/*.css'],
        tasks: ['build']
      }
    }
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
    var fs = require('fs')

    var mdir = __dirname
    var app = express()

    app.use(function(req, res, next) {
      if (false == debug) return next()
      if ('/css/style.min.css' == req.url) return res.redirect('/css/main.css')
      if ('/js/app.min.js' == req.url) return res.redirect('/js/app/main.js')
      next()	
    })
    app.use('/js', express.static(mdir + '/js'))
    app.use('/css', express.static(mdir + '/css'))
    app.use('/img', express.static(mdir + '/img'))
    app.use('/locales', express.static(mdir + '/locales'))
    app.use('/templates', express.static(mdir + '/templates'))
    app.get('/config.js', function(req, res) {
    fs.readFile(mdir + '/config.js', 'utf8', function(error, file) {
        res.contentType('application/javascript')
        res.send(file)
      });
    });
    app.get('*', function(req, res) {
    fs.readFile(mdir + '/index.html', 'utf8', function(error, file) {
        res.send(file)
      })
    });
    var port = config.port || 3000
    app.listen(port)
    console.log('Listening on port ' + port + '...')
  });

  // Build server
  grunt.registerTask('build', 'Build the compressed javascript and CSS files', function() {
	var done = this.async()
	var requirejs = require('requirejs')
	var tasks = ['css', 'javascript']
	// Compress CSS
	var cssConfig = {
	  cssIn: './css/main.css',
      out: './css/style.min.css',
	  optimizeCss: 'standard'
	}
	requirejs.optimize(cssConfig, function(log) {
	  grunt.log.writeln(("Application CSS optimisation complete").green)
	  tasks.pop()
	  if (0 == tasks.length) return done()
	}, function(error) {
	  done(new Error("\nError optimizing CSS: " + error))
	})
	
	// Compress JavaScript
	var mainConfig = {
	  baseUrl: './js/app',
	  name: 'main',
	  inlineText: true,
	  out: './js/app.min.js',
	  mainConfigFile: './js/app/main.js',
	  optimizeAllPluginResources: true,
	  optimize: 'uglify2',
	  generateSourceMaps: true,
	  preserveLicenseComments: false,
          exclude: [ 'config' ]
	}
	
	requirejs.optimize(mainConfig, function (log) {
	  grunt.log.writeln(("Main JavaScript optimisation complete").green)
	  tasks.pop()
	  if (0 == tasks.length) return done()
	}, function(error) {
		grunt.log.writeln("\nError optimizing JavaScript: " + error)
	    done(new Error("\nError optimizing JavaScript: " + error))
	})

  })
}
