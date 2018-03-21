var fs = require("fs"),
    path = require("path"),
    logger = require('../../../utils/logger');

const LOG_POSITION = path.resolve(__dirname, 'log.txt')
function getIPAddress(){  
    var interfaces = require('os').networkInterfaces();  
    for(var devName in interfaces){  
          var iface = interfaces[devName];  
          for(var i=0;i<iface.length;i++){  
               var alias = iface[i];  
               if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){  
                     return alias.address;  
               }  
          }  
    }  
}

function isIPChanged(ip) {
    const recordIp = fs.readFileSync(LOG_POSITION) 
    return recordIp != ip
}

function iPRecord(ip) {
    fs.writeFile(LOG_POSITION, ip,  function(err) {
     if (err) {
         return logger.fatal(err);
     }
  });
}

module.exports = {
    iPRecord: iPRecord,
    getIPAddress: getIPAddress,
    isIPChanged: isIPChanged
}