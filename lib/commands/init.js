var fs = require('fs'),
    path = require('path'),
    ora = require('ora'),
    fse = require('fs-extra'),
    download = require('download-git-repo'),
    inquirer = require('inquirer'),

    exists = require('fs').existsSync,
    rm = require('rimraf').sync,
    
    gulpServer = require('./server/gulpfile'),
    argv = require('yargs').argv,
    print = require('../../utils/print'),
    Config = require('../../utils/config'),
    logger = require('../../utils/logger'),

    shell = require('shelljs');

var config = {
    name: 'init',
    explain: 'generate eros template.',
    command: 'eros init',
    options: [{
        keys: ['-h', '--help'],
        describe: 'read help.'
    }]
}

function helpTitle() {
    print.title(config)
}

function helpCommand() {
    print.command(config)
}

var questions = [{
    type: 'input',
    name: 'name',
    default: function() {
        return 'eros-demo';
    },
    message: "Input project/app's name.",
    validate: function(value) {
        var pass = value.match(/^[0-9a-z\-_]+$/i);
        if (pass) {
            return true;
        }

        return 'Your input contain illegal character, please try again.';
    }

}, {
    type: 'input',
    name: 'version',
    default: function() {
        return '1.0.0';
    },
    message: "Input init version?",
    validate: function(value) {
        var pass = value.match(/^\d{1,2}\.\d{1,2}\.\d{1,2}$/);
        if (pass) {
            return true;
        }
        return 'Your input contain illegal character, please try again.';
    }
}, {
    type: 'list',
    name: 'type',
    message: "Choose your template type.",
    choices: [{
            name: "with A rich example And detailed project layering. (recommend)",
            value: "demo"
        }, {
            name: "just pure project.",
            value: "pure"
        }
    ]    
}, {
    type: 'input',
    name: 'applicationID',
    default: function() {
        return 'com.eros.wx';
    },
    message: "Input init android application id.",
    validate: function(value) {
        var pass = value.match(/^[a-z\.]+$/);
        if (pass) {
            return true;
        }
        return 'Your input contain illegal character, please try again.';
    }
}]

function changeFile(path, oldText, newText) {
    if (!exists(path)) return
    var result = fs.readFileSync(path, 'utf8').replace(new RegExp(oldText, "g"), newText);
    if (result) {
        fs.writeFileSync(path, result, 'utf8');
    }
};
const TEMPLATE = 'eros-template'
function create() {
    inquirer.prompt(questions).then(function(answers) {
        let _answers = JSON.parse(JSON.stringify(answers))

        let { name, type, version, applicationID } = _answers

        const spinner = ora('downloading template'),
            tmp = path.resolve(process.cwd(), name)

        spinner.start();
        if (exists(tmp)) rm(tmp);
        download(`bmfe/${TEMPLATE}#${type}`, tmp, function(err) {
            spinner.stop()

            if (err) logger.fatal('Failed to download repo ' + TEMPLATE + ': ' + err.message.trim())
            changeFile(tmp + '/package.json', `${TEMPLATE}-name`, name)

            changeFile(tmp + '/config/eros.native.js', `${TEMPLATE}-name`, name)
            changeFile(tmp + '/config/eros.native.js', `${TEMPLATE}-version`, version)
            changeFile(tmp + '/platforms/android/WeexFrameworkWrapper/gradle.properties', 'com.eros.wx', applicationID)

            logger.sep()
            logger.success('Generated "%s".', name)
            logger.sep()
            logger.success('Run flowing code to get started.')
            logger.log('1. cd %s', name)
            logger.log('2. npm install')
            logger.log('3. eros dev')
        })
    });
};


function run() {
    if (argv.h || argv.help) {
        helpCommand();
    } else {
        create();
    }
}

module.exports = {
    run: run,
    config: config,
    helpTitle: helpTitle,
    helpCommand: helpCommand
}
