define(['src/utils'], function(utils) {
    function Hijacker(name, url) {
        this.name = name;
        this.url = url;

        this.callbacks = {
            beforeSend: [],
            receive: [],
            complete: []
        };

        return this;
    }

    Hijacker.prototype.fireEvent = function(event, xhr) {
        var eventCallbacks = this.callbacks[event];

        if (xhr.url !== this.url) { return; }

        for (var ctr = 0; ctr < eventCallbacks.length; ctr++) {
            eventCallbacks[ctr].apply(this, [xhr]);
        }
    };

    Hijacker.prototype.beforeSend = function(cb) {
        this.callbacks.beforeSend.push(cb);
        return this;
    };
    Hijacker.prototype.receive = function(cb) {
        this.callbacks.receive.push(cb);
        return this;
    };
    Hijacker.prototype.complete = function(cb) {
        this.callbacks.complete.push(cb);
        return this;
    };

    return Hijacker;
});
