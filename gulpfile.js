var publish = process.argv[2] === "publish";
var target = publish ? 'publish' : 'dest';
var through2 = require('through2');

var gulp = require('gulp');
var connect = require('gulp-connect');
var sass = require('gulp-sass');
var del = require('del');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');

// watch files for changes
gulp.task('serve', function() {
    connect.server({
        root: 'dest',
        livereload: true
    });
});

gulp.task('html', function() {
    del([target + '/*.html'], function() {
        gulp.src('./src/*.html')
        .pipe(gulp.dest(target + ''))
        .pipe(connect.reload());
    });
});

gulp.task('sass', function() {
    del([target + '/css/**'], function() {
        gulp.src('./src/scss/*.scss')
        .pipe(sass({
            sourcemap: "none",
            style: publish ? 'expanded' : 'compressed'
        }))
        .pipe(gulp.dest(target + '/css'))
        .pipe(connect.reload());
    });
});

gulp.task('img', function() {
    del([target + '/images/**'], function() {
        gulp.src('src/images/*.{png,jpg,gif}')
        .pipe(
            publish ?
            imagemin({
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                use: [pngquant()]
            }) :
            through2.obj(function(file,encoding,callback){
                callback(null, file);
            })
        )
        .pipe(gulp.dest(target + '/images'));
    });
});

gulp.task('bg', function() {
    del([target + '/css/images/**'], function() {
        gulp.src('src/scss/images/*.{png,jpg,gif}')
        .pipe(gulp.dest(target + '/css/images'));
    });
});

gulp.task('clean', function() {
    del([target + '']);
});

gulp.task('watch', function() {
    gulp.watch(['./src/*.html'], ['html']);
    gulp.watch(['./src/scss/**/*.scss'], ['sass']);
    gulp.watch(['src/images/**'], ['img']);
    gulp.watch(['src/scss/images/**'], ['bg']);
});

gulp.task('default', ['clean', 'html', 'sass', 'img', 'bg', 'serve', 'watch']);
gulp.task('publish', ['clean', 'html', 'sass', 'img', 'bg']);
