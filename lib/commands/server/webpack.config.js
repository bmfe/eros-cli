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
        path: resolve('dist'),
        publicPath: resolve('dist/js/'),
        filename: '[name].js',
        chunkFilename: '[chunkhash].js'
    },
    module: {
        rules: [{
            test: /\.vue$/,
            use: [{
                loader: 'weex-loader',
                options: {
                    loaders: {
                        'scss': ['weex-vue-loader/lib/style-loader','sass-loader'],
                        'stylus': ['stylus-loader']
                    }
                }
            }]
        }, {
            test: /\.(jsx?|babel|es6)$/,
            loader: 'babel-loader'
        }]
    },
    resolveLoader: {
        modules: [path.resolve(__dirname, '../../../', 'node_modules')]
    },
    plugins: [
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh-cn/),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        // new webpack.optimize.ModuleConcatenationPlugin(),
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

var startEslint = readConfig.get('eslint') || ''

if(startEslint) {
    webpackConfig.module.rules.unshift({
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: resolve('src'),
        options: {
            formatter: require('eslint-friendly-formatter')
        }
    })
}

if (isDev) {
    webpackConfig.devtool = readConfig.get('webpackDevtool') || 'eval';
    webpackConfig.plugins = webpackConfig.plugins.concat([
        new webpack.DefinePlugin(Object.assign({
        'process.env': {
            NODE_ENV: JSON.stringify('development')
        }
    }, readConfig.get('webpackDevEnv') || []))], readConfig.get('webpackDevPlugins') || []);
} else if (isProd) {

    webpackConfig.devtool = readConfig.get('webpackProdtool') || 'cheap-module-source-map';
    webpackConfig.plugins = webpackConfig.plugins.concat([
        new webpack.DefinePlugin(Object.assign({
        'process.env': {
            NODE_ENV: JSON.stringify(process.env.NODE_ENV) || JSON.stringify('production')
        }
    }, readConfig.get('webpackProdEnv') || [])),
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
function resolve(relativePath) {
    return path.join(process.cwd(), relativePath)
}

module.exports = readConfig.getAllConfig() ? webpack(webpackConfig) : false
