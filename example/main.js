require.config({
    baseUrl: '../../',
    paths: {
        'hijax': '../src/hijax',
        'hijacker': '../src/hijacker',

        'logger': 'example/logger',
        'desktop': 'example/desktop',

        'jquery': 'bower_components/jquery/dist/jquery'
    },
    shim: {
        'jquery': {
            exports: '$'
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
                log(this.name, 'Intercepting send...');
            },
            // Receiving response
            receive: function(xhr) {
                log(this.name, 'Receiving data...');
            },
            // Request completed (desktop listener has finished processing it)
            complete: function(data, xhr) {
                // Fix shitty tabbing
                // var dHandler = xhr._originalHandler.toString()
                //     .replace(/\t/g, '  ');
                // log(this.name, 'Desktop handler: ',
                //     '<pre>' + dHandler + '</pre>');
                log(this.name, 'Request complete.');
            }
        });

    // Multiple listeners can be set on the same proxy
    hiJax.addListener('proxy1', 'complete', function(data, xhr) {
        log(this.name, 'Request complete.');
    });

    // Instantiate another proxy
    hiJax.set('proxy2', condition, {
        complete: function(data, xhr) {
            log(this.name, 'Request complete.');
        }
    });

    log('hijax', 'Proxies set');
});