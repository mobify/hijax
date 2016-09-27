define(['hijax', 'jquery211'],
function(Hijax, jQuery) {
    describe('Whitelisted URLs by domain', function() {
        var foo;
        var hijax;

        before(function() {
            hijax = new Hijax(null, true);
            hijax.set(
                'whitelistTest',
                function(url) {
                    return /response/.test(url);
                },
                {
                    receive: function(data, xhr) {
                        foo = 'baz';
                    }
                }
            );
        });

        afterEach(function() {
            foo = "bar";
        });

        it('should be able to add a domain to the whitelist', function(done) {
            assert.equal(1, hijax.whitelistedDomains.length);
            hijax.addWhitelistedDomain('www.google-analytics.com');
            assert.equal(2, hijax.whitelistedDomains.length);
            done();
        });

        it('should not be able to add a duplicate domain to the whitelist', function(done) {
            assert.equal(2, hijax.whitelistedDomains.length);
            hijax.addWhitelistedDomain('www.google-analytics.com');
            assert.equal(2, hijax.whitelistedDomains.length);
            done();
        });

        it('should be able to remove a domain from the whitelist', function(done) {
            assert.equal(2, hijax.whitelistedDomains.length);
            hijax.removeWhitelistedDomain('www.google-analytics.com');
            assert.equal(1, hijax.whitelistedDomains.length);
            done();
        });

        it('should not be able to remove a domain from the whitelist that is not there', function(done) {
            assert.equal(1, hijax.whitelistedDomains.length);
            hijax.removeWhitelistedDomain('www.google-analytics.com');
            assert.equal(1, hijax.whitelistedDomains.length);
            done();
        });

        it('should regex match on current domain (relative path)', function(done) {
            assert.equal(1, hijax.whitelistedDomains.length);
            jQuery
                .ajax({
                    url: '/examples/response.json',
                    type: 'GET',
                    success: function(data, status, xhr) {
                        assert.equal(foo, 'baz', 'Foo value is set by Hijax');
                        done();
                    }
                });
        });

        it('should regex match on current domain (absolute path)', function(done) {
            assert.equal(1, hijax.whitelistedDomains.length);
            jQuery
                .ajax({
                    url: 'http://' + location.hostname + ':' + location.port + '/examples/response.json',
                    type: 'GET',
                    success: function(data, status, xhr) {
                        // Should have a value thanks to the proxy
                        foo = foo || JSON.parse(data).foo;
                        assert.equal(foo, 'baz', 'Foo value is set by Hijax');
                        done();
                    }
                });
        });

        it('should not regex match on another domain (http)', function(done) {
            assert.equal(1, hijax.whitelistedDomains.length);
            jQuery
                .ajax({
                    url: 'http://www.google-analytics.com/collect?response=awesome',
                    type: 'GET',
                    success: function(data, status, xhr) {
                        assert.equal(foo, 'bar', 'Foo value should not be set by Hijax');
                        done();
                    }
                });
        });

        it('should not regex match on another domain (https)', function(done) {
            assert.equal(1, hijax.whitelistedDomains.length);
            jQuery
                .ajax({
                    url: 'https://www.google-analytics.com/collect?response=awesome',
                    type: 'GET',
                    success: function(data, status, xhr) {
                        assert.equal(foo, 'bar', 'Foo value should not be set by Hijax');
                        done();
                    }
                });
        });

        it('should regex match on another domain after adding to whitelist', function(done) {
            assert.equal(1, hijax.whitelistedDomains.length);
            hijax.addWhitelistedDomain('www.google-analytics.com');
            jQuery
                .ajax({
                    url: 'https://www.google-analytics.com/collect?response=awesome&hi',
                    type: 'GET',
                    success: function(data, status, xhr) {
                        assert.equal(foo, 'baz', 'Foo value is set by Hijax');
                        done();
                    }
                });
        });

    });
});
