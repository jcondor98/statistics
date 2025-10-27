import test from 'ava'
import { CaesarCipher } from '../src/ciphers/caesar.js'

test('CaesarCipher.encrypt', t => {
  const plaintext = "The quick brown fox jumps over the lazy dog."
  const expected = "Gur dhvpx oebja sbk whzcf bire gur ynml qbt."
  const ciphertext = new CaesarCipher({ key: 13 }).encrypt(plaintext)
  t.is(ciphertext, expected)
})

test('CaesarCipher.decrypt', t => {
  const ciphertext = "Gur dhvpx oebja sbk whzcf bire gur ynml qbt."
  const expected = "The quick brown fox jumps over the lazy dog."
  const plaintext = new CaesarCipher({ key: 13 }).decrypt(ciphertext)
  t.is(plaintext, expected)
})
