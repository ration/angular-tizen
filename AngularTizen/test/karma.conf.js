// Karma configuration

module.exports = function (config) {
    config.set({
        // base path that will be used to resolve files and exclude
        basePath: '../',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            "lib/angular/angular.js",
            "lib/angular-mocks/angular-mocks.js",
            // With firefox
            "lib/tau/wearable/js/tau.min.js",
       //     "app/scripts/**/*.js",
            "app/scripts/app.js",
            "app/scripts/services/tizenhttprelay.js",
            "app/scripts/services/webapisService.js",
            "app/scripts/services/androidService.js",
            "test/spec/services/*.js",

        ],

        // list of files / patterns to exclude
        exclude: [],

        // web server port
        port: 8081,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR ||
        //                  LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests
        // whenever any file changes
        autoWatch: true,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['Firefox'],


        // Continuous Integration mode
        // if true, it captures browsers, runs tests, and exits
        singleRun: false
    });
};
