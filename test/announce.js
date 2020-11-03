const test = require('tape')
const common = require('./common')

const LSD = require('../index')

test('should emit a warning when invalid announce header', t => {
  const opts = {
    peerId: common.randomId(),
    infoHash: common.randomHash(),
    port: common.randomPort()
  }
  const lsd = new LSD(opts)

  lsd.on('warning', err => {
    t.equal(err, 'Invalid LSD announce (header)')
  })

  const announce = 'INVALID ANNOUNCE'

  t.notok(lsd._parseAnnounce(announce))

  lsd.destroy(() => {
    t.end()
  })
})

test('should emit a warning when invalid announce host', t => {
  const opts = {
    peerId: common.randomId(),
    infoHash: common.randomHash(),
    port: common.randomPort()
  }
  const lsd = new LSD(opts)

  lsd.on('warning', err => {
    t.equal(err, 'Invalid LSD announce (host)')
  })

  const host = '127.0.0.1:6771'
  const port = '51413'
  const ihash = 'F60AE72E07713D4F14878A5B24ADB34992401AC9'

  const announce = `BT-SEARCH * HTTP/1.1\r\nHost: ${host}\r\nPort: ${port}\r\nInfohash: ${ihash}\r\n\r\n\r\n`

  t.notok(lsd._parseAnnounce(announce))

  lsd.destroy(() => {
    t.end()
  })
})

test('should emit a warning when invalid announce port', t => {
  const opts = {
    peerId: common.randomId(),
    infoHash: common.randomHash(),
    port: common.randomPort()
  }
  const lsd = new LSD(opts)

  lsd.on('warning', err => {
    t.equal(err, 'Invalid LSD announce (port)')
  })

  const host = '239.192.152.143:6771'
  const port = ''
  const ihash = 'F60AE72E07713D4F14878A5B24ADB34992401AC9'

  const announce = `BT-SEARCH * HTTP/1.1\r\nHost: ${host}\r\nPort: ${port}\r\nInfohash: ${ihash}\r\n\r\n\r\n`

  t.notok(lsd._parseAnnounce(announce))

  lsd.destroy(() => {
    t.end()
  })
})

test('should emit a warning when invalid announce infoHash', t => {
  const opts = {
    peerId: common.randomId(),
    infoHash: common.randomHash(),
    port: common.randomPort()
  }
  const lsd = new LSD(opts)

  lsd.on('warning', err => {
    t.equal(err, 'Invalid LSD announce (infoHash)')
  })

  const host = '239.192.152.143:6771'
  const port = '51413'
  const ihash = 'ABCD'

  const announce = `BT-SEARCH * HTTP/1.1\r\nHost: ${host}\r\nPort: ${port}\r\nInfohash: ${ihash}\r\n\r\n\r\n`

  t.notok(lsd._parseAnnounce(announce))

  lsd.destroy(() => {
    t.end()
  })
})

test('should parse an announce without cookie', t => {
  const opts = {
    peerId: common.randomId(),
    infoHash: common.randomHash(),
    port: common.randomPort()
  }
  const lsd = new LSD(opts)

  const host = '239.192.152.143:6771'
  const port = '51413'
  const ihash = 'F60AE72E07713D4F14878A5B24ADB34992401AC9'

  const announce = `BT-SEARCH * HTTP/1.1\r\nHost: ${host}\r\nPort: ${port}\r\nInfohash: ${ihash}\r\n\r\n\r\n`

  const parsedAnnounce = lsd._parseAnnounce(announce)
  const expectedAnnounce = {
    host: host,
    port: port,
    infoHash: [ihash],
    cookie: null
  }

  t.deepEqual(parsedAnnounce, expectedAnnounce)

  lsd.destroy(() => {
    t.end()
  })
})

test('should parse an announce with a single infohash', t => {
  const opts = {
    peerId: common.randomId(),
    infoHash: common.randomHash(),
    port: common.randomPort()
  }
  const lsd = new LSD(opts)

  const host = '239.192.152.143:6771'
  const port = '51413'
  const ihash = 'F60AE72E07713D4F14878A5B24ADB34992401AC9'
  const cookie = 'cookie'

  const announce = `BT-SEARCH * HTTP/1.1\r\nHost: ${host}\r\nPort: ${port}\r\nInfohash: ${ihash}\r\ncookie: ${cookie}\r\n\r\n\r\n`

  const parsedAnnounce = lsd._parseAnnounce(announce)
  const expectedAnnounce = {
    host: host,
    port: port,
    infoHash: [ihash],
    cookie: cookie
  }

  t.deepEqual(parsedAnnounce, expectedAnnounce)

  lsd.destroy(() => {
    t.end()
  })
})

test('should parse an announce with multiple infohashes', t => {
  const opts = {
    peerId: common.randomId(),
    infoHash: common.randomHash(),
    port: common.randomPort()
  }
  const lsd = new LSD(opts)

  const host = '239.192.152.143:6771'
  const port = '51413'
  const ihashA = 'F60AE72E07713D4F14878A5B24ADB34992401AC9'
  const ihashB = '562A86EFE4DC660E9D216A901D74338AF34205AA'
  const cookie = 'cookie'

  const announce = `BT-SEARCH * HTTP/1.1\r\nHost: ${host}\r\nPort: ${port}\r\nInfohash: ${ihashA}\r\nInfohash: ${ihashB}\r\ncookie: ${cookie}\r\n\r\n\r\n`

  const parsedAnnounce = lsd._parseAnnounce(announce)
  const expectedAnnounce = {
    host: host,
    port: port,
    infoHash: [ihashA, ihashB],
    cookie: cookie
  }

  t.deepEqual(parsedAnnounce, expectedAnnounce)

  lsd.destroy(() => {
    t.end()
  })
})

test('should parse an announce with ipv6 host', t => {
  const opts = {
    peerId: common.randomId(),
    infoHash: common.randomHash(),
    port: common.randomPort()
  }
  const lsd = new LSD(opts)

  const host = '[ff15::efc0:988f]:6771'
  const port = '51413'
  const ihash = 'F60AE72E07713D4F14878A5B24ADB34992401AC9'
  const cookie = 'cookie'

  const announce = `BT-SEARCH * HTTP/1.1\r\nHost: ${host}\r\nPort: ${port}\r\nInfohash: ${ihash}\r\ncookie: ${cookie}\r\n\r\n\r\n`

  const parsedAnnounce = lsd._parseAnnounce(announce)
  const expectedAnnounce = {
    host: host,
    port: port,
    infoHash: [ihash],
    cookie: cookie
  }

  t.deepEqual(parsedAnnounce, expectedAnnounce)

  lsd.destroy(() => {
    t.end()
  })
})
