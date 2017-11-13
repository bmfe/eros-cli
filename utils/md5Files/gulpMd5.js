/**
 * @Author: songqi
 * @Date:   2016-04-10
 * @Email:  songqi@benmu-health.com
 * @Last modified by:   songqi
 * @Last modified time: 2016-10-26
 */

var path = require('path'),
    gutil = require('gulp-util'),
    through = require('through2'),
    crypto = require('crypto'),
    fs = require('fs');

function writeHtmlVersion(isNewTask, ifile, l_filename, l_md5_filename) {
    process.send({
        type: 'versionTask',
        ifile: ifile,
        l_filename: l_filename,
        l_md5_filename: l_md5_filename
    })
}

module.exports = function(size, ifile, option) {
    size = size | 0;
    option = option || {};
    return through.obj(function(file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-debug', 'Streaming not supported'));
            return cb();
        }

        if (!file.contents) {
            return cb();
        }

        var d = calcMd5(file, size),
            filename = path.basename(file.path),
            relativepath = path.relative(file.base, file.path),
            sub_namepath = relativepath.replace(new RegExp(filename), "").split(path.sep).join('/'),
            dir;
        if (file.path[0] == '.') {
            dir = path.join(file.base, file.path);
        } else {
            dir = file.path;
        }
        dir = path.dirname(dir);

        var md5_filename = filename.split('.').map(function(item, i, arr) {
            return i == arr.length - 2 ? item + '_' + d : item;
        }).join('.');
        var levelDir = "";
        if (option.dirLevel) {
            levelDir = getLevelDir(dir, option.dirLevel).join(path.sep);
        }
        var l_filename = path.join(levelDir, filename);
        var l_md5_filename = path.join(levelDir, md5_filename);

        if (Object.prototype.toString.call(ifile) == "[object Array]") {
            ifile.forEach(function(i_ifile) {
                writeHtmlVersion(true, i_ifile, l_filename, l_md5_filename);
            })
        } else {
            writeHtmlVersion(true, ifile, l_filename, l_md5_filename);
        }
        file.path = path.join(dir, md5_filename);

        this.push(file);
        fs.unlink(path.join(dir, filename))

        if (filename.slice(-3) === '.js') {
            var mapFile = path.join(dir, filename + '.map');
            fs.exists(mapFile, function(result) {
                if (result) {
                    fs.unlink(mapFile);
                }
            });
        }
        cb();
    }, function(cb) {
        cb();
    });
};

function getLevelDir(dir, level) {
    var dirs = dir.split(path.sep);
    if (dirs && dirs.length >= level) {
        return dirs.slice(dirs.length - level)
    } else {
        return ""
    }
}

function calcMd5(file, slice) {
    var md5 = crypto.createHash('md5');
    md5.update(file.contents, 'utf8');

    return slice > 0 ? md5.digest('hex').slice(0, slice) : md5.digest('hex');
}