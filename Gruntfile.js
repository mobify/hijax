'use strict';

var path = require('path');

module.exports = function(grunt) {
    var _ = grunt.util._;

    // By default, we load all local tasks from the tasks directory.
    grunt.file.expand('tasks/*').forEach(function(task) {
        grunt.loadTasks(task);
    });

    var npmTasks = [
        'grunt-contrib-connect',
        'grunt-mocha-phantomjs'
    ];

    npmTasks.forEach(function(taskName) {
        if(!grunt.task._tasks[taskName]) {
            grunt.loadNpmTasks(taskName);
        }
    });

    var configPaths = [
        'tasks/config/*'
    ];

    // Populate the config object
    var config = {};
    grunt.file.expand(configPaths).forEach(function(configPath) {
        // Get the grunt-task name to put in the config which is based on the
        // name of the config file
        var configName = configPath.match(/\/([^\/]*)\.js/)[1];
        var option = require(path.join(__dirname + '/' + configPath))(grunt);
        config[configName] = _.extend(config[configName] || {}, option);
    });

    grunt.initConfig(config);

    grunt.registerTask('serve', ['connect:serve:keepalive']);
    grunt.registerTask('test', ['connect:serve', 'mocha_phantomjs']);
};
