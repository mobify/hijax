define([
    'src/utils',
    'src/hijacker'
],
function(utils, Smuggler) {
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

    Hijax.prototype.createProxy = function(name, url) {
        var proxy = new Smuggler(name, url);

        this.proxies[name] = proxy;

        return proxy;
    };

    Hijax.prototype.proxy = function(name, url) {
        // Look for a hijacker with the given name
        if (!url) {
            // Getter
            if (!(name in this.proxies)) {
                throw name + ' proxy does not exist!';
            }
            return this.proxies[name];
        }
        // Setter
        return this.createProxy(name, url);
    };

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
        var preHandler = function() {
            if (xhr.readyState === states.DONE) {
                hijax.dispatch('receive', xhr, function() {
                    hijax.active--;
                });
            }
        };
        var postHandler = function() {
            if(xhr.readyState === states.DONE) {
                hijax.dispatch('complete', xhr);
            }
        };

        xhr.addEventListener('readystatechange',
            function() {
                var result;

                if(typeof xhr.onreadystatechange === 'function') {
                    // Desktop has a RSC handler set
                    preHandler();
                    result = xhr.onreadystatechange.apply(this, arguments);
                    postHandler();
                } else {
                    preHandler();
                    postHandler();
                }

            },
            false
        );

    });

    return hijax;
});
