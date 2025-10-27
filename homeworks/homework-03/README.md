# Letterwise RSA

This directory contains algorithm implementations for using and breaking a
vulnerable, letter-wise RSA algorithm.

In particular, modular algorithms are implemented to:

* perform frequency analysis over any iterable object (not only strings)
* manipulate and implement substitution ciphers in a pluggable and modular way
* break any implemented substitution cipher with frequency analysis
* use and break the Caesar cipher
* use and break a vulnerable, letter-wise RSA algorithm with a small set of
  primes

## Testing

Testing is done via the [AVA test framework](https://github.com/avajs/ava).
To execute the full test suite, run:

```bash
yarn ava
```

## Building

All the implemented algorithm are maintained as an npm package. To make a build
suitable for being served on the web (e.g. for a web application),
[`esbuild`](https://esbuild.github.io/) can be used:

```bash
npm build
```

This will produce a JavaScript minified bundle under the `dist/` directory
