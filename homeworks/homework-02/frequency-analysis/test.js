import { computeFrequencies, encrypt, decrypt, crack, detectLanguage } from "./lib.js";
import { buildFrequenciesDb } from './build-frequencies-db.js';
import fs from "node:fs/promises"

const TEXT_FILE = "./samples/english.txt";
const FREQUENCIES_DB_FILE = "./frequencies.json";

console.log("Statistics - Test suite for Homework 2");

await initFrequenciesDb();
const frequencies = JSON.parse(await fs.readFile(FREQUENCIES_DB_FILE))

let results = [];

results.push(await testComputeFrequencies());
results.push(await testDetectLanguage());
results.push(testEncrypt());
results.push(testDecrypt());
results.push(await testCrack());
results.push(await testCrack("./samples/italian-short.txt"));

const passed = results.filter(x => x).reduce((x, y) => x + y, 0);
const failed = results.filter(x => !x).reduce((x, y) => x + y, 0);

console.log();
console.log(`Passed ${passed} tests out of ${results.length}`);
console.log(`Failed ${failed} tests out of ${results.length}`);


async function testComputeFrequencies(textFile = TEXT_FILE) {
  console.group("Testing computeFrequencies()");
  const text = await fs.readFile(textFile, 'utf8');
  const frequencies = computeFrequencies(text);

  console.debug(`Computed frequencies for text in ${textFile}`, frequencies);
  const total = Object.values(frequencies)
    .reduce((x, total) => total + x, 0);

  if (total === 1)
    console.log("The sum of all frequencies 1 (correct)");
  else if (total >= 0.99 && total <= 1.01)
    console.log(`The sum of all frequencies is ${total} (close enough to 1)`);
  else
    console.debug(`The sum of all frequencies is ${total} (should be 1)`);

  console.groupEnd();
  return total >= 0.99 && total <= 1.01
}

async function testDetectLanguage() {
  async function _test(expected, textFile) {
    const text = await fs.readFile(textFile, 'utf8');
    const { language } = detectLanguage(text, frequencies);

    if (language === expected)
      console.log(`Correct language ${language} detected for ${textFile}`);
    else console.log(`Incorrect language ${language} detected for ${textFile} (expected ${expected})`);

    return language === expected
  }

  let passed = true;
  passed ||= await _test("english", "./samples/english.txt");
  passed ||= await _test("english", "./samples/english-short.txt");
  passed ||= await _test("italian", "./samples/italian.txt");
  passed ||= await _test("italian", "./samples/italian-short.txt");
  passed ||= await _test("german", "./samples/german.txt");
  passed ||= await _test("german", "./samples/german-short.txt");
  return passed;
}

function testEncrypt() {
  console.group("Testing encrypt() with key 13 (ROT13)");
  const plaintext = "The quick brown fox jumps over the lazy dog.";
  const expected = "Gur dhvpx oebja sbk whzcf bire gur ynml qbt.";
  const ciphertext = encrypt(plaintext, 13)

  console.log(`Plaintext is: ${plaintext}`);
  console.log(`Computed ciphertext is: ${ciphertext}`);
  console.log(`Expected ciphertext is: ${expected}`);

  const passed = ciphertext === expected;
  if (passed)
    console.log("Ciphertext is correct");
  else
    console.warn("Ciphertext does not match the expected result");

  console.groupEnd();
  return passed;
}

function testDecrypt() {
  console.group("Testing decrypt() with key 13 (ROT13)");
  const ciphertext = "Gur dhvpx oebja sbk whzcf bire gur ynml qbt.";
  const expected = "The quick brown fox jumps over the lazy dog.";
  const plaintext = decrypt(ciphertext, 13)

  console.log(`Ciphertext is: ${ciphertext}`);
  console.log(`Computed plaintext is: ${plaintext}`);
  console.log(`Expected plaintext is: ${expected}`);

  const passed = plaintext === expected;
  if (passed)
    console.log("Plaintext is correct");
  else
    console.warn("Plaintext does not match the expected result");

  console.groupEnd();
  return passed;
}

async function testCrack(textFile = TEXT_FILE) {
  console.group("Testing crack() with key 7");
  const expected = await fs.readFile(textFile, 'utf8');
  const ciphertext = encrypt(expected, 7);

  const result = crack(ciphertext, frequencies);
  const plaintext = decrypt(ciphertext, result.key);

  console.log(`Ciphertext is: ${ciphertext}`);
  console.log("Result of the cracking process is:", result);
  console.log(`Computed plaintext is: ${plaintext}`);
  console.log(`Expected plaintext is: ${expected}`);

  const passed = plaintext === expected;
  if (passed)
    console.log("Plaintext is correct");
  else
    console.warn("Plaintext does not match the expected result");

  console.groupEnd();
  return passed;
}

async function initFrequenciesDb() {
  try {
    await fs.access(FREQUENCIES_DB_FILE);
    console.debug(`Frequencies database '${FREQUENCIES_DB_FILE}' exists`);
  } catch (e) {
    if (e.code !== 'ENOENT')
      throw e;
    console.debug(`Building frequencies database '${FREQUENCIES_DB_FILE}'`);
    await buildFrequenciesDb();
  }
}
