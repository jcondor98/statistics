const LOWER_A_CODE = 'a'.charCodeAt(0);
const LOWER_Z_CODE = 'z'.charCodeAt(0);
const UPPER_A_CODE = 'A'.charCodeAt(0);
const UPPER_Z_CODE = 'Z'.charCodeAt(0);

const FREQ_MAX_GUESS_DISTANCE = 26;

/**
 * @param {number} start the start value of the range, inclusive
 * @param {number} stop the stop value of the range, exclusive
 * @param {number} step the step of the range
 * @returns an iterator over the desired range
 */
function* range(start, stop, step = 1) {
  for (let i = start; i < stop; i += step)
    yield i;
}

/**
 * Compute the letters frequencies of a string.
 * Ignores non-alphabetical characters.
 * @param {string} s the string on which to compute frequencies
 * @returns {object} the computed frequencies for all the letters
 */
export function computeFrequencies(s) {
  const frequencies = {};
  for (const i of range(0, 26))
    frequencies[String.fromCharCode(LOWER_A_CODE + i)] = 0;

  s = [...s.toLowerCase()].filter(c => c.match(/[a-z]/))

  for (const c of s)
    frequencies[c] += 1;

  for (const [c, count] of Object.entries(frequencies))
    frequencies[c] = count / s.length;

  return frequencies;
}

/**
 * Encrypt a string using the Caesar cipher
 * @param {string} plaintext the plaintext string to encrypt
 * @param {number} key the key to use
 * @returns {string} the encrypted string
 */
export function encrypt(plaintext, key = 13) {
  return [...plaintext].map(c => {
    let code = c.charCodeAt(0);

    if (code >= LOWER_A_CODE && code <= LOWER_Z_CODE)
      code = LOWER_A_CODE + (code - LOWER_A_CODE + key) % 26;
    else if (code >= UPPER_A_CODE && code <= UPPER_Z_CODE)
      code = UPPER_A_CODE + (code - UPPER_A_CODE + key) % 26;

    return String.fromCharCode(code);
  }).join('');
}

/**
 * Decrypt a string using the Caesar cipher
 * @param {string} ciphertext the ciphertext string to decrypt
 * @param {number} key the key to use
 * @returns {string} the decrypted plaintext string
 */
export function decrypt(ciphertext, key) {
  return [...ciphertext].map(c => {
    let code = c.charCodeAt(0);

    if (code >= LOWER_A_CODE && code <= LOWER_Z_CODE)
      code = LOWER_A_CODE + (code - LOWER_A_CODE + 26 - key) % 26;
    else if (code >= UPPER_A_CODE && code <= UPPER_Z_CODE)
      code = UPPER_A_CODE + (code - UPPER_A_CODE + 26 - key) % 26;

    return String.fromCharCode(code);
  }).join('');
}

/**
 * Attempt to crack a ciphertext encrypted with the Caesar cipher
 * @param {string} ciphertext the ciphertext string to crack
 * @param {object} frequencies the letters frequencies for all languages
 * @returns {object} the guess of the cracking process, containing the key
 */
export function crack(ciphertext, frequencies, language) {
  if (!!language)
    return _crack(ciphertext, frequencies[language]);

  let guess = { distance: FREQ_MAX_GUESS_DISTANCE };

  for (const l in frequencies) {
    const attempt = _crack(ciphertext, frequencies[l]);
    if (attempt.distance < guess.distance)
      guess = { language: l, ...attempt };
  }

  return guess;
}

// Attempt cracking with just one language (i.e. a single set of letters frequencies)
function _crack(ciphertext, frequencies) {
  const encFrequencies = computeFrequencies(ciphertext);
  let guess = {
    key: 0,
    distance: FREQ_MAX_GUESS_DISTANCE
  };

  for (const key of range(0, 26)) {
    const distance = computeDistance(frequencies, encFrequencies, key);
    if (distance < guess.distance)
      guess = { key, distance };
  }

  return guess;
}

/**
 * Guess the language of a text (not encrypted) using frequency analysis
 * @param {string} text the text to analyse
 * @param {object} frequencies the letters frequencies for all the available languages
 * @returns {object} a guess result containing the language and the frequency analysis distance
 */
export function detectLanguage(text, frequencies) {
  const textFrequencies = computeFrequencies(text);
  let guess = {
    language: null,
    distance: FREQ_MAX_GUESS_DISTANCE
  };

  for (const language in frequencies) {
    const distance = computeDistance(
      textFrequencies, frequencies[language]);
    if (distance < guess.distance)
      guess = { language, distance };
  }

  return guess;
}

/**
 * Compute the distance between two frequency analyses.
 * If key is specified, it will be used to shift f2 frequencies.
 * @param {object} f1 the first frequency analysis
 * @param {object} f2 the second frequency analysis
 * @param {number} key the encryption key for the Caesar cipher, if cracking
 */
export function computeDistance(f1, f2, key = 0) {
  let total = 0

  for (const i of range(0, 26)) {
    const c = String.fromCharCode('a'.charCodeAt(0) + i);
    total += Math.abs(f1[c] - f2[encrypt(c, key)]);
  }

  return total;
}
