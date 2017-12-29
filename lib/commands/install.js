var argv = require('yargs').argv,
    path = require('path'),
    erosUpdate = require('./update'),
    inquirer = require('inquirer'),
    print = require('../../utils/print'),
    logger = require('../../utils/logger'),
    readSyncByRl = require('./util').readSyncByRl,
    Process = require('child_process');


var config = {
    name: 'install',
    explain: "install eros platform and components' librarys.",
    command: 'eros install',
    options: [{
        keys: ['-h', '--help'],
        describe: 'read help'
    }, {
        keys: ['-ios'],
        describe: 'install ios platform base library.'
    }, {
        keys: ['-android'],
        describe: 'install android platform base library.'
    }, {
        keys: ['-component'],
        describe: 'install component library.'
    }]
}

var installContainer = {
    installIosDep: installIosDep,
    installAndroidDep: installAndroidDep
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
            name: "platform | ios ",
            value: "installIosDep"
        }, {
            name: "platform | android",
            value: "installAndroidDep"
        }
    ]
}]

function installSelect() {
    inquirer.prompt(questions).then(function(answers) {
        var platform = JSON.parse(JSON.stringify(answers)).platform;
        installContainer[platform] && installContainer[platform]();
    }, (error) => {
        logger.fatal('input error'.red)
        logger.fatal(error)
    });
}

function installIosDep() {
    logger.log('installing ios sdk...');
    console.time('[' + 'eros'.blue + '] ' + 'ios updating time consuming: '.green);
    var build = Process.exec(path.resolve(process.cwd(), './platforms/ios/WeexEros/install.sh'), { cwd: path.resolve(process.cwd(), './platforms/ios/WeexEros/') }, function(error, stdout, stderr) {
        // window上防止报错
        // if (error !== null) {
        //     logger.fatal('exec error: ' + error, 'red');
        //     return;
        // }
        console.timeEnd('[' + 'eros'.blue + '] ' + 'ios updating time consuming: '.green);
    });
    build.stdout.on('data', function(data) {
        console.log(data)
    });
    build.stderr.on('data', function(data) {
        console.log(data)
    });
};

function installAndroidDep() {
    logger.log('installing android sdk...')
    console.time('[' + 'eros'.blue + '] ' + 'android updating time consuming: '.green);
    var build = Process.exec(path.resolve(process.cwd(), './platforms/android/WeexFrameworkWrapper/install.sh'), { cwd: path.resolve(process.cwd(), './platforms/android/WeexFrameworkWrapper/') }, function(error, stdout, stderr) {
        // if (error !== null) {
        //     logger.fatal('exec error: ' + error, 'red');
        //     return;
        // }
        console.timeEnd('[' + 'eros'.blue + '] ' + 'android updating time consuming: '.green);
    });
    build.stdout.on('data', function(data) {
        console.log(data)
    });
    build.stderr.on('data', function(data) {
        console.log(data)
    });
};


function run() {
    if (argv.h || argv.help) {
        helpCommand();
        return
    }

    if (argv.ios) {
        installIosDep();
    } else if (argv.android) {
        installAndroidDep();
    } else {
        installSelect();
    }
}

module.exports = {
    run: run,
    config: config,
    helpTitle: helpTitle,
    helpCommand: helpCommand
}