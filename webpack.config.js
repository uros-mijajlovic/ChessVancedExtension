const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
module.exports = {
  entry: {
    contentScriptWrapper: './dist/contentScriptWrapper.js',
    contentScript: './dist/contentScript.js',
    backgroundScript: './dist/backgroundScript.js',
    mainOffscreenScript: './dist/offscreen/mainOffscreenScript.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'distWebpack'),
  },
  optimization: {
    'minimize': true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        compress: {
          pure_funcs: [
            'console.log',
            'console.info',
            'console.debug',
            'console.warn'
          ]
        }
      }
    })],
  },
};