/**
 * @Author: songqi
 * @Date:   2016-07-15
 * @Email:  songqi@benmu-health.com
 * @Last modified by:   songqi
 * @Last modified time: 2017-05-25
 */

var os = require('os'),
    _ = require('lodash'),
    path = require('path'),
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    less = require('gulp-less'),
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    gutil = require('gulp-util'),
    argv = require('yargs').argv,
    clean = require('gulp-clean'),
    shell = require('shelljs'),
    logColors = require('colors'),
    merge = require('merge-stream'),
    gulpOpen = require('gulp-open'),
    uglifyJs = require('gulp-uglify'),
    gulpSequence = require('gulp-sequence'),
    stylus = require('gulp-stylus'),
    mockServer = require('gulp-mock-server'),
    fileinclude = require('gulp-file-include'),
    templateCache = require('gulp-angular-templatecache'),
    erosConsole = require('../util').erosConsole,
    webpackRun = require('./webpack3.config.js') || require('./weexWebpack.config.js');

var print = require('../../../utils/print'),
    weexUtil = require('../../../utils/weex/weex'),
    getFiles = require('../../../utils/getFiles'),
    duration = require('../../../utils/duration'),
    readConfig = require('../../../utils/readConfig'),
    md5Task = require('../../../utils/md5Files/md5Task'),
    htmlMonitor = require('../../../utils/monitor/htmlMonitor');

var mockConfig = {
    port: 52077,
    mockDir: './dist/mock'
}

if (argv.s || argv.ssl) {
    mockConfig['https'] = true;
}

var MOCKHOST = _.assign(mockConfig, readConfig.get('mockServer'));

var OPENPATH = readConfig.get('openPath');

var browser = os.platform() === 'linux' ? 'Google chrome' : (
    os.platform() === 'darwin' ? 'Google chrome' : (
        os.platform() === 'win32' ? 'chrome' : 'firefox'));

