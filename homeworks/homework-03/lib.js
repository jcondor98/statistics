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
export function* range(start, stop, step = 1) {
  for (let i = start; i < stop; i += step)
    yield i;
}

/**
 * Test if a character is alphabetic
 * @param {string} c the character to test
 * @returns {boolean} true if `c` is alphabetic, false otherwise
 */
export function isAlphabetic(c) {
  const code = c.charCodeAt(0);
  return code >= LOWER_A_CODE && code <= LOWER_Z_CODE ||
    code >= UPPER_A_CODE && code <= UPPER_Z_CODE
}

/** A letter-wise frequency analysis */
export class FrequencyAnalysis extends Map {
  defaultValue = 0

  constructor(...args) {
    super(...args)
  }

  /**
   * Get an item frequency.
   * @param {any} key the item relative to the frequency to get
   * @returns {number} the item's frequency
   */
  get(key) {
    return super.get(key) || this.defaultValue
  }

  /**
   * Set the default value for the frequency of an item
   * @param {number} v the default value
   */
  setDefaultValue(v) {
    defaultValue = v
  }

  /**
   * Build an empty FrequencyAnalysis with all values set to default.
   * Present for compatibility purposes.
   * @returns an empty FrequencyAnalysis
   */
  static empty() {
    return new FrequencyAnalysis()
  }

  /**
   * Compute the letters frequencies of a string.
   * Ignores non-alphabetical characters.
   * @param {string} s the string on which to compute frequencies
   * @returns {FrequencyAnalysis} the FrequencyAnalysis computed on `s`
   */
  static of(s) {
    return FrequencyAnalysis.raw([...s.toLowerCase()]
      .filter(c => isAlphabetic(c)))
  }

  /**
   * Compute the items frequencies of an iterable object.
   * Does not ignore any item.
   * @param {Iterable} s the iterable object on which to compute frequencies
   * @returns {FrequencyAnalysis} the FrequencyAnalysis computed on `s`
   */
  static raw(s) {
    const analysis = new FrequencyAnalysis()

    for (const c of s)
      analysis.set(c, analysis.get(c) + 1)

    for (const [c, count] of analysis.entries())
      analysis.set(c, count / s.length)

    return analysis
  }

  /**
   * Compute the distance from another frequency analysis.
   * @param {other} f2 the second frequency analysis
   * @returns {number} the distance from the specified frequency analysis
   */
  distanceFrom(other) {
    let total = 0
    for (const [c, f] of this)
      total += Math.abs(f - other.get(c))
    return total
  }

  /**
   * Remap a FrequencyAnalysis by key
   * @param {function} fn the remapping function
   * @returns a new, remapped FrequencyAnalysis
   */
  remap(fn) {
    const r = new FrequencyAnalysis()
    for (const [c, f] of this)
      r.set(fn(c), f)
    return r
  }

  /**
   * Convert this FrequencyAnalysis to consider just alphabetic characters, case-insensitive
   * @returns {FrequencyAnalysis}
   */
  alphabetic() {
    const analysis = new FrequencyAnalysis()
    for (const i of range(0, 26)) {
      const lower = String.fromCharCode(LOWER_A_CODE + i)
      const upper = String.fromCharCode(UPPER_A_CODE + i)
      analysis.set(lower, this.get(lower) + this.get(upper))
    }
    return analysis
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
      analyses[l] = new FrequencyAnalysis(Object.entries(dataByLanguage[l]))
    return analyses
  }
}

/** A generic cipher */
export class Cipher {
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

  /** @returns {any} the key of the cipher instance */
  get key() {
    return this.context.key
  }

  /** The name of the cipher */
  static name = 'generic'

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

  /**
   * Adapt the ciphertext for decryption.
   * Allows to call decrypt() with arguments of different types.
   * May not be required for some ciphers.
   * @param {string|number|array} ciphertext the ciphertext
   * @returns {array} the ciphertext adapted for decryption
   */
  static adaptCiphertext(ciphertext) {
    return ciphertext
  }

  /** @returns all possible ciphers (i.e. a cipher for each possible key) */
  static *all() {
    throw new Error('all() is not implemented for this Cipher')
  }
}

/**
 * Ciphertext cracking algorithm for a generic letter-wise substitution cipher
 * @param {Cipher|class} the Cipher to crack, either as class or instance
 * @param {object} frequencies the plaintext frequency analyses indexed by language
 * @param {string|undefined} language the specific language of the ciphertext
 */
export class Cracker {
  constructor({ cipher, frequencies, language }) {
    this.cipher = cipher
    this.frequencies = frequencies
    this.language = language
  }

  /**
   * Attempt to crack a ciphertext encrypted with the Caesar cipher
   * @param {string} ciphertext the ciphertext string to crack
   */
  crack(ciphertext) {
    const getAllCiphers =
      this.cipher.constructor?.all || this.cipher.all;
    const adaptCiphertext =
      this.cipher.constructor?.adaptCiphertext || this.cipher.adaptCiphertext;

    ciphertext = adaptCiphertext(ciphertext)

    const encFrequencies = FrequencyAnalysis.raw(ciphertext)
    let guess = { distance: FREQ_MAX_GUESS_DISTANCE };

    for (const cipher of getAllCiphers()) {
      const f = encFrequencies
        .remap(c => cipher.decrypt(c))
        .alphabetic()

      for (const language in this.frequencies) {
        const distance = f.distanceFrom(this.frequencies[language])
        if (distance < guess.distance)
          guess = { language, distance, cipher }
      }
    }

    return guess
  }
}
