import { Cipher, range, LOWER_A_CODE, LOWER_Z_CODE, UPPER_A_CODE, UPPER_Z_CODE } from "../lib.js";

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
}

