import fs from "node:fs/promises"
import { CaesarCipher } from "./ciphers/caesar.js"
import { FrequencyAnalysis, Cracker } from "./lib.js"
import { LetterwiseRSA, egcd, modInv, modPow } from "./ciphers/letterwise-rsa.js"
import { buildFrequenciesDb } from './build-frequencies-db.js'

const TEXT_FILE = "./samples/english.txt"
const FREQUENCIES_DB_FILE = "./frequencies.json"

if (!process.env.DEBUG)
  console.debug = () => { }

console.log("Statistics - Test suite for Homework 3")

await initFrequenciesDb()
const frequencies = FrequencyAnalysis.manyByLanguage(
  JSON.parse(await fs.readFile(FREQUENCIES_DB_FILE)))

let results = []

results.push(await testDistanceFrom())
results.push(await testDetectLanguage())
results.push(testCaesarEncrypt())
results.push(testCaesarDecrypt())
results.push(testEgcd())
results.push(testModInv())
results.push(testModPow())

for (const cipher of CaesarCipher.all())
  results.push(testCipherCorrectness(cipher))

for (const cipher of LetterwiseRSA.all())
  results.push(testCipherCorrectness(cipher))

results.push(await testCrack(CaesarCipher.rot(7)))
results.push(await testCrack(CaesarCipher.rot(7), "./samples/italian-short.txt"))
results.push(await testCrack(LetterwiseRSA.random()))

const passed = results.filter(x => x).length
const failed = results.filter(x => !x).length

console.log()
console.log(`Passed ${passed} tests out of ${results.length}`)
console.log(`Failed ${failed} tests out of ${results.length}`)


async function testDistanceFrom(textFile = TEXT_FILE) {
  console.group("Testing FrequencyAnalysis.distanceFrom()")
  const text = await fs.readFile(textFile, 'utf8')
  const frequencies = FrequencyAnalysis.of(text)

  console.debug(`Computed frequencies for text in ${textFile}`, frequencies)
  const total = frequencies.values()
    .reduce((x, total) => total + x, 0)

  if (total === 1)
    console.debug("The sum of all frequencies 1 (correct)")
  else if (total >= 0.99 && total <= 1.01)
    console.debug(`The sum of all frequencies is ${total} (close enough to 1)`)
  else
    console.debug(`The sum of all frequencies is ${total} (should be 1)`)

  const distance = frequencies.distanceFrom(frequencies)
  if (distance !== 0)
    console.warn(`Distance from the analysis to itself should be 0, got ${distance}`)

  console.groupEnd()
  return total >= 0.99 && total <= 1.01 && distance === 0
}

async function testDetectLanguage() {
  async function _test(expected, textFile) {
    const text = await fs.readFile(textFile, 'utf8')
    const { language } = FrequencyAnalysis.of(text).detectLanguage(frequencies)

    if (language === expected)
      console.debug(`Correct language ${language} detected for ${textFile}`)
    else console.debug(`Incorrect language ${language} detected for ${textFile} (expected ${expected})`)

    return language === expected
  }

  console.group("Testing FrequencyAnalysis.detectLanguage()")
  let passed = true
  passed ||= await _test("english", "./samples/english.txt")
  passed ||= await _test("english", "./samples/english-short.txt")
  passed ||= await _test("italian", "./samples/italian.txt")
  passed ||= await _test("italian", "./samples/italian-short.txt")
  passed ||= await _test("german", "./samples/german.txt")
  passed ||= await _test("german", "./samples/german-short.txt")
  console.groupEnd()
  return passed
}

function testCaesarEncrypt() {
  console.group("Testing encrypt() with key 13 (ROT13)")
  const plaintext = "The quick brown fox jumps over the lazy dog."
  const expected = "Gur dhvpx oebja sbk whzcf bire gur ynml qbt."
  const ciphertext = new CaesarCipher({ key: 13 }).encrypt(plaintext)

  console.debug(`Plaintext is: ${plaintext}`)
  console.debug(`Computed ciphertext is: ${ciphertext}`)
  console.debug(`Expected ciphertext is: ${expected}`)

  const passed = ciphertext === expected
  if (passed)
    console.debug("Ciphertext is correct")
  else
    console.warn("Ciphertext does not match the expected result")

  console.groupEnd()
  return passed
}

