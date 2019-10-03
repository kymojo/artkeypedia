

const path = require('path')
/*
const nodeExternals = require('webpack-node-externals')

module.exports = {
    "entry": "./client/src/app.js",
    "output": {
        "path": __dirname+'/client/public/script',
        "filename": "bundle.js"
    },
    resolve: {
        alias: {
            vue: 'vue/dist/vue.js'
        }
    }
}
*/

const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
    entry: './client/src/app.js',
    module: {
        rules: [
            { test: /\.js$/, use: 'babel-loader', exclude: [ /joi-browser/ ] },
            { test: /\.vue$/, use: 'vue-loader' },
            { test: /\.css$/, use: ['vue-style-loader', 'css-loader'] },
        ]
    },
    output: {
        path: __dirname + '/client/public/script',
        filename: "app.js"
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            'joi$': 'joi-browser',
        },
        extensions: ['*', '.js', '.vue', '.json']
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './client/src/index.html',
            filename: '../index.html'
        }),
        new VueLoaderPlugin(),
    ]
};