define(['jquery'], function($) {
    return function() {
        $.get('/example/response.json', function(data, status, xhr) {
            var $ajaxContainer = $('#ajax-container');

            $ajaxContainer
                .append(
                    '<p class="x-desktop"><strong>desktop' +
                    ': </strong>Received data: ' + JSON.stringify(data) + '</p>'
                );
        });

        $.get('/example/response.html', function(data, status, xhr) {
            var $ajaxContainer = $('#ajax-container');

            $ajaxContainer
                .append(
                    '<p class="x-desktop"><strong>desktop' +
                    ': </strong>Received data: ' + data + '</p>'
                );
        });
    };
});