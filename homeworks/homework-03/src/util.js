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
