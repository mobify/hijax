define(['hijacker'],
function(Hijacker) {
    var callbackOne = function() {
        return 1;
    };
    var callbackTwo = function() {
        return 2;
    };
    var hijacker;


    describe('Hijacker listeners', function() {
        beforeEach(function() {
            hijacker = new Hijacker('test', '/', {});
        });

        afterEach(function() {
            if (hijacker) {
                hijacker = null;
            }
        });

        it('adds a listener callback', function() {
            hijacker.addListener('receive', callbackOne);

            assert.include(hijacker.callbacks['receive'], callbackOne, 'A callback has been added.');
        });

        it('removes only one callback when passed a valid callback', function() {
            hijacker.addListener('receive', callbackOne);
            hijacker.addListener('receive', callbackTwo);


            hijacker.removeListener('receive', callbackOne);

            assert.deepEqual(hijacker.callbacks['receive'], [callbackTwo], 'One of two callbacks have been removed');
        });

        it('removes all callbacks when passed no callbacks', function() {
            hijacker.addListener('receive', callbackOne);
            hijacker.addListener('receive', callbackTwo);


            hijacker.removeListener('receive');

            assert.deepEqual(hijacker.callbacks['receive'], [], 'All callbacks have been removed');
        });

        it('removes no callbacks when passed invalid callback', function() {
            hijacker.addListener('receive', callbackOne);
            hijacker.addListener('receive', callbackTwo);

            try {
                hijacker.removeListener('receive', function() { return; });
            } catch (e) {
                assert.deepEqual(hijacker.callbacks['receive'], [callbackOne, callbackTwo], 'No callbacks have been removed.');
            }
        })
    });
});