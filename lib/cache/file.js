var fs = require('fs')
  , path = require('path')
  , crypto = require('crypto')
  , Cache = require('./cache')

module.exports = FileCache

/**
 * File cache.
 *
 * The following options are recognized:
 * <ul>
 *   <li><strong>path</strong>: Path to directory where cache files will be saved</li>
 *   <li><strong>prefix</strong>: Prefix to be used in cache file names (default: <tt>''</tt>)</li>
 * </ul>
 *
 * @exports FileCache as hamster.cache.FileCache
 * @param {Object} options
 * @constructor
 */
function FileCache(options) {
  Cache.call(this)

  var tmpDir = process.env.TMPDIR || process.env.TEMP || '/tmp'
  options = options || {}

  this.setPath(options.path || path.join(tmpDir, 'hamster-cache'))
  this.setPrefix(options.prefix || '')
}

FileCache.prototype = Object.create(Cache.prototype)

/**
 * Set path to cache directory.
 *
 * @param {String} p Directory path
 */
FileCache.prototype.setPath = function (p) {
  this._path = p
}

/**
 * Get path to cache directory.
 *
 * @return {String} Directory path
 */
FileCache.prototype.getPath = function () {
  return this._path
}

/**
 * Set file name prefix.
 *
 * @param {String} prefix Prefix string
 */
FileCache.prototype.setPrefix = function (prefix) {
  this._prefix = prefix
}

/**
 * Get file name prefix.
 *
 * @return {String} Prefix string
 */
FileCache.prototype.getPrefix = function () {
  return this._prefix
}

/**
 * Get path to file identified by the specified cache key.
 *
 * @param  {String} key Cache key
 * @return {String}     Path
 */
FileCache.prototype.getFilePath = function (key) {
  var hash = crypto.createHash('sha1')
    , sha1 = hash.update(key).digest('hex')
    , file = this.getPrefix() + sha1

  return path.join(this.getPath(), sha1.substr(0, 2), sha1.substr(2, 2), file)
}

/**
 * Clear file cache.
 *
 * @param  {Function} cb Callback
 */
FileCache.prototype.clear = function (cb) {
  if (!cb) cb = function () {}

  var self = this
  var clearDir = function (dir, cb) {
    fs.readdir(dir, function (err, files) {
      if (err) throw err
      if (!files.length) return cb(null)

      var remaining = files.length
      var removeDir = function () {
        if (!(--remaining)) {
          if (self.getPath() === dir) return cb(null)

          fs.rmdir(dir, function () {
            cb(null)
          })
        }
      }

      files.forEach(function (file) {
        file = path.join(dir, file)

        fs.stat(file, function (err, stats) {
          if (err) throw err

          if (stats.isDirectory()) {
            clearDir(file, function (err) {
              if (err) throw err
              fs.rmdir(file, removeDir)
            })
          } else {
            fs.unlink(file, removeDir)
          }
        })
      })
    })
  }

  try {
    clearDir(this.getPath(), cb)
  } catch (err) {
    cb(err)
  }
}

/**
 * Recursively create directories.
 *
 * @param  {String}   dir Dir name
 * @param  {Function} cb  Callback
 */
FileCache.prototype.makeDirs = function (dir, cb) {
  if (!cb) cb = function () {}

  var self = this

  fs.exists(dir, function (exists) {
    if (exists) {
      cb(null)
    } else {
      fs.mkdir(dir, function (err) {
        if (err) {
          if (err.code !== 'ENOENT') return cb(err)

          self.makeDirs(path.dirname(dir), function (err) {
            if (err) return cb(err)

            self.makeDirs(dir, cb)
          })
        } else {
          cb(null)
        }
      })
    }
  })
}

/**
 * Store value in cache.
 *
 * @param {String}   key      Cache key
 * @param {String}   value    Cache Value
 * @param {Number}   duration Number of seconds this cache entry will live
 * @param {Function} cb       Callback
 */
FileCache.prototype.write = function (key, value, duration, cb) {
  var file = this.getFilePath(key)
    , dir = path.dirname(file)
    , self = this

  self.makeDirs(dir, function (err) {
    if (err) return cb(err)

    fs.open(file, 'w', function (err, fd) {
      if (err) return cb(err)

      var meta = JSON.stringify({expireTime: (new Date()).getTime() + duration})
        , data = new Buffer([meta, value].join('\n'))

      fs.write(fd, data, 0, data.length, 0, function (err, written, buffer) {
        if (err) return cb(err)

        fs.close(fd, function () { cb(null) })
      })
    })
  })
}

/**
 * Retrieve value from cache.
 *
 * @param  {String}   key Cache key
 * @param  {Function} cb  Callback
 * @return {String}       Cache value
 */
FileCache.prototype.read = function (key, cb) {
  var file = this.getFilePath(key)
    , self = this

  fs.readFile(file, function (err, data) {
    if (err) {
      if (err.code === 'ENOENT') return cb(null)
      return cb(err)
    }

    data = data.toString().split('\n', 2)
    var meta = JSON.parse(data[0])

    if (self.getCurrentTime() >= meta.expireTime) {
      fs.unlink(file, function (err) { cb(err) })
    } else {
      cb(null, data[1])
    }
  })
}