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
    // URL match as function
    var condition = function(url) {
        return (/^\/example\/response\.html/).test(url);
    };
    var log = function(caller, message) {
        $ajaxContainer.append('<p class="x-' + caller + '"><strong>' +
            caller + ': </strong>' + message + '</p>');
    };

    // Instantiate proxy
    hiJax
        .set(
            'proxy1',
            '/example/response.json',
            {
            // Request is being sent
            beforeSend: function(xhr) {
                log(this.name, 'Before send');
            },
            // Any data received
            receive: function(xhr) {
                log(this.name, 'Receiving data...');
            },
            // Request completed (desktop listener has finished processing it)
            complete: function(data, xhr) {
                log(this.name, 'Request complete. (' + typeof data + ')');
            }
        });

    // Multiple listeners can be set on the same proxy
    hiJax.addListener('proxy1', 'complete', function(data, xhr) {
        log(this.name, 'Request complete. (' + typeof data + ')');
    });

    // Instantiate another proxy
    hiJax.set('proxy2', condition, {
        complete: function(data, xhr) {
            log(this.name, 'Request complete. (' + typeof data + ')');
        }
    });

    log('proxies', 'Proxies set');
    desktop();
});