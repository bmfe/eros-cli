var fs = require('fs'),
    path = require('path'),
    ora = require('ora'),
    fse = require('fs-extra'),
    download = require('download-git-repo'),
    inquirer = require('inquirer'),

    exists = require('fs').existsSync,
    rm = require('rimraf').sync,

    argv = require('yargs').argv,
    print = require('../../utils/print'),
    Config = require('../../utils/config'),
    logger = require('../../utils/logger'),

    shell = require('shelljs');

const TMP_NAME = 'eros-template-tmp';

var config = {
    name: 'update',
    explain: 'update eros-template file by path.',
    command: 'eros update _path',
    options: [{
        keys: ['-h', '--help'],
        describe: 'read update.'
    }, {
        keys: ['_path'],
        describe: 'input path that you want to update.'
    }]
}


var questions = [{
    type: 'list',
    name: 'template',
    message: 'Choice a template.',
    choices: [{
            name: "standard | with default's widgets",
            value: "eros-template"
        },
        new inquirer.Separator(),
        {
            name: "simple | without default's widgets",
            value: "eros-template-simple",
            disabled: 'Unavailable at this time'
        },
    ]
}, {
    type: 'input',
    name: 'targetPath',
    message: "What's the path/file you want to update? (start input with project's root path)",
    default: () => ('src/js')
}]

var questions2 = [{
    type: 'list',
    name: 'result',
    message: 'What kind of eros template you developed now?',
    choices: [{
            name: "false",
            value: false
        },
        {
            name: "true",
            value: true,
        },
    ]
}]

function helpTitle() {
    print.title(config)
}

function helpCommand() {
    print.command(config)
}

function update() {
    inquirer.prompt(questions).then(function(answers) {
        const spinner = ora('updating template ...')
        let tmp = path.join(process.cwd(), TMP_NAME)
        let _answers = JSON.parse(JSON.stringify(answers))

        let { template, targetPath } = _answers

        let target = path.join(process.cwd(), targetPath),
            source = path.join(tmp, targetPath);


        spinner.start();
        download(`bmfe/${template}`, tmp, function(err) {
            spinner.stop()

            if (err) {
                rm(tmp)
                logger.fatal('Failed to download repo ' + template + ': ' + err.message.trim())
            }

            if (!exists(target)) {
                rm(tmp)
                logger.fatal('Path/File is not exists: %s', target)
            } else {
                questions2[0].message = `Path/File is exists: ${target}, are you sure to cover it?`
                inquirer.prompt(questions2).then(function(answers2) {
                    let canCover = JSON.parse(JSON.stringify(answers2)).result

                    if (!canCover) return
                    rm(target)

                    shell.chmod('-R', '777', tmp)
                    shell.cp('-R', source, target)
                    shell.chmod('-R', '777', target)

                    rm(tmp)
                    logger.sep()
                    logger.success('Update success, path is "%s".', tmp)
                    logger.log('tips: if your change the file that installed/updated , you should diff your change immediatily!'.yellow);
                })
            }
        })
    });
};

function updateProject(targetPath) {
    const spinner = ora('Install ...'),
        tmp = path.resolve(process.cwd(), TMP_NAME)

    let target = path.join(process.cwd(), targetPath),
        source = path.join(tmp, targetPath)

    spinner.start();
    download('bmfe/eros-template', tmp, function(err) {
        spinner.stop()
        if (err) {
            logger.fatal('Failed to download repo bmfe/eros-template')
            rm(tmp)
        }
        questions2[0].message = `Path/File is exists: ${target}, are you sure to cover it?`
        inquirer.prompt(questions2).then(function(answers2) {
            let canCover = JSON.parse(JSON.stringify(answers2)).result

            if (!canCover) return
            if (exists(target)) rm(target)

            shell.chmod('-R', '777', tmp)
            shell.cp('-R', source, target)
            shell.chmod('-R', '777', target)

            rm(tmp)
            logger.sep()
            logger.success('Install success, path is "%s".', tmp)
        })
    })
}

function run() {
    if (argv.h || argv.help) {
        helpCommand()
    } else {
        update(argv._[1])
    }
}
module.exports = {
    run: run,
    updateProject: updateProject,
    config: config,
    helpTitle: helpTitle,
    helpCommand: helpCommand
}