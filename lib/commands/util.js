var readline = require('readline');

function erosConsole(msg, color) {
    var _color = color || 'white';
    console.log('[' + 'eros'.blue + '] ' + msg[_color]);
}

function readSyncByRl(tips) {
    tips = tips || '> ';
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(tips, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}


module.exports = {
    erosConsole: erosConsole,
    readSyncByRl: readSyncByRl
}