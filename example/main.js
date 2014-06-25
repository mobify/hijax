require.config({
    baseUrl: '../../',
    paths: {
        'hijax': '../src/hijax',
        'hijacker': '../src/hijacker',

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

define(['hijax', 'logger', 'desktop'], function(hiJax, log, desktop) {
    // URL match as function
    var condition = function(url) {
        return (/^\/example\/response\.html/).test(url);
    };

    // Instantiate proxy
    hiJax
        .set(
            'proxy1',
            '/example/response.json',
            {
            // Request is being sent
            beforeSend: function(xhr) {
                log(this.name, 'send', 'Intercepting send.');
            },
            // Received response data
            receive: function(data, xhr) {
                log(this.name, 'receive', 'Receiving data.');
            },
            // Request completed (desktop listener has finished processing it)
            complete: function(data, xhr) {
                log(this.name, 'receive', 'Request complete.');
            }
        });

    // Multiple listeners can be set on the same proxy
    hiJax.addListener('proxy1', 'complete', function(data, xhr) {
        log(this.name, 'receive', 'Request complete (2nd listener).');
    });

    // Instantiate another proxy
    hiJax.set('proxy2', condition, {
        complete: function(data, xhr) {
            log(this.name, 'receive', 'Request complete.');
        }
    });

    log('hijax', '', 'Proxies set');
    desktop();
});