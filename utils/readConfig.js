/**
 * @Author: songqi
 * @Date:   2016-07-15
 * @Email:  songqi@benmu-health.com
 * @Last modified by:   songqi
 * @Last modified time: 2017-02-15
 */

var fs = require('fs'),
    _ = require('lodash'),
    path = require('path');

var CONFIG = null;

function readAllConfig() {
    var configPath = path.join(process.cwd(), './config.js'),
        erosDevPath = path.join(process.cwd(), './config/eros.dev.js'),
        erosConfigPath = path.resolve(process.cwd(), './config/eros.native.js');

    // 兼容weex-eros 
    if (fs.existsSync(erosConfigPath) && fs.existsSync(erosDevPath)) {
        var erosDev = require(erosDevPath),
            erosConfig = require(erosConfigPath);

        CONFIG = _.assign({
            weex: true,
            appName: erosConfig.appName,
            hotRefresh: erosConfig.hotRefresh,
            appBoard: erosConfig.appBoard,
            localZipFolder: erosConfig.zipFolder,
            version: erosConfig.version,
            framework: '// { "framework": "Vue" }\n',
            erosNativeJs: erosConfig
        }, erosDev)
        return;
    }
    // 否则只读取项目中的js文件
    if (fs.existsSync(configPath)) {
        CONFIG = require(configPath);
    }

}

function readNativeConfig() {
    return require(path.resolve(process.cwd(), './config/eros.native.js'))
}

function get(key) {
    if (CONFIG && CONFIG[key]) {
        return _.cloneDeep(CONFIG[key]);
    } else {
        return false;
    }
}

function getAllConfig() {
    return CONFIG || false
}
readAllConfig();

module.exports = {
    get: get,
    readNativeConfig:readNativeConfig,
    getAllConfig: getAllConfig
}