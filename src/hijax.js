(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define('hijax',['hijacker'], factory);
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
     * @destFn {Function}:      Target
     * @beforeFn {Function}:    (optional) Runs before destFn
     * @afterFn {Function}:     (optional) Runs after destFn
     */
    function proxyFunction(destFn, beforeFn, afterFn) {
        var proxied = function() {
            var result;

            if (typeof destFn !== 'function') {
                throw destFn + ' is not a function, and cannot be proxied!';
            }
            if (typeof beforeFn === 'function') {
                beforeFn.apply(this, arguments);
            }
            result = destFn.apply(this, arguments);
            if (typeof afterFn === 'function') {
                afterFn.apply(this, arguments);
            }

            return result;
        };

        return proxied;
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

        this.rscProxied = false;
        this.onLoadProxied = false;

        hijax.active++;
        hijax.dispatch('beforeSend', this);
    });

    hijax.proxyXhrMethod('send', function() {
        var xhr = this;

        var receiveHandler = function() {
            if (xhr.readyState !== states.DONE) { return; }
            hijax.dispatch('receive', xhr);
        };
        var completeHandler = function() {
            if (xhr.readyState !== states.DONE) { return; }
            hijax.dispatch('complete', xhr, function() {
                hijax.active--;
            });
        };

        /*
         * Ways to intercept AJAX responses:
         * 1. During send, proxy the desktop handler for load/RSC
         * 2. If no desktop handler is found, we just listen for the RSC event,
         * and fire our handlers. In this case, we lose the capability of
         * proxying the desktop function.
         */
        var proxyDesktopHandlers = function() {
            if (xhr.rscProxied || xhr.onLoadProxied) { return; }

            if (typeof xhr.onload === 'function') {
                // Make original XHR handler available to subscribers
                xhr._originalOnLoadHandler = xhr.onload;
                xhr.onLoadProxied = true;

                xhr.onload = proxyFunction(
                    xhr.onload,
                    receiveHandler,
                    completeHandler
                );
            } else if (typeof xhr.onreadystatechange === 'function') {
                xhr._originalRSCHandler = xhr.onreadystatechange;
                xhr.rscProxied = true;

                // Receive fires continuosly as it receives data, so we have to
                // ensure data reception is complete
                xhr.onreadystatechange = proxyFunction(
                    xhr.onreadystatechange,
                    receiveHandler,
                    completeHandler
                );
            } else {
                // We were unable to find an onload or onRSC handler to proxy
                xhr.addEventListener(
                    'readystatechange',
                    stateChangeHandler,
                    false
                );
            }
        };

        var stateChangeHandler = function() {
            // We've managed to intercept the handlers, so no need to continue
            // listening to the event
            if (xhr.rscProxied || xhr.onLoadProxied) {
                xhr.removeEventListener('readystatechange', stateChangeHandler);
                return;
            }

            // In some cases, handlers are set later by the library,
            // e.g jQuery 2.1. Try to intercept them
            if (typeof xhr.onreadystatechange === 'function' ||
                typeof xhr.onload === 'function') {
                proxyDesktopHandlers();
            }
            else {
                // This is silly, but since we couldn't find a desktop proxy to
                // proxy, we just fire these simultaneously
                // TODO: Find a case where this happens, and do this more
                // elegantly. Possibly by proxying the desktop event handler
                console.warn('Unable to proxy desktop handler. ' +
                    'Firing Hijax receive and complete handlers.');
                receiveHandler();
                completeHandler();
            }
        };

        // Try to set proxies for desktop RSC/onload if they're present
        proxyDesktopHandlers();
    });

    return hijax;
}));

