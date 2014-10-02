require.config({
    baseUrl: '../',
    paths: {
        'hijax': 'dist/hijax',

        // Adapters
        'adapter': 'adapters/jquery.legacy',

        'logger': 'examples/assets/js/logger',
        'desktop': 'examples/assets/js/desktop',

        // 2.1.1
        'jquery': 'bower_components/jquery211/dist/jquery'
        // 1.3.2
        // 'jquery': 'bower_components/jquery132/jquery'
    },
    shim: {
        'jquery': {
            exports: '$'
        }
    }
});