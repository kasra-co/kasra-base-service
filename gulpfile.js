'use strict';

var gulp = require('gulp');

// Load plugins
var XX = require('gulp-load-plugins')();
var server = require('gulp-develop-server');

// Test slugify..
gulp.task('slugify-test', function() {
	return gulp.src('./lib/slugify/tests/unit/*-test.js', {read: false})
		.pipe(XX.mocha());
});

// Run functional tests on HTTP endpoints
gulp.task('functional-test', function() {
	return gulp.src('./tests/api-test.js', {read: false})
		.pipe(XX.mocha());
});


// Default task
gulp.task('default', ['clean', 'functional-test', 'slugify-test' ]);

// Webserver
gulp.task('server:start', function() {
	server.listen({
		path: 'service.js'
	});
});


gulp.task('server:livereload', function() {
	gulp.watch(['./**/*.js','!./node_modules/**/*'], server.restart );
});

gulp.task( 'test', [ 'slugify-test', 'functional-test' ]);

// Watch
gulp.task('watch', ['server:start'], function () {

    // Watch .js files
    gulp.watch(['./**/*.js','!./node_modules/**/*'], [ 'server:livereload']);

});
