const SESSION_PAYLOAD = 'manager-authenticated'

const encoder = new TextEncoder()

const toBase64Url = (bytes: Uint8Array): string => {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

const createHmacKey = async (secret: string): Promise<CryptoKey> =>
  crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ])

export const createSessionToken = async (secret: string): Promise<string> => {
  const key = await createHmacKey(secret)
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(SESSION_PAYLOAD))

  return toBase64Url(new Uint8Array(signature))
}

export const isValidSessionToken = async (token: string, secret: string): Promise<boolean> => {
  if (!token || !secret) {
    return false
  }

  const validToken = await createSessionToken(secret)
  return token === validToken
}
