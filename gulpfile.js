'use strict';

var TAPE_TESTS = './test/unit/controller/**/*.js';
var TESTLING_TESTS = './test/unit/view/**/*.js';
var ALL_TESTS = './test/all.js';
var ALL_TESTS_DEST = './test/dist';

var ALL_TESTS_GLOB = './test/unit/**/*.js';

var APP_SRC = './src/app.js';
var APP_DEST = './build/Release';
var APP_GLOB = './src/**/*.js';

var BUNDLE_FILENAME ='bundle.js';

var gulp = require('gulp');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');

var shelljs = require('shelljs');
var gulpshell = require('gulp-shell');


var bundler = watchify(browserify(watchify.args));
bundler.add(APP_SRC);
bundler.transform('brfs');
//Now triggered by gulp.watch which does the tests first
//bundler.on('update', appBundle); 
bundler.on('log', gutil.log); 

var testBundler = watchify(browserify(watchify.args));
testBundler.add(ALL_TESTS);
testBundler.transform('brfs');
//Now triggered by gulp.watch which does the tests first
//testBundler.on('update', testBundle); 
testBundler.on('log', gutil.log); 

function appBundle(){
	return bundle(bundler,APP_DEST);
}

function testBundle(){
	bundle(testBundler,ALL_TESTS_DEST);
}

function bundle(b,dest) {
  return b.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source(BUNDLE_FILENAME))
    // optional, remove if you dont want sourcemaps
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
      .pipe(sourcemaps.write('./')) // writes .map file
    //
	.pipe(gulp.dest(dest));
}

gulp.task("autotest", function() {
	gulp.watch(
	    [APP_GLOB, ALL_TESTS_GLOB], 
	    ["testling",'js','test-build']
	);
});

//gulp.task('testling', gulpshell.task(['browserify '+ALL_TESTS_GLOB+' | testling']));

gulp.task('testling', function(){
	return gulp.src(ALL_TESTS_GLOB)
			.pipe(gulpshell([
				'browserify '+ALL_TESTS_GLOB+' | testling'
			]));
});

gulp.task('js', appBundle); // $ gulp js // to build the file
gulp.task('test-build', testBundle); // $ gulp test-build // to build the test file for browser testing and tdd dev

gulp.task('default', ['autotest']); // $ gulp //