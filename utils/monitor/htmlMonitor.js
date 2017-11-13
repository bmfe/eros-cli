/**
 * @Author: songqi
 * @Date:   2016-04-10
 * @Email:  songqi@benmu-health.com
 * @Last modified by:   songqi
 * @Last modified time: 2017-03-06
 */

var fs = require('fs'),
    path = require('path'),
    gutil = require('gulp-util'),
    through = require('through2');

var readConfig = require('../readConfig'),
    header = fs.readFileSync(path.resolve(__dirname, './htmlTpl/header'), 'utf8'),
    footer = fs.readFileSync(path.resolve(__dirname, './htmlTpl/footer'), 'utf8');

module.exports = function(size, ifile, option) {
    size = size | 0;
    option = option || {};
    return through.obj(function(file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-debug', 'Streaming not supported'));
            return cb(null, file);
        }

        if (!file.contents) {
            return cb(null, file);
        }

        var monitorConfig = readConfig.get('monitor');
        if (!monitorConfig) {
            return cb(null, file);
        }

        var html = file.contents.toString('utf8'),
            htmlHeaderIndex = html.indexOf('<head>') + 6,
            monitorUrl = monitorConfig.url || '/proxy/receive',
            monitorName = monitorConfig.name || '';
        footer = footer.replace(/@monitorUrl@/g, monitorUrl).replace(/@monitorName@/g, monitorName);
        html = html.slice(0, htmlHeaderIndex) + header + html.slice(htmlHeaderIndex);
        var htmlFooterIndex = html.indexOf('</body>');
        html = html.slice(0, htmlFooterIndex) + footer + html.slice(htmlFooterIndex);
        file.contents = new Buffer(html, "utf8");
        cb(null, file);
    }, function(cb) {
        cb();
    });
};