var gulp = require('gulp'); // gulpfile to build css
var stylus = require('gulp-stylus');

gulp.task('css', function () {
	gulp.src('css/**/*.styl')
		.pipe(stylus())
		.pipe(gulp.dest('assets'));
});