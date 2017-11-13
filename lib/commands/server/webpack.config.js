/**
 * @Author: songqi
 * @Date:   2016-07-07
 * @Email:  songqi@benmu-health.com
 * @Last modified by:   songqi
 * @Last modified time: 2017-03-01
 */

var path = require('path'),
    _ = require('lodash'),
    getFiles = require('../../../utils/getFiles');

module.exports = {
    devtool: "eval",
    entry: getFiles.getEntry(),
    output: {
        path: path.join(process.cwd(), "dist"),
        publicPath: path.join(process.cwd(), "dist/js/"),
        filename: "[name].js",
        chunkFilename: "[chunkhash].js"
    },
    module: {
        loaders: [{
            test: /\.coffee$/,
            loader: 'coffee-loader'
        }, {
            test: /\.(jsx?|babel|es6)$/,
            include: path.join(process.cwd(), "src/js/"),
            exclude: /node_modules|bower_components|base_libs|baseLibs/,
            loader: 'babel-loader',
            query: {
                presets: [path.resolve(__dirname, '../../../node_modules/babel-preset-es2015')]
            }
        }, {
            test: /\.vue$/,
            include: path.join(process.cwd(), "src/js/"),
            exclude: /node_modules|bower_components/,
            loader: 'vue-loader',
        }, {
            test: /\.json$/,
            loaders: ['json-loader']
        }, {
            test: /\.css$/,
            loader: 'style-loader!css-loader'
        }, {
            test: /\.scss$/,
            loader: 'style-loader!css-loader!sass-loader'
        }, {
            test: /\.less$/,
            exclude: /node_modules/,
            loader: 'style-loader!css-loader!less-loader'
        }, {
            test: /\.(eot|woff|woff2|svg|ttf)([\?]?.*)$/,
            loader: "file-loader"
        }]
    },
    plugins: [],
    resolveLoader: {
        root: [path.join(__dirname, '../../../', 'node_modules')]
    },
    resolve: {
        extensions: ['', '.js', '.vue', '.json', '.coffee'],
        alias: _.assign(getFiles.getAlias(), {
            vue: 'vue/dist/vue.js'
        })
    }
};