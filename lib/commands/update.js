/**
 * @Author: songqi
 * @Date:   2016-07-12
 * @Email:  songqi@benmu-health.com
 * @Last modified by:   songqi
 * @Last modified time: 2017-02-22
 */


var fs = require('fs'),
    path = require('path'),
    erosConsole = require('./util').erosConsole,
    readConfig = require('../../utils/readConfig'),
    child_process = require('child_process'),
    print = require('../../utils/print'),
    shell = require('shelljs'),

    exists = require('fs').existsSync,
    rm = require('rimraf').sync,

    TEMPLATE_NAME = 'bmfe-weex-eros-template';


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

function helpTitle() {
    print.title(config)
}

function helpCommand() {
    print.command(config)
}


function updateProject(targetPath) {
    var projectPath = path.resolve(process.cwd(), '../'),
        porjectFEPath = path.resolve(process.cwd());

    shell.cd(porjectFEPath).exec('cnpm install ' + TEMPLATE_NAME + ' --verbose');

    var templatePath = path.join(porjectFEPath, 'node_modules', TEMPLATE_NAME);

    shell.chmod('-R', '777', templatePath);
    shell.cp('-R', path.join(templatePath, 'template', targetPath), path.join(projectPath, targetPath, '../'));
    shell.chmod('-R', '777', path.join(projectPath, targetPath));

    erosConsole('install/update success !'.green);
    erosConsole('tips: if your change the file that installed/updated , you should diff your change immediatily!'.yellow);
}



module.exports = {
    updateProject: updateProject
}

function run() {
    if (argv.h || argv.help) {
        helpCommand();
    } else {
        updateProject(argv._[1]);
    }

}
module.exports = {
    run: run,
    config: config,
    helpTitle: helpTitle,
    helpCommand: helpCommand
}