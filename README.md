# Hijax XHR Proxy

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

    var hijax = new Hijax(myAdapter);

An XHR request can be proxied by calling the `set` method, and providing a name,
url/truth function and the callbacks for the events to be proxied:

    hijax
        .set(
            // A unique name for the proxy
            'proxy1',
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

    hijax.addListener('proxy1', 'complete', function(data, xhr) {
        console.log(this.name, 'Another listener.');
    });