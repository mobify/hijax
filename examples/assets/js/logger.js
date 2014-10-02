define(['jquery'], function($) {
    var started = Date.now();

    return function(caller, request, eventName) {
        var args = [].slice.call(arguments, 3);
        
        var timestamp = Date.now() - started;

        var $log = $('.log[data-request="' + request + '"]');

        $log.append('<h3><span class="' + eventName + ' ' + caller + '">' +
            caller + '</span><span class="timestamp">' + timestamp +
            'ms</span></h3>' +
            args.join(' ') + '</p>');
    };
});