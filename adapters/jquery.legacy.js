/* global hijax */
/*
 * Hijax adapter for legacy jQuery versions.
 * 
 * Tested on: jQuery 1.3.2
 *
 */
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

            hijax.proxyXhrMethod('open', function(method, url) {
                var xhr = this;

                // Store URL
                xhr.url = url;

                hijax.active++;

                // Before Send
                hijax.dispatch('beforeSend', xhr);

                // Receive
                xhr.onload = function() {
                    hijax.dispatch('receive', xhr);
                };
            });

            // Complete
            jQuery(document).bind('ajaxComplete', function(ev, xhr, jqXHR) {
                hijax.dispatch('complete', xhr, function() {
                    hijax.active--;
                });
            });
        }
    };
}));
