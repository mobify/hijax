define(['jquery'], function ($) {
    var started = Date.now();

    return function (caller, eventName) {
        var args = [].slice.call(arguments, 3);

        var $log = $('#js-log');
        var timestamp = Date.now() - started;

        $log.append('<h3><span class="' + eventName + ' ' + caller + '">' +
            caller + '</span><span class="timestamp">' + timestamp +
            'ms</span></h3>' +
            args.join(' ') + '</p>')
            // Scroll to the bottom to see new log messages
            .prop('scrollTop', $log.prop('scrollHeight'));
    };
});