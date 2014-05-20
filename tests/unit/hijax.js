define([
    'src/hijax'
],
function(Hijax) {
    describe('Hijax Tests', function() {
        it('creates a global Hijax instance', function() {
            assert.equal(typeof Hijax, 'object', 'Hijax created');
        });

        it('provides a reference to the global singleton', function() {
            assert.equal(window.hijax, Hijax,
                'Singleton instance is the same as the global instance');
        });
    });
});