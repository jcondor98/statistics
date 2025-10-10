import { computeFrequencies, encrypt, decrypt, crack } from "./lib.js";
import { buildFrequenciesDb } from './build-frequencies-db.js';
import fs from "node:fs/promises"

const TEXT_FILE = "./sample.txt";
const FREQUENCIES_DB_FILE = "./frequencies.json";

console.log("Statistics - Test suite for Homework 2");

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

async function testComputeFrequencies(textFile = TEXT_FILE) {
  console.group("Testing computeFrequencies()");
  const text = await fs.readFile(textFile, 'utf8');
  const frequencies = computeFrequencies(text);

  console.debug(`Computed frequencies for text in ${TEXT_FILE}`, frequencies);
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

function testEncrypt() {
  console.group("Testing encrypt() with key 13 (ROT13)");
  const plaintext = "The quick brown fox jumps over the lazy dog.";
  const expected = "Gur dhvpx oebja sbk whzcf bire gur ynml qbt.";
  const ciphertext = encrypt(plaintext, 13)

  console.log(`Plaintext is: ${plaintext}`);
  console.log(`Computed ciphertext is: ${ciphertext}`);
  console.log(`Expected ciphertext is: ${expected}`);

  const correct = ciphertext === expected;
  if (correct)
    console.log("Ciphertext is correct");
  else
    console.warn("Ciphertext does not match the expected result");

  console.groupEnd();
  return correct;
}

function testDecrypt() {
  console.group("Testing decrypt() with key 13 (ROT13)");
  const ciphertext = "Gur dhvpx oebja sbk whzcf bire gur ynml qbt.";
  const expected = "The quick brown fox jumps over the lazy dog.";
  const plaintext = decrypt(ciphertext, 13)

  console.log(`Ciphertext is: ${ciphertext}`);
  console.log(`Computed plaintext is: ${plaintext}`);
  console.log(`Expected plaintext is: ${expected}`);

  const correct = plaintext === expected;
  if (correct)
    console.log("Plaintext is correct");
  else
    console.warn("Plaintext does not match the expected result");

  console.groupEnd();
  return correct;
}

async function testCrack(textFile = TEXT_FILE) {
  console.group("Testing crack() with key 13 (ROT13)");
  await initFrequenciesDb();
  const frequencies = JSON.parse(await fs.readFile(FREQUENCIES_DB_FILE))
  const expected = await fs.readFile(textFile, 'utf8');
  const ciphertext = encrypt(expected, 13);

  const result = crack(ciphertext, frequencies);
  const plaintext = decrypt(ciphertext, result.key);

  console.log(`Ciphertext is: ${ciphertext}`);
  console.log("Result of the cracking process is:", result);
  console.log(`Computed plaintext is: ${plaintext}`);
  console.log(`Expected plaintext is: ${expected}`);

  const correct = plaintext === expected;
  if (correct)
    console.log("Plaintext is correct");
  else
    console.warn("Plaintext does not match the expected result");

  console.groupEnd();
  return correct;
}

await testComputeFrequencies();
testEncrypt();
testDecrypt();
await testCrack();
