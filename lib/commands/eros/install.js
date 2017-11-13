var path = require('path'),
    erosUpdate = require('./update'),
    inquirer = require('inquirer'),
    erosConsole = require('./util').erosConsole,
    readSyncByRl = require('./util').readSyncByRl,
    Process = require('child_process');



var questions = [
    {
        type: 'list',
        name: 'platform',
        message: 'You can install or update eros sdk and librarys.',
        choices: [{
            name: "eros-sdk | ios ",
            value: "iosDep"
        },{
            name: "eros-sdk | android",
            value: "androidDep"
        },
        new inquirer.Separator(),
        {
            name: "eros-library | components",
            value: "components",
          },
        ]
  }    
]

function select() {
    inquirer.prompt(questions).then(function (answers) {
        var platform = JSON.parse(JSON.stringify(answers)).platform;
        installContainer[platform] && installContainer[platform]();
    }, (error) => {
        erosConsole('input error'.red)
        erosConsole(error)
    });    
}

function iosDep() {
    erosConsole('installing ios sdk...');
    console.time('[' + 'bm-eros'.blue + '] ' + 'ios updating time consuming: '.green);
    var build = Process.exec(path.resolve(process.cwd(), './platforms/ios/WeexEros/install.sh'), { cwd: path.resolve(process.cwd(), './platforms/ios/WeexEros/') }, function(error, stdout, stderr) {
        // window上防止报错
        // if (error !== null) {
        //     erosConsole('exec error: ' + error, 'red');
        //     return;
        // }
        console.timeEnd('[' + 'bm-eros'.blue + '] ' + 'ios updating time consuming: '.green);
    });
    build.stdout.on('data', function(data) {
        console.log(data)
    });
    build.stderr.on('data', function(data) {
        console.log(data)
    });
};

function androidDep() {
    erosConsole('installing android sdk...')
    console.time('[' + 'bm-eros'.blue + '] ' + 'android updating time consuming: '.green);
    var build = Process.exec(path.resolve(process.cwd(), './platforms/android/WeexFrameworkWrapper/install.sh'), { cwd: path.resolve(process.cwd(), './platforms/android/WeexFrameworkWrapper/') }, function(error, stdout, stderr) {
        // if (error !== null) {
        //     erosConsole('exec error: ' + error, 'red');
        //     return;
        // }
        console.timeEnd('[' + 'bm-eros'.blue + '] ' + 'android updating time consuming: '.green);
    });
    build.stdout.on('data', function(data) {
        console.log(data)
    });
    build.stderr.on('data', function(data) {
        console.log(data)
    });
};

function components() {
    erosConsole('installing eros component library...')
    erosUpdate.updateProject('src/js/components/__eros__');
};

var installContainer = {
    select: select,
    iosDep: iosDep,
    androidDep: androidDep,
    components: components
}
module.exports = installContainer