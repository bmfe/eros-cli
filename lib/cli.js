/**
* @Author: songqi
* @Date:   2016-07-12
* @Email:  songqi@benmu-health.com
* @Last modified by:   songqi
* @Last modified time: 2016-07-13
*/

var commands = require('./commands');

function helpTitle(){
    commands.helpTitle();
}

function run(cmd){
    commands.run(cmd)
}

module.exports = {
    run: run,
    helpTitle: helpTitle
}
