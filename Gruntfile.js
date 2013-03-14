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

  // Development Server
  grunt.registerTask('_server', 'Start a custom static web server.', function() {
    var express = require('express');
    var fs = require('fs');

    var mdir = __dirname;
    var app = express();

    app.use('/js', express.static(mdir + '/js'));
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
    app.listen(3000);

    console.log('Listening on port 3000...');
  });

}
