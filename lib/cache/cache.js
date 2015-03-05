module.exports = Cache

/**
 * @exports Cache as eveonline.cache.Cache
 * @constructor
 */
function Cache() {}

/**
 * Get current time as UNIX timestamp.
 *
 * @return {Number} Current timestamp
 */
Cache.prototype.getCurrentTime = function () {
  return (new Date()).getTime()
}

/**
 * Store value in cache.
 *
 * @param {String}   key      Cache key
 * @param {String}   value    Cache Value
 * @param {Number}   duration Number of seconds this cache entry will live
 * @param {Function} cb       Callback
 */
Cache.prototype.write

/**
 * Retrieve value from cache.
 *
 * @param  {String}   key Cache key
 * @param  {Function} cb  Callback
 * @return {String}       Cache value
 */
Cache.prototype.read