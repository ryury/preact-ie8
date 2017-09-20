let base = {}

require('./karma.conf')({
  set (conf) { base = conf }
})

base.webpack.externals = {
  preact: 'preact'
}

module.exports = function(config) {
  config.set(Object.assign({}, base, {
    frameworks: ['jasmine'],
    browsers: ['IE8'],
    files: [
      'http://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.5.7/es5-shim.js',
      'http://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.5.7/es5-sham.js',
      '../dist/preact.js',
      './ie8/index.js'
    ],
    preprocessors: {
      './ie8/index.js': ['webpack']
    },
    customLaunchers: {
      IE8: {
        'base': 'IE',
        'x-ua-compatible': 'IE=EmulateIE8'
      }
    },
    plugins: [
      'karma-jasmine',
      'karma-mocha-reporter',
      'karma-coverage',
      'karma-webpack',
      'karma-ie-launcher'
    ]
  }))
}