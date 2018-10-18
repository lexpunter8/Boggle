const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpack = require('webpack');
var path = require("path");
module.exports = {
    devtool: 'eval-source-map',
    entry: './src/app.js',
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: 'app.bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.scss$/, 
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'sass-loader']
                })
                    //['css-loader', 'sass-loader'])}
            },
            {
                test: /\.js$/, exclude: /node_modules/, loader: ["source-map-loader", "babel-loader"]
            }
                
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000,
        stats: "errors-only"
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Boggle',
            template: './src/index.html'
        }),
        new ExtractTextPlugin("app.css"),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
      ]
}