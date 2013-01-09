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

    watch: {}
  });

  // Plug-ins
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Tasks
  grunt.registerTask('default', ['server']);
  grunt.registerTask('server', ['connect', 'watch']);
}