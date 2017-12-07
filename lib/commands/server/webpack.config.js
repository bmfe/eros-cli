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

var isDev = argv._[0] === 'dev',
    isProd = argv._[0] === 'build' || argv._[0] === 'pack';


process.noDeprecation = true;
var webpackConfig = {
    entry: getFiles.getEntry(),
    output: {
        // libraryTarget: 'commonjs2',
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
        }, {
            test: /\.js$/,
            include,
            exclude,
            loader: 'babel-loader'
        }]
    },
    resolveLoader: {
        modules: [path.resolve(__dirname, '../../../', 'node_modules')]
    },
    plugins: [
        // new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh-cn/),
        // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
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
    webpackConfig.plugins = webpackConfig.plugins.concat([
        definePlugin, 
        new webpack.LoaderOptionsPlugin({
          minimize: true,
          debug: false
        }),
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: false
          },
          output: {
            comments: false
          },
          sourceMap: false
        })
    ], readConfig.get('webpackProdPlugins') || []);
}


module.exports = webpack(webpackConfig)
