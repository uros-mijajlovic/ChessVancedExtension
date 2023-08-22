const path = require('path');

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
};