import crypto from 'crypto'

export const randomPort = () => {
  return crypto.randomBytes(2).readUInt16LE(0)
}

export const randomId = () => {
  return crypto.randomBytes(20)
}

export const randomHash = () => {
  return crypto.randomBytes(20)
}
