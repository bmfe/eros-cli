var path = require('path'),
    jsonfile = require('jsonfile'),
    shell = require('shelljs');

var readConfig = require('../readConfig');

function erosConsole(msg, color) {
 var _color = color || 'white';
    console.log('['+'eros'.blue+'] ' + msg[_color]);
}


function iosHandler(params) {
 var iosZipTarget = path.resolve(process.cwd(), './platforms/' + readConfig.get('localZipFolder').iOS);

    console.log();
    erosConsole('compile done! start to pack.'.green);
    erosConsole('copy  -----> bundle.zip');
    shell.cp('-r' , params.jsZipPath, iosZipTarget + '/bundle.zip');
    erosConsole('write -----> eros.native.json');
    jsonfile.writeFileSync(path.resolve(iosZipTarget, 'eros.native.json'), params.erosNative);
    erosConsole('write -----> bundle.config');
    jsonfile.writeFileSync(path.resolve(iosZipTarget, 'bundle.config'), params.bundleConfig);
    console.log();
    erosConsole('packing success!'.green);
    erosConsole('ios bundle zip has packing to: ' +  iosZipTarget);
}

function androidHandler(params) {
 var androidZipTarget = path.resolve(process.cwd(), './platforms/' + readConfig.get('localZipFolder').android);
 
    console.log(); 
    erosConsole('compile done! start to pack.'.green);
    erosConsole('copy  -----> bundle.zip');
    shell.cp('-r' , params.jsZipPath, androidZipTarget + '/bundle.zip');
    erosConsole('write -----> eros.native.json');
    jsonfile.writeFileSync(path.resolve(androidZipTarget, 'eros.native.json'), params.erosNative);     
    erosConsole('write -----> bundle.config');
    jsonfile.writeFileSync(path.resolve(androidZipTarget, 'bundle.config'), params.bundleConfig);     
    console.log();
    erosConsole('packing success!'.green);
    erosConsole('android bundle zip has packing to: ' +  androidZipTarget);
}

module.exports = {
    packIosHandler: iosHandler,
    packAndroidHandler: androidHandler
}