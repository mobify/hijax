/* global log */
define(['jquery'], function($) {
    return function() {
        var $ajaxContainer = $('#ajax-container');

        log('desktop', 'Sending AJAX request 1');
        $.get('/example/response.json', function(data, status, xhr) {
            log('desktop', 'Data received');
            $ajaxContainer
                .append(
                    '<p><strong>desktop' +
                    ': </strong>Received data: ' + JSON.stringify(data) + '</p>'
                );
        });

        log('desktop', 'Sending AJAX request 2');
        $.get('/example/response.html', function(data, status, xhr) {
            log('desktop', 'Data received');
            $ajaxContainer
                .append(
                    '<p><strong>desktop' +
                    ': </strong>Received data: <pre>' + data + '</pre></p>'
                );
        });
    };
});