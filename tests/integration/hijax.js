define([
    'src/hijax',
    'jquery'
],
function(hijax, jQuery) {
    var foo = 'baa';

    // beforeEach(function() {
    //     hijax
    //         .set('home', '/example/myUrl', {
    //             complete: function(data, status, xhr) {
    //                 foo = 'baz';
    //             }
    //         });
    // });

    // describe('Hijax proxying tests', function() {
    //     it('proxies the AJAX request', function(done) {
    //         jQuery
    //             .get('/example/myUrl', function(data) {
    //                 foo = JSON.parse(data).foo;
    //                 done();
    //             });

    //         assert.equal(foo, 'baz', 'AJAX value is modified by Hijax');
    //     });
    // });
});
