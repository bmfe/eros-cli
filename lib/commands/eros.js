/**
 * @Author: songqi
 * @Date:   2017-01-10
 * @Last modified by:   songqi
 * @Last modified time: 2017-03-23
 */

var path = require('path'),
    print = require('../../utils/print'),
    argv = require('yargs').argv,
    eros = require('./eros/index'),
    erosConsole = require('./eros/util.js').erosConsole;

var config = {
    name: 'eros',
    explain: 'bm 脚手架 weex-eros 开发工具',
    command: 'bm eros',
    options: [{
        keys: ['dev'],
        describe: '开启本地服务，默认80端口拦截'
    }, {
        keys: ['pack'],
        describe: '生成 eros 内置包'
    }, {
        keys: ['install'],
        describe: '更新下载 ios 或者 android 依赖'
    }]
}

function helpTitle() {
    print.title(config);;
}

function helpCommand() {
    print.command(config);
}

function run() {
    (argv.h || argv.help) && helpCommand();

    switch(argv._[1]) {
        case 'init':
            eros.initCreate();
            break;        
        case 'dev':
            eros.devServer();
            break;
        case 'build':
            eros.devBuild();
            break;        
        case 'update':
            eros.updateProject(argv._[2]);
            break;            
        case 'pack':
            if(argv.ios) {eros.packIos();}
            else if(argv.android) {eros.packAndroid();}
            else {eros.packSelect();}
            break;    
        case 'install':
            if(argv.ios) {eros.installIosDep();}
            else if(argv.android) {eros.installAndroidDep();}
            else if(argv.fe) {eros.installComponents();}
            else {eros.installSelect();}
            break;            
    }
}

module.exports = {
    run: run,
    config: config,
    helpTitle: helpTitle,
    helpCommand: helpCommand
}