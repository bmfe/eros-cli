/**
* @Author: songqi
* @Date:   2016-07-14
* @Email:  songqi@benmu-health.com
* @Last modified by:   songqi
* @Last modified time: 2016-07-14
*/

function createEmptySchema(){
    return {
        name: '',
        version: '',
        mockServer: {
            'port': 52077,
            'mockDir': ''
        },
        openPath: '',
        jsExt: '',
        exports: [],
        alias: {}
    }
}

module.exports = {
    createEmptySchema: createEmptySchema
}
