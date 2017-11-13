/**
* @Author: songqi
* @Date:   2017-01-10
* @Last modified by:   songqi
* @Last modified time: 2017-03-23
*/

var print = require('../../utils/print'),
    argv = require('yargs').argv,
    gulpServer = require('./server/gulpfile');

var config = {
    name: 'minWeex',
    explain: '压缩打包上线 weex 项目',
    command: 'BM minWeex',
    options: [{
        keys: ['-h', '--help'],
        describe: '查看帮助'
    }, {
        keys: ['-s', '--send'],
        describe: '版本发送至服务器'
    }, {
        keys: ['-d', '--diff'],
        describe: '创建 diff 的 zip 包'
    }, {
        keys: ['-e', '--eros'],
        describe: '把 zip 包发送到 weex-eros 的路径下'
    }]
}

function helpTitle(){
    print.title(config);
}

function helpCommand(){
    print.command(config);
}

function run(){
    if(argv.h || argv.help){
        helpCommand();
    } else {
        gulpServer.start('weex');
    }
}

module.exports = {
    run: run,
    config: config,
    helpTitle: helpTitle,
    helpCommand: helpCommand
}
