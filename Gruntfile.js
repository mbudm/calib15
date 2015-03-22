module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
		browserify: {
			/*
			build:{
      	'build/Release/bundle.js': ['src/app.js']
			},
			tests:{*/
				'test/bundle.js': ['test/tests.js']
			//}
    },
		watch: {
      files: [ "src/**/*.js"],
      tasks: [ 'build' ]
    },
		tape: {
      options: {
        pretty: true,
        output: 'console'
      },
      files: ['test/unit/**/*.js']
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
 	grunt.loadNpmTasks('grunt-browserify');
 	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-tape');
  grunt.registerTask('test', ['tape']);
  grunt.registerTask('ci', ['tape:ci']);
  grunt.registerTask('build', ['test','browserify','copy']);
  grunt.registerTask('default', ['build']);
}