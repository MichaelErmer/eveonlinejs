var assert = require('assert')
  , fs = require('fs')
  , path = require('path')
  , FileCache = require(__dirname + '/../../lib/cache/file')

suite('eveonlinejs.cache.FileCache')

test('#getFilePath() returns path to cache entry', function () {
  var cache = new FileCache({path: '/tmp'})

  assert.equal(cache.getFilePath('herp'), path.sep + 'tmp' + path.sep + 'dc' + path.sep + 'bc' + path.sep + 'dcbc8f63b06c899b9db957f0e03466860fce8056')
})

test('#getFilePath() prepends prefix to file name', function () {
  var cache = new FileCache({path: '/tmp', prefix: 'herp-'})

  assert.equal(cache.getFilePath('derp'), path.sep + 'tmp' + path.sep + 'e0' + path.sep + '57' + path.sep + 'herp-e057d4ea363fbab414a874371da253dba3d713bc')
})

test('#makeDirs() recursively creates directories', function (done) {
  var cache = new FileCache()
    , dir = path.join(cache.getPath(), 'foo', 'bar', 'baz')

  fs.exists(dir, function (exists) {
    assert.ok(!exists)

    cache.makeDirs(dir, function (err) {
      assert.ifError(err)

      fs.exists(dir, function (exists) {
        assert.ok(exists)
        cache.clear(done)
      })
    })
  })
})

test('#read() retrieves value from cache', function (done) {
  var cache = new FileCache({prefix: 'test1-'})

  cache.write('herp', 'derp', 5, function (err) {
    assert.ifError(err)

    cache.read('herp', function (err, value) {
      assert.ifError(err)
      assert.equal(value, 'derp')

      cache.read('herp', function (err, value) {
        assert.ifError(err)
        assert.equal(value, 'derp')
        cache.clear(done)
      })
    })
  })
})

test('#read() passes undefined for expired entry', function (done) {
  var cache = new FileCache({prefix: 'test2-'})
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
        cache.clear(done)
      })
    })
  })
})

test('#read() does not error on ENOENT', function (done) {
  var cache = new FileCache({prefix: 'test3-'})

  cache.read('herp', function (err, value) {
    assert.ifError(err)
    assert.ok(typeof value === 'undefined')
    cache.clear(done)
  })
})