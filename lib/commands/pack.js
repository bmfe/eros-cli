var argv = require('yargs').argv,
    inquirer = require('inquirer'),
    print = require('../../utils/print'),
    gulpServer = require('./server/gulpfile.js'),
    readSyncByRl = require('./util').readSyncByRl,
    erosConsole = require('./util').erosConsole;

var config = {
    name: 'pack',
    explain: 'pack full dose zip and send to eros platform project.',
    command: 'eros dev',
    options: [{
        keys: ['-h', '--help'],
        describe: 'read help'
    }, {
        keys: ['-ios'],
        describe: 'pack ios full dose zip and send to eros ios platform.'
    }, {
        keys: ['-android'],
        describe: 'pack ios full dose zip and send to eros android platform.'
    }]
}

function helpTitle() {
    print.title(config)
}

function helpCommand() {
    print.command(config)
}

var questions = [{
    type: 'list',
    name: 'platform',
    message: 'what kind of platform you want to pack?',
    choices: [{
        name: "ios",
        value: "ios"
    }, {
        name: "android",
        value: "android"
    }, ]
}]

var packContainer = {
    select: select,
    ios: function() {
        gulpServer.start('weex-eros:ios');
    },
    android: function() {
        gulpServer.start('weex-eros:android');
    }
}

function select() {
    inquirer.prompt(questions).then(function(answers) {
        var platform = JSON.parse(JSON.stringify(answers)).platform;
        packContainer[platform] && packContainer[platform]();
    }, (error) => {
        erosConsole('input error'.red)
        erosConsole(error)
    });
}

function run() {
    if (argv.h || argv.help) {
        helpCommand();
        return
    }

    if (argv.ios) {
        packContainer.ios()
    } else if (argv.android) {
        packContainer.android()
    } else {
        select();
    }
}

module.exports = {
    run: run,
    config: config,
    helpTitle: helpTitle,
    helpCommand: helpCommand
}