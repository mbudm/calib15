'use strict';

var TAPE_TESTS = './test/unit/controller/**/*.js';
var TESTLING_TESTS = './test/unit/view/**/*.js';
var ALL_TESTS = './test/all.js';
var ALL_TESTS_DEST = './test/dist';

var APP_SRC = './src/app.js';
var APP_DEST = './build/Release';

var BUNDLE_FILENAME ='bundle.js';

var gulp = require('gulp');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');


gulp.task('js', appBundle); // so you can run `gulp js` to build the file
gulp.task('test-build', testBundle); // so you can run `gulp test-build` to build the file

gulp.task('default', ['js','test-build']); // so you can run `gulp test-build` to build the file

var bundler = watchify(browserify(watchify.args));
// add the file to bundle
bundler.add(APP_SRC);
// add any other browserify options or transforms here
bundler.transform('brfs');
bundler.on('update', appBundle); // on any dep update, runs the bundler
bundler.on('log', gutil.log); // output build logs to terminal

var testBundler = watchify(browserify(watchify.args));
// add the file to bundle
testBundler.add(ALL_TESTS);
// add any other browserify options or transforms here
testBundler.transform('brfs');
testBundler.on('update', testBundle); // on any dep update, runs the bundler
testBundler.on('log', gutil.log); // output build logs to terminal

function appBundle(){
	bundle(bundler,APP_DEST);
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