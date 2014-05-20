module.exports = function(grunt){
    return {
        serve: {
            options: {
                hostname: '0.0.0.0',
                port: (grunt.option('p') || 8888),
                base: '.'
            }
        }
    };
};