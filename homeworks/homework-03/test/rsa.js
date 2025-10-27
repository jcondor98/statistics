import test from 'ava'
import { egcd, modInv, modPow } from '../src/ciphers/letterwise-rsa.js'

function testEgcd(x, y, expected) {
  test(`egcd(${x}, ${y}) = ${expected}`,
    t => t.is(egcd(x, y)[0], expected))
}

function testModInv(a, m, expected) {
  test(`modInv(${a}, ${m}) = ${expected}`,
    t => t.is(modInv(a, m), expected))
}

function testModPow(b, e, m, expected) {
  test(`modPow(${b}, ${e}, ${m}) = ${expected}`,
    t => t.is(modPow(b, e, m), expected))
}

// Test cases in the form [x, y, expected]
const EGCD_CASES = [
  [2, 4, 2],
  [1, 5, 1],
  [3, 6, 3],
  [4, 12, 4],
  [6, 14, 2],
]

// Test cases in the form [a, m, expected]
const MOD_INV_CASES = [
  [10, 9, 1],
  [50, 13, 6],
  [11, 5, 1],
  [9, 5, 4],
]

// Test cases in the form [base, exp, mod, expected]
const MOD_POW_CASES = [
  [16, 4, 8, 0],
  [16, 4, 5, 1],
  [11, 2, 7, 2],
  [50, 19, 14, 8],
  [50, 5, 5, 0],
]

for (const c of EGCD_CASES)
  testEgcd(...c)

for (const c of MOD_INV_CASES)
  testModInv(...c)

for (const c of MOD_POW_CASES)
  testModPow(...c)
