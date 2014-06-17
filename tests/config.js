require.config({
    baseUrl: '../',
    paths: {
        'chai': 'node_modules/chai/chai',
        'mocha': 'node_modules/mocha/mocha',
        'jquery': 'bower_components/jquery/dist/jquery',

        'hijax': '../src/hijax',
        'hijacker': '../src/hijacker'
    },
    'shim': {
        'mocha': {
            init: function() {
                this.mocha.setup('bdd');
                return this.mocha;
            }
        },
        'jquery': {
            exports: 'jQuery'
        }
    }
});
