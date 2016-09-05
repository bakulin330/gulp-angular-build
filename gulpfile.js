;
(function () {
    'use strict';

    var gulp = require('gulp'),
        prefixer = require('gulp-autoprefixer'),
        sass = require('gulp-sass'),
        csso = require('gulp-csso'),
        notify = require('gulp-notify'),
        gutil = require('gulp-util'),
        jswrap = require('gulp-lpmotor-jswrap'),
        uglify = require('gulp-uglify'),
        concat = require('gulp-concat'),
        imagemin = require('gulp-imagemin'),
        templateCache = require('gulp-angular-templatecache'),
        htmlmin = require('gulp-htmlmin'),
        pngquant = require('imagemin-pngquant'),
        concatCss = require('gulp-concat-css'),
        sourcemaps = require('gulp-sourcemaps'),
        ngAnnotate = require('gulp-ng-annotate'),
        jade = require("gulp-jade"),
        rigger = require("gulp-rigger"),
        debug = require("gulp-debug"),
        str2base64 = require("gulp-lpm-scss-str2base64"),
        browserSync = require("browser-sync"),
        rimraf = require("rimraf"),
        merge2 = require('merge2'),
        reload = browserSync.reload;

    var prod = false,
        minify = false;

    var path = {
        build: {
            base: 'build/',
            img: 'build/img/',
            fonts: 'build/fonts/',
            templates: 'build/modules/'
        },
        src: {
            index: 'src/index.jade',
            style: ['src/build.scss'],
            vendor: 'src/js/vendor.js',
            js: 'src/build.js',
            img: 'src/img/**/*.*',
            fonts: 'src/fonts/**/*.*',
            templates: ['src/js/modules/**/*.jade'] //'src/js/modules/**/*.jade'
        },
        watch: {
            js: ['src/js/**/*.js', '!src/js/vendor.js'],
            style: ['src/style/**/*.scss', 'src/js/modules/**/*.scss']
        },
        clean: './build'
    };

    var serverConfig = {
        server: {
            baseDir: "./build"
        },
        tunnel: false,
        host: '127.0.0.1',
        port: 59000,
        logPrefix: "Frontend_Dev"
    };

    gulp.task('default', ['build', 'webserver', 'watch']);

    gulp.task('webserver', function () {
        browserSync(serverConfig);
    });

    gulp.task('build', [
        'build:index',
        'build:vendor',
        'build:templates',
        'build:js',
        'build:style',
        'build:image',
        'build:fonts'
    ]);

    gulp.task('watch', function () {
        gulp.watch(path.src.index, ['build:index']);
        gulp.watch(path.watch.style, ['build:style']);
        gulp.watch(path.src.vendor, ['build:vendor']);
        gulp.watch(path.watch.js, ['build:js']);
        gulp.watch(path.src.img, ['build:image']);
        gulp.watch(path.src.fonts, ['build:fonts']);
        gulp.watch(path.src.templates, ['build:templates']);
    });

    gulp.task('build:index', function () {
        return gulp.src(path.src.index)
            .pipe(jade())
            .pipe(gulp.dest(path.build.base))
            .pipe(reload({stream: true}));
    });

    gulp.task('build:vendor', function () {
        return gulp.src(path.src.vendor)
            //.pipe(sourcemaps.init())
            .pipe(rigger())
            .pipe(concat('v.js'))
            //.pipe(sourcemaps.write())
            .pipe(gulp.dest(path.build.base))
            .pipe(reload({stream: true}));
    });

    gulp.task('build:templates', function () {
        return gulp.src(path.src.templates)
            .pipe(jade())
            .pipe(gulp.dest(path.build.templates))
            .pipe(reload({stream: true}));
    });

    gulp.task('build:js', function () {
        var jsStream = gulp.src(path.src.js)
            .pipe(rigger());

        var templateHeader = 'angular.module("<%= module %>"<%= standalone %>, []).run(["$templateCache", function($templateCache) {';
        var tplStream = gulp.src(path.src.templates)
            .pipe(jade())
            .pipe(htmlmin({collapseWhitespace: prod, removeComments: true}))
            .pipe(templateCache('templates.app.js', {
                module: 'templates.app',
                templateHeader: templateHeader
            }));

        return jsStream // merge2(jsStream, tplStream)
            //.pipe(sourcemaps.init())
            .pipe(concat('b.js'))
            .pipe(ngAnnotate())
            .pipe(jswrap('_err(e,\'{{fn_id}}\')', ['_err']))
            .pipe(prod || minify ? uglify().on('error', gutil.log) : gutil.noop())
            //.pipe(sourcemaps.write())
            .pipe(gulp.dest(path.build.base))
            .pipe(reload({stream: true}));
    });

    gulp.task('build:style', function () {
        return gulp.src(path.src.style)
            //.pipe(sourcemaps.init())
            .pipe(sass({style: 'compressed'}).on('error', notify.onError(function (error) {
                return 'Error: ' + error.message;
            })))
            .pipe(str2base64())
            .pipe(concatCss('a.css'))
            .pipe(prefixer({browsers: ['> 1%', 'last 4 versions', 'IE 7']}))
            .pipe(prod || minify ? csso({
                restructure: true,
                debug: true
            }) : gutil.noop())
            //.pipe(sourcemaps.write())
            .pipe(gulp.dest(path.build.base))
            .pipe(reload({stream: true}));;
    });

    gulp.task('build:image', function () {
        return gulp.src(path.src.img)
            .pipe(imagemin({
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                use: [pngquant()]
                //interlaced: true
            }).on('error', notify.onError(function (error) {
                return 'Error: ' + error.message;
            })))
            .pipe(gulp.dest(path.build.img))
            .pipe(reload({stream: true}));
    });

    gulp.task('build:fonts', function () {
        return gulp.src(path.src.fonts)
            .pipe(gulp.dest(path.build.fonts))
    });

    gulp.task('clean', function (cb) {
        rimraf(path.clean, cb);
    });

})();
