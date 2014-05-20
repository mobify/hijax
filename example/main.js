require.config({
    baseUrl: '../../',
    paths: {
        'utils': 'src/utils',

        'jquery': 'bower_components/jquery/dist/jquery'
    },
    shim: {
        'jquery': {
            exports: '$'
        }
    }
});

define(['src/hijax', 'jquery'], function(hiJax, $) {
    // Initial AJAX request: .beforeSend
    // Server AJAX response: .receive
    // After handler processing: .complete
    var hijacker = hiJax
        .proxy('home', '/')
        .receive(function(xhr) {
            console.info('This is proxied before the AJAX handler');
        });

    $.get('/', function() {
        console.log('AJAX handler');
    });
});