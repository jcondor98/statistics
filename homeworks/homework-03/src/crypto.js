import { FREQ_MAX_GUESS_DISTANCE } from "./util.js"
import { FrequencyAnalysis } from "./frequency.js";

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

  toString() {
    return 'Cipher'
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

