/**
 * Karma settings
 * @author Bichi Kim <bichi@live.co.kr>
 */
require('./ts-register')
const webpack = require('./webpack.test.config').default
const {join} = require('path')
module.exports = function (config) {
  config.set({
    basePath: '../',
    browsers: ['ChromeHeadless'],
    frameworks: ['mocha', 'chai'],
    reporters: ['spec','coverage-istanbul'],
    files: [
      'config/karma.polyfill.js',
      {pattern: 'test/browser/**/*.spec.js', watched: false},
      {pattern: 'test/browser/**/*.spec.ts', watched: false},
    ],
    exclude: [
      'test/**/*.spec.skip.js',
    ],
    preprocessors: {
      'config/**/*.js': ['webpack', 'sourcemap'],
      'config/**/*.ts': ['webpack', 'sourcemap'],
      'test/browser/**/*.js': ['webpack', 'sourcemap'],
      'test/browser/**/*.ts': ['webpack', 'sourcemap'],
    },

    coverageReporter: {
      // This is for Webstrom coverage reporter
      // Karma coverage won't use this
      dir: '.coverage',
    },
    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly', 'text-summary'],
      dir: join(process.cwd(), '.coverage/browser'),
      fixWebpackSourcePaths: true,
      skipFilesWithNoCoverage: true,
    },
    customLaunchers: {
      ChromeWithoutSecurity: {
        base: 'Chrome',
        flags: ['--disable-web-security'],
      },
      ChromeHeadlessWithoutSecurity: {
        base: 'ChromeHeadless',
        flags: ['--disable-web-security'],
      },
    },
    logLevel: config.LOG_INFO,
    webpack,
    webpackMiddleware: {
      stats: 'errors-only',
      logLevel: 'silent',
      noInfo: true,
    },

    mime: {
      'text/x-typescript': ['ts' ,'tsx'],
    },
  })
}
