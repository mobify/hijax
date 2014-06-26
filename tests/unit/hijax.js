define(['hijax'],
function(Hijax) {
    var hijax = new Hijax();
    describe('Hijax Tests', function() {
        it('creates a Hijax constructor', function() {
            assert.equal(typeof hijax, 'object', 'Hijax created');
        });
    });
});