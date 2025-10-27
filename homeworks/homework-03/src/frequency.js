import { FREQ_MAX_GUESS_DISTANCE, LOWER_A_CODE, UPPER_A_CODE, isAlphabetic, range } from "./util.js"

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
    const analyses = {}
    for (const l in dataByLanguage)
      analyses[l] = new FrequencyAnalysis(Object.entries(dataByLanguage[l]))
    return analyses
  }
}

