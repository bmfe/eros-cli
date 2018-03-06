const runAndroid = require('./android')
const runIOS = require('./ios.js')

module.exports = {
  runAndroid: runAndroid.runAndroid,
  runIOS: runIOS.runIOS
}

