// src/ciphers/caesar.js
var CaesarCipher = class _CaesarCipher extends Cipher {
  static name = "caesar";
  constructor(context = { key: 0 }) {
    super(context);
  }
  /**
   * Construct a ROT cipher with the given key
   * @param key the key
   * @returns the constructed CaesarCipher
   */
  static rot(key) {
    return new _CaesarCipher({ key });
  }
  encrypt(plaintext) {
    return [...plaintext].map((c) => {
      let code = c.charCodeAt(0);
      if (code >= LOWER_A_CODE && code <= LOWER_Z_CODE)
        code = LOWER_A_CODE + (code - LOWER_A_CODE + this.key) % 26;
      else if (code >= UPPER_A_CODE && code <= UPPER_Z_CODE)
        code = UPPER_A_CODE + (code - UPPER_A_CODE + this.key) % 26;
      return String.fromCharCode(code);
    }).join("");
  }
  decrypt(ciphertext) {
    return [...ciphertext].map((c) => {
      let code = c.charCodeAt(0);
      if (code >= LOWER_A_CODE && code <= LOWER_Z_CODE)
        code = LOWER_A_CODE + (code - LOWER_A_CODE + 26 - this.key) % 26;
      else if (code >= UPPER_A_CODE && code <= UPPER_Z_CODE)
        code = UPPER_A_CODE + (code - UPPER_A_CODE + 26 - this.key) % 26;
      return String.fromCharCode(code);
    }).join("");
  }
  static *all() {
    for (const i of range(0, 26))
      yield new _CaesarCipher({ key: i });
  }
  toString() {
    return `CaesarCipher(${this.key})`;
  }
};

// src/ciphers/letterwise-rsa.js
var PRIMES = [29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127];
function egcd(a, b) {
  if (b === 0)
    return [a, 1, 0];
  const [g, x, y] = egcd(b, a % b);
  return [g, y, x - Math.floor(a / b) * y];
}
function modInv(a, m) {
  const [g, x] = egcd(a, m);
  if (g !== 1)
    throw new Error("No modular inverse");
  return (x % m + m) % m;
}
function modPow(base, exp, m) {
  let result = 1;
  base %= m;
  while (exp > 0) {
    if (exp % 2 === 1) result = result * base % m;
    base = base * base % m;
    exp = Math.floor(exp / 2);
  }
  return result;
}
var LetterwiseRSA = class _LetterwiseRSA extends Cipher {
  static name = "letterwise-rsa";
  constructor(context) {
    super(context);
  }
  /**
   * Construct an RSA cipher from two primes p and q
   * @param {number} p the first prime
   * @param {number} q the second prime (different from p)
   * @returns {Cipher} the constructed LetterwiseRSA Cipher
   */
  static fromPrimes(p, q) {
    if (p === q)
      throw new Error("p and q must differ");
    return new _LetterwiseRSA({ p, q, key: this.generateKeys(p, q) });
  }
  /** @returns {Cipher} a LetterwiseRSA Cipher constructed with random primes */
  static random() {
    const [p, q] = this.pickRandomPrimes();
    return this.fromPrimes(p, q);
  }
  static pickRandomPrimes() {
    function randomPrime() {
      return PRIMES[Math.floor(Math.random() * PRIMES.length)];
    }
    const p = randomPrime();
    let q = randomPrime();
    while (p === q)
      q = randomPrime();
    return [p, q];
  }
  static generateKeys(p, q) {
    const n = p * q;
    const phi = (p - 1) * (q - 1);
    let e;
    for (e = 2; e < phi; e++)
      if (egcd(e, phi)[0] === 1) break;
    const d = modInv(e, phi);
    return {
      public: { e, n },
      private: { d, n }
    };
  }
  encrypt(plaintext) {
    const { e, n } = this.key.public;
    const encrypted = [...plaintext].map((c) => c.charCodeAt(0)).map((c) => modPow(c, e, n));
    return JSON.stringify(encrypted);
  }
  /**
   * Adapt the ciphertext for decryption.
   * Allows to call decrypt() with arguments of different types.
   * @param {string|number|array} ciphertext the ciphertext
   * @returns {array} the ciphertext adapted for decryption
   */
  static adaptCiphertext(ciphertext) {
    if (typeof ciphertext === "string")
      return JSON.parse(ciphertext);
    if (typeof ciphertext === "number")
      return [ciphertext];
    return ciphertext;
  }
  decrypt(ciphertext) {
    const { d, n } = this.key.private;
    return this.constructor.adaptCiphertext(ciphertext).map((x) => modPow(x, d, n)).map((c) => String.fromCharCode(c)).join("");
  }
  static *all() {
    for (const i of range(0, PRIMES.length))
      for (const j of range(i + 1, PRIMES.length))
        yield _LetterwiseRSA.fromPrimes(PRIMES[i], PRIMES[j]);
  }
  toString() {
    return `LetterwiseRSA(p=${this.context.p}, q=${this.context.q})`;
  }
};

