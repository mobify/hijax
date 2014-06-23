(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define('hijacker',[], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.Hijacker = factory();
    }
}(this, function() {
    function Hijacker(name, condition, callbacks, options) {
        options = options || {};

        if (!name || !condition || !callbacks ||
            typeof callbacks !== 'object') {
            throw 'Missing or invalid Hijacker proxy initialization options';
        }

        this.name = name;
        this.condition = typeof condition === 'function' ?
            condition : function(url) { return condition === url; };

        this.callbacks = {
            beforeSend: [],
            receive: [],
            load: [],
            complete: []
        };

        var defaultParsers = {
            'text': String,
            'html': function(html) { return html; },
            'xml': function(xml) { return xml; },
            'json': JSON.parse
        };

        // Custom parsers for data types
        var parsers = this.dataParsers = defaultParsers;
        var customParsers = options.dataParsers;

        if (customParsers) {
            for (var parser in customParsers) {
                if (customParsers.hasOwnProperty(parser)) {
                    this.dataParsers[parser] = customParsers[parser];
                }
            }
        }

        // Set the callbacks that have been provided
        for (var event in callbacks) {
            if (callbacks.hasOwnProperty(event)) {
                this.callbacks[event].push(callbacks[event]);
            }
        }

        return this;
    }

    var states = {
        UNSENT: 0,
        OPENED: 1,
        HEADERS_RECEIVED: 2,
        LOADING: 3,
        DONE: 4
    };

    // Get a particular response header value by key
    // Extracted from jQuery 2.1.1
    Hijacker.prototype.getResponseHeader = function(xhr, key) {
        var rHeaders = /^(.*?):[ \t]*([^\r\n]*)$/mg;
        var match;
        var responseHeadersString;

        if ([states.HEADERS_RECEIVED, states.LOADING, states.DONE]
                .indexOf(xhr.readyState) > -1) {

            responseHeadersString = xhr.getAllResponseHeaders();

            if (!this.responseHeaders) {
                this.responseHeaders = {};
                while ((match = rHeaders.exec(responseHeadersString))) {
                    this.responseHeaders[match[1].toLowerCase()] = match[2];
                }
            }
            match = this.responseHeaders[key.toLowerCase()];
        }
        return match === null ? null : match;
    };

    // Data parse methods adapted from jQuery 2.1.1
    function getResponses(xhr) {
        var responses = {};
        var responseFields = {
            'text': 'responseText',
            'json': 'responseJSON',
            'xml': 'responseXML'
        };

        // What responses are available?
        for (var rType in responseFields) {
            if (xhr.hasOwnProperty(responseFields[rType])) {
                responses[rType] = xhr[responseFields[rType]];
            }
        }

        return responses;
    }

    // Check which response types have been provided by the server
    Hijacker.prototype.getResponseHeaderType = function(xhr) {
        var detectedTypes = [];
        var contentType = this.getResponseHeader(xhr, 'Content-Type');
        var knownTypes = {
            'html': /html/,
            'json': /json/,
            'script': /(?:java|ecma)script/
        };

        // Check if this is a known data type, and add it to the stack
        for (var type in knownTypes) {
            if (knownTypes[type] && knownTypes[type].test(contentType)) {
                return type;
            }
        }

        return 'text';
    };

    // Detect the type of response, and convert it to a usable type
    Hijacker.prototype.parseResponse = function(xhr) {
        var parsers = this.dataParsers;
        var responseHeaderType = this.getResponseHeaderType(xhr);
        var responses = getResponses(xhr);

        if (responses[responseHeaderType]) {
            // A parsed response has been provided
            return responses[responseHeaderType];
        } else if (parsers[responseHeaderType]) {
            // We can convert this data type using a parser
            return parsers[responseHeaderType](xhr.response || xhr.responseText);
        }

        // TODO: Injecting scripts into DOM?

        // Response as string
        return xhr.responseText;
    };

    // Handles an XHR event, like beforeSend, receive or complete
    Hijacker.prototype.fireEvent = function(event, xhr) {
        var eventCallbacks = this.callbacks[event];

        if (!this.condition(xhr.url)) { return; }

        for (var ctr = 0; ctr < eventCallbacks.length; ctr++) {
            if (event === 'complete' || event === 'load') {
                // Include parsed data
                eventCallbacks[ctr].call(this, this.parseResponse(xhr), xhr);
            } else {
                eventCallbacks[ctr].call(this, xhr);
            }
        }
    };

    // Adds a listener to the given method queue of the current hijacker
    Hijacker.prototype.addListener = function(method, cb) {
        this.callbacks[method].push(cb);
    };

    return Hijacker;
}));

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
            hijax.dispatch('receive', xhr);
        };
        var loadHandler = function() {
            hijax.dispatch('load', xhr);
        };
        var completeHandler = function() {
            hijax.dispatch('complete', xhr, function() {
                hijax.active--;
            });
        };

        var proxyDesktopHandlers = function() {
            if (xhr.rscProxied && xhr.onLoadProxied) { return; }

            if (typeof xhr.onreadystatechange === 'function') {
                xhr._originalRSCHandler = xhr.onreadystatechange;
                xhr.rscProxied = true;

                xhr.onreadystatechange = proxyFunction(
                    xhr.onreadystatechange,
                    function() {
                        if (xhr.readyState === states.DONE) {
                            loadHandler();
                        }
                    },
                    function() {
                        if (xhr.readyState === states.DONE) {
                            completeHandler();
                        }
                    }
                );
            }

            if (typeof xhr.onload === 'function') {
                // Make original XHR handler available to subscribers
                xhr._originalOnLoadHandler = xhr.onload;
                xhr.onLoadProxied = true;

                xhr.onload = proxyFunction(
                    xhr.onload,
                    loadHandler,
                    completeHandler
                );
            }
        };

        var stateChangeHandler = function() {
            // In some cases, handlers are set later by the library,
            // e.g jQuery 2.1. Try to intercept them
            if (xhr.readyState === states.HEADERS_RECEIVED) {
                receiveHandler();
            } else if (xhr.readyState === states.DONE) {
                // This is silly, but since we couldn't find a desktop proxy to
                // proxy, we just fire these simultaneously
                // TODO: Find a case where this happens, and do this more
                // elegantly. Possibly by proxying the desktop event handler
                loadHandler();
                completeHandler();
            }
        };

        // Try to set proxies for desktop RSC/onload if they're present
        proxyDesktopHandlers();

        if (!xhr.rscProxied && !xhr.onLoadProxied) {
            // We were unable to find an onload or onRSC handler to proxy
            xhr.addEventListener(
                'readystatechange',
                stateChangeHandler,
                false
            );
        }
    });

    return hijax;
}));


