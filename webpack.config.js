const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack'); //to access built-in plugins
const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index_bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|css)$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
        }, {
          loader: 'style-loader',
        }, {
          loader: 'css-loader',
        }],
      },
    ],
  },
  devServer: {
    port: 3000
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    })
  ]
}