// src/index.js
var LOWER_A_CODE = "a".charCodeAt(0);
var LOWER_Z_CODE = "z".charCodeAt(0);
var UPPER_A_CODE = "A".charCodeAt(0);
var UPPER_Z_CODE = "Z".charCodeAt(0);
var FREQ_MAX_GUESS_DISTANCE = 26;
function* range(start, stop, step = 1) {
  for (let i = start; i < stop; i += step)
    yield i;
}
function isAlphabetic(c) {
  const code = c.charCodeAt(0);
  return code >= LOWER_A_CODE && code <= LOWER_Z_CODE || code >= UPPER_A_CODE && code <= UPPER_Z_CODE;
}
var FrequencyAnalysis = class _FrequencyAnalysis extends Map {
  defaultValue = 0;
  constructor(...args) {
    super(...args);
  }
  /**
   * Get an item frequency.
   * @param {any} key the item relative to the frequency to get
   * @returns {number} the item's frequency
   */
  get(key) {
    return super.get(key) || this.defaultValue;
  }
  /**
   * Set the default value for the frequency of an item
   * @param {number} v the default value
   */
  setDefaultValue(v) {
    defaultValue = v;
  }
  /**
   * Build an empty FrequencyAnalysis with all values set to default.
   * Present for compatibility purposes.
   * @returns an empty FrequencyAnalysis
   */
  static empty() {
    return new _FrequencyAnalysis();
  }
  /**
   * Compute the letters frequencies of a string.
   * Ignores non-alphabetical characters.
   * @param {string} s the string on which to compute frequencies
   * @returns {FrequencyAnalysis} the FrequencyAnalysis computed on `s`
   */
  static of(s) {
    return _FrequencyAnalysis.raw([...s.toLowerCase()].filter((c) => isAlphabetic(c)));
  }
  /**
   * Compute the items frequencies of an iterable object.
   * Does not ignore any item.
   * @param {Iterable} s the iterable object on which to compute frequencies
   * @returns {FrequencyAnalysis} the FrequencyAnalysis computed on `s`
   */
  static raw(s) {
    const analysis = new _FrequencyAnalysis();
    for (const c of s)
      analysis.set(c, analysis.get(c) + 1);
    for (const [c, count] of analysis.entries())
      analysis.set(c, count / s.length);
    return analysis;
  }
  /**
   * Compute the distance from another frequency analysis.
   * @param {other} f2 the second frequency analysis
   * @returns {number} the distance from the specified frequency analysis
   */
  distanceFrom(other) {
    let total = 0;
    for (const [c, f] of this)
      total += Math.abs(f - other.get(c));
    return total;
  }
  /**
   * Remap a FrequencyAnalysis by key
   * @param {function} fn the remapping function
   * @returns a new, remapped FrequencyAnalysis
   */
  remap(fn) {
    const r = new _FrequencyAnalysis();
    for (const [c, f] of this)
      r.set(fn(c), f);
    return r;
  }
  /**
   * Convert this FrequencyAnalysis to consider just alphabetic characters, case-insensitive
   * @returns {FrequencyAnalysis}
   */
  alphabetic() {
    const analysis = new _FrequencyAnalysis();
    for (const i of range(0, 26)) {
      const lower = String.fromCharCode(LOWER_A_CODE + i);
      const upper = String.fromCharCode(UPPER_A_CODE + i);
      analysis.set(lower, this.get(lower) + this.get(upper));
    }
    return analysis;
  }
  /**
  * Guess the language of the text relative to this frequency analysis
  * @param {object} frequencies the letters frequencies for all the available languages
  * @returns {object} a guess result containing the language and the frequency analysis distance
  */
  detectLanguage(frequencies) {
    let guess = {
      language: null,
      distance: FREQ_MAX_GUESS_DISTANCE
    };
    for (const language in frequencies) {
      const distance = this.distanceFrom(frequencies[language]);
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
    const analyses = {};
    for (const l in dataByLanguage)
      analyses[l] = new _FrequencyAnalysis(Object.entries(dataByLanguage[l]));
    return analyses;
  }
};
var Cipher = class {
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
    return this.context.key;
  }
  /** The name of the cipher */
  static name = "generic";
  /**
   * Encrypt a plaintext
   * @param {any} _s the plaintext to encrypt
   * @param {object} _context the Cipher context
   * @returns the encrypted ciphertext
   */
  encrypt(_s, _context) {
    throw new Error("encrypt() is not implemented for this Cipher");
  }
  /**
   * Decrypt a ciphertext
   * @param {any} _s the ciphertext to decrypt
   * @param {object} _context the Cipher context
   * @returns the decrypted plaintext
   */
  decrypt(_s, _context) {
    throw new Error("decrypt() is not implemented for this Cipher");
  }
  /**
   * Adapt the ciphertext for decryption.
   * Allows to call decrypt() with arguments of different types.
   * May not be required for some ciphers.
   * @param {string|number|array} ciphertext the ciphertext
   * @returns {array} the ciphertext adapted for decryption
   */
  static adaptCiphertext(ciphertext) {
    return ciphertext;
  }
  /** @returns all possible ciphers (i.e. a cipher for each possible key) */
  static *all() {
    throw new Error("all() is not implemented for this Cipher");
  }
  toString() {
    return "Cipher";
  }
};
var Cracker = class {
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
    const getAllCiphers = this.cipher.constructor?.all || this.cipher.all;
    const adaptCiphertext = this.cipher.constructor?.adaptCiphertext || this.cipher.adaptCiphertext;
    ciphertext = adaptCiphertext(ciphertext);
    const encFrequencies = FrequencyAnalysis.raw(ciphertext);
    let guess = { distance: FREQ_MAX_GUESS_DISTANCE };
    for (const cipher of getAllCiphers()) {
      const f = encFrequencies.remap((c) => cipher.decrypt(c)).alphabetic();
      for (const language in this.frequencies) {
        const distance = f.distanceFrom(this.frequencies[language]);
        if (distance < guess.distance)
          guess = { language, distance, cipher };
      }
    }
    return guess;
  }
};
export {
  CaesarCipher,
  Cipher,
  Cracker,
  FREQ_MAX_GUESS_DISTANCE,
  FrequencyAnalysis,
  LOWER_A_CODE,
  LOWER_Z_CODE,
  LetterwiseRSA,
  UPPER_A_CODE,
  UPPER_Z_CODE,
  egcd,
  isAlphabetic,
  modInv,
  modPow,
  range
};
