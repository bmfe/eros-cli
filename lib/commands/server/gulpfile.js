
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
    jsonfile = require('jsonfile'),
    webpackInstance= require('./newpack.config.js');

var print = require('../../../utils/print'),
    serverUtil = require('./util'),
    weexUtil = require('../../../utils/weex/weex'),
    weexErosPackUtil = require('../../../utils/weex/weexErosPack'),
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
        logger.log(stats.toString({
            chunks: false,
            colors: true, 
            warnings: !!readConfig.get('webpackWarnings')
        }))
        callback();
    });
});
// 解决 weex debug 时找不到 widget 方法
gulp.task("compatible-weex-debug", (done) => {
    // if(!readConfig.get('debug')) {
    //     done()
    //     return
    // }
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

let clients = []
const uuid = require('node-uuid'); 
    
gulp.task('socket', (done) => {
    let hotRefresh = readConfig.get('hotRefresh'),
        socketServer = readConfig.get('socketServer'),
        server = readConfig.get('server'),
        isSSL = argv.s || argv.ssl ,
        devPort = server[ isSSL? 'httpsPort' : 'port' ],
        mockPort =  MOCKHOST.port

    if(socketServer && socketServer.switch) {
        let WebSocketServer = require('ws').Server,
        wss = new WebSocketServer({port: socketServer.port}) 
        wss.on('connection', (ws) => {
            let deviceId = uuid.v4()
            clients.push({ deviceId, ws })
            logger.success(`Your device ${deviceId} had been connected to the socket server.`)
            ws.on('pong', () => {
                this.isAlive = true
            });        

            ws.on('close', () => {
                for (var i=0, len = clients.length; i< len;i++){
                    if(clients[i].deviceId === deviceId) {
                        clients.splice(i, 1);
                        logger.warning(`Your device ${deviceId} had left this socket.`)
                        break;
                    }
                }
            })

            ws.on('error', (e) => {
                logger.warning('Socket error:' + e)
            })            
        })            
    }
    logger.sep()
    logger.success('Service started successfully!' + '   ( End server by Ctrl + C )'.yellow )
    logger.log('dev server started in port : ' + devPort.toString().green)
    socketServer.switch && logger.log('dev socket started in port : ' + socketServer.port.toString().green)
    logger.log('mock server start success  : ' + mockPort.toString().green)
    logger.log('enjoy it !');    
    done()
});


gulp.task('socket-send-refresh', (done) => {
    if(!clients.length) {
        done()
        return
    }
    clients.map((client) => {
        (client.ws.readyState !== 2) && client.ws.send('SERVER/JS_BUNDLE_CHANGED')
    })
    done()
})

gulp.task('handle-config-native', (done) => {
    let server = readConfig.get('server'),
        socketServerPort = readConfig.get('socketServer').port,
        isSSL = argv.s || argv.ssl ,
        devPort = server[ isSSL? 'httpsPort' : 'port' ],
        nativeConfig = readConfig.readNativeConfig()

    const IP = serverUtil.getIPAddress()
    if(serverUtil.isIPChanged(IP)) logger.log(`Your IP address has changed to ${IP}.`)
    serverUtil.iPRecord(IP)
    
    nativeConfig.ip = IP
    if(!nativeConfig.url.jsServer) {
        nativeConfig.url.jsServer = `${isSSL ? 'https' : 'http'}://${IP}:${devPort}`
    }
    if(!nativeConfig.url.socketServer) {
        nativeConfig.url.socketServer = `ws://${IP}:${socketServerPort}`
    } 
     // 加密
    nativeConfig = weexUtil._encrypt(nativeConfig)
    weexErosPackUtil._writeJsonToIos('eros.native.json', nativeConfig)
    weexErosPackUtil._writeJsonToAndroid('eros.native.json', nativeConfig)
    done()
})


// 文件监听
gulp.task('watch', (done) => {
    logger.log('Start to watch files...')
    gulp.watch('src/js/**/*', ['weex-dev'])
    gulp.watch('src/mock/**/*', ['build-mock'])
    gulp.watch('src/assets/**/*', ['build-assets'])    
    gulp.watch('src/iconfont/**/*', ['build-iconfont'])    
    done()
});



gulp.task('dev', (callback) => {
    gulpSequence('clean', ['build-assets', 'build-iconfont', 'build-mock', 'build-js'], ['handle-config-native', "compatible-weex-debug", 'start-mock', 'watch', 'socket'])(callback)
});

gulp.task('weex', (callback) => {
    gulpSequence('clean', 'weex:js')(callback)
});

gulp.task('weex-dev', (callback) => {
    gulpSequence('build-js', 'compatible-weex-debug', 'socket-send-refresh')(callback)
});
gulp.task('weex-eros:ios', (callback) => {
    gulpSequence('clean', 'weex-eros-ios', 'handle-config-native', 'weex:js')(callback)
});
gulp.task('weex-eros:android', (callback) => {
    gulpSequence('clean', 'weex-eros-android', 'handle-config-native','weex:js')(callback)
});
gulp.task('weex-eros:all', (callback) => {
    gulpSequence('clean', 'weex-eros-all', 'handle-config-native','weex:js')(callback)
});


module.exports = {
    start: (type) => {
        gulp.start(type)
    }
}