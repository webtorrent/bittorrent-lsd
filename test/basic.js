const test = require('tape')
const sinon = require('sinon')
const dgram = require('dgram')
const os = require('os')
const common = require('./common')

const LSD = require('../index')

test('should emit a warning when addMembership fails', t => {
  const opts = {
    peerId: common.randomId(),
    infoHash: common.randomHash(),
    port: common.randomPort()
  }
  const lsd = new LSD(opts)

  sinon.stub(lsd.server, 'addMembership').throws()

  lsd.on('warning', (err) => {
    t.ok(err)

    lsd.destroy(() => t.end())
  })

  lsd.start()
})

test('should emit peer when receiving a valid announce', t => {
  const opts = {
    peerId: common.randomId(),
    infoHash: common.randomHash(),
    port: common.randomPort()
  }
  const lsd = new LSD(opts)
  const client = dgram.createSocket('udp4')

  const host = '239.192.152.143:6771'
  const port = '51413'
  const infoHash = 'F60AE72E07713D4F14878A5B24ADB34992401AC9'

  client.connect(6771, '239.192.152.143', (err) => {
    if (err) {
      t.error(err)
    }

    const announce = `BT-SEARCH * HTTP/1.1\r\nHost: ${host}\r\nPort: ${port}\r\nInfohash: ${infoHash}\r\n\r\n\r\n`
    client.send(announce)
    client.close()
  })

  lsd.on('error', (err) => {
    t.error(err)
  })

  lsd.on('peer', (peerAddress, infoHash) => {
    const ip = Object.values(os.networkInterfaces())
      .flatMap(i => i)
      .filter(i => !i.internal && i.family === 'IPv4')
      .reduce((acc, cur) => cur.address, '')

    t.equal(peerAddress, `${ip}:${port}`)
    t.equal(infoHash, infoHash)

    lsd.destroy(() => t.end())
  })

  lsd.start()
})

test('should not announce once when 3min passed', t => {
  const clock = sinon.useFakeTimers(new Date())
  let counter = 0

  const opts = {
    peerId: common.randomId(),
    infoHash: common.randomHash(),
    port: common.randomPort()
  }
  const lsd = new LSD(opts)
  const client = dgram.createSocket({ type: 'udp4', reuseAddr: true })

  const host = '239.192.152.143:6771'
  const port = opts.port.toString()
  const infoHash = opts.infoHash.toString('hex')
  const cookie = `bittorrent-lsd-${opts.peerId.toString('hex')}`

  client.bind(6771, () => {
    client.addMembership('239.192.152.143')
  })

  client.on('message', (msg, rinfo) => {
    const announce = `BT-SEARCH * HTTP/1.1\r\nHost: ${host}\r\nPort: ${port}\r\nInfohash: ${infoHash}\r\ncookie: ${cookie}\r\n\r\n\r\n`

    t.equal(msg.toString(), announce)
    counter++

    if (counter === 2) {
      t.fail()
    } else {
      clock.tick(180000) // 3min

      lsd.destroy(() => {
        client.close()
        t.end()
      })
    }
  })

  lsd.start()
})

test('should announce twice when 5min passed', t => {
  const clock = sinon.useFakeTimers(new Date())
  let counter = 0

  const opts = {
    peerId: common.randomId(),
    infoHash: common.randomHash(),
    port: common.randomPort()
  }
  const lsd = new LSD(opts)
  const client = dgram.createSocket({ type: 'udp4', reuseAddr: true })

  const host = '239.192.152.143:6771'
  const port = opts.port.toString()
  const infoHash = opts.infoHash.toString('hex')
  const cookie = `bittorrent-lsd-${opts.peerId.toString('hex')}`

  client.bind(6771, () => {
    client.addMembership('239.192.152.143')
  })

  client.on('message', (msg, rinfo) => {
    const announce = `BT-SEARCH * HTTP/1.1\r\nHost: ${host}\r\nPort: ${port}\r\nInfohash: ${infoHash}\r\ncookie: ${cookie}\r\n\r\n\r\n`

    t.equal(msg.toString(), announce)
    counter++

    if (counter === 2) {
      t.pass()
    } else {
      clock.tick(300000) // 5min

      lsd.destroy(() => {
        client.close()
        t.end()
      })
    }
  })

  lsd.start()
})
