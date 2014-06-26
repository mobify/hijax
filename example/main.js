require.config({
    baseUrl: '../../',
    paths: {
        'hijax': '../src/hijax',
        'hijacker': '../src/hijacker',

        // Adapters
        'jQ132Adapter': '../adapters/jquery.1.3.2',

        'logger': 'example/logger',
        'desktop': 'example/desktop',

        'jquery211': 'bower_components/jquery211/dist/jquery',
        'jquery132': 'bower_components/jquery132/jquery'
    },
    shim: {
        'jquery211': {
            exports: '$'
        },
        'jquery132': {
            exports: 'jQuery'
        }
    }
});

define([
    'hijax', 'logger', 'desktop', 'jQ132Adapter'
],
function(Hijax, log, desktop, jQueryAdapter) {
    var hijax = new Hijax(jQueryAdapter);

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