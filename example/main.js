require.config({
    baseUrl: '../../',
    paths: {
        'utils': 'src/utils',

        'jquery': 'bower_components/jquery/jquery'
    },
    shim: {
        'jquery': {
            exports: '$'
        }
    }
});

define(['src/hijax', 'jquery'], function(hiJax, $) {
    var $ajaxContainer = $('#ajax-container');

    // Instantiate proxy
    hiJax
        .set('home', '/example/myUrl', {
            beforeSend: function() {
                console.log('Before send');
            }
        });

    hiJax.addListener('home', 'complete', function() {
        console.log('Before send 2');
    });

    // Pass URL match as function
    var condition = function(url) {
        return (/^\/example\/myUrl$/).test('/example/myUrl');
    };

    // Listeners can exist independently
    hiJax.set('home2', condition, {
        beforeSend: function() {
            console.log('I\'m listening too!');
        }
    });

    $.get('/example/myUrl', function(data, status, xhr) {
        var parsed = JSON.parse(data);
        console.log('Data received: ', data);
        $ajaxContainer.html('foo is ' + parsed.foo);
    });
});