---
title: Breaking letter-wise RSA
description: >-
  Implement a vulnerable, letter-wise RSA algorithm.<br/>
  Break the letter-wise RSA algorithm with frequency analysis.
author: Paolo Lucchesi
date: 2025-10-28 20:00:00 +0200
permalink: /homework-3/
---

{% include mathjax.html %}

In this article we will get a deeper understanding of the concepts discussed in
the previous one. First, we give an implementation of a letter-wise RSA
algorithm. Then, we will break it using frequency analysis, just like we did
with the Caesar cipher.

All the work related to this homework can be found in the
[repository](https://github.com/jcondor98/statistics), in the
`homeworks/homework-03/` directory.

## Theoretical context

The RSA algorithm (acronimous of Rivest-Shamir-Adleman) is an asymmetric
cipher. It uses different keys for encryption and decryption, solving the
problem of the secure exchange of secret keys. The strength of the RSA
algorithm is based on the conjecture that, if a number is the product of two
large (e.g. 2048 bits) primes, factorizing it is computationally infeasible.

### RSA internals in a nutshell

A great, authoritative, deep analysis of the RSA algorithm is given in [a great
arXiv article](https://arxiv.org/html/2308.02785v2#S2.SS1) (Luo, Liu, Mehta,
Ali). We will take inspiration from the such article to give a very brief
explaination of the cipher before actually implementing it.

Let $p$, $q$ be two primes, $n = p \cdot q$, $\phi = \phi(n) = (p-1) (q-1)$.  
Let $e$ be an integer coprime with $n$.  
Let $d$ be an integer such that $e \dot d = 1 mod (\phi n)$.

Then, being $M$ the plaintext message and $C$ the ciphertext, the following
holds:

<div>
$$
    \begin{align*}
        enc(M) &= C = M^e \ (mod\ n) \\
        dec(C) &= M = C^d \ (mod\ n)
    \end{align*}
$$
</div>

In other words, the cipher $\Pi = (\text{enc}, \text{dec})$ defined as above is
correct, and it is indeed the RSA cipher. The public key $K_p = (n, e)$ can be
shared with anyone, while the private key $K_s = (n, d)$ must be kept secret.

### Letter-wise RSA

The practical use of a secure RSA cipher usually involves two key factors:

* the primes $p$ and $q$ must be very large (e.g. 2048 or 4096 bits)
* the encryption happens in _blocks_ (i.e. data is not encrypted byte by byte)

However, for the purpose of this article, we will craft a deliberately
vulnerable RSA implementation, as we will need to break it with a rather common
attack method that in general is not suitable for block cipher.

We will use very small primes (between 29 and 127) and, more importantly, we
will perform _letter-wise_ encryption, i.e. we will encrypt character by
character. This way, frequency analysis can be done even if a string of text is
encrypted.

## Implementation

### Metodology and resources

All the related work can be found in the `homeworks/homework-03` directory of
the repository. The directory itself is structured as an _npm_ package
containing a JavaScript library. This brings a number of advantages:

* a test framework can be used to assert the correctness of the implementations
* the library can be conveniently minified and bundled to be served on the web
* the source code files are structured in a consistent way

To perform automatic testing and be sure that the algorithms are implemented in
a correct way, the [AVA](https://github.com/avajs/ava) test framework has been
used.

The [esbuild](https://esbuild.github.io/) tool has been used to generate a
minified bundle suitable to be served on the web as a library.

### Crafting a frequency analysis framework

In the last article we already have implemented algorithms for frequency
analysis and cipher breaking. Those algorithms were specifically tailored for
the Caesar cipher. First, we will rewrite and generalize that code to build a
frequency analysis framework that should theoretically work with _any_
substitution cipher susceptible to straightforward frequency analysis.

For each relevant task, we will create a [JavaScript
class](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
containing ergonomic primitives to perform it. Classes were introduced in
JavaScript with the EcmaScript 6 standard, and their use may improve the
readability and ergonomics of a JavaScript software library.

#### `FrequencyAnalysis`

First, we will create a class to perform frequency analysis over a generic
iterable object. In contrast to the previous article, we will use a
[`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
instead of `object` to internally store the character-frequency pairs of the
analysis. `Map`s are way faster than plain JavaScript objects and they can use
basically anything as key.

We can proceed to implement the `FrequencyAnalysis` class as follows:

```js
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

  // [...]
}
```

Notice we did a method override over the `get` function of `Map`. This is
because we want the map to return a default value (`0` in our case) instead of
`undefined`. This is completely logical, as if a character is missing from a
frequency analysis, its frequency is 0, and it allows us to perform aritmetic
operations over frequencies without incurring in `NaN` values or errors.

To actually instantiate `FrequencyAnalysis` objects, we can use the following
methods:

Function | Description
---------|---------------------------------------------------------------------
`new FrequencyAnalysis()`         | For internal use. The arguments are passed directly to the `Map` constructor.
`FrequencyAnalysis.empty(text)`   | Create an empty `FrequencyAnalysis`
`FrequencyAnalysis.of(text)`      | Create a `FrequencyAnalysis` over `text`. Only consider alphabetical characters.
`FrequencyAnalysis.raw(iterable)` | Create a `FrequencyAnalysis` over `iterable`. Consider every item.

The `raw` function is necessary, as later on we will need to perform frequency
analyses over an array of numbers to decrypt RSA.

As in the previous article, we provide algorithms to compute the distance from
another `FrequencyAnalysis` and guess the language of a piece of cleartext:

```js
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
```

To conveniently and ergonomically use the library, we will provide a few
methods to manipulate a `FrequencyAnalysis`:

```js
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
```

The `remap` algorithm will be used to adapt an analysis performed over a
ciphertext in order to compute its distance from a reference cleartext
analysis.

The `alphabetic` algorithm will be used to strip non-alphabetical characters
from analyses performed over RSA-encrypted ciphertexts. In my opinion, this is
the most clean and convenient way to perform a correct analysis over such kind
of text, and this approach is very flexible, as it should work with other
ciphers.

Lastly, we provide an algorithm to construct a set of `FrequencyAnalysis`
instances from a frequency analyses database:

```js
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
```

#### `Cipher`

Even if JavaScript does not offer abstract classes, we will model a generic
cipher in a dedicated class:

```js
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
```

This approach has many advantages:

* the computation model and scope is clearly defined
* algorithms interfacing with the `Cipher` class can work with virtually any
  cipher, as long as it extends it

The `all` function allows to iterate over all the possible ciphers. Beware that
it is a [generator
function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*),
the generation of the ciphers is lazy and the iteration can be performed over a
virtually infinite number of ciphers. For example:

```js
for (const cipher of CaesarCipher.all()) {
  const plaintext = 'Some text'
  const ciphertext = cipher.encrypt('Some text')
  console.log(`Encrypting '${plaintext} with ${cipher.toString()}': ${ciphertext}`)
}
```

#### `CaesarCipher`

In order to demonstrate the use of the `Cipher` class by a developer, we will
implement the Caesar cipher again:

```js
/** The Caesar cipher */
export class CaesarCipher extends Cipher {
  static name = 'caesar'

  constructor(context = { key: 0 }) {
    super(context);
  }

  /**
   * Construct a ROT cipher with the given key
   * @param key the key
   * @returns the constructed CaesarCipher
   */
  static rot(key) {
    return new CaesarCipher({ key })
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

  toString() {
    return `CaesarCipher(${this.key})`
  }
}
```

### Implementing letter-wise RSA

Using the `Cipher` class, we can implement the letter-wise RSA algorithm we
introduced earlier. Of course, we will take advantage of some mathematical
algorithms.

```js
/** Fixed set of small primes, such that n < 26 (alphabet length) */
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
  static name = 'letterwise-rsa'

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

  /**
   * Adapt the ciphertext for decryption.
   * Allows to call decrypt() with arguments of different types.
   * @param {string|number|array} ciphertext the ciphertext
   * @returns {array} the ciphertext adapted for decryption
   */
  static adaptCiphertext(ciphertext) {
    if (typeof ciphertext === 'string')
      return JSON.parse(ciphertext)
    if (typeof ciphertext === 'number')
      return [ciphertext]
    return ciphertext
  }

  decrypt(ciphertext) {
    const { d, n } = this.key.private
    return this.constructor.adaptCiphertext(ciphertext)
      .map(x => modPow(x, d, n))
      .map(c => String.fromCharCode(c))
      .join('')
  }

  static *all() {
    for (const i of range(0, PRIMES.length))
      for (const j of range(i + 1, PRIMES.length))
        yield LetterwiseRSA.fromPrimes(PRIMES[i], PRIMES[j])
  }

  toString() {
    return `LetterwiseRSA(p=${this.context.p}, q=${this.context.q})`
  }
}
```

Notice we did not use a secure random number generator. For the purpose of this
article, JavaScript's default PRNG is sufficient.

The `egcd` function implements the [Extended Euclidean
Algorithm](https://cp-algorithms.com/algebra/extended-euclid-algorithm.html).
Such algorithm is used to compute the GCD (i.e. _Greatest Common Divisor_)
between two numbers $x$ and $y$, along with their coefficients $a$, $b$ such
that:

<div>
    $$
    a \cdot x + b \cdot y = \text{gcd}(a, b)
    $$
</div>

The `modInv` and `modPow` methods implement some basic modular aritmetic
primitives to respectively compute the modular inverse and the modular power.
Those primitives are necessary to implement the RSA algorithm.

In the `encrypt` and `decrypt` methods, we straightforwardly implemented the
letter-wise RSA algorithm as described in previous sections.

Lastly, notice that encryption and decryption are performed over single
characters, and unlike with the Caesar cipher, the output of the encryption
process is not a text string. Indeed, there is a unique set of complications in
this context. The ciphertext space is fundamentally different from the
plaintext space, as encrypting a number generally produces a larger one.
Also, even if we converted the outcome of the encryption process back to text,
the eventual presence of non-printable characters would make the implementation
not suitable for an easy and intuitive use, and may break compatibility with
stuff such as the operating system clipboard.

### Breaking the RSA

In this section we will rewrite the cracking algorithm used in the previous
article to make it work with any cipher implemented as a `Cipher` subclass.
Below, the full implementation is given:

```js
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
```

We can clearly see how the implementation of ergonomic class methods makes the
use of our framework really clean.

Compared to the cracking algorithm given in the previous article, this one has
some key differences:

* the `Crack` class never references a specific, concrete implementation of
  `Cipher`
* the frequency of the ciphertext are remapped instead of the language
  reference ones; this guarantees consistency and direct compatibility with
  frequency analyses databases
* the ciphertext is adapted before analysis, so it can be supplied in virtually
  any format

## Testing

Nearly all the implemented algorithms are shipped with automated unit tests.
Tests from the previous article have been rewritten to be integrated with AVA.
We can performing automated tests by installing the necessary dependencies and
launching the test suite:

```
$ yarn install  # You can use a package manager of your choice
$ yarn test

[...]
  ✔ ciphers-correctness › correctness of CaesarCipher(0)
  ✔ ciphers-correctness › correctness of CaesarCipher(1)
  ✔ ciphers-correctness › correctness of CaesarCipher(2)
[...]
  ✔ ciphers-correctness › correctness of LetterwiseRSA(p=29, q=31)
  ✔ ciphers-correctness › correctness of LetterwiseRSA(p=29, q=37)
  ✔ ciphers-correctness › correctness of LetterwiseRSA(p=29, q=41)
  ✔ ciphers-correctness › correctness of LetterwiseRSA(p=29, q=43)
  ✔ ciphers-correctness › correctness of LetterwiseRSA(p=29, q=47)
  ✔ ciphers-correctness › correctness of LetterwiseRSA(p=29, q=53)
  ✔ ciphers-correctness › correctness of LetterwiseRSA(p=29, q=59)
  ✔ ciphers-correctness › correctness of LetterwiseRSA(p=29, q=61)
Frequencies database './frequencies.json' exists
  ✔ crack › crack() CaesarCipher(7), plaintext ./samples/english.txt
  ✔ crack › crack() CaesarCipher(7), plaintext ./samples/italian-short.txt
  ✔ crack › crack() LetterwiseRSA(p=53, q=127), plaintext ./samples/english.txt
Frequencies database './frequencies.json' exists
  ✔ frequency › distanceFrom
  ✔ frequency › detectLanguage for file ./samples/english.txt
  ✔ frequency › detectLanguage for file ./samples/english-short.txt
  ✔ frequency › detectLanguage for file ./samples/italian.txt
  ✔ frequency › detectLanguage for file ./samples/italian-short.txt
  ✔ frequency › detectLanguage for file ./samples/german.txt
  ✔ frequency › detectLanguage for file ./samples/german-short.txt
  ✔ rsa › egcd(2, 4) = 2
  ✔ rsa › egcd(1, 5) = 1
  ✔ rsa › egcd(3, 6) = 3
  ✔ rsa › egcd(4, 12) = 4
  ✔ rsa › egcd(6, 14) = 2
  ✔ rsa › modInv(10, 9) = 1
  ✔ rsa › modInv(50, 13) = 6
  ✔ rsa › modInv(11, 5) = 1
  ✔ rsa › modInv(9, 5) = 4
  ✔ rsa › modPow(16, 4, 8) = 0
  ✔ rsa › modPow(16, 4, 5) = 1
  ✔ rsa › modPow(11, 2, 7) = 2
  ✔ rsa › modPow(50, 19, 14) = 8
  ✔ rsa › modPow(50, 5, 5) = 0
  ✔ caesar › CaesarCipher.encrypt
  ✔ caesar › CaesarCipher.decrypt
  ─

  283 tests passed
Done in 0.37s.
```

Below we also give an example of test unit written with AVA:

```js
import test from 'ava'
import { CaesarCipher } from '../src/ciphers/caesar.js'

test('CaesarCipher.encrypt', t => {
  const plaintext = "The quick brown fox jumps over the lazy dog."
  const expected = "Gur dhvpx oebja sbk whzcf bire gur ynml qbt."
  const ciphertext = CaesarCipher.rot(13).encrypt(plaintext)
  t.is(ciphertext, expected)
})

test('CaesarCipher.decrypt', t => {
  const ciphertext = "Gur dhvpx oebja sbk whzcf bire gur ynml qbt."
  const expected = "The quick brown fox jumps over the lazy dog."
  const plaintext = CaesarCipher.rot(13).decrypt(ciphertext)
  t.is(plaintext, expected)
})
```

## Conclusions

We implemented a full-fledged JavaScript framework to perform frequency
analysis, encryption, decryption and cipher breaking in a generic and
extensible way.

We gave a reference implementation of a letterwise RSA algorithm, and then
broke it with a cracking routine that does not even mention the concrete
`LetterwiseRSA` class.

We also provided automated testing and bundling for everything we crafted.
