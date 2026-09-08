// src/lib/password.ts
// Password hashing for the admin account.
//
// Passwords used to be stored and compared as plaintext. They are now hashed
// with scrypt. Existing plaintext rows still verify (see verifyPassword) and
// are transparently upgraded on the next successful login, so no manual
// migration is needed.
//
// Node runtime only — do not import from the Edge proxy.

import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number
) => Promise<Buffer>

const PREFIX = 'scrypt$'
const KEY_LENGTH = 64

/** True if the stored value is one of our hashes rather than a legacy plaintext password. */
export function isHashed(stored: string | null | undefined): boolean {
  return typeof stored === 'string' && stored.startsWith(PREFIX)
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16)
  const derived = await scrypt(plain.normalize('NFKC'), salt, KEY_LENGTH)
  return `${PREFIX}${salt.toString('hex')}$${derived.toString('hex')}`
}

/** Constant-time comparison of two arbitrary-length strings. */
function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a, 'utf8').digest()
  const hb = createHash('sha256').update(b, 'utf8').digest()
  return timingSafeEqual(ha, hb)
}

export async function verifyPassword(
  plain: string,
  stored: string | null | undefined
): Promise<boolean> {
  if (!stored || !plain) return false

  // Legacy plaintext row — still accepted so existing admins can log in, but
  // the caller is expected to re-hash on success.
  if (!isHashed(stored)) return safeEqual(plain, stored)

  const [, saltHex, keyHex] = stored.split('$')
  if (!saltHex || !keyHex) return false

  const derived = await scrypt(plain.normalize('NFKC'), Buffer.from(saltHex, 'hex'), KEY_LENGTH)
  const expected = Buffer.from(keyHex, 'hex')
  if (expected.length !== derived.length) return false

  return timingSafeEqual(derived, expected)
}

/** Constant-time comparison for short secrets like reset codes. */
export function safeCompare(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false
  return safeEqual(a, b)
}
