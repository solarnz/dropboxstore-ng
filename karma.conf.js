'use strict';
module.exports = function(config) {
  config.set({
    basePath: './',
    frameworks: ['jasmine'],
    browsers: ['PhantomJS'],
    preprocessors: {
      'src/**/!(*.spec|*.mock)+(.js)': ['coverage']
    },
    'babelPreprocessor': {
      options: {
        sourceMap: 'inline',
      }
    },
    coverageReporter: {
      type : 'html',
      dir : 'coverage/',
    },
  });
};
