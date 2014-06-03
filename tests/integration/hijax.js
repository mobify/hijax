define([
    'src/hijax',
    'jquery'
],
function(hijax, jQuery) {
    var foo = 'baa';

    beforeEach(function() {
        hijax
            .set('home', '/example/myUrl', {
                receive: function(data, status, xhr) {
                    delete xhr.response;
                    delete xhr.responseText;

                    xhr.response = data.replace(/bar/, 'baz');
                    xhr.responseText = data.replace(/bar/, 'baz');

                    console.log('\n\nReceive', data, xhr);
                }
            });
    });

    describe('Hijax proxying tests', function() {
        it('proxies the AJAX request', function(done) {
            jQuery
                .ajax({
                    url: '/example/myUrl',
                    type: 'GET',
                    success: function(data, status, xhr) {
                        foo = JSON.parse(data).foo;
                        console.log('\n\nGet', xhr);

                        assert.equal(foo, 'baz', 'Foo value is modified by Hijax');
                        done();
                    }
                });
        });
    });
});
