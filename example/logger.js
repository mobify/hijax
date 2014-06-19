define(['jquery'], function($) {
    var $log = $('#log');
    var started = Date.now();

    return function() {
        var caller = arguments[0];
        var args = [].slice.call(arguments, 1);
        var timestamp = Date.now() - started;

        $log.append('<h3><span class="' + caller + '">' +
            caller + '</span><span class="timestamp">' + timestamp +
            'ms</span></h3>' +
            args.join(' ') + '</p>');
    };
});