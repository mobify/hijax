require(['config'], function(){
    require(['require',
             'chai',
             'mocha'],
    function(require, chai, mocha){

        var tests = [
            'tests/unit/hijax',
            'tests/unit/hijacker',
            'tests/unit/hijackerListeners',

            'tests/integration/jquery-1.3.2',
            'tests/integration/jquery-2.1.1',

            'tests/integration/conditionParameter'
        ];

        require(tests, function() {
            assert = chai.assert;
            if(window.mochaPhantomJS) {
                return window.mochaPhantomJS.run();
            }
            mocha.timeout(2000);
            mocha.run();
        });
    });
});
