require.config({
    baseUrl: '../',
    paths: {
        'chai': 'node_modules/chai/chai',
        'mocha': 'node_modules/mocha/mocha',

        'jquery211': 'bower_components/jquery211/dist/jquery',
        'jquery132': 'bower_components/jquery132/jquery',

        'adapter': '../adapters/jquery.legacy',

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
        'jquery211': {
            exports: 'jQuery'
        },
        'jquery132': {
            exports: 'jQuery'
        }
    }
});
