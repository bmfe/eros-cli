var path = require('path'),
    readConfig = require('./readConfig');

var SUPPORT_FILES = ['js', 'vue'];

function getEntry() {
    var entryMap = {};
    readConfig.get('exports') && readConfig.get('exports').map(item => {
        var arr = item.split('.'),
            len = arr.length,
            fItem = arr[len-1],
            subLen = fItem.length + 1,
            entry = fItem === 'vue' ? '?entry=true' : '';

        if ( SUPPORT_FILES.indexOf(fItem) > -1 ) {
            entryMap[item.slice(0, -subLen)] = path.join(process.cwd(), '/src', item + entry);

        }
    });
    return entryMap;
}

function getAlias() {
    var aliasMap = {},
        aliasConfig = readConfig.get('alias');
    for (var i in aliasConfig) {
        if (aliasConfig[i].slice(0, 2) === 'js') {
            aliasMap[i] = path.join(process.cwd(), '/src', aliasConfig[i]);
        } else {
            aliasMap[i] = aliasConfig[i];

        }
    }
    return aliasMap;
}

module.exports = {
    getAlias,
    getEntry
}