import { Cipher } from "./lib.js";

/** Fixed set of small primes, such that n < 26 (alphabet length) */
//const PRIMES = [2, 3, 5, 7, 11, 13] // Small primes do not work when using the full ASCII table
const PRIMES = [29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127]

/**
 * Compute the Greatest Common Divisor using the Euclid's algorithm
 * @param {number} a the first number
 * @param {number} a the second number
 * @returns {array} an array in the form [gcd, x, y] such that `a * x + b * y = gcd`
 */
export function egcd(a, b) {
  if (b === 0)
    return [a, 1, 0];
  const [g, x, y] = egcd(b, a % b);
  return [g, y, x - Math.floor(a / b) * y];
}

/**
 * Compute the modular inverse of a modulo m
 * @param {number} a the number to invert
 * @param {number} m the modulo
 * @returns {number} the inverse modular
 */
export function modInv(a, m) {
  const [g, x] = egcd(a, m);
  if (g !== 1)
    throw new Error("No modular inverse");
  return ((x % m) + m) % m;
}

/** @returns base ^ exp mod m */
export function modPow(base, exp, m) {
  let result = 1;
  base %= m;
  while (exp > 0) {
    if (exp % 2 === 1) result = (result * base) % m;
    base = (base * base) % m;
    exp = Math.floor(exp / 2);
  }
  return result;
}

/** An insecure letter-wise implementation of the RSA algorithm */
export class LetterwiseRSA extends Cipher {
  constructor(context) {
    super(context)
  }

  /**
   * Construct an RSA cipher from two primes p and q
   * @param {number} p the first prime
   * @param {number} q the second prime (different from p)
   * @returns {Cipher} the constructed LetterwiseRSA Cipher
   */
  static fromPrimes(p, q) {
    if (p === q)
      throw new Error('p and q must differ')
    return new LetterwiseRSA({ p, q, key: this.generateKeys(p, q) })
  }

  /** @returns {Cipher} a LetterwiseRSA Cipher constructed with random primes */
  static random() {
    const [p, q] = this.pickRandomPrimes()
    return this.fromPrimes(p, q)
  }

  static pickRandomPrimes() {
    function randomPrime() {
      return PRIMES[Math.floor(Math.random() * PRIMES.length)]
    }

    const p = randomPrime()
    let q = randomPrime()
    while (p === q)
      q = randomPrime()

    return [p, q]
  }

  static generateKeys(p, q) {
    const n = p * q
    const phi = (p - 1) * (q - 1);

    let e // Pick e coprime with phi
    for (e = 2; e < phi; e++)
      if (egcd(e, phi)[0] === 1) break;

    const d = modInv(e, phi);

    return {
      public: { e, n },
      private: { d, n }
    };
  }

  encrypt(plaintext) {
    const { e, n } = this.key.public
    const encrypted = [...plaintext]
      .map(c => c.charCodeAt(0))
      .map(c => modPow(c, e, n))
    return JSON.stringify(encrypted)
  }

  decrypt(ciphertext) {
    const { d, n } = this.key.private
    return JSON.parse(ciphertext)
      .map(x => modPow(x, d, n))
      .map(c => String.fromCharCode(c))
      .join('')
  }

  static *all() {
    for (const i of range(0, PRIMES.length))
      for (const j of range(i + 1, PRIMES.length))
        yield LetterwiseRSA.fromPrimes(PRIMES[i], PRIMES[j])
  }
}
