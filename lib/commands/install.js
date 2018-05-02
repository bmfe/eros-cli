var argv = require('yargs').argv,
    erosUpdate = require('./update'),
    inquirer = require('inquirer'),
    print = require('../../utils/print'),
    logger = require('../../utils/logger'),
    util = require('./util')


var config = {
    name: 'install',
    explain: "install eros platform and components' librarys.",
    command: 'eros install',
    options: [{
        keys: ['-h', '--help'],
        describe: 'read help'
    }, {
        keys: ['ios'],
        describe: 'install ios platform base library.'
    }, {
        keys: ['android'],
        describe: 'install android platform base library.'
    }, {
        keys: ['all'],
        describe: 'install android and ios platform base library.'
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
            name: "eros-sdk | ios ",
            value: "runiOSInstallScript"
        }, {
            name: "eros-sdk | android",
            value: "runAndroidInstallScript"
        }, {
            name: "eros-sdk | ios & android",
            value: "runAllInstallScript"
        }
    ]
}]

function installSelect() {
    inquirer.prompt(questions).then(function(answers) {
        var platform = JSON.parse(JSON.stringify(answers)).platform
        util[platform] && util[platform]()
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
    // if (argv._[1] === 'ios'){
    //     util.runiOSInstallScript()
    //     return
    // } 
    // if(argv._[1] === 'android') {
    //     util.runAndroidInstallScript()
    //     return
    // }
    // if(argv._[1] === 'all') {
    //     util.runAllInstallScript()
    //     return
    // }     

    // if (argv.ios) {
    //     util.installIosDep()
    // } else if (argv.android) {
    //     util.installAndroidDep()
    // } else {
    //     installSelect()
    // }
}

module.exports = {
    run: run,
    config: config,
    helpTitle: helpTitle,
    helpCommand: helpCommand
}