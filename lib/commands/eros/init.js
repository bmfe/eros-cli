
var fs = require('fs'),
    path = require('path'),
    fse = require('fs-extra'),
    inquirer = require('inquirer'),
    argv = require('yargs').argv,
    print = require('../../../utils/print'),
    Config = require('../../../utils/config'),
    erosUtils = require('./util'),
    shell = require('shelljs');


var questions = [
    {
        type: 'list',
        name: 'template',
        message: 'What eros template you want to created?',
        choices: [{
            name: "standard | with default's widgets",
            value: "standard"
        },
        new inquirer.Separator(),
        {
            name: "simple | without default's widgets",
            value: "simple",
            disabled: 'Unavailable at this time'
          },
        ]
  },{
        type: 'input',
        name: 'name',
        default: function () {
          return 'eros-demo';
        },
        message: "Please enter your project's name.",
        validate: function (value) {
          var pass = value.match(/^[0-9a-z\-_]+$/i);
          if (pass) {
            return true;
          }

          return 'Your input contain illegal character, please try again.';
        }
        
      }, {
        type: 'input',
        name: 'version',
        default: function () {
          return '1.0.0';
        },
        message: "Please enter your project's version.",
        validate: function (value) {
          var pass = value.match(/^\d{1,2}\.\d{1,2}\.\d{1,2}$/);
          if (pass) {
            return true;
          }
          return 'Your input contain illegal character, please try again.';
        }
  }     
]

function changeFile(path, oldText, newText) {
    if (!fs.existsSync(path)) return
    var result = fs.readFileSync(path, 'utf8').replace(new RegExp(oldText, "g"), newText);
    if (result) {
        fs.writeFileSync(path, result, 'utf8');
    }
};

function create() {
    inquirer.prompt(questions).then(function (answers) {
        var _answers = JSON.parse(JSON.stringify(answers)),
            configJson, projectPath;

        configJson = Config.createEmptySchema();
        configJson.name = _answers.name;
        configJson.template = _answers.template;
        configJson.version = _answers.version;
        configJson.platform = 'weex-eros';
        projectPath = path.join(process.cwd(), configJson.name);
        createProject(configJson, projectPath);      

    });
};

function createProject(configJson, projectPath) {
    var frame = 'weex-eros-template-' + configJson.template,
        fullFrame = 'bmfe-' + frame;

        if(configJson.template === 'simple') fullFrame += '-simple'
    fse.ensureDir(projectPath, function() {
        console.time('[' + 'eros'.blue + '] ' + 'Template loading time consuming :'.green);

        shell.cd(projectPath).exec('cnpm install ' + fullFrame + ' --verbose');
        shell.cp('-R', projectPath + '/node_modules/' + fullFrame + '/template/*', projectPath);
        shell.rm('-rf', projectPath + '/node_modules');

        var _name = configJson.name
        changeFile(projectPath + '/config/eros.dev.js', frame, _name);
        changeFile(projectPath + '/config/eros.native.js', frame, _name);
        changeFile(projectPath + '/config/eros.native.js', "weex-eros-version", configJson.version);
        changeFile(projectPath + '/fe/package.json', frame, _name);

        fs.rename(projectPath + '/gitignore', projectPath + '/.gitignore');

        shell.cd(projectPath).exec('cnpm install');
        shell.chmod('-R', '777', projectPath);
        console.timeEnd('[' + 'eros'.blue + '] ' + 'Template loading time consuming :'.green);
        erosUtils.erosConsole('Init template success，run the following code.'.green);
        console.log('');
        console.log('1.     cd ' + configJson.name );
        console.log('2.     bm eros install');
        console.log('3.     bm eros dev');
        
    });
};


module.exports = {
    create: create,
    createProject: createProject
}