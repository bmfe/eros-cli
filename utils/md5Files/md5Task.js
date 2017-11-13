/**
* @Author: songqi
* @Date:   2016-09-14
* @Email:  songqi@benmu-health.com
* @Last modified by:   songqi
* @Last modified time: 2017-03-06
*/

var fs = require('fs'),
    glob = require('glob'),
    path = require('path'),
    childProcess = require('child_process'),
    print = require('../print');

var cpus = require('os').cpus().length;

var versionTask = [],
    writeWorking = false;

function doFork(element, type){
    var n = childProcess.fork(path.resolve(__dirname, './md5cssAndJs.js'));
    n.send({
        type: type,
        name: element
    });
    return n;

}

function writeHtmlVersion(){
    if(writeWorking || !versionTask.length){
        return;
    }else{
        writeWorking = true;
    }
    var _task = versionTask[0];

    _task.ifile && glob(_task.ifile, function(err, files) {
        if (err) return console.log(err);
        files.forEach(function(ilist) {
            var result = fs.readFileSync(ilist, 'utf8').replace(new RegExp('/' + _task.l_filename + '[^a-zA-Z_0-9].*?', "g"), function(sfile_name) {
                return sfile_name.replace(_task.l_filename, _task.l_md5_filename)
            });
            if (result) {
                fs.writeFileSync(ilist, result, 'utf8');
            }
        })
    });
    versionTask.shift();
    writeWorking = false;
    writeHtmlVersion();
}

String.prototype.firstUpperCase=function(){
    return this.replace(/^\S/,function(s){return s.toUpperCase();});
}

function doTask(tasks, type, done){
    var times = +new Date();
        len = cpus > tasks.length ? tasks.length : cpus;
    for(var i=len; i--;){
        (function(){
            var n = doFork(tasks.shift(), type);
            n.on('message', function(message){
                if(message.type === 'done'){
                    if(tasks.length !== 0){
                        n.send({
                            type: type,
                            name: tasks.shift()
                        });
                    }else{
                        n.kill();
                        --len;
                        if(len === 0){
                            print.gulpLog(' min-md5' + type.firstUpperCase() + '：', (+new Date() - times));
                            // 将 version 号写到 html 文件中
                            writeHtmlVersion();
                            done();
                        }
                    }
                }else if(message.type === 'versionTask'){
                    versionTask.push(message)
                }
            })
        })()
    }
}

module.exports = doTask
