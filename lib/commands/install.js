/**
 * @Author: songqi
 * @Date:   2016-09-01
 * @Email:  songqi@benmu-health.com
 * @Last modified by:   songqi
 * @Last modified time: 2016-09-18
 */

var fs = require('fs');
var _ = require('lodash');
var exec = require('child_process').exec;
var print = require('../../utils/print');
var argv = require('yargs').argv;
var params = { //参数配置
    'help': function() {
        helpCommand();
    },
    'save': function() {

    },
    'save-dev': function() {

    }
}
var config = {
    name: 'install',
    explain: '安装bower依赖',
    command: 'BM bower install \r\n       BM bower install <name> [<name> ..] [<options>]',
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

function convertDeps(colle, joinSym) {
    var deps = [];
    switch (Object.prototype.toString.call(colle)) {
        case '[object Object]':
            for (var mod in colle) {
                deps.push(mod + (joinSym || '#') + colle[mod]);
            }
            break;
        case '[object Array]':
            deps = {};
            for (var i = 0; i < colle.length; i++) {
                var item = (colle[i] + '').split(joinSym || '#');
                deps[item[0]] = item[1] || '*';
            }
            break;
    }
    return deps;
}

function readFiles(path, resolve) {
    fs.stat(path, function(err, stat) {
        if (err == null) {
            resolve && resolve(path);
        } else if (err.code == 'ENOENT') {
            console.log(path, ' does not exist');
        } else {
            console.log('Some other error: ', err.code);
        }
    });
}

function execShellInstall(packsStr) {
    var cmd = 'bower install ' + packsStr;
    console.log(cmd);
    exec(cmd, function(err, stdout, stderr) {
        if (err) {
            console.log(stderr);
        } else {
            stdout && console.log(stdout);
        }
    });
}

function confOperator(config) {
    var arg = argv._.slice(1);
    var configObj = require(config);
    var bower = configObj.bower;
    if (!(bower && !_.isEmpty(bower.dependencies)) && !arg.length) {
        console.log('no enable pack to install');
    } else {
        var packs = [];
        if (arg.length) {
            packs = arg;
            if (argv.save) {
                console.log('will save config');
                configObj.bower = _.merge(bower, {
                    dependencies: convertDeps(packs)
                });
                fs.writeFileSync(process.cwd() + '/' + 'config.js', 'module.exports = ' + JSON.stringify(configObj, null, 4));
            }
        } else {
            if (bower.registry) {
                var conf = {
                    "directory": "bower_components",
                    "registry": bower.registry,
                    "timeout": 300000
                }
                fs.writeFileSync(process.cwd() + '/' + '.bowerrc', JSON.stringify(conf, null, 4));
            }
            packs = convertDeps(bower.dependencies);
        }
        if (packs.length) {
            execShellInstall(packs.join(''));
        }
    }
}

function tryInstall() {
    var config = process.cwd() + '/' + 'config.js';
    var readFilePro = new Promise(function(resolve, reject) {
        readFiles(config, function(config) {
            resolve(config);
        });
    }).then(confOperator);
}

function run() {
    if (argv.h || argv.help) {
        params.help();
    } else {
        tryInstall();
    }
}
module.exports = {
    run: run,
    config: config,
    helpTitle: helpTitle,
    helpCommand: helpCommand
}