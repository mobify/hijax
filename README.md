# Hijax XHR Proxy

[![NPM](https://nodei.co/npm/hijax.png?downloads=true&stars=true)](https://nodei.co/npm/hijax/)

Hijax is meant to be a lightweight library-independent way of intercepting XHR
requests. It is meant to be used with the
[Mobify Adaptive](https://github.com/mobify/adaptivejs) and
[MobifyJS](https://github.com/mobify/mobifyjs) frameworks.

## Browser support
Hijax has been tested on the following browsers:

- Chrome (mobile and desktop)
- Firefox (desktop)
- Safari (desktop and iOS6+)

## Library support
Although Hijax should intercept XHR requests regardless of how the XHR request
is invoked, its proxying features are known only to work with the following
libraries at present:

- jQuery 2.1.1, 1.3.2
- Zepto 1.1

Hijax *should* be able to work with other libraries, but support isn't
guaranteed.

## Adapters
Support for proxying other libraries can be added with the use of adapters, as
shown in the example in the `example` folder, which uses an adapter for jQuery
1.3.2 from the `adapter` folder.

## How to use Hijax
Import Hijax distribution file from the `dist` folder (and any adapters you
need) into your project. Hijax uses an UMD format, but AMD is the preferred way
of using Hijax.

Hijax is initialized by creating a hijax instance like so:

    var hijax = new Hijax();

If an adapter is used, it should be passed to the constructor:

    // Eg:
    var myAdapter = require('adapters/jquery.legacy');
    var hijax = new Hijax(myAdapter);

Note that Hijax is a singleton, so if you initialize it more than once, you will still be getting the same instance back. If you need to clear the existing Hijax instance with a new one, pass `true` as the second parameter to the constructor.

    // Eg:
    var hijaxA = new Hijax();
    var hijaxB = new Hijax();
    // hijaxA == hijaxB

    var hijaxC = new Hijax(null, true);
    // hijaxA != hijaxC

An XHR request can be proxied by calling the `set` method, and providing a name,
url/truth function and the callbacks for the events to be proxied:

    hijax.set(<name>, <url> OR <function>, {
        beforeSend: <function>,
        receive: <function>,
        complete: <function>
    });

    // Eg:
    hijax
        .set(
            // A unique name for the proxy
            'homeProxy',
            // Either a URL, or a function that takes in the URL as an argument,
            // and returns true/false
            '/example/response.json',
            {
            // Request is being sent
            beforeSend: function(xhr) {
                console.log(this.name, 'Intercepting send.');
            },
            // Received response data
            receive: function(data, xhr) {
                console.log(this.name, 'Intercepting receive.');
            },
            // Request completed (desktop listener has finished processing it)
            complete: function(data, xhr) {
                console.log(this.name, 'Request complete.');
            }
        });

Additional listeners can be set like so:

    hijax.addListener(<name>, <event>, <callback>);

    // Eg:
    hijax.addListener('proxy1', 'complete', function(data, xhr) {
        console.log(this.name, 'Another listener.');
    });

You can remove listeners on a given instance like so:

    hijax.removeListener(<name>, <event>);

    // Eg:
    var cb = function() { ... }
    hijax.removeListener('proxy1', 'beforeSend', cb);

    // Removes all listeners on the beforeSend event
    hijax.removeListener('proxy', 'beforeSend');

Note that Hijax operates on a domain whitelist to prevent the interception of irrelevant requests. By default, this whitelist includes the current host. For example:

    // For an instance of Hijax running on www.example.com
    
    hijax.set(
        'bookReviews',
        function(url) {
            return /\/reviews\/books/.test(url);
        },
        {
            receive: function(data, xhr) {
                // The following urls would reach this callback:
                // - /reviews/books
                // - http://www.example.com/reviews/books
                // - https://www.example.com/reviews/books
                // - http://www.example.com/users/reviews/books/novels
    
                // The following urls would *not* reach this callback:
                // - http://www.mobify.com/reviews/books
                // - http://www.mobify.com/?referrer=http://www.example.com/reviews/books
            }
        }
    );

Additional domains can be added and removed from the whitelist like so:
    
    hijax.addWhitelistedDomain('www.mobify.com');
    hijax.removeWhitelistedDomain('www.mobify.com');

## Data Parsers
Hijax will attempt to detect the type of data by reading the response header. If
the response is available in the respective format (for instance, responseJSON
for a json content type), Hijax will just pipe it through.

In other instances, Hijax will attempt to use a data parser to parse the data
into a usable format. Currently only JSON is parsed (using the browser's native
JSON.parse method). Text, HTML and XML are piped through a stub parser which
does not modify the data.

You can override the parsers by passing it in the options when creating an
instance:

    hijax.set(<name>, <url> OR <function>, { ... }, {
        dataParsers: { ... }
    });

    // Eg:
    hijax.set('homeProxy', '/home.html', {
        complete: function(data) {
            // ...
        }
    }, {
        dataParsers: {
            // When receiving HTML content, invoke this callback
            html: function(data) {
                return data;
            }
        }
    });

## Development

To develop Hijax locally:
```bash
# Grab dev dependencies
npm install
./node_modules/.bin/bower install
```

To get familiar with Hijax:
Check out some of the example usages in `examples/`

To test:
Run `grunt serve` and open `http://localhost:8888/tests/` in your browser

To build `dist/` code:
Run `grunt` or `grunt build`

To contribute:
Open a PR!
