module.exports = function(grunt) {
    var fs = require('fs');
    var exec = require('child_process').exec;
    /*
     *function restartGrunt(task) {
     *    exec('ps -a', function(error, stdout, stderr) {
     *        stdout.split('\n').forEach(function(child) {
     *            if (child.indexOf('node') !== -1) {
     *                grunt.log.ok('killing node');
     *                restart = false;
     *                exec('kill ' + child.trim().split(' ')[0] + '&& grunt', function(err, stdout, stderr) {
     *                    grunt.log.error('error: \n' + err);
     *                });
     *            }
     *        });
     *    });
     *}
     */
    require('time-grunt')(grunt);
    // load npmTasks which named with pattern 'grunt-*'
    require('load-grunt-tasks')(grunt);

    var bower = {
        /* need to restart grunt when changed , so far dont know how to restart grunt inside grunt */
        'vendor/jquery.fancybox.js': 'bower_components/fancybox-scss/source/jquery.fancybox.js',
        'vendor/select2.min.js': 'bower_components/select2/select2.min.js'
    };

    // project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        /* ========== Tasks ===========*/
        watch: {
            gruntfile: {
                files: ['Gruntfile.js'],
                options: {
                    reload: true
                }
            },
            livereload: {
                options: { livereload: 35729 },
                files: 'dest/**/*'
            },
            html: {
                files: "src/*.html",
                tasks: ['clean:html', 'copy:html']
            },
            sass: {
                files: "src/scss/**/*.scss",
                tasks: ['cachebreaker:css', 'clean:css', 'sass:dev']
            },
            js: {
                files: "src/js/**/*.js",
                tasks: ['cachebreaker:js', 'clean:js', 'copy:js']
            },
            img: {
                files: ["src/images/**/*", "src/scss/images/**/*"],
                tasks: ['clean:img', 'copy:img']
            },
            font: {
                files: ["src/fonts/*.*"],
                tasks: ['clean:font', 'copy:font']
            }
        },
        connect: {
            dev: {
                options: {
                    hostname: 'localhost',
                    port: 9000,
                    open: false,
                    livereload: 35729,
                    base: '.',
                    middleware: function(connect, options, middlewares) {
                        middlewares.unshift(function(req, res, next) {
                                console.log(req.url);
                            if (req.url.indexOf('jquery.fancybox') !== -1) {
                                return res.end('jquery.fancybox respsonse');
                            }
                        });
                        return [connect.static('.'), function(req, res, next) {
                            Object.keys(bower).forEach(function(key) {
                                if (req.url.indexOf(key) !== -1 ) {
                                    return res.end(fs.readFileSync(bower[key]));
                                }
                            });
                            return next();
                        }];
                    }
                }
            }
        },
        clean: {
            html: ['dest/*.html'],
            js: ['dest/js/**/*.*'], /* 'dest/js' will produce ENOTEMPTYerror on win7 */
            css: ['dest/css/*.css'],
            img: ['dest/images/', 'dest/css/images/'],
            dest: ['dest'],
            publish: ['publish']
        },

        copy: {
            html: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['*.html'],
                    dest: process.argv[2] === 'publish' ? 'publish' : 'dest/',
                    filter: 'isFile'
                }]
            },
            js: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['js/**/*.js'],
                    dest: process.argv[2] === 'publish' ? 'publish' : 'dest/',
                }]
            },
            img: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['images/**/*', 'css/images/**/*'],
                    dest: process.argv[2] === 'publish' ? 'publish' : 'dest/',
                }]
            },
            font: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: 'fonts/*',
                    dest: process.argv[2] === 'publish' ? 'publish' : 'dest/',
                }]
            },
            requirejs: {
                files: [{
                    expand: true,
                    cwd: '.',
                    src: (function() {
                        var files = [];
                        Object.keys(bower).forEach(function(key) {
                            files.push(bower[key]);
                        });
                    })(),
                    dest: 'test',
                    rename: function(dest, src) {
                        console.log(src);
                        console.log(dest);
                        return dest + src;
                    }
                }]
            }
        },
        sass: {
            dev: {
                options: {
                    style: 'expanded',
                    sourcemap: 'none',
                    lineNumbers: true
                },
                files: [{
                    expand: true,
                    cwd: 'src/scss',
                    src: ['*.scss'],
                    dest: 'dest/css',
                    ext: '.css',
                }]
            },
            publish: {
                options: {
                    style: 'compressed',
                    sourcemap: 'none',
                    lineNumbers: false
                },
                files: [{
                    expand: true,
                    cwd: 'src/scss',
                    src: ['*.scss'],
                    dest: 'publish/css',
                    ext: '.css',
                }]
            }
        },
        cachebreaker: {
            /* Break js and css cacheing during development */
            js: {
                options: {
                    match: ['main.js']
                },
                files: {
                    src: ['dest/*.html']
                }
            },
            css: {
                options: {
                    match: ['common.css']
                },
                files: {
                    src: ['dest/*.html']
                }
            }
        },

        /* minify images for published version */
        imagemin: {
            publish: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['images/*.{png,jpg,gif}', 'scss/images/*.{gif,png,jpg}'],
                    dest: 'publish/',
                    rename: function(dest, src) {
                        if (src.indexOf('scss') !== -1) {
                            return dest + src.replace('scss/', 'css/');
                        }
                        return dest + src;
                    }
                }]
            }
        },
        requirejs: {
            publish: {
                options: {
                    baseUrl: 'src/js',
                    mainConfigFile: 'src/js/main.js',
                    name: 'main',
                    out: 'publish/js/main.js'
                }
            }
        }
    });

    // grunt task registration
    grunt.registerTask('default', ['clean:dest', 'connect:dev', 'copy:html', 'cachebreaker', 'copy:js', 'copy:img', 'copy:font', 'sass:dev', 'watch']);
    grunt.registerTask('publish', ['clean:publish', 'copy:html', 'requirejs', 'imagemin', 'copy:font', 'sass:publish']);
};
