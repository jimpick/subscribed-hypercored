#!/usr/bin/env node

process.title = 'hypercored'

var datDns = require('dat-dns')()
var wss = require('websocket-stream')
var archiver = require('hypercore-archiver')
var swarm = require('hypercore-archiver/swarm')
var readFile = require('read-file-live')
var minimist = require('minimist')
var path = require('path')
var pump = require('pump')
var http = require('http')

var argv = minimist(process.argv.slice(2))
var cwd = argv.cwd || process.cwd()
var ar = archiver(path.join(cwd, 'archiver'), argv._[0])
var server = http.createServer()
var port = argv.port || process.env.PORT || 0
var unencryptedWebsockets = !!argv['unencrypted-websockets']

var Dat = require('dat-node')
require('dotenv').config({ silent: true })

async function run () {

  const feedKey = process.env.FEED_KEY
  if (!feedKey) {
    console.error('Please set the FEED_KEY environment variable or use .env')
    process.exit(1)
  }

  const resolvedFeedKey = await datDns.resolveName(feedKey)

  console.log('Master feed key is', feedKey)
  console.log('Resolved master feed key is', resolvedFeedKey)

  if (process.env.MAX_LISTENERS) {
    const maxListeners = parseInt(process.env.MAX_LISTENERS, 10)
    if (maxListeners) {
      require('events').EventEmitter.defaultMaxListeners =
        parseInt(process.env.MAX_LISTENERS, 10)
      console.log('Set EventEmitter.defaultMaxListeners to', maxListeners)
    }
  }

  if (argv.help) {
    console.log(
      'Usage: hypercored [key?] [options]\n\n' +
      '  --cwd         [folder to run in]\n' +
      '  --websockets  [share over websockets as well]\n' +
      '  --port        [explicit websocket port]\n'
    )
    process.exit(0)
  }

  if (unencryptedWebsockets) {
    argv.websockets = true
  }

  ar.on('sync', function (feed) {
    console.log('Fully synced', feed.key.toString('hex'))
  })

  ar.on('add', function (feed) {
    console.log('Adding', feed.key.toString('hex'))
  })

  ar.on('remove', function (feed) {
    console.log('Removing', feed.key.toString('hex'))
  })

  ar.on('changes', function (feed) {
    console.log('Archiver key is ' + feed.key.toString('hex'))
  })

  console.log('Watching %s for a list of active feeds', feedKey)

  wss.createServer({server: server}, onwebsocket)
  server.on('request', function (req, res) {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({
      name: 'hypercored',
      version: require('./package').version
    }))
  })

  swarm(ar).on('listening', function () {
    var self = this

    if (argv.websockets) server.listen(port, onlisten)
    else onlisten()

    function onlisten () {
      console.log('Swarm listening on port %d', self.address().port)
      if (argv.websockets) console.log('WebSocket server listening on port %d', server.address().port)
    }
  })


  Dat('./dat-master-feed', {
    // 2. Tell Dat what link I want
    key: resolvedFeedKey,
     // (a 64 character hash from above)
    temp: true,
    sparse: true
  }, function (err, dat) {
    if (err) throw err

    // 3. Join the network & download (files are automatically downloaded)
    dat.joinNetwork()

    dat.archive.on('update', () => {
      console.log('Feed update version', dat.archive.version)
      dat.archive.readFile('/feeds', function (err, content) {
        // console.log(content.toString()) // prints cat-locations.txt file!
        var unresolvedFeeds = content.toString().trim().split('\n')
        resolveAll(unresolvedFeeds, (err, feeds) => {
          feeds
            .filter(function (line) {
              return /^(dat:)?(\/\/)?[0-9a-f]{64}(\/.*)?$/i.test(line.trim())
            })
            .map(function (line) {
              return line.trim().split('//').pop().split('/')[0]
            })

          ar.list(function (err, keys) {
            if (err || !ar.changes.writable) return

            var i = 0

            for (i = 0; i < keys.length; i++) {
              if (feeds.indexOf(keys[i].toString('hex')) === -1) ar.remove(keys[i])
            }
            for (i = 0; i < feeds.length; i++) {
              ar.add(feeds[i])
            }
          })
        })
      })
    })
  })

}

function resolveAll (links, cb) {
  var keys = []
  var missing = links.length

  if (!missing) return cb(null, [])

  for (var i = 0; i < links.length; i++) {
    datDns.resolveName(links[i], function (_, key) {
      keys.push(key)
      if (!--missing) cb(null, keys.filter(Boolean))
    })
  }
}

function onwebsocket (stream) {
  pump(stream, ar.replicate({encrypt: !unencryptedWebsockets}), stream)
}

run()

