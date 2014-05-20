define([
    'src/hijax',
    'jquery'
],
function(hijax, jQuery) {
    var foo = '';

    beforeEach(function() {
        hijax
            .proxy('home', '/example/myUrl')
            .receive(function(xhr) {
                // Overwrite response from foo: 'bar' to foo: 'baz'
                var responseText = xhr.responseText;

                responseText = responseText.replace(/bar/, 'baz');
                delete xhr.responseText;
                xhr.responseText = responseText;
            });
    });

    describe('Hijax proxying tests', function() {
        it('proxies the AJAX request', function(done) {
            jQuery
                .get('/example/myUrl')
                .done(function(data) {
                    foo = JSON.parse(data).foo;
                    assert.equal(foo, 'baz', 'AJAX value is modified by Hijax');
                    done();
                });
        });
    });
});
