# Homework 02

This directory all the practical work related to Homework 02.

## Distribution

Under the `distribution/` directory, you can test the queries for calculating
the required distributions by running `run.sh`.

You will need `sqlite3` and `python3` with the `faker` pip package installed in
your machine.

The script will:

* Create a random dataset
* Create a `sqlite3` database on a local file
* Populate the database with the dataset
* Run all the queries in the `queries/` directory (which compute the
  distributions)
* Save the results in the `output/` directory, formatted in CSV

## Frequency analysis

Under the `distribution/` directory, you can test all the JavaScript functions
required by the second part of the homework by running `test.js`:

```bash
node test.js
```

You will need a modern `nodejs` distribution. No third-party libraries or tools
are used.

The test suite will assert that the following functions work:

Function                | Description
------------------------|------------------------------------------------------
`computeFrequencies`    | Compute the letters frequencies for a string
`encrypt`               | Encrypt a string with the Caesar cipher
`decrypt`               | Decrypt a string with the Caesar cipher
`crack`                 | Crack a ciphertext encrypted with the Caesar cipher
`buildFrequenciesDb`    | Build a database with the frequencies of various languages

To use the functions in a program, import `lib.js` and
`build-frequencies-db.js`. Only `build-frequencies-db.js` needs `nodejs`.
