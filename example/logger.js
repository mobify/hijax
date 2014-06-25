define(['jquery211'], function($) {
    var $log = $('.log');
    var started = Date.now();

    return function() {
        var caller = arguments[0];
        var classes = arguments.length > 2 &&
            typeof arguments[1] === 'string' ? arguments[1] : '';
        var args = [].slice.call(arguments, classes.length ? 2 : 1);
        
        var timestamp = Date.now() - started;

        $log.append('<h3><span class="' + classes + ' ' + caller + '">' +
            caller + '</span><span class="timestamp">' + timestamp +
            'ms</span></h3>' +
            args.join(' ') + '</p>');
    };
});