module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
		browserify: {
      'dist/app.js': ['app/app.js']
    },
		watch: {
      files: [ "app/**/*.js"],
      tasks: [ 'browserify' ]
    }
  })
 grunt.loadNpmTasks('grunt-browserify')
 grunt.loadNpmTasks('grunt-contrib-watch')
}