define(['hijax', 'jquery211'],
function(Hijax, jQuery) {
    describe('Hijax URL Condition tests', function() {
        var urlIsEqual;
        var hijax = new Hijax();
        var foo;

        hijax
            .set('home', function(url, xhr) {
                urlIsEqual = (url === xhr.url);
                return urlIsEqual;
            }, {
                receive: function() {
                    foo = 'baz';
                },
                complete: function() {
                    foo = 'complete';
                }
            });
            
        it('passes xhr as part of condition function', function(done) {
            jQuery
                .ajax({
                    url: '/examples/response.json',
                    type: 'GET',
                    success: function(data) {
                        // Should have a value thanks to the proxy
                        foo = foo || JSON.parse(data).foo;
                        assert.equal(urlIsEqual, true, 'urlIsEqual value is set by Hijax');
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