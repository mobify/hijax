define(['jquery', 'logger'], function($, log) {
    return function() {
        var $ajaxContainer = $('#js-ajax-target');
        var $sendAjax = $('.js-send-ajax');

        // Initiate AJAX requests
        $sendAjax.on('click', function() {
            var $button = $(this);
            var requestType = $button.data('type');
            var endpoint = '/examples/response.' + requestType;

            log('desktop', requestType, 'send', 'Sending request.');
            $.get(endpoint, function(data) {
                log('desktop', 1, 'receive', 'Processing data.');
                $ajaxContainer.html(requestType === 'html' ? data : JSON.stringify(data));
            });
        });
    };
});