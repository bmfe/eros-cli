var fs = require('fs'),
    path = require('path'),
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
 var androidZipTarget = path.resolve(process.cwd(), './platforms/' + readConfig.get('localZipFolder').android),
     gradlePropertiesPath = path.resolve(process.cwd(), './platforms/android/WeexFrameworkWrapper/gradle.properties'),
     erosNativeJs = readConfig.get('erosNativeJs');

    console.log(); 
    erosConsole('compile done! start to pack.'.green);
    erosConsole('write -----> gradle.properties');
    // changeFile(gradlePropertiesPath, '{{UMENG_APPKEY}}', erosNativeJs.umeng.androidAppKey)
    // changeFile(gradlePropertiesPath, '{{GETUI_APPID}}', erosNativeJs.getui.appId)
    // changeFile(gradlePropertiesPath, '${GETUI_APPKEY}', erosNativeJs.getui.appKey)
    // changeFile(gradlePropertiesPath, '${GETTUI_APPSECRET}', erosNativeJs.getui.appSecret)
    
    var content = fs.readFileSync(gradlePropertiesPath, 'utf8'),
    prefix = '#start',
    endfix = '#end',
    preIndex = content.lastIndexOf(prefix),
    endIndex = content.lastIndexOf(endfix) + prefix.length;

    let info = `
#start
UMENG_APPKEY=${erosNativeJs.umeng.androidAppKey}
GETUI_APPID=${erosNativeJs.getui.appId}
GETUI_APPKEY=${erosNativeJs.getui.appKey}
GETTUI_APPSECRET=${erosNativeJs.getui.appSecret}
#end
`
    fs.writeFileSync(gradlePropertiesPath, content.slice(0, preIndex).concat(info), 'utf8');    

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