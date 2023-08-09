var webpack = require('webpack');
const path = require('path');

module.exports = {
    plugins: [
        new webpack.IgnorePlugin({resourceRegExp:/perf_hooks/}),
        new webpack.IgnorePlugin({resourceRegExp:/fs/}),
        new webpack.IgnorePlugin({resourceRegExp:/worker_threads/}),
    ],
    entry: './src/contentScript.ts', // Change this to the entry point of your extension
    output: {
        filename: 'contentScript.js', // Change this to the desired output filename
        path: path.resolve(__dirname, 'dist'), // Change this to the desired output directory
    },
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: { "path": require.resolve("path-browserify") },
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
};