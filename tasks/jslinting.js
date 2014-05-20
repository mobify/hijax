module.exports = {
    targets: [
        'main.js',
        'adaptation/**/*.js',
        'assets/**/*.js',
        '!adaptation/bower_components/**',
        '!assets/bower_components/**',
        '!node_modules/**'
    ],
    excludes: [
        'node_modules/**',
        'adaptation/bower_components/**',
        'assets/bower_components/**',
        'build',
        'saved',
        'assets/js/pikabu.js',
        'assets/js/bellows.js',
        'assets/fonts/**'
    ]
};