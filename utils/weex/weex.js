/**
 * @Author: songqi
 * @Date:   2017-03-06
 * @Last modified by:   songqi
 * @Last modified time: 2017-04-06
 */

var fs = require('fs'),
    _ = require('lodash'),
    path = require('path'),
    crypto = require('crypto'),
    through = require('through2'),
    __request = require('request'),
    jsonfile = require('jsonfile'),
    zipFolder = require('zip-folder'),
    Process = require('child_process'),
    logger = require('../logger'),
    argv = require('yargs').argv,
    exists = require('fs').existsSync,
    weexErosPack = require('./weexErosPack');

var readConfig = require('../readConfig'),
    shell = require('shelljs');

var versionMap = [],
    pagesTag = path.sep + 'dist' + path.sep + "js",
    iconfontTag = path.sep + 'iconfont' + path.sep,
    assetsTag = path.sep + 'assets' + path.sep,
    appName = readConfig.get('appName'),
    versionInfo = readConfig.get('version');

function getIconfontMd5() {
    return through.obj(function(file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-debug', 'Streaming not supported'));
            return cb();
        }

        if (!file.contents) {
            return cb();
        }
        var filePath = file.history[0],
            indexTag = filePath.indexOf(iconfontTag),
            content = file.contents.toString('utf8');
        versionMap.push({
            page: filePath.slice(indexTag).split(path.sep).join('/'),
            md5: crypto.createHash('md5').update(content, 'utf8').digest('hex')
        });

        cb(null, file);
    }, function(cb) {
        cb();
    });
}

function getAssetsMd5() {
    return through.obj(function(file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-debug', 'Streaming not supported'));
            return cb();
        }

        if (!file.contents) {
            return cb();
        }
        var filePath = file.history[0],
            indexTag = filePath.indexOf(assetsTag),
            content = file.contents.toString('utf8');
        versionMap.push({
            page: filePath.slice(indexTag).split(path.sep).join('/'),
            md5: crypto.createHash('md5').update(content, 'utf8').digest('hex')
        });

        cb(null, file);
    }, function(cb) {
        cb();
    });
}

function addFramework(framework) {
    return through.obj(function(file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-debug', 'Streaming not supported'));
            return cb();
        }

        if (!file.contents) {
            return cb();
        }

        var filePath = file.history[0],
            indexTag = filePath.indexOf(pagesTag) + pagesTag.length,
            content = file.contents.toString('utf8'),
            text = (content.indexOf(framework) > -1 ? '' : framework) + content;


        file.contents = new Buffer(text);
        versionMap.push({
            page: filePath.slice(indexTag).split(path.sep).join('/'),
            md5: crypto.createHash('md5').update(text, 'utf8').digest('hex')
        });
        cb(null, file);
    }, function(cb) {
        cb();
    });
}

function addAppBoardWhenDev(appBoardPath) {
    return through.obj(function(file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-debug', 'Streaming not supported'));
            return cb();
        }

        if (!file.contents) {
            return cb();
        }

        const filePath = file.history[0]
        const indexTag = filePath.indexOf(pagesTag) + pagesTag.length
        const content = file.contents.toString('utf8')
        const appBoardContent = fs.readFileSync(appBoardPath, 'utf8')
        const text = appBoardContent + content

        file.contents = new Buffer(text);
        versionMap.push({
            page: filePath.slice(indexTag).split(path.sep).join('/'),
            md5: crypto.createHash('md5').update(text, 'utf8').digest('hex')
        });
        cb(null, file);
    }, function(cb) {
        cb();
    });
}

function getMd5Version() {
    var md5Arr = [];
    versionMap.map(function(item) {
        md5Arr.push(item.md5);
    });
    md5Arr.sort();
    return crypto.createHash('md5').update(md5Arr.join(''), 'utf8').digest('hex')
}

function makeDiffZip({ jsVersion, platform }) {
    return new Promise((resolve) => {
        var zipFolder = readConfig.get('diff').pwd;

        if (argv.d || argv.diff || argv.s || argv.send) {
            var targetPath = path.resolve(zipFolder, appName),
                n = Process.fork(path.resolve(__dirname, './diffFile.js'));

            if (!exists(targetPath)) {
                shell.mkdir('-p', targetPath)
            }
            n.on('message', function(message) {
                if (message.type === 'done') {
                    n.kill();
                    shell.cp('dist/js/' + jsVersion + '.zip', targetPath);
                    logger.success('publish success!');
                    logger.sep();
                    logger.log('app name: %s', appName);
                    logger.log('app zip md5: %s', jsVersion);
                    logger.log('zip saved path: %s', targetPath);
                    resolve({ jsVersion, platform })
                }
            })
            n.send({
                jsVersion: jsVersion
            })
        } else {
            resolve({ jsVersion, platform })
        }
    })
}

