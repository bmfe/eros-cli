/**
 * @Author: songqi
 * @Date:   2016-07-12
 * @Email:  songqi@benmu-health.com
* @Last modified by:   songqi
* @Last modified time: 2016-09-18
 */
var fs = require('fs');
var print = require('../../utils/print');
var commandsNams = fs.readdirSync(__dirname + '/');
var commandsMap = {};
//除私有命令（`_`开头）、文件夹外，所有文件，均作为命令
commandsNams.map(function(obj, i) {
    if (obj.slice(0, 1) !== '_' && obj.slice(0, 1) !== '.' && fs.statSync(__dirname + '/' + obj).isFile()) {
        commandsMap[obj.split('.')[0]] = require(__dirname + '/' + obj);
    }
});

function helpTitle() {
    print.commonPrint();
    for (var i in commandsMap) {
        commandsMap[i]['helpTitle'] && commandsMap[i]['helpTitle'].apply(null, arguments);
    }
}

function run(cmd) {
    var runCmd = commandsMap[cmd[0]];
    runCmd && runCmd.run && runCmd.run(cmd.slice(1));
}

module.exports = {
    run: run,
    helpTitle: helpTitle
}
