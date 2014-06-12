require.config({
    baseUrl: '../../',
    paths: {
        'utils': 'src/utils',
        'desktop': 'example/desktop',

        'jquery': 'bower_components/jquery/dist/jquery'
    },
    shim: {
        'jquery': {
            exports: '$'
        }
    }
});

define(['src/hijax', 'jquery', 'desktop'], function(hiJax, $, desktop) {
    var $ajaxContainer = $('#ajax-container');
    // URL match as function
    var condition = function(url) {
        return (/^\/example\/myUrl$/).test('/example/myUrl');
    };
    var log = function(caller, message) {
        $ajaxContainer.append('<p class="x-' + caller + '"><strong>' +
            caller + ': </strong>' + message + '</p>');
    };

    // Instantiate proxy
    hiJax
        .set(
            'proxy1',
            '/example/myUrl',
            {
            // Request is being sent
            beforeSend: function(data, statusText, xhr) {
                log(this.name, 'Before send');
            },
            // Any data received
            receive: function(data, statusText, xhr) {
                log(this.name, 'Receiving data...');
            },
            // Request completed (desktop listener has finished processing it)
            complete: function(data, statusText, xhr) {
                log(this.name, 'Request complete');
            }
        });

    // Multiple listeners can be set on the same proxy
    hiJax.addListener('proxy1', 'complete', function() {
        log(this.name, 'Request complete');
    });

    // Instantiate another proxy
    hiJax.set('proxy2', condition, {
        complete: function(data, statusText, xhr) {
            log(this.name, 'Request complete');
        }
    });

    log('proxies', 'Proxies set');
    desktop();
});