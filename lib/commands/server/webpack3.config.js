/**
 * @Author: songqi
 * @Date:   2016-07-07
 * @Email:  songqi@benmu-health.com
* @Last modified by:   songqi
* @Last modified time: 2017-09-12
 */

var path = require('path'),
    webpack = require('webpack'),
    argv = require('yargs').argv,
    readConfig = require('../../../utils/readConfig'),
    getFiles = require('../../../utils/getWebpackFiles');

var include = path.join(process.cwd(), 'src/js/'),
    exclude = [
        path.join(process.cwd(), '/src/js/base_libs'),
        path.join(process.cwd(), '/src/js/baseLibs')
    ];

var webpackConfig = {
    entry: getFiles.getEntry(),
    output: {
        path: path.join(process.cwd(), 'dist'),
        publicPath: path.join(process.cwd(), 'dist/js/'),
        filename: '[name].js',
        chunkFilename: '[chunkhash].js'
    },
    module: {
        rules: [{
            test: /\.coffee$/,
            loader: 'coffee-loader',
            include,
            exclude
        }, {
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader'
            ],
            include,
            exclude
        }, {
            test: /\.s[c|a]ss$/,
            use: [
                'style-loader',
                'css-loader',
                'sass-loader'
            ],
            include,
            exclude
        }, {
            test: /\.less$/,
            use: [
                'style-loader',
                'css-loader',
                'less-loader'
            ],
            include,
            exclude
        }, {
            test: /\.(eot|woff|woff2|svg|ttf)([\?]?.*)$/,
            loader: 'file-loader',
            include,
            exclude
        }, {
            test: /\.vue$/,
            include,
            exclude,
            loader: 'vue-loader'
        }, {
            test: /\.(jsx?|babel|es6)$/,
            include,
            exclude,
            loader: 'babel-loader',
            options: {
                plugins: [
                    require('babel-plugin-transform-runtime'),
                    require('babel-plugin-transform-async-to-generator')
                ],
                presets: [
                    require('babel-preset-es2015'),
                    require('babel-preset-stage-0')
                ]
            }
        }]
    },
    resolveLoader: {
        modules: [path.resolve(__dirname, '../../../', 'node_modules')]
    },
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin()
    ],
    resolve: {
        modules: [
            path.resolve(process.cwd(), 'node_modules')
        ],
        extensions: ['.js', '.vue', '.json', '.coffee', '.css', '.less', '.sass'],
        alias: getFiles.getAlias()
    }
};
var definePlugin;
// 根据环境配置参数
if (argv._[0] === 'server') {
    definePlugin = new webpack.DefinePlugin(Object.assign({
        'process.env': {
            NODE_ENV: JSON.stringify('development')
        }
    }, readConfig.get('webpackDevEnv') || []))

    webpackConfig.devtool = readConfig.get('webpackDevtool') || 'eval';
    webpackConfig.plugins = webpackConfig.plugins.concat([definePlugin], readConfig.get('webpackDevPlugins') || []);
} else if (argv._[0] === 'min') {
    definePlugin = new webpack.DefinePlugin(Object.assign({
        'process.env': {
            NODE_ENV: JSON.stringify('production')
        }
    }, readConfig.get('webpackProdEnv') || []));

    webpackConfig.devtool = readConfig.get('webpackProdtool') || 'hidden-source-map';
    webpackConfig.plugins = webpackConfig.plugins.concat([definePlugin], readConfig.get('webpackProdPlugins') || []);
}
if (!readConfig.get('weex') && (argv._[0] === 'server' || argv._[0] === 'min')) {
    module.exports = webpack(webpackConfig);
} else {
    module.exports = false;
}