function writeJson({ jsVersion, platform }) {
    return new Promise((resolve, reject) => {
        var requestUrl = argv.s || argv.send,
            file = path.resolve(process.cwd(), 'dist/version.json'),
            jsPath = process.cwd() + '/dist/js/',
            tmpJsPath = process.cwd() + '/dist/_js/';
        shell.mkdir('-p', tmpJsPath);
        shell.cp('-r', process.cwd() + '/dist/js/**/*.zip', tmpJsPath);
        shell.rm('-rf', jsPath);
        fs.rename(tmpJsPath, jsPath, (err) => {
             if(err) throw err;
            if (requestUrl) {
                __request.post(requestUrl, {
                    form: versionInfo
                }, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        resolve({ jsVersion, platform });
                    } else {
                        logger.fatal('eros publish fail: %s', error);
                        reject('eros publish fail: %s', error)
                    }
                });
            } else {
                jsonfile.writeFile(file, versionInfo, function(err) {
                    if (err) {
                        logger.fatal('generate eros json error: %s', err);
                        reject('generate eros json error: %s', err)
                        return
                    }
                    resolve({ jsVersion, platform });
                });
            }
        });
    })
}

function generateZip({ jsVersion, platform }) {
    return new Promise((resolve, reject) => {
        zipFolder(path.resolve(process.cwd(), 'dist/js/_pages/'), path.resolve(process.cwd(), 'dist/js/' + jsVersion + '.zip'), (err) => {
            if (err) {
                logger.fatal('generate eros json error: %s', err);
                reject(e)
            } else {
                resolve({ jsVersion, platform })
            }
        })
    })
}

function minWeex(platform) {
    var timestamp = +new Date(),
        jsVersion = getMd5Version(),
        md5File = path.resolve(process.cwd(), 'dist/js/_pages/md5.json');

    versionInfo['appName'] = appName;
    versionInfo['jsVersion'] = jsVersion;
    versionInfo['timestamp'] = timestamp;
    versionInfo['jsPath'] = readConfig.get('diff')['proxy'];

    jsonfile.writeFile(md5File, _.assign({
        filesMd5: versionMap
    }, versionInfo), (e) => {
        generateZip({ jsVersion, platform })
            .then(writeJson)
            .then(makeDiffZip)
            .then(weexErosHandler)
            .catch((err) => {
                if (err) {
                    try {
                        if (err.stderr) {
                            console.log(err.stderr)
                        } else {
                            console.log(err);
                        }
                        if (err.output) console.log(err.output.join('\n'))
                    } catch (e) {
                        console.log(e);
                    }
                }
            })
    })
}

function weexErosHandler({ jsVersion, platform }) {
    return new Promise((resolve) => {
        var params = {
            jsZipPath: path.resolve(process.cwd(), './dist/js/' + jsVersion + '.zip'),
            erosNative: require(path.resolve(process.cwd(), './config/eros.native.js')),
            bundleConfig: _.assign({
                filesMd5: versionMap
            }, versionInfo)
        }
        // params.erosNative = _encrypt(params.erosNative)
        if (platform === 'ALL') {
            weexErosPack.packAndroidHandler(params);
            weexErosPack.packIosHandler(params);
        }

        platform === 'IOS' && weexErosPack.packIosHandler(params);
        platform === 'ANDROID' && weexErosPack.packAndroidHandler(params);

        resolve()
    })
}

// 加密
function _encrypt(data) {
    let _crypt = require('cryptlib'),
        tmp = JSON.stringify(data),
        iv = 'RjatRGC4W72PJXTE',
        key = _crypt.getHashSha256('eros loves you', 32)

    return _crypt.encrypt(tmp, key, iv)
}


module.exports = {
    _encrypt: _encrypt,
    minWeex: minWeex,
    addFramework: addFramework,
    getAssetsMd5: getAssetsMd5,
    getIconfontMd5: getIconfontMd5,
    addAppBoardWhenDev: addAppBoardWhenDev
}