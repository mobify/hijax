define(['jquery211', 'logger'], function($, log) {
    return function() {
        var $ajaxContainer = $('#ajax-container');

        log('desktop [1]', 'send', 'Sending request.');
        $.get('/example/response.json', function(data, status, xhr) {
            log('desktop [1]', 'receive', 'Data received.');
            $ajaxContainer
                .append(
                    '<p><strong>desktop' +
                    ': </strong>Received data: ' + JSON.stringify(data) + '.</p>'
                );
        });

        log('desktop [2]', 'send', 'Sending request.');
        $.get('/example/response.html', function(data, status, xhr) {
            log('desktop [2]', 'receive', 'Data received.');
            $ajaxContainer
                .append(
                    '<p><strong>desktop' +
                    ': </strong>Received data: <pre>' + data + '</pre>.</p>'
                );
        });
    };
});