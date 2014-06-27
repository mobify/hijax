require.config({
    baseUrl: '../../',
    paths: {
        'hijax': '../src/hijax',
        'hijacker': '../src/hijacker',

        // Adapters
        'jQ132Adapter': '../adapters/jquery.1.3.2',

        'logger': 'example/logger',
        'desktop': 'example/desktop',

        // 2.1.1
        'jquery': 'bower_components/jquery211/dist/jquery',
        // 1.3.2
        // 'jquery': 'bower_components/jquery132/jquery'
    },
    shim: {
        'jquery': {
            exports: '$'
        }
    }
});

define([
    'hijax', 'logger', 'desktop', 'jQ132Adapter'
],
function(Hijax, log, desktop, jQueryAdapter) {
    // Uncomment when using 1.3.2
    // var hijax = new Hijax(jQueryAdapter);
    var hijax = new Hijax();

    // URL match as function
    var condition = function(url) {
        return (/^\/example\/response\.html/).test(url);
    };

    // Instantiate proxy
    hijax
        .set(
            'proxy1',
            '/example/response.json',
            {
            // Request is being sent
            beforeSend: function(xhr) {
                log(this.name, 1, 'send', 'Intercepting send.');
            },
            // Received response data
            receive: function(data, xhr) {
                log(this.name, 1, 'receive', 'Intercepting receive.');
            },
            // Request completed (desktop listener has finished processing it)
            complete: function(data, xhr) {
                log(this.name, 1, 'receive', 'Request complete [listener 1].');
            }
        });

    // Multiple listeners can be set on the same proxy
    hijax.addListener('proxy1', 'complete', function(data, xhr) {
        log(this.name, 1, 'receive', 'Request complete [listener 2].');
    });

    // Instantiate another proxy
    hijax.set('proxy2', condition, {
        beforeSend: function(xhr) {
            log(this.name, 2, 'send', 'Intercepting send.');
        },
        receive: function(data, xhr) {
            log(this.name, 2, 'receive', 'Intercepting receive.');
        },
        complete: function(data, xhr) {
            log(this.name, 2, 'receive', 'Request complete.');
        }
    });

    log('hijax', '', 'Proxies set');
    desktop();
});