let base = {}

require('./karma.conf')({
  set (conf) { base = conf }
})

base.webpack.externals = {
  preact: 'preact'
}

module.exports = function(config) {
  config.set(Object.assign({}, base, {
    browsers: ['IE8'],
    frameworks: ['jasmine'],
    files: [
      'http://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.5.7/es5-shim.js',
      'http://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.5.7/es5-sham.js',
      '../dist/preact.js',
      './ie8/index.js'
    ],
    preprocessors: {
      './ie8/index.js': ['webpack', 'sourcemap']
    },
    customLaunchers: {
      IE8: {
        'base': 'IE',
        'x-ua-compatible': 'IE=EmulateIE8'
      }
    }
  }))
}