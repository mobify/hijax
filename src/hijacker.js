define(['src/utils'], function(utils) {
    function Hijacker(name, condition, callbacks) {
        if (!name || !condition || !callbacks || typeof callbacks !== 'object') {
            throw 'Missing or invalid Hijacker proxy initialization options';
        }

        this.name = name;
        this.condition = typeof condition === 'function' ?
            condition : function(url) { return condition === url; };

        this.callbacks = {
            beforeSend: [],
            receive: [],
            complete: []
        };

        // Set the callbacks that have been provided
        for (var event in callbacks) {
            if (callbacks.hasOwnProperty(event)) {
                this.callbacks[event].push(callbacks[event]);
            }
        }

        return this;
    }

    // Handles an XHR event, like beforeSend, receive or complete
    Hijacker.prototype.fireEvent = function(event, xhr) {
        var eventCallbacks = this.callbacks[event];
        var data = xhr.response;

        if (!this.condition(xhr.url)) { return; }

        for (var ctr = 0; ctr < eventCallbacks.length; ctr++) {
            eventCallbacks[ctr].call(this, data, xhr.statusText, xhr);
        }
    };

    // Adds a listener to the given method queue of the current hijacker
    Hijacker.prototype.addListener = function(method, cb) {
        this.callbacks[method].push(cb);
    };

    return Hijacker;
});
