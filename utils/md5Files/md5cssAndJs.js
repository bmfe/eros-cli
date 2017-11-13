/**
 * @Author: songqi
 * @Date:   2016-09-14
 * @Email:  songqi@benmu-health.com
 * @Last modified by:   songqi
 * @Last modified time: 2017-03-06
 */

var gulp = require('gulp'),
    md5 = require('./gulpMd5'),
    uglifyJs = require('gulp-uglify'),
    uglifyCss = require('gulp-uglifycss');
// ngAnnotate = require('gulp-ng-annotate');

var readConfig = require('../readConfig')

var MD5LENGTH = readConfig.get('md5Len') || 10;

process.on('message', function(message) {
    var element = message.name,
        pathNum = element.lastIndexOf('/'),
        _path = element.slice(0, pathNum);
    if (message.type === 'js') {
        gulp.task(element, function(done) {
            gulp.src(element)
                // .pipe(ngAnnotate())
                .pipe(uglifyJs())
                .pipe(md5(MD5LENGTH, 'dist/html/**/*.html', {
                    dirLevel: readConfig.get('jsDirLevel') || 1
                }))
                // .pipe(duration(element))
                .pipe(gulp.dest(_path))
                .on('end', function() {
                    process.send({
                        type: 'done'
                    });
                    done();
                });
        });
    } else if (message.type === 'css') {
        gulp.task(element, function(done) {
            gulp.src(element)
                .pipe(uglifyCss())
                .pipe(md5(MD5LENGTH, 'dist/html/**/*.html', {
                    dirLevel: readConfig.get('cssDirLevel') || 1
                }))
                // .pipe(duration(element))
                .pipe(gulp.dest(_path))
                .on('end', function() {
                    process.send({
                        type: 'done'
                    });
                    done();
                });
        });
    }
    gulp.start(element)
});