/* istanbul ignore file no way to test */
import webpack from 'webpack'
import webpackMerge from 'webpack-merge'
import webpackBaseConfigFn from './webpack.base.config'
const webpackBaseConfig = webpackBaseConfigFn()

export default webpackMerge({
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('test'),
      'process.env.PATH_BOOT': JSON.stringify('../test/mock/boot'),
      'process.env.WEBPACK_SRC_ALIAS': JSON.stringify('@'),
      'process.env.PATH_SRC': JSON.stringify('src'),
    }),
  ],
}, webpackBaseConfig)
