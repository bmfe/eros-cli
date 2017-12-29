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
    gulpSequence = require('gulp-sequence'),
    stylus = require('gulp-stylus'),
    mockServer = require('gulp-mock-server'),
    webpackConf = require('./webpack.config.js');

var print = require('../../../utils/print'),
    weexUtil = require('../../../utils/weex/weex'),
    getFiles = require('../../../utils/getFiles'),
    readConfig = require('../../../utils/readConfig'),
    md5Task = require('../../../utils/md5Files/md5Task'),
    logger = require('../../../utils/logger');


var weexErosPlatform = 'IOS';

var mockConfig = {
    port: 52077,
    mockDir: './dist/mock'
}

if (argv.s || argv.ssl) {
    mockConfig['https'] = true;
}

var MOCKHOST = _.assign(mockConfig, readConfig.get('mockServer'));


logColors.setTheme({
    info: 'green',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

// iconfont
gulp.task('build-iconfont', done => {
    buildIconfont(done);
});

// assets
gulp.task('build-assets', done => {
    buildAssets(done);
});


gulp.task('build-mock', (done) => {
    gulp.src('src/mock/**/*')
        .pipe(logger.time('build-mock'))
        .pipe(gulp.dest('dist/mock'), {
            mode: '0777'
        }).on('end', done);
});

gulp.task('start-mock', () => {
    gulp.src('.')
        .pipe(mockServer(MOCKHOST));
});


gulp.task('weex-eros-ios', (done) => {
    weexErosPlatform = 'IOS'
    done()
});

gulp.task('weex-eros-android', (done) => {
    weexErosPlatform = 'ANDROID'
    done()
});

gulp.task('clean', (done) => {
    return gulp.src('dist', {
            read: false
        })
        .pipe(clean({
            force: true
        }));
});

gulp.task('cleanAll', (done) => {
    return gulp.src(['dist', 'node_modules'], {
            read: false
        })
        .pipe(clean({
            force: true
        }));
});

gulp.task("build-js", (callback) => {
    var times = +new Date(),
        webpack = require('webpack');
    webpack(webpackConf).run((err, stats) => {
        var jsonStats = stats.toJson();
        console.log(stats.toString({
            chunks: false, // 使构建过程更静默无输出
            colors: true // 在控制台展示颜色
        }))
        if (stats.hasErrors()) {
            gutil.log("[webpack:build-js]", logColors.error(jsonStats.errors.toString()));
        }
        if (stats.hasWarnings()) {
            gutil.log("[webpack:build-js]", logColors.warn(jsonStats.warnings.toString()));
        }
        callback();
    });
});

gulp.task('weex:js', ['build-js'], (done) => {
    var tasks = [];
    getFiles.getAllFiles(path.resolve(process.cwd(), 'dist/js'), 'js').map((element) => {
        var distDir = path.resolve(element, '../');

        tasks.push(gulp.src(element)
            .pipe(weexUtil.addFramework(readConfig.get('framework')))
            .pipe(gulp.dest(distDir, {
                mode: '0777'
            })))
    })

    if (!tasks.length) {
        done()
    }
    return merge(tasks).pipe(logger.time('build-weex-js')).on('end', (done) => {
        // 修复只能打pages的bug
        var _source = path.resolve(process.cwd(), 'dist/js'),
            _tmppath = path.resolve(process.cwd(), 'dist/_pages'),
            _target = path.resolve(process.cwd(), 'dist/js/_pages');
            // _rmpath = path.resolve(process.cwd(), 'dist/js/**/*.js.map');
        // shell.rm('-rf', _rmpath);
        shell.cp('-r', _source, _tmppath);
        shell.mv('-f', _tmppath, _target);

        buildIconfont();
        buildAssets();

        weexUtil.minWeex(weexErosPlatform);
    });
    
});

// 文件监听
gulp.task('watch', (done) => {
   
    let server = readConfig.get('server'),
        isSSL = argv.s || argv.ssl ,
        devPort = server[ isSSL? 'httpsPort' : 'port' ],
        mockPort =  MOCKHOST.port

    gulp.watch('src/js/**/*', ['build-js'])
    gulp.watch('src/mock/**/*', ['build-mock'])
    gulp.watch('src/assets/**/*', ['build-assets'])    

    logger.sep()
    logger.success('Service started successfully!' + '   ( End server by Ctrl + C )'.yellow )
    logger.log('dev server started in port : ' + devPort.toString().green)
    logger.log('mock server start success  : ' + mockPort.toString().green)
    logger.log('enjoy it !');

    done()
});



gulp.task('dev', gulpSequence(
    'clean', ['build-assets', 'build-iconfont', 'build-mock', 'build-js'], ['start-mock', 'watch']
));

gulp.task('weex', gulpSequence(
    'clean', 'weex:js'
));

gulp.task('weex-eros:ios', gulpSequence(
    'clean', 'weex-eros-ios', 'weex:js'
));
gulp.task('weex-eros:android', gulpSequence(
    'clean', 'weex-eros-android', 'weex:js'
));


function buildIconfont(done) {
    gulp.src('src/iconfont/**/*')
        .pipe(logger.time('build-iconfont'))
        .pipe(gulp.dest('dist/iconfont', {
            mode: '0777'
        }))
        .on('end', () => {
            done && done();
        });    
}

function buildAssets(done) {
    gulp.src('src/assets/**/*')
        .pipe(logger.time('build-assets'))
        .pipe(gulp.dest('dist/assets', {
            mode: '0777'
        }))
        .on('end', () => {
            done && done()
        });  
}

module.exports = {
    start: (type) => {
        gulp.start(type)
    }
}