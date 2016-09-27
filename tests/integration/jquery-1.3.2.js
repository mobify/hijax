define(['hijax', 'jquery132', 'adapter'],
function(Hijax, jQuery, adapter) {
    describe('Hijax proxying tests  (jQuery 1.3.2)', function() {
        var foo;
        var hijax;

        before(function() {
            window.jQuery = jQuery; // So that the legacy adapter uses the right version of jQuery

            hijax = new Hijax(adapter, true);
            hijax
                .set('jquery-1.3.2', '/examples/response.json', {
                    receive: function() {
                        foo = 'baz';
                    },
                    complete: function() {
                        foo = 'complete';
                    }
                });
        });
            
        it('proxies the AJAX request', function(done) {
            jQuery
                .ajax({
                    url: '/examples/response.json',
                    type: 'GET',
                    success: function(data) {
                        // Should have a value thanks to the proxy
                        foo = foo || JSON.parse(data).foo;
                        assert.equal(foo, 'baz', 'Foo value is set by Hijax');
                        done();
                    }
                });
        });

        it('fires the complete event after desktop', function(done) {
            setTimeout(function() {
                assert.equal(foo, 'complete', 'Complete fires after desktop');
                done();
            });
        });
    });
});