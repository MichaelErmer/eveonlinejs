var assert = require('assert')
  , url = require('url')
  , fs = require('fs')
  , http = require('http')
  , Client = require(__dirname + '/../lib/client')

suite('eveonlinejs.Client')

test('#getPathName() supports <namespace>:<resource> path format', function () {
  var client = new Client()

  assert.equal(client.getPathName('eve:SkillTree'), '/eve/SkillTree.xml.aspx')
  assert.equal(client.getPathName('char:AccountBalance'), '/char/AccountBalance.xml.aspx')
  assert.equal(client.getPathName('OhNoez'), '/OhNoez.xml.aspx')
})

test('#getPathName() prepends base path', function () {
  var client = new Client()

  // with trailing slashes
  client.setUrl('https://api.eveonline.com/')
  assert.equal(client.getPathName('/char/AccountBalance.xml.aspx'), '/char/AccountBalance.xml.aspx')
  assert.equal(client.getPathName('char:AccountBalance'), '/char/AccountBalance.xml.aspx')

  client.setUrl('https://api.eveonline.com/char/')
  assert.equal(client.getPathName('/AccountBalance.xml.aspx'), '/char/AccountBalance.xml.aspx')
  assert.equal(client.getPathName('AccountBalance'), '/char/AccountBalance.xml.aspx')

  // without trailing slashes
  client.setUrl('https://api.eveonline.com')
  assert.equal(client.getPathName('/char/AccountBalance.xml.aspx'), '/char/AccountBalance.xml.aspx')
  assert.equal(client.getPathName('char:AccountBalance'), '/char/AccountBalance.xml.aspx')

  client.setUrl('https://api.eveonline.com/char')
  assert.equal(client.getPathName('/AccountBalance.xml.aspx'), '/char/AccountBalance.xml.aspx')
  assert.equal(client.getPathName('AccountBalance'), '/char/AccountBalance.xml.aspx')
})

test('#getRequestUrl() returns URL object', function () {
  var client = new Client()
    , actual
    , expected

  actual = url.format(client.getRequestUrl('char:AccountBalance', {characterID: 1234}))
  expected = 'https://api.eveonline.com/char/AccountBalance.xml.aspx?characterID=1234'
  assert.equal(actual, expected)

  actual = url.format(client.getRequestUrl('eve:SkillTree'))
  expected = 'https://api.eveonline.com/eve/SkillTree.xml.aspx'
  assert.equal(actual, expected)

  actual = url.format(client.getRequestUrl('foo:bar', {c: 'c', a: 'a', b: 'b'}))
  expected = 'https://api.eveonline.com/foo/bar.xml.aspx?c=c&a=a&b=b'
  assert.equal(actual, expected)
})

test('#getRequestUrl() merges default params', function () {
  var client = new Client()
    , actual
    , expected

  client.setParams({keyID: 'herp', vCode: 'derp'})

  actual = url.format(client.getRequestUrl('char:AccountBalance', {characterID: '1234'}))
  expected = 'https://api.eveonline.com/char/AccountBalance.xml.aspx?characterID=1234&keyID=herp&vCode=derp'
  assert.equal(actual, expected)
})

test('#getCacheKey() returns URL string', function () {
  var client = new Client()
    , actual
    , expected

  actual = client.getCacheKey(client.getRequestUrl('server:ServerStatus'))
  expected = 'https://api.eveonline.com/server/ServerStatus.xml.aspx'
  assert.equal(actual, expected)

  actual = client.getCacheKey(client.getRequestUrl('char:AccountBalance', {characterID: '12345'}))
  expected = 'https://api.eveonline.com/char/AccountBalance.xml.aspx?characterID=12345'
  assert.equal(actual, expected)
})

