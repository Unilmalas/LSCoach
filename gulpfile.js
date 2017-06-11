var gulp = require('gulp');
var concat = require('gulp-concat'); // concatenates the .js files
//var sourcemaps = require('gulp-sourcemaps'); // guide for debugging minimized code
//var uglify = require('gulp-uglify'); // minimizes the .js
var ngAnnotate = require('gulp-ng-annotate'); // fixes dependency injection issue from minimizer

gulp.task('js', function() {
	gulp.src(['ng/module.js', 'ng/**/*.js'])
		.pipe(concat('app.js'))
		//.pipe(ngAnnotate())
		//.pipe(uglify())
		//.pipe(sourcemaps.write())
		.pipe(gulp.dest('assets'));
});

// read all files in /gulp and add them as require
var fs = require('fs');
fs.readdirSync(__dirname + '/gulp').forEach(function (task) {
	require('./gulp/' + task);
});