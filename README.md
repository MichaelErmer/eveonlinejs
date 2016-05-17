# eveonline.js [![](https://secure.travis-ci.org/MichaelErmer/eveonlinejs.png)](http://travis-ci.org/#!/MichaelErmer/eveonlinejs)


**An asynchronous EVE Online API client for Node.js** 

- no function mapping
- direct access
- asynchronous
- caching

**This is a continued version of https://github.com/kuja/hamster**

### Installation

```
npm install eveonlinejs
```

### Examples

```javascript
var eveonlinejs = require('eveonlinejs')

// Print a list of skill groups
eveonlinejs.fetch('eve:SkillTree', function (err, result) {
  if (err) throw err

  for (var groupID in result.skillGroups) {
    console.log(result.skillGroups[groupID].groupName)
  }
})

// Set default parameters (useful for setting keyID and vCode)
eveonlinejs.setParams({
  keyID: '1234567',
  vCode: 'some random vcode'
})

// Default parameters will get merged with the parameters passed into fetch().
// The actual request will include all three parameters: keyID, vCode and characterID
eveonlinejs.fetch('char:AccountBalance', {characterID: 12345}, function (err, result) {
  if (err) throw err
  // do stuff
})
```


### Client object

The `eveonlinejs` object is multi-purpose in that it is both a namespace container and an instance of `eveonlinejs.Client`. Client objects individually maintain their own cache state and server details. If you do not want to use the default `eveonlinejs` object, feel free to construct your own client objects as you see fit.

```javascript
var eveonlinejs = require('eveonlinejs')
  , client = new eveonlinejs.Client({url: url, cache: cache})

client.fetch('...', function (err, result) {
  // ...
})
```


### Caching

* Easily extendible
* Asynchronous store/read
* Ships with `eveonlinejs.cache.FileCache` and `eveonlinejs.cache.MemoryCache`
* Defaults to `eveonlinejs.cache.MemoryCache` (it is highly recommended you switch to FileCache)

```javascript
var eveonlinejs = require('eveonlinejs')

eveonlinejs.setCache(new eveonlinejs.cache.FileCache({path: '...'}))
```

### Multiple outgoing addresses

```javascript
eveonlinejs.setInterface('123.123.123.123');
```


### Tests

eveonline.js is mostly tested, but not completely. Any contributions, especially to tests are greatly appreciated.

Run tests with (requires mocha):
```
npm test
```

### License

Hamser is licensed under the MIT license:
```
Copyright (c) 2012 Matt Harris

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES
OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
