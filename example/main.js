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
                log(this.name, 'send', 'Intercepting send...');
            },
            // Receiving response
            receive: function(xhr) {
                log(this.name, 'receive', 'Receiving data...');
            },

            load: function(xhr) {
                log(this.name, 'receive', 'Data loaded');
            },

            // Request completed (desktop listener has finished processing it)
            complete: function(data, xhr) {
                // var dHandler = xhr._originalHandler.toString()
                //     .replace(/\t/g, '  ');
                // log(this.name, 'Desktop handler: ',
                //     '<pre>' + dHandler + '</pre>');
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
});