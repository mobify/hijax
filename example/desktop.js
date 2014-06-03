define(['jquery'], function($) {
    return function() {
        $.get('/example/myUrl', function(data, status, xhr) {
            var parsed = JSON.parse(data);
            var $ajaxContainer = $('#ajax-container');

            $ajaxContainer.append('<p class="x-desktop"><strong>desktop' +
                ': </strong>Received data: ' + data + '</p>');
        });
    };
});