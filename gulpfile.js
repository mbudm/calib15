'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var transform = require('vinyl-transform');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('build-app', function () {
	return bundlify('./src/app.js','./build/Release/' );
});

gulp.task('build-test', function () {
	return bundlify('./test/tests.js','./test/dist/' );
});

gulp.task('default', ['build-app', 'build-test']);

function bundlify(srcFile,destFile){
  // transform regular node stream to gulp (buffered vinyl) stream 
  var browserified = transform(function(filename) {
    var b = browserify({entries: filename, debug: true});
    return b.bundle();
  });

  return gulp.src(srcFile)
    .pipe(browserified)
    .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(destFile));
};