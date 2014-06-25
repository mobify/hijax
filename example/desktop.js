define(['jquery132', 'logger'], function($, log) {
    return function() {
        var $ajaxContainer = $('#ajax-container');

        log('desktop', 'send', 'Sending AJAX request 1.');
        $.get('/example/response.json', function(data, status, xhr) {
            log('desktop', 'receive', 'Data received.');
            $ajaxContainer
                .append(
                    '<p><strong>desktop' +
                    ': </strong>Received data: ' + JSON.stringify(data) + '.</p>'
                );
        });

        log('desktop', 'send', 'Sending AJAX request 2.');
        $.get('/example/response.html', function(data, status, xhr) {
            log('desktop', 'receive', 'Data received.');
            $ajaxContainer
                .append(
                    '<p><strong>desktop' +
                    ': </strong>Received data: <pre>' + data + '</pre>.</p>'
                );
        });
    };
});