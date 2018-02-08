/**
 * @Author: songqi
 * @Date:   2016-07-12
 * @Email:  songqi@benmu-health.com
 * @Last modified by:   songqi
 * @Last modified time: 2016-11-10
 */

var fs = require('fs'),
    _ = require('lodash'),
    path = require('path'),
    gulp = require('gulp'),
    http = require('http'),
    https = require('https'),
    connect = require('connect'),
    argv = require('yargs').argv,
    mockServer = require('gulp-mock-server');

var print = require('../../utils/print'),
    corsMiddleware = require('../middleware/cors'),
    proxyMiddleware = require('../middleware/proxy'),
    readConfig = require('../../utils/readConfig');

var mockConfig = {
    port: 52077,
    mockDir: './dist/mock'
}

if (argv.s || argv.ssl) {
    mockConfig['https'] = true;
}


var config = {
    name: 'mock',
    explain: 'start a mock server.',
    command: 'eros mock',
    options: [{
        keys: ['-h', '--help'],
        describe: 'read help.'
    }]
}

function helpTitle() {
    print.title(config);
}

function helpCommand() {
    print.command(config);
}

function listenPort(server, port) {
    server.on('error', function(e) {
        if (e.code === 'EADDRINUSE') {
            print.info('[ERROR]: 端口 ' + port + ' 已经被占用, 请关闭占用该端口的程序或者使用其它端口.');
        }
        if (e.code === 'EACCES') {
            print.info('[ERROR]: 权限不足, 请使用sudo执行.');
        }
        return process.exit(1);
    });
    server.on('listening', function(e) {
        print.log('server 运行成功, 端口为 ' + port);
        print.log('按 Ctrl + C 结束进程');
        gulp.start('start-mock');
    });
    return server.listen(port);
}

function run() {
    if (argv.h || argv.help) {
        helpCommand();
    } else {
        var serverConfig = readConfig.get('server') || {},
            ssl = argv.s || argv.ssl,
            app = connect();
        app.use(corsMiddleware)
            .use(proxyMiddleware());
        if (ssl) {
            var opts = {
                key: fs.readFileSync(path.resolve(process.cwd(), ssl + ".key")),
                cert: fs.readFileSync(path.resolve(process.cwd(), ssl + ".crt"))
            };
            listenPort(https.createServer(opts, app), serverConfig.httpsPort || 443);
        } else {
            listenPort(http.createServer(app), serverConfig.port || 80);
        }
    }
}

module.exports = {
    run: run,
    config: config,
    helpTitle: helpTitle,
    helpCommand: helpCommand
}