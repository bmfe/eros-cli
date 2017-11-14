#!/usr/bin/env node

/**
 * @Author: songqi
 * @Date:   2016-07-12
 * @Email:  songqi@benmu-health.com
 * @Last modified by:   songqi
 * @Last modified time: 2017-02-21
 */

var cli = require('../lib/cli'),
    argv = require('yargs').argv,
    print = require('../utils/print'),
    logger = require('../utils/logger'),
    packageFile = require('../package.json');

if (argv.v) {
    print.commonPrint();
    logger.success('current version: ' + packageFile.version);
} else if (argv._ && argv._.length) {
    return cli.run(argv._)
} else {
    return cli.helpTitle()
}