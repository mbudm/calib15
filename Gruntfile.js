module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
		browserify: {
      'build/Release/bundle.js': ['src/app.js']
    },
		watch: {
      files: [ "src/**/*.js"],
      tasks: [ 'browserify' ]
    },
		copy: {
		  main: {
				src: 'src/index.html',
		    dest: 'build/Release/index.html',
		    options: {
		      process: function (content, srcpath) {
		        return content.replace(/\bapp.js\b/g,"bundle.js");
		      }
		    }
			}
		}
  })
 	grunt.loadNpmTasks('grunt-browserify')
 	grunt.loadNpmTasks('grunt-contrib-watch')
	grunt.loadNpmTasks('grunt-contrib-copy')
}