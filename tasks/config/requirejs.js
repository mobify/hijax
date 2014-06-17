var path = require("path");

module.exports = function(grunt) {
    var options = {
        baseUrl: 'src',
        name: 'hijax',
        removeCombined: true,
        optimize: 'none',
        out: 'dist/hijax.js'
    };

    return {
        dev: {
            options: options
        },

        prod: {
            options: grunt.util._.extend(
                grunt.util._.clone(options),
                {
                    // Only uglify2 minification works with source maps
                    optimize: 'uglify2',
                    out: './dist/hijax.min.js'
                }
            )
        }
    };
};