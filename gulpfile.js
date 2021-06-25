'use strict';
const gulp = require('gulp');
const sass = require('gulp-dart-sass');
const cache = require('gulp-cached');
const eslint = require('gulp-eslint');

gulp.task('sass', function () {
    return gulp.src('./scss/**/*.scss')
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(gulp.dest('./styles'));
});

gulp.task('lint', function () {
    return gulp.src(['hm.js', './modules/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format());
});

gulp.task('default', function () {
    gulp.watch('./scss/**/*.scss', gulp.series('sass'));
    gulp.watch(['hm.js', './modules/**/*.js'], gulp.series('lint'));
});
