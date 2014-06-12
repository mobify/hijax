define('src/utils', [], function() {

    /**
     * Sandwiches a given function between two given functions
     */
    function proxy(destFn, beforeFn, afterFn) {
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

            // TODO: Extend properties
            return result;
        };
    }

    return {
        proxy: proxy
    };
});
