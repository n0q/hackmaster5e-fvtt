'use strict';
const gulp = require('gulp');
const sass = require('gulp-dart-sass');
const cache = require('gulp-cached');
const eslint = require('gulp-eslint-new');

const sourceJS = ['hm.js', './modules/**/*.js'];
const sourceSASS = './scss/**/*.scss';

gulp.task('sass', () => gulp.src(sourceSASS)
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulp.dest('./styles')));

gulp.task('eslint', () => gulp.src(sourceJS)
    .pipe(cache('lint'))
    .pipe(eslint())
    .pipe(eslint.format()));

gulp.task('default', gulp.series('sass', 'eslint', () => {
    gulp.watch(sourceSASS, gulp.series('sass'));
    gulp.watch(sourceJS, gulp.series('eslint'));
}));
