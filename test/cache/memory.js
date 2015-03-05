var assert = require('assert')
  , MemoryCache = require(__dirname + '/../../lib/cache/memory')

suite('eveonlinejs.cache.MemoryCache')

test('#read() retrieves value from cache', function (done) {
  var cache = new MemoryCache()

  cache.write('herp', 'derp', 5, function (err) {
    assert.ifError(err)

    cache.read('herp', function (err, value) {
      assert.ifError(err)
      assert.equal(value, 'derp')

      cache.read('herp', function (err, value) {
        assert.ifError(err)
        assert.equal(value, 'derp')
        done()
      })
    })
  })
})

test('#read() passes undefined for expired entry', function (done) {
  var cache = new MemoryCache()
    , duration = 5

  cache.write('herp', 'derp', duration, function (err) {
    assert.ifError(err)

    cache.read('herp', function (err, value) {
      assert.ifError(err)
      assert.equal(value, 'derp')

      cache.getCurrentTime = function () {
        return (new Date()).getTime() + duration
      }

      cache.read('herp', function (err, value) {
        assert.ifError(err)
        assert.ok(typeof value === 'undefined')
        done()
      })
    })
  })
})