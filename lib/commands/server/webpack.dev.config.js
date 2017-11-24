var path = require('path'),
    webpack = require('webpack'),
    argv = require('yargs').argv,
    readConfig = require('../../../utils/readConfig'),
    getFiles = require('../../../utils/getWebpackFiles'),
    BabiliPlugin = require("babili-webpack-plugin");

var include = path.join(process.cwd(), 'src/js/'),
    exclude = [
        path.join(process.cwd(), '/src/js/base_libs'),
        path.join(process.cwd(), '/src/js/baseLibs')
    ];

var isDev = argv._[0] === 'dev',
    isProd = argv._[0] === 'build' || argv._[0] === 'pack';


console.log(123123)
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
            include,
            exclude,
            loader: 'weex-loader',
            options: {
                stylus: 'vue-style-loader!css-loader!stylus-loader',
                styl: 'vue-style-loader!css-loader!stylus-loader'
            }
        }]
    },
    resolveLoader: {
        modules: [path.resolve(__dirname, '../../../', 'node_modules')]
    },
    plugins: [
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh-cn/),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new BabiliPlugin(),
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

module.exports = webpackConfig
