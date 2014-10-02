
require(['config'], function() {
    require([
        'config', 'hijax', 'logger', 'desktop', 'adapter'
    ],
    function(config, Hijax, log, desktop, adapter) {
        // Uncomment when using 1.3.2
        // var hijax = new Hijax(adapter);
        var hijax = new Hijax();

        // URL match as function
        var condition = function(url) {
            return (/^\/example\/response\.html/).test(url);
        };

        // Instantiate proxy
        hijax
            .set(
                'homeJSON',
                '/examples/response.json',
                {
                // Request is being sent
                beforeSend: function(xhr) {
                    log(this.name, 1, 'send', 'Intercepting send.');
                },
                // Received response data
                receive: function(data, xhr) {
                    log(this.name, 1, 'receive', 'Intercepting receive.');
                },
                // Request completed (desktop listener has finished processing it)
                complete: function(data, xhr) {
                    log(this.name, 1, 'receive', 'Request complete [listener 1].');
                }
            }, {
                dataParsers: {
                    // Custom parser for json data type
                    // Default parsers: json, text, html, xml
                    json: function(data) {
                        return JSON.parse(data);
                    }
                }
            });

        // Multiple listeners can be set on the same proxy
        hijax.addListener('homeJSON', 'complete', function(data, xhr) {
            log(this.name, 1, 'receive', 'Request complete [listener 2].');
        });

        // Instantiate another proxy
        hijax.set('homeHTML', condition, {
            beforeSend: function(xhr) {
                log(this.name, 2, 'send', 'Intercepting send.');
            },
            receive: function(data, xhr) {
                log(this.name, 2, 'receive', 'Intercepting receive.');
            },
            complete: function(data, xhr) {
                log(this.name, 2, 'receive', 'Request complete.');
            }
        });

        log('hijax', '', 'Proxies set');
        desktop();
    });
});
