import fs from "node:fs/promises"
import test from 'ava'
import { FrequencyAnalysis } from '../src/frequency.js'
import { initFrequenciesDb } from './helpers/common.js'

const TEXT_FILE = "./samples/english.txt"

let frequencies
test.before(async () => {
  frequencies = await initFrequenciesDb()
})

test('distanceFrom', async t => {
  const text = await fs.readFile(TEXT_FILE, 'utf8')
  const frequencies = FrequencyAnalysis.of(text)

  const total = frequencies.values()
    .reduce((x, total) => total + x, 0)

  t.true(total >= 0.99 && total <= 1.01,
    `The sum of all frequencies is ${total} (should be 1)`)

  const distance = frequencies.distanceFrom(frequencies)
  t.is(distance, 0, 'Distance from the analysis to itself should be 0')
})

function testDetectLanguage(expected, textFile) {
  test(`detectLanguage for file ${textFile}`, async t => {
    const text = await fs.readFile(textFile, 'utf8')
    const { language } = FrequencyAnalysis.of(text).detectLanguage(frequencies)
    t.is(language, expected)
  })
}

testDetectLanguage("english", "./samples/english.txt")
testDetectLanguage("english", "./samples/english-short.txt")
testDetectLanguage("italian", "./samples/italian.txt")
testDetectLanguage("italian", "./samples/italian-short.txt")
testDetectLanguage("german", "./samples/german.txt")
testDetectLanguage("german", "./samples/german-short.txt")
