define(['jquery', 'logger'], function($, log) {
    // We execute requests on page ready
    $(function() {
        var $ajaxContainer = $('#ajax-container');

        log('joe', 'send', 'Sending AJAX request 1');
        $.get('/example/response.json', function(data, status, xhr) {
            log('joe', 'receive', 'Data received');
            $ajaxContainer
                .append(
                    '<p><strong>desktop' +
                    ': </strong>Received data: ' + JSON.stringify(data) + '</p>'
                );
        });

        log('jim', 'send', 'Sending AJAX request 2');
        $.get('/example/response.html', function(data, status, xhr) {
            log('jim', 'receive', 'Data received');
            $ajaxContainer
                .append(
                    '<p><strong>desktop' +
                    ': </strong>Received data: <pre>' + data + '</pre></p>'
                );
        });
    });
});