

var print = require('../../utils/print'),
    argv = require('yargs').argv,
    gulpServer = require('./server/gulpfile');

var config = {
    name: 'source',
    explain: 'source eros config.',
    command: 'eros config',
    options: [{
        keys: ['-h', '--help'],
        describe: 'read help.'
    }, {
        keys: ['-s', '--send'],
        describe: 'pack production zip and send to server.'
    }, {
        keys: ['-d', '--diff'],
        describe: 'generate diff zip.'
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
        return
    } 

	if (argv._[1] === 'reload'){
         gulpServer.start('handle-config-native');
        return
    }     
}

module.exports = {
    run: run,
    config: config,
    helpTitle: helpTitle,
    helpCommand: helpCommand
}