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
            android: versionInfo.android,
            iOS: versionInfo.iOS,
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
            android: versionInfo.android,
            iOS: versionInfo.iOS,
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
            android: versionInfo.android,
            iOS: versionInfo.iOS,
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

function makeDiffZip(jsVersion) {
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
            }
        })
        n.send({
            jsVersion: jsVersion
        });
    }
}

function writeJson(jsVersion) {
    var requestUrl = argv.s || argv.send,
        file = path.resolve(process.cwd(), 'dist/version.json'),
        jsPath = process.cwd() + '/dist/js/',
        tmpJsPath = process.cwd() + '/dist/_js/';

    shell.mkdir('-p', tmpJsPath);
    shell.cp('-r', process.cwd() + '/dist/js/**/*.zip', tmpJsPath);
    shell.rm('-rf', jsPath);
    fs.rename(tmpJsPath, jsPath);
    if (requestUrl) {
        __request.post(requestUrl, {
            form: versionInfo
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                makeDiffZip(jsVersion);
            } else {
                logger.fatal('eros publish fail: %s', error);
            }
        });
    } else {
        jsonfile.writeFile(file, versionInfo, function(err) {
            if (err) {
                logger.fatal('generate eros json error: %s', err);
            } else {
                makeDiffZip(jsVersion);
            }
        });
    }
}

function minWeex(isWeexEros, platform) {
    var timestamp = +new Date(),
        jsVersion = getMd5Version(),
        md5File = path.resolve(process.cwd(), 'dist/js/_pages/md5.json');

    versionInfo['appName'] = appName;
    versionInfo['jsVersion'] = jsVersion;
    versionInfo['timestamp'] = timestamp;
    versionInfo['jsPath'] = readConfig.get('diff')['proxy'];


    jsonfile.writeFileSync(md5File, _.assign({
        filesMd5: versionMap
    }, versionInfo));


    zipFolder(path.resolve(process.cwd(), 'dist/js/_pages/'), path.resolve(process.cwd(), 'dist/js/' + jsVersion + '.zip'), function(err) {
        if (err) {
            logger.fatal('generate eros json error: %s', err);
        } else {
            isWeexEros && weexErosHandler(jsVersion, platform)
            writeJson(jsVersion);
        }
    });
}

function weexErosHandler(jsVersion, platform) {
    if (!platform) {
        logger.fatal('platform not exited')
        return
    }
    var params = {
        jsZipPath: path.resolve(process.cwd(), './dist/js/' + jsVersion + '.zip'),
        erosNative: require(path.resolve(process.cwd(), './config/eros.native.js')),
        bundleConfig: _.assign({
            filesMd5: versionMap
        }, versionInfo)
    }
    var _crypt = require('cryptlib'),

	tmp = JSON.stringify(params.erosNative),
	iv = 'RjatRGC4W72PJXTE', //16 bytes = 128 bit
	key = _crypt.getHashSha256('eros loves you', 32); //32 bytes = 256 bits

	params.erosNative = _crypt.encrypt(tmp, key, iv);

    console.log('key:',key);
    console.log('iv:',iv);

    platform === 'ALL' && weexErosPack.packIosHandler(params) && weexErosPack.packAndroidHandler(params);
    platform === 'IOS' && weexErosPack.packIosHandler(params);
    platform === 'ANDROID' && weexErosPack.packAndroidHandler(params);
}


module.exports = {
    minWeex: minWeex,
    addFramework: addFramework,
    getAssetsMd5: getAssetsMd5,
    getIconfontMd5: getIconfontMd5
}