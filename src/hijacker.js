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
        var contentType = this.getResponseHeader(xhr, 'Content-Type') ||
            'text/html';
        var knownTypes = {
            'html': /html/,
            'json': /json/,
            'script': /(?:java|ecma)script/
        };

        // Check if this is a known data type, and add it to the stack
        for (var type in knownTypes) {
            if (knownTypes.hasOwnProperty(type) &&
                knownTypes[type].test(contentType)) {
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

        if (!this.condition(xhr.url, xhr)) { return; }

        for (var ctr = 0; ctr < eventCallbacks.length; ctr++) {
            if (event === 'complete' || event === 'receive') {
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

    // Removes the callback specified, or all callbacks for the method if no callback is given
    Hijacker.prototype.removeListener = function(method, cb) {
        var listeners;
        if (!(method in this.callbacks)) {
            throw (method + ' listener does not exist!');
        }

        listeners = this.callbacks[method];

        if (cb) {
            var foundAt = listeners.indexOf(cb);
            if (foundAt < 0) {
                throw (cb + ' callback does not exist!');
            }
            listeners = listeners.slice(0, foundAt).concat(listeners.slice(foundAt + 1));
        } else {
            listeners = [];
        }

        this.callbacks[method] = listeners;
    };

    return Hijacker;
}));
