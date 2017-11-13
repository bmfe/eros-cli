var fs = require('fs'),
    path = require('path'),
    erosConsole = require('./util').erosConsole,
    readConfig = require('../../../utils/readConfig'),
    child_process = require('child_process'),
    TEMPLATE_NAME = 'bmfe-weex-eros-template';

var shell = require('shelljs');


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