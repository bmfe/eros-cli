/**
 * @Author: songqi
 * @Date:   2017-01-13
 * @Last modified by:   songqi
 * @Last modified time: 2017-03-23
 */

var path = require('path'),
    webpack = require('webpack'),
    argv = require('yargs').argv,
    readConfig = require('../../../utils/readConfig'),
    getFiles = require('../../../utils/getWebpackFiles')

var isDev = argv._[0] === 'dev',
    isProd = argv._[0] === 'build' || argv._[0] === 'pack';


process.noDeprecation = true;
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
            test: /\.vue$/,
            loader: 'weex-loader',
            options: {
                stylus: 'vue-style-loader!css-loader!stylus-loader',
                styl: 'vue-style-loader!css-loader!stylus-loader'
            }
        }, {
            test: /\.(jsx?|babel|es6)$/,
            loader: 'babel-loader',
            options: {
                plugins: [
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
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh-cn/),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.BannerPlugin({
            banner: '// { "framework": "Vue" }\n',
            raw: true
        })
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

if (isDev) {
    definePlugin = new webpack.DefinePlugin(Object.assign({
        'process.env': {
            NODE_ENV: JSON.stringify('development')
        }
    }, readConfig.get('webpackDevEnv') || []))

    webpackConfig.devtool = readConfig.get('webpackDevtool') || 'eval';
    webpackConfig.plugins = webpackConfig.plugins.concat([definePlugin], readConfig.get('webpackDevPlugins') || []);
} else if (isProd) {
    definePlugin = new webpack.DefinePlugin(Object.assign({
        'process.env': {
            NODE_ENV: JSON.stringify('production')
        }
    }, readConfig.get('webpackProdEnv') || []));

    webpackConfig.devtool = readConfig.get('webpackProdtool') || 'cheap-module-source-map';
    webpackConfig.plugins = webpackConfig.plugins.concat([definePlugin], readConfig.get('webpackProdPlugins') || []);
}

module.exports = webpack(webpackConfig)
