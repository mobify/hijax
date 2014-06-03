/*
TODO: Test with devices
TODO: Test with multiple versions of Zepto, jQuery, Prototype, etc.
*/
define([
    'src/utils',
    'src/hijacker'
],
function(utils, Hijacker) {
    if (window.hijax) { return window.hijax; }

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
        var proxy = utils.proxy(this.getXHRMethod(method), before, after);
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
            if(proxies.hasOwnProperty(proxy)) {
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
            hijax.dispatch('receive', xhr, function() {
                hijax.active--;
            });
        };
        var completeHandler = function() {
            if(xhr.readyState === states.DONE) {
                hijax.dispatch('complete', xhr);
            }
        };

        var proxyListeners = function() {
            if(xhr.proxied) { return; }
            xhr.onreadystatechange = utils.proxy(
                xhr.onreadystatechange, receiveHandler, completeHandler
            );
            xhr.proxied = true;
        };

        // We are not guaranteed to have an onRSC method on the XHR object.
        // For example, jQuery fires off send before settings the XHR's
        // onRSC method
        if(typeof xhr.onreadystatechange === 'function' && !xhr.proxied) {
            proxyListeners();
        } else {
            // TODO: Figure out how to sandwich any desktop methods between
            // pre and post
            xhr.addEventListener(
                'readystatechange',
                proxyListeners,
                false
            );
        }
    });

    return hijax;
});
