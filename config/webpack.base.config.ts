/* istanbul ignore file no way to test */
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import path from 'path'
import VueLoaderPlugin from 'vue-loader/lib/plugin'
import webpack, {Configuration} from 'webpack'
import createDefinitions from './create-definitions'

export interface Options {
  env?: any,
}

// read env and assign it
const config = (
  options: Options = {},
): Configuration => {
  const {
    env: envData = {} as any,
  } = options || {} as any
  const config: Configuration = {
    resolve: {
      extensions: ['.js', '.jsx', '.mjs', '.json', '.ts', '.tsx', '.vue', '.stylus', 'styl'],
      alias: {
        'vue$': 'vue/dist/vue.esm.js',
        '@': path.resolve('src'),
      },
    },
    module: {
      rules: [
        {
          test: /\.font\.js/,
          use: [
            'style-loader',
            'css-loader',
            'webfonts-loader',
          ],
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.jsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [
            'vue-style-loader',
            'css-loader',
          ],
        },
        {
          test: /\.styl(us)?$/,
          use: [
            'vue-style-loader',
            'css-loader',
            {
              loader: 'stylus-loader',
            },
          ],
        },
        {
          test: /\.scss?$/,
          use: [
            'vue-style-loader',
            'css-loader',
            {
              loader: 'sass-loader',
            },
          ],
        },
        {
          test: /\.(png|jpe?g|gif)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            name: 'img/[name].[ext]?[hash]',
            fallback: 'file-loader',
            limit: 10000,
          },
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            name: 'fonts/[name].[ext]?[hash]',
            fallback: 'file-loader',
            limit: 10000,
          },
        },
        {
          test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            name: 'media/[name].[ext]?[hash]',
            fallback: 'file-loader',
            limit: 10000,
          },
        },
        {
          test: /\.pug$/,
          oneOf: [
            // this applies to `<template lang="pug">` in Vue components
            {
              resourceQuery: /^\?vue/,
              use: ['pug-plain-loader'],
            },
            // this applies to pug imports inside JavaScript
            {
              use: ['pug-loader'],
            },
          ],
        },
        {
          test: /\.tsx?$/,
          exclude: [/node_modules/],
          use: [
            {
              loader: 'babel-loader',
            },
            {
              loader: 'ts-loader',
              options: {
                appendTsSuffixTo: [/\.vue$/],
                transpileOnly: process.env.TS_TRANSPILE_ONLY === 'true',
                configFile: process.env.TS_PROJECT || 'tsconfig.json',
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new VueLoaderPlugin(),
      new webpack.DefinePlugin({
        'process.env.ENV': JSON.stringify(envData),
        ////
        ...createDefinitions({}, true),
      }),
    ],
  }

  if(!config.plugins) {
    config.plugins = []
  }

  if(process.env.TS_TRANSPILE_ONLY === 'true') {
    config.plugins.push(new ForkTsCheckerWebpackPlugin())
  }
  return config
}

export default config
