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
    util = require('./util'),

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
}]

// {
//     type: 'input',
//     name: 'targetPath',
//     message: "What's the path/file you want to update? (start input with project's root path)",
//     default: () => ('src/js')
// }

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

function update(template, targetPath) {
    const spinner = ora('updating template ...')
    let tmp = path.join(process.cwd(), TMP_NAME)

    let target = path.join(process.cwd(), targetPath),
        source = path.join(tmp, targetPath),
        targetForward = path.join(process.cwd(), './__update__/');


    spinner.start();
    download(`bmfe/${template}`, tmp, function(err) {
        spinner.stop()

        if (err) {
            rm(tmp)
            logger.fatal('Failed to download repo ' + template + ': ' + err.message.trim())
        }

        if (!exists(target)) {
            coverHandler()
            rm(tmp)
            return
        }
     
        questions2[0].message = `Path/File is exists: ${target}, are you sure to cover it?`
        inquirer.prompt(questions2).then((answers2) =>{
            let canCover = JSON.parse(JSON.stringify(answers2)).result

            if (canCover) {
                coverHandler()
                logger.sep()
                logger.success('Update success, path is "%s".', tmp)
                logger.log('tips: if your change the file that installed/updated , you should diff your change immediatily!'.yellow);
            } else {
                cannotCoverHandler()
                logger.sep()
                logger.success('Update success, files locate in "%s".', targetForward)
                logger.log('tips: when diff is done , suggest delete this path file'.yellow);                                            
            }
        })

        function coverHandler() {
            rm(target)
            shell.chmod('-R', '777', tmp)
            shell.cp('-R', source, target)
            shell.chmod('-R', '777', target)
            rm(tmp)
        }

        function cannotCoverHandler() {
            shell.mkdir('-p', targetForward)
            shell.chmod('-R', '777', tmp)
            shell.cp('-R', source, targetForward)    
            shell.chmod('-R', '777', targetForward)
            rm(tmp)
        }
    })
}

function run() {
    if (argv.h || argv.help) {
        helpCommand()
    }

    // if (argv._[1] === 'ios'){
    //     util.runiOSUpdateScript()
    //     return
    // } 
    // if(argv._[1] === 'android') {
    //     util.runAndroidUpdateScript()
    //     return
    // }
    // if(argv._[1] === 'widget') {
    //     update("eros-template", 'src/js/widget')
    //     return
    // } 
    if(argv._[1] === 'template' && !argv._[2]) {
        logger.fatal('please input the update path')
        return
    }
    if(argv._[1] === 'template' && argv._[2]) {
        update("eros-template", argv._[2])
        return
    } 
    
}
module.exports = {
    run: run,
    config: config,
    helpTitle: helpTitle,
    helpCommand: helpCommand
}