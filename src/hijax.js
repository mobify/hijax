/* global Hijacker */
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['hijacker'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('hijacker'));
    } else {
        // Browser globals (root is window)
        root.hijax = factory(root.Hijacker);
    }
}(this, function(Hijacker) {
    if (window.hijax) { return window.hijax; }

    /**
     * Proxy destFn, so that beforeFn runs before it, and afterFn runs after it
     *
     * @destFn {Function}: Target
     * @beforeFn {Function}: (optional) Runs before destFn
     * @afterFn {Function}: (optional) Runs after destFn
     */
    function proxyFunction(destFn, beforeFn, afterFn) {
        var _destFn = destFn;
        return function() {
            var result;

            if (typeof destFn !== 'function') {
                throw destFn + ' is not a function, and cannot be proxied!';
            }

            if (typeof beforeFn === 'function') {
                beforeFn.apply(this, arguments);
            }

            result = _destFn.apply(this, arguments);
            if (typeof afterFn === 'function') {
                afterFn.apply(this, arguments);
            }

            return result;
        };
    }

    // XHR states
    var hijax;
    var states = {
        UNSENT: 0,
        OPENED: 1,
        HEADERS_RECEIVED: 2,
        LOADING: 3,
        DONE: 4
    };

    function Hijax() {
        this.proxies = {};

        // Active connections
        this.active = 0;
    }

    Hijax.prototype.getXHRMethod = function(method) {
        return window.XMLHttpRequest.prototype[method];
    };

    Hijax.prototype.setXHRMethod = function(method, value) {
        window.XMLHttpRequest.prototype[method] = value;
    };

    Hijax.prototype.proxyXhrMethod = function(method, before, after) {
        var proxy = proxyFunction(this.getXHRMethod(method), before, after);
        this.setXHRMethod(method, proxy);
    };

    Hijax.prototype.createProxy = function(name, condition, cbs) {
        var proxy = new Hijacker(name, condition, cbs);

        this.proxies[name] = proxy;

        return proxy;
    };

    Hijax.prototype.set = function(name, condition, cbs) {
        // Setter
        return this.createProxy(name, condition, cbs);
    };

    Hijax.prototype.addListener = function(name, method, cb) {
        // Getter
        if (!(name in this.proxies)) {
            throw name + ' proxy does not exist!';
        }
        this.proxies[name].addListener(method, cb);
    };

    // Dispatch current event to all listeners
    Hijax.prototype.dispatch = function(event, xhr, callback) {
        var proxies = this.proxies;
        for (var proxy in proxies) {
            if (proxies.hasOwnProperty(proxy)) {
                proxies[proxy].fireEvent(event, xhr);
            }
        }

        typeof callback === 'function' && callback();
    };

    hijax = window.hijax = new Hijax();

    // Bind events
    hijax.proxyXhrMethod('open', function(method, url) {
        // Store URL
        this.url = url;

        hijax.active++;
        hijax.dispatch('beforeSend', this);
    });

    hijax.proxyXhrMethod('send', function() {
        var xhr = this;

        var receiveHandler = function() {
            hijax.dispatch('receive', xhr);
        };
        var completeHandler = function() {
            // Might be triggered before complete, on RSC
            if (xhr.readyState === states.DONE) {
                hijax.dispatch('complete', xhr, function() {
                    hijax.active--;
                });
            }
        };

        var proxyListeners = function() {
            if (xhr.proxied) { return; }

            // Desktop AJAX might be using onRSC, onload, or listening to the
            // XHR rsc event
            if (typeof xhr.onreadystatechange === 'function') {
                xhr.onreadystatechange = proxyFunction(
                    xhr.onreadystatechange, receiveHandler, completeHandler
                );
                xhr.proxied = true;
            } else if (typeof xhr.onload === 'function') {
                xhr.onload = proxyFunction(
                    xhr.onload, receiveHandler, completeHandler
                );
                xhr.proxied = true;
            } else if (xhr.readyState === states.LOADING) {
                receiveHandler();
            } else if (xhr.readyState === states.DONE) {
                completeHandler();
            }
        };

        xhr.addEventListener(
            'readystatechange',
            proxyListeners,
            false
        );
    });

    return hijax;
}));
