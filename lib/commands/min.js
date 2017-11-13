/**
 * @Author: songqi
 * @Date:   2016-07-12
 * @Email:  songqi@benmu-health.com
 * @Last modified by:   songqi
 * @Last modified time: 2016-09-21
 */

var print = require('../../utils/print');
var argv = require('yargs').argv,
    gulpServer = require('./server/gulpfile');

var config = {
    name: 'min',
    explain: '压缩打包',
    command: 'BM min',
    options: [{
        keys: ['-h', '--help'],
        describe: '查看帮助'
    }]
}

function helpTitle() {
    print.title(config);
}

function helpCommand() {
    print.command(config);
}

function run() {
    if (argv.h || argv.help) {
        helpCommand();
    } else {
        gulpServer.start('default');
    }
}

module.exports = {
    run: run,
    config: config,
    helpTitle: helpTitle,
    helpCommand: helpCommand
}