test('#getCacheKey() sorts query string parameters alphebetically', function () {
  var client = new Client()
    , actual
    , expected

  actual = client.getCacheKey(client.getRequestUrl('foo:bar', {c: 'c', a: 'a', b: 'b'}))
  expected = 'https://api.eveonline.com/foo/bar.xml.aspx?a=a&b=b&c=c'
  assert.equal(actual, expected)

  actual = client.getCacheKey(client.getRequestUrl('foo:bar', {b: 'b', c: 'c', a: 'a'}))
  expected = 'https://api.eveonline.com/foo/bar.xml.aspx?a=a&b=b&c=c'
  assert.equal(actual, expected)
})

test('#parse() can parse simple API response', function (done) {
  var client = new Client()

  fs.readFile(__dirname + '/simple.xml', function (err, xml) {
    fs.readFile(__dirname + '/simple.json', function (err, json) {
      client.parse(xml, function (err, result) {
        assert.ifError(err)
        assert.deepEqual(result, JSON.parse(json))
        done()
      })
    })
  })
})

test('#parse() can parse rowsets', function (done) {
  var client = new Client()

  fs.readFile(__dirname + '/rowset.xml', function (err, xml) {
    fs.readFile(__dirname + '/rowset.json', function (err, json) {
      client.parse(xml, function (err, result) {
        assert.ifError(err)
        assert.deepEqual(result, JSON.parse(json))
        done()
      })
    })
  })
})

test('#parse() can parse nested rowsets', function (done) {
  var client = new Client()

  fs.readFile(__dirname + '/alliance-list.xml', function (err, xml) {
    fs.readFile(__dirname + '/alliance-list.json', function (err, json) {
      client.parse(xml, function (err, result) {
        assert.ifError(err)
        assert.deepEqual(result, JSON.parse(json))
        done()
      })
    })
  })
})

test('#parse() can parse mutli-keyed rowsets', function (done) {
  var client = new Client()

  fs.readFile(__dirname + '/multi-key.xml', function (err, xml) {
    fs.readFile(__dirname + '/multi-key.json', function (err, json) {
      client.parse(xml, function (err, result) {
        assert.ifError(err)
        assert.deepEqual(result, JSON.parse(json))
        done()
      })
    })
  })
})

test('#parse() can parse cdata', function (done) {
  var client = new Client()

  fs.readFile(__dirname + '/cdata.xml', function (err, xml) {
    fs.readFile(__dirname + '/cdata.json', function (err, json) {
      client.parse(xml, function (err, result) {
        assert.ifError(err)
        assert.deepEqual(result, JSON.parse(json))
        done()
      })
    })
  })
})

test('#parse() can parse error response', function (done){
  var client = new Client()

  fs.readFile(__dirname + '/error.xml', function (err, xml) {
    client.parse(xml, function (err, result) {
      assert.ok(err instanceof Error)
      assert.equal(err.message, 'Must provide userID or keyID parameter for authentication.')
      assert.equal(err.code, 106)
      done()
    })
  })
})

test('#parse() can parse streams', function (done) {
  var client = new Client()
    , stream = fs.createReadStream(__dirname + '/simple.xml', {bufferSize: 128})

  client.parse(stream, function (err, result) {
    assert.ifError(err)
    done()
  })
})

test('#fetch() can request and parse API response', function (done) {
  var client = new Client({url: 'http://127.0.0.1:1337'})
    , server = http.createServer()

  fs.readFile(__dirname + '/server-status.xml', function (err, xml) {
    server.on('request', function (request, response) {
      if (request.url === '/server/ServerStatus.xml.aspx') {
        response.write(xml)
        response.end()
      }
    })

    server.listen(1337)
  })

  fs.readFile(__dirname + '/server-status.json', function (err, json) {
    client.fetch('server:ServerStatus', function (err, result) {
      assert.ifError(err)
      assert.deepEqual(result, JSON.parse(json))
      server.close()
      done()
    })
  })
})

test('#fetch() only parses OK responses (status code == 200)', function (done) {
  var client = new Client({url: 'http://127.0.0.1:1338'})
    , server = http.createServer()

  server.on('request', function (request, response) {
    response.writeHead(404)
    response.end()
  })

  server.listen(1338)

  client.fetch('server:ServerStatus', function (err, result) {
    assert.ok(err instanceof Error)
    server.close()
    done()
  })
})