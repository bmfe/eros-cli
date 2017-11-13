/**
 * @Author: songqi
 * @Date:   2016-07-12
 * @Email:  songqi@benmu-health.com
 * @Last modified by:   songqi
 * @Last modified time: 2017-02-22
 */

var fs = require('fs'),
    path = require('path'),
    fse = require('fs-extra'),
    prompt = require('prompt'),
    argv = require('yargs').argv,
    print = require('../../utils/print'),
    Config = require('../../utils/config'),
    child_process = require('child_process');

var config = {
    name: 'init',
    explain: '初始化目录',
    command: 'BM init [项目名]',
    options: [{
        keys: ['-h', '--help'],
        describe: '查看帮助'
    }, {
        keys: ['-f', '--frame'],
        describe: '选择什么框架来初始化项目'
    }]
}

var schema = {
    properties: {
        name: {
            pattern: /^[0-9a-z\-_]+$/i,
            message: '只允许输入字母、连接符、下划线',
            required: true,
            description: '请输入创建工程的名字'
        },
        version: {
            pattern: /^\d{1,2}\.\d{1,2}\.\d{1,2}$/,
            message: '只允许输入如 1.x.x',
            required: true,
            description: '请输入工程的初始版本号，默认1.0.0，初始化工程建议不修改',
            default: '1.0.0'
        }
    }
};

function helpTitle() {
    print.title(config)
}

function helpCommand() {
    print.command(config)
}

function onlyCreateProject(configJson, projectPath) {
    fse.ensureDir(projectPath, function() {
        fse.ensureDirSync(path.join(projectPath, 'html'));
        fse.ensureDir(path.join(projectPath, 'src'), function(err) {
            fse.ensureDirSync(path.join(projectPath, 'src/html'));
            fse.ensureDirSync(path.join(projectPath, 'src/css'));
            fse.ensureDirSync(path.join(projectPath, 'src/js'));
            fse.ensureDirSync(path.join(projectPath, 'src/mock'));
            print.info('初始化成功');
        });
        fs.writeFileSync(path.join(projectPath, 'config.js'), 'module.exports=' + JSON.stringify(configJson), 'utf8');
    });
}

function changeFile(path, oldText, newText) {
    if (!fs.existsSync(path)) return
    var result = fs.readFileSync(path, 'utf8').replace(new RegExp(oldText, "g"), newText);
    if (result) {
        fs.writeFileSync(path, result, 'utf8');
    }
}

function createFrameProject(configJson, projectPath) {
    var frame = (argv.f || argv.frame),
        fullFrame = 'bmfe-' + frame;
    fse.ensureDir(projectPath, function() {
        var execString = 'cd ' + projectPath + ' && cnpm install ' + fullFrame +
            '&& cp -r ./node_modules/' + fullFrame + '/template/ ./'
        child_process.exec(execString, function(error) {
            if (error !== null) {
                print.info('初始化失败: ' + error);
            } else {
                changeFile(projectPath + '/html/page/index.html', frame, configJson.name);
                changeFile(projectPath + '/config.js', frame, configJson.name);
                changeFile(projectPath + '/package.json', frame, configJson.name);
                changeFile(projectPath + '/config.js', '1.0.0', frame);
                fs.rename(projectPath + '/gitignore', projectPath + '/.gitignore');
                child_process.exec('cd ' + projectPath + ' && cnpm install', function(error) {
                    if (error !== null) {
                        print.info('初始化失败: ' + error);
                    } else {
                        print.info('初始化成功');
                        child_process.exec('cd ' + projectPath + ' && chmod -R 777 ./');
                    }
                });
            }
        });
    });
}

function createProject() {
    schema.properties.name['default'] = argv._[1];
    prompt.start();
    return prompt.get(schema, function(err, result) {
        var configJson, projectPath;
        if (err) {
            print.info('创建失败');
            return;
        }
        configJson = Config.createEmptySchema();
        configJson.name = result.name;
        configJson.version = result.version;
        projectPath = path.join(process.cwd(), configJson.name);
        if (argv.f || argv.frame) {
            createFrameProject(configJson, projectPath);
        } else {
            onlyCreateProject(configJson, projectPath);
        }
    });
}

function run() {
    if (argv.h || argv.help) {
        helpCommand();
    } else {
        createProject();
    }
}

module.exports = {
    run: run,
    config: config,
    helpTitle: helpTitle,
    helpCommand: helpCommand
}