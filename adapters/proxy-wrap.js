(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.jQueryAdapter = factory();
    }
}(this, function() {
    return {
        init: function(doc) {
            var hijax = this;

            // ======================================
            // Check if we've already proxied the native XHR functions
            if (!window.hijaxProxyWrapTest) {
                window.hijaxProxyWrapTest = 0;
            }
            var xhrMethod = this.getXHRMethod('open');
            if (/destFn/i.test(xhrMethod.toString())) {
                window.hijaxProxyWrapTest++;
            }
            // ======================================

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
        }
    };
}));
