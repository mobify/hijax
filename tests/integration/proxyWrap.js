define(['hijax', 'jquery211', 'proxyWrapAdapter'],
function(Hijax, jQuery, adapter) {
    describe('Hijax XHR native function wrapping', function() {
        it('wraps the native XHR functions once only', function(done) {
            var hijaxA = new Hijax(adapter, true);
            var hijaxB = new Hijax(adapter);
            var hijaxC = new Hijax(adapter);
            var hijaxD = new Hijax(adapter);
            var hijaxE = new Hijax(adapter);
            assert.equal(window.hijaxProxyWrapTest, 0);
            done();
        });
    });
});