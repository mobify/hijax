define(['hijax', 'jquery132', 'adapter'],
function(Hijax, jQuery, adapter) {
    describe('Hijax proxying tests  (jQuery 1.3.2)', function() {
        var foo;
        var hijax = new Hijax(adapter);

        hijax
            .set('home', '/example/response.json', {
                receive: function(data, xhr) {
                    console.log('Receive!');
                    foo = 'baz';
                },
                complete: function(data, xhr) {
                    foo = 'complete';
                    console.log('Complete!');
                }
            });
            
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

        it('fires the complete event after desktop', function(done) {
            setTimeout(function() {
                assert.equal(foo, 'complete', 'Complete fires after desktop');
                done();
            });
        });
    });
});