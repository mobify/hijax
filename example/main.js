require.config({
    baseUrl: '../../',
    paths: {
        'utils': 'src/utils',

        'jquery': 'bower_components/jquery/jquery'
    },
    shim: {
        'jquery': {
            exports: '$'
        }
    }
});

define(['src/hijax', 'jquery'], function(hiJax, $) {
    var $ajaxContainer = $('#ajax-container');
    // URL match as function
    var condition = function(url) {
        return (/^\/example\/myUrl$/).test('/example/myUrl');
    };

    function log(caller, message) {
        $ajaxContainer.append('<p><strong>' + caller + ': </strong>' + message + '</p>');
    }

    // Instantiate proxy
    hiJax
        .set('homeListener', '/example/myUrl', {
            beforeSend: function() {
                log(this.name, 'Before send');
            },
            receive: function() {
                log(this.name, 'Receive');
            },
            complete: function() {
                log(this.name, 'Complete');
            }
        });

    hiJax.addListener('homeListener', 'complete', function() {
        log(this.name, 'Complete 2');
    });

    // Listeners can exist independently
    hiJax.set('homeListener2', condition, {
        complete: function() {
            log(this.name, 'Complete');
        }
    });

    $.get('/example/myUrl', function(data, status, xhr) {
        var parsed = JSON.parse(data);
        log('Desktop', 'Received data: ' + data);
    });
});