/**
 * @Author: songqi
 * @Date:   2016-09-01
 * @Email:  songqi@benmu-health.com
 * @Last modified by:   songqi
 * @Last modified time: 2016-09-18
 */

var fs = require('fs');
var exec = require('child_process').exec;
var print = require('../../utils/print');
var argv = require('yargs').argv;
var params = { //参数配置
    'help': function() {
        helpCommand();
    }
}
var config = {
    name: 'uninstall',
    explain: '卸载bower依赖',
    command: 'BM uninstall <name> [<name> ..] [<options>]',
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

function execShellunInstall(packsStr) {
    var cmd = 'bower uninstall ' + packsStr;
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
    if (!arg.length) {
        console.log('no enable pack to uninstall');
    } else {
        var configObj = require(config);
        if (argv.save && configObj.bower && configObj.bower.dependencies) {
            for (var n in convertDeps(arg)) {
                delete configObj.bower.dependencies[n];
            }
            fs.writeFileSync(process.cwd() + '/' + 'config.js', 'module.exports = ' + JSON.stringify(configObj, null, 4));
        }
        if (arg.length) {
            execShellunInstall(arg.join(''));
        }
    }
}

function tryunInstall() {
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
        tryunInstall();
    }
}
module.exports = {
    run: run,
    config: config,
    helpTitle: helpTitle,
    helpCommand: helpCommand
}