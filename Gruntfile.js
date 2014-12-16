module.exports = function(grunt) {
    require('time-grunt')(grunt);
    // load npmTasks which named with pattern 'grunt-*' and 'grunt-contrib-*'
    require('grunt-task-loader')(grunt, {
        /* see issue https://github.com/yleo77/grunt-task-loader/issues/1 */
        mapping: {
            cachebreaker: 'cache-breaker'
        }
    });

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
                files: ["src/scss/fonts/*"],
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
                        return [connect.static('.')];
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
                    src: ['images/**/*', 'scss/images/**/*'],
                    dest: process.argv[2] === 'publish' ? 'publish' : 'dest/',
                    rename: function(dest, src) {
                        if (src.indexOf('scss') !== -1) {
                            return dest + src.replace('scss/', 'css/');
                        }
                        return dest + src;
                    }
                }]
            },
            font: {
                files: [{
                    expand: true,
                    cwd: 'src/scss',
                    src: 'fonts/*',
                    dest: process.argv[2] === 'publish' ? 'publish/css' : 'dest/css',
                }]
            },
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
        },
    });

    // grunt task registration
    grunt.registerTask('default', ['clean:dest', 'connect:dev', 'copy:html', 'cachebreaker', 'copy:js', 'copy:img', 'copy:font', 'sass:dev', 'watch']);
    grunt.registerTask('publish', ['clean:publish', 'copy:html', 'requirejs', 'imagemin', 'copy:font', 'sass:publish']);
};
