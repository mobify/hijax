require.config({
    baseUrl: '../../',
    paths: {
        'utils': 'src/utils',

        'jquery': 'example/jquery-1.11.1'
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
            console.info('This is proxies before the AJAX handler');
        })
        .complete(function(xhr) {
            console.info('This is proxies after the AJAX handler');
        });

    $.get('/', function() {
        console.log('AJAX handler');
    });
});