define(['jquery', 'logger'], function($, log) {
    return function() {
        var $ajaxContainer = $('#ajax-container');

        log('desktop1', 1, 'send', 'Sending request.');
        $.get('/examples/response.json', function(data, status, xhr) {
            log('desktop1', 1, 'receive', 'Processing data.');
            $ajaxContainer
                .append(
                    '<p><strong>desktop' +
                    ': </strong>Received data: ' + JSON.stringify(data) + '.</p>'
                );
        });

        log('desktop2', 2, 'send', 'Sending request.');
        $.get('/examples/response.html', function(data, status, xhr) {
            log('desktop2', 2, 'receive', 'Processing data.');
            $ajaxContainer
                .append(
                    '<p><strong>desktop' +
                    ': </strong>Received data: <pre>' + data + '</pre>.</p>'
                );
        });
    };
});