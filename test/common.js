const crypto = require('crypto')

exports.randomPort = () => {
  return crypto.randomBytes(2).readUInt16LE(0)
}

exports.randomId = () => {
  return crypto.randomBytes(20)
}

exports.randomHash = () => {
  return crypto.randomBytes(20)
}
