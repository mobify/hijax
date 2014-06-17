define(['hijacker'],
function(Hijacker) {
    var hijacker = new Hijacker('test', '/', {
        receive: function() {}
    });

    describe('Hijacker Tests', function() {
        it('provides the Hijacker constructor', function(done) {
            assert.equal(typeof Hijacker, 'function',
                'Hijacker constructor created');
            done();
        });

        it('creates a Hijacker instance', function(done) {
            assert.equal(typeof hijacker, 'object',
                'Hijacker instance created');
            done();
        });
    });
});