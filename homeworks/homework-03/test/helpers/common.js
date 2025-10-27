import fs from "node:fs/promises"
import { buildFrequenciesDb } from '../../build-frequencies-db.js'
import { FrequencyAnalysis } from "../../src/index.js"

const FREQUENCIES_DB_FILE = './frequencies.json'
let frequencies

export async function initFrequenciesDb() {
  if (frequencies)
    return frequencies

  try {
    await fs.access(FREQUENCIES_DB_FILE)
    console.debug(`Frequencies database '${FREQUENCIES_DB_FILE}' exists`)
  } catch (e) {
    if (e.code !== 'ENOENT')
      throw e
    console.debug(`Building frequencies database '${FREQUENCIES_DB_FILE}'`)
    await buildFrequenciesDb()
  }

  frequencies = FrequencyAnalysis.manyByLanguage(
    JSON.parse(await fs.readFile(FREQUENCIES_DB_FILE)))
  return frequencies
}
