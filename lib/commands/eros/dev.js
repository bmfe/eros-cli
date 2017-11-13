var bmServer = require('../server.js'),
    gulpServer = require('../server/gulpfile');

function server() {
    bmServer.run()
}

function build() {
    gulpServer.start('weex')
}


module.exports = {
    server: server,
    build: build
}