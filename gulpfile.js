'use strict';
const gulp = require('gulp');
const sass = require('gulp-dart-sass');

gulp.task('sass', function () {
  return gulp.src('./scss/**/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulp.dest('./styles'));
});

gulp.task('watch', function () {
  gulp.watch('./scss/**/*.scss', gulp.series('sass'));
});

