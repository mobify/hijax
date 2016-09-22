define(['hijax'],
function(Hijax) {
    describe('Hijax Tests', function() {
        it('creates a Hijax constructor', function() {
            var hijax = new Hijax();
            assert.equal(typeof hijax, 'object', 'Hijax created');
        });

        it('maintains a singleton instance', function() {
            var hijaxA = new Hijax(null, true);
            var hijaxB = new Hijax();
            var hijaxC = new Hijax();
            var hijaxD = new Hijax();
            var hijaxE = new Hijax();
            assert.equal(hijaxA, hijaxE);
        });

        it('clears singleton instance', function() {
            var hijaxA = new Hijax(null, true);
            var hijaxB = new Hijax();
            var hijaxC = new Hijax(null, true);
            assert.equal(hijaxA, hijaxB);
            assert.notEqual(hijaxA, hijaxC);
        });
    });
});