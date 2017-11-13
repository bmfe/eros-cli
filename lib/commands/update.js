/**
 * @Author: songqi
 * @Date:   2016-07-12
 * @Email:  songqi@benmu-health.com
 * @Last modified by:   songqi
 * @Last modified time: 2017-02-22
 */

var fs = require('fs'),
    path = require('path'),
    argv = require('yargs').argv,
    print = require('../../utils/print'),
    readConfig = require('../../utils/readConfig');

var child_process = require('child_process');

var config = {
    name: 'update',
    explain: '更新框架代码',
    command: 'BM update',
    options: [{
        keys: ['-h', '--help'],
        describe: '查看帮助'
    }, {
        keys: ['-f', '--frame'],
        describe: '选择什么框架更行代码，默认会读取 config.js 中的 frame'
    }]
}

function helpTitle() {
    print.title(config)
}

function helpCommand() {
    print.command(config)
}

function changeFile(path, oldText, newText) {
    if (!fs.existsSync(path)) return
    var result = fs.readFileSync(path, 'utf8').replace(new RegExp(oldText, "g"), newText);
    if (result) {
        fs.writeFileSync(path, result, 'utf8');
    }
}

function copyFile(execString, frame) {
    var projectPath = process.cwd(),
        fileName = process.cwd().split('/').pop();
    child_process.exec(execString, function(error) {
        if (error !== null) {
            print.info('更新失败: ' + error);
        } else {
            changeFile(projectPath + '/html/page/index.html', frame, fileName);
            changeFile(projectPath + '/package.json', frame, fileName);
            print.info('更新成功');
        }
    });
}

function updateProject() {
    var projectPath = process.cwd(),
        frame = readConfig.get('frame') || (argv.f || argv.frame);
    frameName = 'bmfe-' + frame;
    var execString = 'cd ' + projectPath + ' && cnpm install ' + frameName;
    child_process.exec(execString, function(error) {
        if (error !== null) {
            print.info('更新失败: ' + error);
        } else {
            var stat,
                updateArr,
                frameFile = path.join(projectPath, 'node_modules', frameName),
                updateFile = path.join(frameFile, 'update.js');
            try {
                stat = fs.statSync(updateFile);
            } catch (e) {}
            if (stat) {
                updateArr = require(updateFile);
                execString = '';
                updateArr.map(function(item, index) {
                    var updateFileItem;
                    if (index) {
                        execString += ' && ';
                    }
                    try {
                        updateFileItem = fs.statSync(path.join(frameFile, 'template', item));
                    } catch (e) {}
                    if (updateFileItem.isDirectory()) {
                        execString += 'cp -r ' + path.join(frameFile, 'template', item) + '/ ' + path.join(projectPath, item);
                    } else {
                        execString += 'cp -r ' + path.join(frameFile, 'template', item) + ' ' + path.join(projectPath, item);
                    }
                });
                copyFile(execString, frame);
            } else {
                print.info('没有需要更新的内容');
            }
        }
    });
}

function run() {
    if (argv.h || argv.help) {
        helpCommand();
    } else {
        updateProject();
    }
}

module.exports = {
    run: run,
    config: config,
    helpTitle: helpTitle,
    helpCommand: helpCommand
}