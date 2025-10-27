import test from 'ava'
import { CaesarCipher } from '../src/ciphers/caesar.js'
import { LetterwiseRSA } from '../src/ciphers/letterwise-rsa.js'

function testCipherCorrectness(cipher) {
  test(`correctness of ${cipher.toString()}`, t => {
    const original = "The quick brown fox jumps over the lazy dog."
    const ciphertext = cipher.encrypt(original)
    const plaintext = cipher.decrypt(ciphertext)
    t.is(original, plaintext)
  })
}

for (const cipher of CaesarCipher.all())
  testCipherCorrectness(cipher)

for (const cipher of LetterwiseRSA.all())
  testCipherCorrectness(cipher)

