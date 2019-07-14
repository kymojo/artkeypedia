const path = require('path')
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