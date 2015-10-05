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
    var states = {
        UNSENT: 0,
        OPENED: 1,
        HEADERS_RECEIVED: 2,
        LOADING: 3,
        DONE: 4
    };

    function Hijax(adapter) {
        this.proxies = {};
        this.adapter = adapter;

        // Active connections
        this.active = 0;

        if (!adapter) {
            this.proxyXHREvents();
        } else {
            adapter.init.call(this);
        }
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

    Hijax.prototype.createProxy = function(name, condition, callbacks, options) {
        var proxy = new Hijacker(name, condition, callbacks, options);

        this.proxies[name] = proxy;

        return proxy;
    };

    Hijax.prototype.set = function(name, condition, callbacks, options) {
        // Setter
        return this.createProxy(name, condition, callbacks, options);
    };

    Hijax.prototype.addListener = function(name, method, callback) {
        // Getter
        if (!(name in this.proxies)) {
            throw name + ' proxy does not exist!';
        }
        this.proxies[name].addListener(method, callback);
    };

    Hijax.prototype.removeListener = function(name, method, callback) {
        // Getter
        if (!(name in this.proxies)) {
            throw name + ' proxy does not exist!';
        }

        this.proxies[name].removeListener(method, callback);
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

    // Can be overridden by an adapter
    Hijax.prototype.proxyXHREvents = function() {
        var hijax = this;

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

            // We can't just depend on the readyState being 4 (complete), as desktop
            // libraries sometimes set readyState to 0 after processing
            // (so receive will fire, complete won't). Instead, we just make sure
            // the data isn't incomplete (states 1, 2, 3)
            function isProcessing(xhr) {
                return xhr.readyState >= 1 && xhr.readyState <= 3;
            }

            function receiveHandler() {
                // In case we're coming through the RSCHandler
                if (isProcessing(xhr)) { return; }

                hijax.dispatch('receive', xhr);
            }

            function completeHandler() {
                // In case we're coming through the RSCHandler
                if (isProcessing(xhr)) { return; }

                hijax.dispatch('complete', xhr, function() {
                    hijax.active--;
                });
            }

            /*
             * Ways to intercept AJAX responses:
             * 1. During send, proxy the desktop handler for load/RSC
             * 2. If no desktop handler is found, we just fire our handlers. In
             * this case, we lose the capability of proxying the desktop function.
             */
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

                xhr.onreadystatechange = proxyFunction(
                    xhr.onreadystatechange,
                    receiveHandler,
                    completeHandler
                );
            } else {
                // No handlers found
                if (window.console && console.warn) {
                    console.warn('Couldn\'t find desktop handlers. ' +
                        '`complete` might fire before desktop handler.');
                }
                xhr.onload = proxyFunction(completeHandler, receiveHandler);
            }
        });
    };

    return Hijax;
}));
