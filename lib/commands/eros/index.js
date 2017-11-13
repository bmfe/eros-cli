var dev = require('./dev'),
    init = require('./init'),
    pack = require('./pack'),
    update = require('./update'),
    install = require('./install');

module.exports = {
    devServer: dev.server,
    devBuild: dev.build,
    initCreate: init.create,
    initCreateProject: init.initCreateProject,

    installSelect: install.select,
    installIosDep: install.iosDep,
    installAndroidDep: install.androidDep,
    installComponents: install.components,

    packSelect: pack.select,
    packIos: pack.ios,
    packAndroid: pack.android,
    packIosHandler: pack.iosHandler,
    packAndroidHandler: pack.androidHandler,

    updateProject: update.updateProject
}