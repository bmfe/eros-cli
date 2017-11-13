/**
 * @Author: songqi
 * @Date:   2016-07-19
 * @Email:  songqi@benmu-health.com
 * @Last modified by:   songqi
 * @Last modified time: 2016-07-19
 */

var pretty = require('pretty-hrtime');
var through = require('through2');
var logColors = require('colors');

var print = require('./print');

logColors.setTheme({
    info: 'green',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

var prefix = '[' + logColors.debug('gulp') + '] '

function duration(name) {
    var start = process.hrtime()
    var stream = through.obj({
        objectMode: true
    })

    stream.start = resetStart

    name = name || 'gulp-duration'
    name = '' + name + ': '

    return stream.once('end', function() {
        var time = pretty(process.hrtime(start))
        log(logColors.info(print.fixempty(name, 30, '-')) + time.magenta);
    })

    function resetStart() {
        start = process.hrtime()
    }

    function log(str) {
        str = prefix + str
        console.log(str)
    }
}

module.exports = duration