var argv = require('yargs').argv,
    p = require('path'),
    erosUpdate = require('./update'),
    inquirer = require('inquirer'),
    print = require('../../utils/print'),
    logger = require('../../utils/logger'),
    runApp = require('./run/index')


var config = {
    name: 'run',
    explain: "eros run app in your device",
    command: 'eros run',
    options: [{
        keys: ['-h', '--help'],
        describe: 'read help'
    }, {
        keys: ['ios'],
        describe: 'install ios platform base library.'
    }, {
        keys: ['android'],
        describe: 'install android platform base library.'
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
    message: 'You can install or update eros sdk and librarys.',
    choices: [{
            name: "ios ",
            value: "runIOS"
        }, {
            name: "android",
            value: "runAndroid"
        }
    ]
}]
const _path = process.cwd()
const dir = p.basename(_path)

function choosePlatform() {
    inquirer.prompt(questions).then(function(answers) {
        var platform = JSON.parse(JSON.stringify(answers)).platform
        runApp[platform] && runApp[platform]({dir})
    }, (error) => {
        logger.fatal('input error'.red)
        logger.fatal(error)
    })
}


function run() {
    if (argv.h || argv.help) {
        helpCommand()
        return
    }


    if (argv.ios || argv._[1] === 'ios') {
        runApp.runIOS({dir})
    } else if (argv.android || argv._[1] === 'android') {
        runApp.runAndroid({dir})
    } else {
        choosePlatform()
    }
}

module.exports = {
    run: run,
    config: config,
    helpTitle: helpTitle,
    helpCommand: helpCommand
}