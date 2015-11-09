'use strict';

/* ================================
 * Dependencies
 * ================================ */

var gulp        = require('gulp');
var uglify      = require('gulp-uglify');
var rename      = require('gulp-rename');
var browserSync = require('browser-sync').create();
var notify      = require('gulp-notify');
var jscs        = require('gulp-jscs');
var jsStylish   = require('gulp-jscs-stylish');
var noop        = function () {};


/* ================================
 * Config variables
 * ================================ */

// JS Code Style options
var jscsOptions = {
	src: ['src/*.js', 'src/**/*.js'],
	opts: {
		config : '.jscsrc'
	}
};

// Uglify
var uglifyOptions = {
	src: ['src/*.js'],
	dest: 'dist/',
	opts: {
		mangle: true
	}
};

// Notify options
var notifyOptions = {
	sound: false
};

// Browser Sync options
var browserSyncOptions = {
	watchTask: true,
	open: false,
	server: {
		baseDir: './'
	}
};

// Watch options
var watchOptions = [
	'*.html',
	'dist/*.js'
];



/* ================================
 * Tasks
 * ================================ */


// JS Code Style linting
gulp.task('js-lint', function () {

	return gulp.src(jscsOptions.src)
		.pipe(jscs())
		.on('error', noop)
		.pipe(jsStylish())
});


// Build scripts
gulp.task('compress', function() {
  return gulp.src(uglifyOptions.src)
    .pipe(uglify(uglifyOptions.opts))
    .pipe(rename({extname:'.min.js'}))
    .pipe(gulp.dest(uglifyOptions.dest));
});


// Watch
gulp.task('watch', ['compress'], function() {
	browserSync.init(browserSyncOptions);
	console.log(__dirname);

  gulp.watch(jscsOptions.src, ['js-lint', 'compress']);
 	gulp.watch(watchOptions).on('change', browserSync.reload);
});


gulp.task('default', ['watch']);