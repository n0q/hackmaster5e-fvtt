const gulp = require('gulp');
const gulpSass = require('gulp-sass')(require('sass'));
const cache = require('gulp-cached');
const eslint = require('gulp-eslint-new');

const sourceJS = ['hm.js', './modules/**/*.js'];
const sourceSASS = './scss/**/*.scss';

gulp.task('sass', () => gulp.src(sourceSASS)
    .pipe(gulpSass.sync().on('error', gulpSass.logError))
    .pipe(gulp.dest('./styles')));

gulp.task('eslint', () => gulp.src(sourceJS)
    .pipe(cache('lint'))
    .pipe(eslint())
    .pipe(eslint.format()));

gulp.task('default', gulp.series('sass', 'eslint', () => {
    gulp.watch(sourceSASS, gulp.series('sass'));
    gulp.watch(sourceJS, gulp.series('eslint'));
}));
