module.exports = function(grunt) {
    var jslint = require('../jslinting');

    return {
        options: {
            config: 'node_modules/mobify-code-style/javascript/.jscsrc',
            excludeFiles: jslint.excludes
        },
        src: jslint.targets
    };
};