require.config({
    baseUrl: '../../',
    paths: {
        'desktop': 'example/desktop',
        'hijax': '../src/hijax',
        'hijacker': '../src/hijacker',

        'jquery': 'bower_components/jquery/dist/jquery'
    },
    shim: {
        'jquery': {
            exports: '$'
        }
    }
});

define(['hijax', 'jquery', 'desktop'], function(hiJax, $, desktop) {
    var $ajaxContainer = $('#ajax-container');
    var $log = $('#log');

    var started = Date.now();

    // URL match as function
    var condition = function(url) {
        return (/^\/example\/response\.html/).test(url);
    };
    window.log = function() {
        var caller = arguments[0];
        var args = [].slice.call(arguments, 1);
        var timestamp = Date.now() - started;

        $log.append('<small><span class="x-' + caller + '">' +
            caller + '</span><span class="x-timestamp">' + timestamp +
            'ms</span></small>' +
            args.join(' ') + '</p>');
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

    log('Hijax', 'Proxies set');
    desktop();
});