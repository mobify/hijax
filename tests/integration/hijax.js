define(['hijax','jquery132'],
function(hijax, jQuery) {
    var foo;

    beforeEach(function() {
        hijax
            .set('home', '/example/response.json', {
                receive: function(data, xhr) {
                    foo = 'baz';
                }
            });
    });

    describe('Hijax proxying tests', function() {
        it('proxies the AJAX request', function(done) {
            jQuery
                .ajax({
                    url: '/example/response.json',
                    type: 'GET',
                    success: function(data, status, xhr) {
                        // Should have a value thanks to the proxy
                        foo = foo || JSON.parse(data).foo;
                        assert.equal(foo, 'baz', 'Foo value is set by Hijax');
                        done();
                    }
                });
        });
    });
});
