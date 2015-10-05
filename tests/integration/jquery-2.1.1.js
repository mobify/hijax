define(['hijax', 'jquery211'],
function(Hijax, jQuery) {
    describe('Hijax proxying tests  (jQuery 2.1.1)', function() {
        var foo;
        var hijax = new Hijax();

        hijax
            .set('home', '/examples/response.json', {
                receive: function(data, xhr) {
                    foo = 'baz';
                },
                complete: function(data, xhr) {
                    foo = 'complete';
                }
            });

        it('proxies the AJAX request', function(done) {
            jQuery
                .ajax({
                    url: '/examples/response.json',
                    type: 'GET',
                    success: function(data, status, xhr) {
                        // Should have a value thanks to the proxy
                        foo = foo || JSON.parse(data).foo;
                        assert.equal(foo, 'baz', 'Foo value is set by Hijax');
                        done();
                    }
                });
        });

        it('fires the complete event after desktop', function() {
            assert.equal(foo, 'complete', 'Complete fires after desktop');
        });
    });
});
