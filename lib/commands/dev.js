/**
 * @Author: songqi
 * @Date:   2016-07-12
 * @Email:  songqi@benmu-health.com
 * @Last modified by:   songqi
 * @Last modified time: 2016-09-18
 */

var fs = require('fs'),
    path = require('path'),
    http = require('http'),
    https = require('https'),
    connect = require('connect'),
    argv = require('yargs').argv,
    serveIndex = require('serve-index'),
    print = require('../../utils/print'),
    logger = require('../../utils/logger'),
    serveStatic = require('serve-static'),
    readConfig = require('../../utils/readConfig');

var gulpServer = require('./server/gulpfile'),
    proxyMiddleware = require('../middleware/proxy'),
    prdToTestMiddleware = require('../middleware/prdToTest'),
    corsMiddleware = require('../middleware/cors');

var config = {
    name: 'dev',
    explain: 'start dev server.',
    command: 'eros dev',
    options: [{
        keys: ['-h', '--help'],
        describe: 'read help.'
    }, {
        keys: ['-s', '--ssl'],
        describe: 'import https ssl crt and key.'
    }]
}

function helpTitle() {
    print.title(config)
}

function helpCommand() {
    print.command(config)
}

function listenPort(server, port) {
    server.on('error', function(e) {
        if (e.code === 'EADDRINUSE') {
            logger.fatal('[ERROR]: Port ' + port + ' already occupied, please close the program that occupies the port or use other ports.');
        }
        if (e.code === 'EACCES') {
            logger.fatal('[ERROR]: Insufficient permissions, please use sudo to execute.');
        }
        return process.exit(1);
    });
    server.on('listening', function(e) {
        gulpServer.start('dev');
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
            .use(prdToTestMiddleware())
            .use(proxyMiddleware())
            .use(serveStatic(path.join(process.cwd(), serverConfig.path || '../')))
            .use(serveIndex(path.join(process.cwd(), serverConfig.path || '../')));
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