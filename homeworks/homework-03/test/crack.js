import fs from "node:fs/promises"
import test from 'ava'
import { CaesarCipher } from "../src/ciphers/caesar.js"
import { Cracker } from "../src/crypto.js"
import { LetterwiseRSA } from "../src/ciphers/letterwise-rsa.js"
import { initFrequenciesDb } from './helpers/common.js'

const TEXT_FILE = "./samples/english.txt"

let frequencies
test.before(async () => {
  frequencies = await initFrequenciesDb()
})

function testCrack(cipher, textFile = TEXT_FILE) {
  test(`crack() ${cipher.toString()}, plaintext ${textFile}`, async t => {
    const expected = await fs.readFile(textFile, 'utf8')
    const ciphertext = cipher.encrypt(expected)

    const cracker = new Cracker({ cipher, frequencies })
    const { cipher: guessedCipher } = cracker.crack(ciphertext)
    const plaintext = guessedCipher.decrypt(ciphertext)

    t.is(plaintext, expected)
  })
}

testCrack(CaesarCipher.rot(7))
testCrack(CaesarCipher.rot(7), "./samples/italian-short.txt")
testCrack(LetterwiseRSA.random())
