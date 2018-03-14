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
    webpack = require('webpack'),
    logColors = require('colors'),
    merge = require('merge-stream'),
    gulpOpen = require('gulp-open'),
    gulpSequence = require('gulp-sequence'),
    stylus = require('gulp-stylus'),
    mockServer = require('gulp-mock-server'),
    webpackInstance= require('./webpack.config.js');

var print = require('../../../utils/print'),
    weexUtil = require('../../../utils/weex/weex'),
    getFiles = require('../../../utils/getFiles'),
    readConfig = require('../../../utils/readConfig'),
    md5Task = require('../../../utils/md5Files/md5Task'),
    logger = require('../../../utils/logger');


var weexErosPlatform = '';
var wsInstance = null

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
    gulp.src('src/iconfont/**/*')
        .pipe(logger.time('build-iconfont'))
        .pipe(gulp.dest('dist/iconfont', {
            mode: '0777'
        }))
        .on('end', () => {
            done && done();
        }); 
});

// assets
gulp.task('build-assets', done => {
    gulp.src('src/assets/**/*')
        .pipe(logger.time('build-assets'))
        .pipe(gulp.dest('dist/assets', {
            mode: '0777'
        }))
        .on('end', () => {
            done && done()
        });
});


gulp.task('build-mock', (done) => {
    gulp.src('src/mock/**/*')
        .pipe(logger.time('build-mock'))
        .pipe(gulp.dest('dist/mock'), {
            mode: '0777'
        }).on('end', done);
});

gulp.task('start-mock', (done) => {
    gulp.src('.')
        .pipe(mockServer(MOCKHOST))
        .on('end', done)
});


gulp.task('weex-eros-ios', (done) => {
    weexErosPlatform = 'IOS'
    done()
});

gulp.task('weex-eros-android', (done) => {
    weexErosPlatform = 'ANDROID'
    done()
});

gulp.task('weex-eros-all', (done) => {
    weexErosPlatform = 'ALL'
    done()
});

gulp.task('clean', (done) => {
    weexErosPlatform = ''
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
    var times = +new Date();
    webpackInstance.run((err, stats) => {
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
        // refreshNative();
        callback();
    });
});
// 解决 weex debug 时找不到 widget 方法
gulp.task("compatible-weex-debug", (done) => {
    let tasks = []
    const appBoardPath =  path.resolve(process.cwd(), `dist/js${readConfig.get('appBoard')}`)
    getFiles.getAllFiles(path.resolve(process.cwd(), 'dist/js'), 'js').map((element) => {
        if (element === appBoardPath) return
        const distDir = path.resolve(element, '../');

        tasks.push(gulp.src(element)
            .pipe(weexUtil.addAppBoardWhenDev(appBoardPath))
            .pipe(gulp.dest(distDir, {
                mode: '0777'
            })))
    })   
    if (!tasks.length) done()   
    return merge(tasks)
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
            _iconpath = path.resolve(process.cwd(), 'dist/iconfont');
            _assetspath = path.resolve(process.cwd(), 'dist/assets');

        shell.cp('-r', _source, _tmppath);
        shell.mv('-f', _tmppath, _target);
        gulp.src('src/iconfont/**/*')
            .pipe(logger.time('build-iconfont'))
            .pipe(weexUtil.getIconfontMd5())
            .pipe(gulp.dest('dist/js/_pages/iconfont', {
                mode: '0777'
            }))
            .on('end', function() {
                gulp.src('src/assets/**/*')
                    .pipe(weexUtil.getAssetsMd5())
                    .pipe(logger.time('build-assets'))
                    .pipe(gulp.dest('dist/js/_pages/assets', {
                        mode: '0777'
                    }))
                    .on('end', function() {
                        weexUtil.minWeex(weexErosPlatform);
                    });
            });
    }); 
});

    
gulp.task('socket', (done) => {
    const WEBSOCKET_PORT = 8890
    var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: WEBSOCKET_PORT})

    let server = readConfig.get('server'),
    isSSL = argv.s || argv.ssl ,
    devPort = server[ isSSL? 'httpsPort' : 'port' ],
    mockPort =  MOCKHOST.port

    wss.on('connection', (ws) => {
        logger.success('Your device had connect to socket server.')
        wsInstance = ws
        ws.isAlive = true;
        ws.on('pong', () => {
          this.isAlive = true
        });        
        ws.on('message', (message) => {
            // console.log(message)
            if (message === 'PING') ws.send('PONG') 
        })

        ws.on('close', () => {
            wsInstance = null
            console.log('disconnected');
        })
    })

    // const interval = setInterval(function ping() {
    //   wss.clients.forEach(function each(ws) {
    //     if (ws.isAlive === false) return ws.terminate();
     
    //     ws.isAlive = false;
    //     ws.ping(() => {});
    //   });
    // }, 30000);
    // 
    logger.sep()
    logger.success('Service started successfully!' + '   ( End server by Ctrl + C )'.yellow )
    logger.log('dev server started in port : ' + devPort.toString().green)
    logger.log('dev socket started in port : ' + WEBSOCKET_PORT.toString().green)
    logger.log('mock server start success  : ' + mockPort.toString().green)
    logger.log('enjoy it !');    
    done()
});


gulp.task('socket-send-refresh', (done) => {
    wsInstance && wsInstance.send('SERVER/JS_BUNDLE_CHANGED')
    done()
})

// 文件监听
gulp.task('watch', (done) => {
    gulp.watch('src/js/**/*', ['weex-dev'])
    gulp.watch('src/mock/**/*', ['build-mock'])
    gulp.watch('src/assets/**/*', ['build-assets'])    
    gulp.watch('src/iconfont/**/*', ['build-iconfont'])    
    done()
});



gulp.task('dev', gulpSequence(
    'clean', ['build-assets', 'build-iconfont', 'build-mock', 'build-js'], ["compatible-weex-debug", 'start-mock', 'watch', 'socket']
));

gulp.task('weex', gulpSequence(
    'clean', 'weex:js'
));

gulp.task('weex-dev', (callback) => {
    gulpSequence(['build-js'], ['compatible-weex-debug'], ['socket-send-refresh'])(callback)
});
gulp.task('weex-eros:ios', gulpSequence(
    'clean', 'weex-eros-ios', 'weex:js'
));
gulp.task('weex-eros:android', gulpSequence(
    'clean', 'weex-eros-android', 'weex:js'
));
gulp.task('weex-eros:all', gulpSequence(
    'clean', 'weex-eros-all', 'weex:js'
));


module.exports = {
    start: (type) => {
        gulp.start(type)
    }
}