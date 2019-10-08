module.exports = {
  presets: [
    ['@vue/babel-preset-app', {
      // for tree shacking
      modules: false,
      useBuiltIns: 'entry',
    }],
  ],
  env: {
    test: {
      plugins: ['istanbul'],
    },
  },
}
