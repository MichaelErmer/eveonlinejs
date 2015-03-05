var sax = require('sax')
  , Client = require('./client')

/**
 * @namespace
 */
var eveonlinejs = new Client()

module.exports = eveonlinejs

eveonlinejs.Client = Client

/**
 * @namespace
 */
eveonlinejs.cache = {}
eveonlinejs.cache.Cache = require('./cache/cache')
eveonlinejs.cache.FileCache = require('./cache/file')
eveonlinejs.cache.MemoryCache = require('./cache/memory')