function testCaesarDecrypt() {
  console.group("Testing decrypt() with key 13 (ROT13)")
  const ciphertext = "Gur dhvpx oebja sbk whzcf bire gur ynml qbt."
  const expected = "The quick brown fox jumps over the lazy dog."
  const plaintext = new CaesarCipher({ key: 13 }).decrypt(ciphertext)

  console.debug(`Ciphertext is: ${ciphertext}`)
  console.debug(`Computed plaintext is: ${plaintext}`)
  console.debug(`Expected plaintext is: ${expected}`)

  const passed = plaintext === expected
  if (passed)
    console.debug("Plaintext is correct")
  else
    console.warn("Plaintext does not match the expected result")

  console.groupEnd()
  return passed
}

function testCipherCorrectness(cipher) {
  if (cipher instanceof LetterwiseRSA)
    console.group(`Testing correctness of LetterwiseRSA with p=${cipher.context.p}, q=${cipher.context.q}`)
  else if (cipher instanceof CaesarCipher)
    console.group(`Testing correctness of CaesarCipher with key ${cipher.context.key}`)
  else
    console.group(`Testing correctness of Cipher with context:`, cipher.context)


  const original = "The quick brown fox jumps over the lazy dog."
  const ciphertext = cipher.encrypt(original)
  const plaintext = cipher.decrypt(ciphertext)

  console.debug(`Original plaintext is: ${original}`)
  console.debug(`Computed ciphertext is: ${ciphertext}`)
  console.debug(`Computed plaintext is: ${plaintext}`)

  const passed = original === plaintext
  if (passed)
    console.debug("Cipher seems to be correct")
  else
    console.warn("Cipher operations do not return the expected results")

  console.groupEnd()
  return passed
}

async function testCrack(cipher, textFile = TEXT_FILE) {
  console.group(`Testing crack() with cipher ${cipher.constructor.name} - ${JSON.stringify(cipher.context)}`)
  const expected = await fs.readFile(textFile, 'utf8')
  const ciphertext = cipher.encrypt(expected)

  const cracker = new Cracker({ cipher, frequencies })
  const { cipher: guessedCipher, distance, language } = cracker.crack(ciphertext)
  const plaintext = guessedCipher.decrypt(ciphertext)

  console.debug(`Ciphertext is: ${ciphertext}`)
  console.debug(`Computed plaintext is: ${plaintext}`)
  console.debug(`Expected plaintext is: ${expected}`)
  console.debug(`Cracked as ${language} with distance ${distance}`)
  console.debug("Context of the guessed cipher:", guessedCipher.context)

  const passed = plaintext === expected
  if (passed)
    console.debug("Plaintext is correct")
  else
    console.warn("Plaintext does not match the expected result")

  console.groupEnd()
  return passed
}

function testEgcd() {
  console.group("Testing Euclid's Greatest Common Divisor algorithm")

  // Test cases in the form [a, b, expected]
  const cases = [
    [2, 4, 2],
    [1, 5, 1],
    [3, 6, 3],
    [4, 12, 4],
    [6, 14, 2],
  ]

  let passed = true
  for (const [a, b, expected] of cases) {
    const [result] = egcd(a, b)
    console.debug(`egcd(${a}, ${b}) = ${result} (expected ${expected})`)
    passed &= result === expected
  }

  console.groupEnd()
  return passed
}

function testModInv() {
  console.group("Testing multiplicative inverse modulo algorithm")

  // Test cases in the form [a, m, expected]
  const cases = [
    [10, 9, 1],
    [50, 13, 6],
    [11, 5, 1],
    [9, 5, 4],
  ]

  let passed = true
  for (const [a, m, expected] of cases) {
    const result = modInv(a, m)
    console.debug(`modInv(${a}, ${m}) = ${result} (expected ${expected})`)
    passed &= result === expected
  }

  console.groupEnd()
  return passed
}

function testModPow() {
  console.group("Testing power modulo algorithm")

  // Test cases in the form [base, exp, mod, expected]
  const cases = [
    [16, 4, 8, 0],
    [16, 4, 5, 1],
    [11, 2, 7, 2],
    [50, 19, 14, 8],
    [50, 5, 5, 0],
  ]

  let passed = true
  for (const [b, e, m, expected] of cases) {
    const result = modPow(b, e, m)
    console.debug(`modPow(${b}, ${e}, ${m}) = ${result} (expected ${expected})`)
    passed &= result === expected
  }

  console.groupEnd()
  return passed
}

async function initFrequenciesDb() {
  try {
    await fs.access(FREQUENCIES_DB_FILE)
    console.debug(`Frequencies database '${FREQUENCIES_DB_FILE}' exists`)
  } catch (e) {
    if (e.code !== 'ENOENT')
      throw e
    console.debug(`Building frequencies database '${FREQUENCIES_DB_FILE}'`)
    await buildFrequenciesDb()
  }
}
