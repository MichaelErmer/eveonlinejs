var Cache = require('./cache')

module.exports = MemoryCache

/**
 * Process memory cache.
 *
 * @exports MemoryCache as eveonline.cache.MemoryCache
 * @constructor
 */
function MemoryCache() {
  Cache.call(this)
  this._cache = {}
}

MemoryCache.prototype = Object.create(Cache.prototype)

/**
 * Store value in cache.
 *
 * @param {String}   key      Cache key
 * @param {String}   value    Cache Value
 * @param {Number}   duration Number of seconds this cache entry will live
 * @param {Function} cb       Callback
 */
MemoryCache.prototype.write = function (key, value, duration, cb) {
  var expireTime = this.getCurrentTime() + duration

  this._cache[key] = {
    value: value,
    expireTime: expireTime
  }

  cb(null)
}

/**
 * Retrieve value from cache.
 *
 * @param  {String}   key Cache key
 * @param  {Function} cb  Callback
 * @return {String}       Cache value
 */
MemoryCache.prototype.read = function (key, cb) {
  var value

  if (this._cache[key] && this.getCurrentTime() < this._cache[key].expireTime) {
    value = this._cache[key].value
  }

  cb(null, value)
}