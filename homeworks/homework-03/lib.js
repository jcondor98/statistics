export const LOWER_A_CODE = 'a'.charCodeAt(0);
export const LOWER_Z_CODE = 'z'.charCodeAt(0);
export const UPPER_A_CODE = 'A'.charCodeAt(0);
export const UPPER_Z_CODE = 'Z'.charCodeAt(0);

export const FREQ_MAX_GUESS_DISTANCE = 26;

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

/** A letter-wise frequency analysis */
export class FrequencyAnalysis {
  constructor(data) {
    this.data = data;
  }

  /** @returns an empty FrequencyAnalysis with all values set to 0 */
  static empty() {
    const data = {}
    for (const i of range(0, 26))
      data[String.fromCharCode(LOWER_A_CODE + i)] = 0
    return new FrequencyAnalysis(data)
  }

  /**
   * Compute the letters frequencies of a string.
   * Ignores non-alphabetical characters.
   * @param {string} s the string on which to compute frequencies
   * @returns {object} the computed frequencies for all the letters
   */
  static of(s) {
    if (typeof s !== 'string')
      s = s.toString()

    const frequencies = FrequencyAnalysis.empty();
    s = [...s.toLowerCase()].filter(c => c.match(/[a-z]/))

    for (const c of s)
      frequencies.data[c] += 1

    for (const c in frequencies.data)
      frequencies.data[c] /= s.length

    return frequencies
  }

  /**
  * Compute the distance between two frequency analyses.
  * If a cipher is specified, it will be used to shift f2 frequencies.
  * @param {object} f1 the first frequency analysis
  * @param {object} f2 the second frequency analysis
  * @param {Cipher} cipher the reference cipher for f2, if any
  */
  distanceFrom(other) {
    let total = 0

    for (const i of range(0, 26)) {
      const c = String.fromCharCode('a'.charCodeAt(0) + i)
      total += Math.abs(this.data[c] - other.data[c])
    }

    return total
  }

  /**
   * Remap a FrequencyAnalysis to represent the frequency of letters in a ciphertext
   * @param {Cipher} cipher the cipher to remap letters in the analysis
   * @returns a new, remapped FrequencyAnalysis
   */
  remapped(cipher) {
    const data = {}
    for (const c in this.data)
      data[cipher.encrypt(c)] = this.data[c]
    return new FrequencyAnalysis(data)
  }

  /**
  * Guess the language of the text relative to this frequency analysis
  * @param {object} frequencies the letters frequencies for all the available languages
  * @returns {object} a guess result containing the language and the frequency analysis distance
  */
  detectLanguage(frequencies) {
    const textFrequencies = FrequencyAnalysis.of(text);
    let guess = {
      language: null,
      distance: FREQ_MAX_GUESS_DISTANCE
    };

    for (const language in frequencies) {
      const distance = textFrequencies.distance(frequencies[language]);
      if (distance < guess.distance)
        guess = { language, distance };
    }

    return guess;
  }

  /**
   * Remap a FrequencyAnalysis to represent the frequency of letters in a ciphertext
   * @param {object} dataByLanguage the various frequency data indexed by language
   * @returns {object} the new FrequencyAnalysis objects indexed by language
   */
  static manyByLanguage(dataByLanguage) {
    const analyses = {}
    for (const l in dataByLanguage)
      analyses[l] = new FrequencyAnalysis(dataByLanguage[l])
    return analyses
  }
}

/** A generic cipher */
export class Cipher {
  get key() {
    return this.context.key
  }

  /**
   * Construct a cipher
   * @param {object} context the cipher context (will be passed to encrypt and decrypt)
   * @param {function} encryptor the encrypt function
   * @param {function} decryptor the decrypt function
   * @returns the Cipher object
   */
  constructor(context = {}) {
    this.context = context;
  }

  /**
   * Encrypt a plaintext
   * @param {any} _s the plaintext to encrypt
   * @param {object} _context the Cipher context
   * @returns the encrypted ciphertext
   */
  encrypt(_s, _context) {
    throw new Error('encrypt() is not implemented for this Cipher')
  }

  /**
   * Decrypt a ciphertext
   * @param {any} _s the ciphertext to decrypt
   * @param {object} _context the Cipher context
   * @returns the decrypted plaintext
   */
  decrypt(_s, _context) {
    throw new Error('decrypt() is not implemented for this Cipher')
  }

  /** @returns all possible ciphers (i.e. a cipher for each possible key) */
  static *all() {
    throw new Error('all() is not implemented for this Cipher')
  }
}

/** The Caesar cipher */
export class CaesarCipher extends Cipher {
  constructor(context = { key: 0 }) {
    super(context);
  }

  encrypt(plaintext) {
    return [...plaintext].map(c => {
      let code = c.charCodeAt(0);

      if (code >= LOWER_A_CODE && code <= LOWER_Z_CODE)
        code = LOWER_A_CODE + (code - LOWER_A_CODE + this.key) % 26;
      else if (code >= UPPER_A_CODE && code <= UPPER_Z_CODE)
        code = UPPER_A_CODE + (code - UPPER_A_CODE + this.key) % 26;

      return String.fromCharCode(code);
    }).join('');
  }

  decrypt(ciphertext) {
    return [...ciphertext].map(c => {
      let code = c.charCodeAt(0);

      if (code >= LOWER_A_CODE && code <= LOWER_Z_CODE)
        code = LOWER_A_CODE + (code - LOWER_A_CODE + 26 - this.key) % 26;
      else if (code >= UPPER_A_CODE && code <= UPPER_Z_CODE)
        code = UPPER_A_CODE + (code - UPPER_A_CODE + 26 - this.key) % 26;

      return String.fromCharCode(code);
    }).join('');
  }

  static *all() {
    for (const i of range(0, 26))
      yield new CaesarCipher({ key: i })
  }
}

/**
 * Ciphertext cracking algorithm for a generic letter-wise substitution cipher
 * @todo Improve passing the cipher
 */
export class Cracker {
  constructor({ cipher, frequencies, language }) {
    this.cipher = cipher;
    this.frequencies = frequencies;
    this.language = language;
  }

  /**
   * Attempt to crack a ciphertext encrypted with the Caesar cipher
   * @param {string} ciphertext the ciphertext string to crack
   */
  crack(ciphertext) {
    const encFrequencies = FrequencyAnalysis.of(ciphertext)
    let guess = { distance: FREQ_MAX_GUESS_DISTANCE };

    for (const cipher of this.cipher.all()) {
      for (const language in this.frequencies) {
        const langFrequences = this.frequencies[language].remapped(cipher)
        const distance = langFrequences.distanceFrom(encFrequencies)
        if (distance < guess.distance)
          guess = { language, distance, cipher }
      }
    }

    return guess
  }
}
