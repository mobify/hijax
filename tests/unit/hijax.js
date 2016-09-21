define(['hijax'],
function(Hijax) {
    var hijax = new Hijax();
    describe('Hijax Tests', function() {
        it('creates a Hijax constructor', function() {
            assert.equal(typeof hijax, 'object', 'Hijax created');
        });
        it('creating Hijax multiple times still results in a singleton instance', function() {
            var hijaxA = new Hijax();
            var hijaxB = new Hijax();
            var hijaxC = new Hijax();
            var hijaxD = new Hijax();
            var hijaxE = new Hijax();
            assert.equal(hijaxA, hijaxE);
        });
    });
});