logColors.setTheme({
    info: 'green',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

//用于在html文件中直接include文件 模板拼接
gulp.task('build-html', function(done) {
    gulp.src(['html/page/**/*.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(htmlMonitor())
        .pipe(duration('build-html'))
        .pipe(gulp.dest('dist/html'))
        .on('end', done);
});

// angularjs 模板片段
gulp.task('build-templates', function(done) {
    gulp.src('src/templates/**/*.html')
        .pipe(templateCache({
            module: readConfig.get('templatesName')
        }))
        .pipe(duration('build-templates'))
        .pipe(gulp.dest('dist/js'))
        .on('end', done);
});

// iconfont
gulp.task('build-iconfont', function(done) {
    gulp.src('src/iconfont/**/*')
        .pipe(duration('build-iconfont'))
        .pipe(gulp.dest('dist/iconfont'))
        .on('end', done);
});

// assets
gulp.task('build-assets', function(done) {
    gulp.src('src/assets/**/*')
        .pipe(duration('build-assets'))
        .pipe(gulp.dest('dist/assets'))
        .on('end', done);
});

// 编译 sass
gulp.task('build-css', function(done) {
    var tasks = getFiles.getExports('css').map(function(element) {
        if (element.indexOf('.scss') > -1) {
            // sass
            return gulp.src(element)
                .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
                .pipe(gulp.dest(element.replace(/src/, 'dist').match(/(\/.+\/)/)[0]))
        } else if (element.indexOf('.less') > -1) {
            // sass
            return gulp.src(element)
                .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
                .pipe(less())
                .pipe(gulp.dest(element.replace(/src/, 'dist').match(/(\/.+\/)/)[0]))
        } else if (element.indexOf('.styl') > -1) {
            // sass
            return gulp.src(element)
                .pipe(stylus({
                    compress: true
                }))
                .pipe(gulp.dest(element.replace(/src/, 'dist').match(/(\/.+\/)/)[0]))
        } else {
            return gulp.src(element)
                .pipe(gulp.dest(element.replace(/src/, 'dist').match(/(\/.+\/)/)[0]))
        }
    });
    if (tasks.length) {
        return merge(tasks).pipe(duration('build-css'));
    } else {
        done();
    }
});

// 引用 webpack 对 js 进行合并
gulp.task("build-js", function(callback) {
    var times = +new Date();
    webpackRun.run(function(err, stats) {
        var jsonStats = stats.toJson();
        if (stats.hasErrors()) {
            gutil.log("[webpack:build-js]", logColors.error(jsonStats.errors.toString()));
        }
        if (stats.hasWarnings()) {
            gutil.log("[webpack:build-js]", logColors.warn(jsonStats.warnings.toString()));
        }
        print.gulpLog(' build-js: ', +new Date() - times)
        callback();
    });
});

gulp.task('build-js-for-min', function(callback) {
    var timestamp = +new Date();
    webpackRun.run(function(err, stats) {
        var jsonStats = stats.toJson();
        if (stats.hasErrors()) {
            gutil.log("[webpack:build-js]", logColors.error(jsonStats.errors.toString()));
        }
        if (stats.hasWarnings()) {
            gutil.log("[webpack:build-js]", logColors.warn(jsonStats.warnings.toString()));
        }
        print.gulpLog(' build-js-for-min: ', +new Date() - timestamp);
        callback();
    });
});

// 编译 mock 数据
gulp.task('build-mock', function() {
    gulp.src('src/mock/**/*')
        .pipe(duration('build-mock'))
        .pipe(gulp.dest('dist/mock'));
});

// mock 数据 server
gulp.task('mock', function() {
    gulp.src('.')
        .pipe(duration('mockServer'))
        .pipe(mockServer(MOCKHOST));
});

//将js加上10位md5,并修改html中的引用路径，该动作依赖build-js
gulp.task('md5:js', ['build-js-for-min'], function(done) {
    var tasks = getFiles.getAllFiles(path.resolve(process.cwd(), 'dist/js'), 'js');
    md5Task(tasks, 'js', done);
});

//将css加上10位md5，并修改html中的引用路径，该动作依赖sprite
gulp.task('md5:css', ['build-css'], function(done) {
    var tasks = getFiles.getAllFiles(path.resolve(process.cwd(), 'dist/css'), 'css');
    md5Task(tasks, 'css', done);
});

// 切换至weex-eros逻辑
var isWeexEros = false,
    weexErosPlatform = ''
gulp.task('weex-eros-all', function(done) {
    isWeexEros = true
    weexErosPlatform = 'ALL'
    done()
});

gulp.task('weex-eros-ios', function(done) {
    isWeexEros = true
    weexErosPlatform = 'IOS'
    done()
});

gulp.task('weex-eros-android', function(done) {
    isWeexEros = true
    weexErosPlatform = 'ANDROID'
    done()
});

//将js加上10位md5,并修改html中的引用路径，该动作依赖build-js
gulp.task('weex:js', ['build-js-for-min'], function(done) {
    var tasks = [];
    getFiles.getAllFiles(path.resolve(process.cwd(), 'dist/js'), 'js').map(function(element) {
        var distDir = path.resolve(element, '../');

        tasks.push(gulp.src(element)
            .pipe(uglifyJs())
            .pipe(weexUtil.addFramework(readConfig.get('framework')))
            .pipe(gulp.dest(distDir)))
    })
    if (tasks.length) {

        return merge(tasks).pipe(duration('build-weex-js')).on('end', function() {
            // 修复只能打pages的bug
            var _source = path.resolve(process.cwd(), 'dist/js'),
                _tmppath = path.resolve(process.cwd(), 'dist/_pages'),
                _target = path.resolve(process.cwd(), 'dist/js/_pages'),
                _rmpath = path.resolve(process.cwd(), 'dist/js/**/*.js.map');
            shell.rm('-rf', _rmpath);
            shell.cp('-r', _source, _tmppath);
            shell.mv('-f', _tmppath, _target);

            gulp.src('src/iconfont/**/*')
                .pipe(duration('build-iconfont'))
                .pipe(gulp.dest('dist/js/_pages/iconfont'))
                .on('end', function() {
                    gulp.src('src/assets/**/*')
                        .pipe(duration('build-assets'))
                        .pipe(gulp.dest('dist/js/_pages/assets'))
                        .on('end', function() {
                            weexUtil.minWeex(isWeexEros, weexErosPlatform);
                        });
                });
        });
    } else {
        done();
    }
});

// 文件监听
gulp.task('watch', function() {
    gulp.watch('src/css/**/*', ['build-css']);
    gulp.watch('src/js/**/*', ['build-js']);
    gulp.watch('html/**/*', ['build-html']);
    gulp.watch('src/templates/**/*', ['build-templates']);
    gulp.watch('src/mock/**/*', ['build-mock']);
    gulp.watch('src/assets/**/*', ['build-assets']);
    gulp.watch('./config.json', ['build-css', 'build-js']);
});

// 直接打开页面
gulp.task('open', function(done) {
    // 不传 path 就不打开，线上开发调试时候打开也没用
    if (!OPENPATH) {
        setTimeout(() => {
            erosConsole('dev server start success !'.green)
        }, 500)
        return;
    }
    gulp.src('')
        .pipe(gulpOpen({
            app: browser,
            uri: OPENPATH
        }))
        .on('end', done);
});

// 删除 dist 文件夹
gulp.task('clean', function(done) {
    return gulp.src('dist', {
            read: false
        })
        .pipe(clean({
            force: true
        }));
});

// 删除所有依赖
gulp.task('cleanAll', function(done) {
    return gulp.src(['dist', 'bower_components', 'node_modules'], {
            read: false
        })
        .pipe(clean({
            force: true
        }));
});

// 发布
gulp.task('default', gulpSequence(
    'clean', ['build-html', 'build-templates', 'build-iconfont'], ['md5:css', 'md5:js']
));

// 发布 weex
gulp.task('weex', gulpSequence(
    'clean', 'weex:js'
));
// 发布 weex
gulp.task('weex-eros:all', gulpSequence(
    'clean', 'weex-eros-all', 'weex:js'
));
gulp.task('weex-eros:ios', gulpSequence(
    'clean', 'weex-eros-ios', 'weex:js'
));
gulp.task('weex-eros:android', gulpSequence(
    'clean', 'weex-eros-android', 'weex:js'
));

// 开发
gulp.task('dev', gulpSequence(
    'clean', ['build-html', 'build-templates', 'build-assets', 'build-iconfont', 'build-mock'], ['build-css', 'build-js'], ['mock', 'watch', 'open']
));

module.exports = {
    start: function(type) {
        gulp.start(type)
    }
}