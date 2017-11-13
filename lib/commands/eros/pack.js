var inquirer = require('inquirer'),
    gulpServer = require('../server/gulpfile.js'),
    readSyncByRl = require('./util').readSyncByRl,
    erosConsole = require('./util').erosConsole;


var questions = [{
    type: 'list',
    name: 'platform',
    message: 'what platform you want to packed?',
    choices: [{
        name: "ios",
        value: "ios"
    },{
        name: "android",
        value: "android"
    },]
}]



function select() {
    inquirer.prompt(questions).then(function (answers) {
        var platform = JSON.parse(JSON.stringify(answers)).platform;
        packContainer[platform] && packContainer[platform]();
    }, (error) => {
        erosConsole('input error'.red)
        erosConsole(error)
    });    
}

var packContainer = {
    select: select,
    ios: function() {
        gulpServer.start('weex-eros:ios');
    },
    android: function() {
        gulpServer.start('weex-eros:android');
    }
}

module.exports = packContainer