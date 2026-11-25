module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    files: ['test-build/tests.js'],
    browsers: ['jsdom'],
    reporters: ['progress'],
    singleRun: true,
    plugins: [
      require('karma-jasmine'),
      require('karma-jsdom-launcher'),
    ],
  });
};