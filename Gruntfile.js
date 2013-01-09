module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    connect: {
      app: {
        options: {
          port: 8000,
          base: ''
        }
      }
    },

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
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('gruntacular');

  // Tasks
  grunt.registerTask('default', ['server']);
  grunt.registerTask('server', ['connect', 'watch']);
  grunt.registerTask('test', ['testacular']);
}