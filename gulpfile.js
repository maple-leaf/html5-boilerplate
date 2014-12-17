var gulp = require('gulp');

var connect = require('gulp-connect');
var sass = require('gulp-sass');
var del = require('del');

// watch files for changes
gulp.task('serve', function() {
    connect.server({
        root: 'dest',
        livereload: true
    });
});

gulp.task('html', function() {
    del(['dest/*.html'], function() {
        gulp.src('./src/*.html')
        .pipe(gulp.dest('dest'))
        .pipe(connect.reload());
    });
});

gulp.task('sass', function() {
    del(['dest/css/**'], function() {
        gulp.src('./src/scss/*.scss')
        .pipe(sass({
            sourcemap: "none",
            style: 'expanded'
        }))
        .pipe(gulp.dest('dest/css'))
        .pipe(connect.reload());
    });
});

gulp.task('clean', function() {
    del(['dest']);
});

gulp.task('watch', function() {
    gulp.watch(['./src/*.html'], ['html']);
    gulp.watch(['./src/scss/**/*.scss'], ['sass']);
});

gulp.task('default', ['clean', 'html', 'sass', 'serve', 'watch']);
