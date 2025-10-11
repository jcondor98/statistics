---
title: Distribution and frequency analysis
description: >-
  Compute distributions with a DBMS.<br/>
  Perform frequency analysis over text.<br/>
  Implement the Caesar cipher.<br/>
  Break the Caesar cipher with frequency analysis.
author: Paolo Lucchesi
date: 2025-10-10 19:00:00 +0200
permalink: /homework-2/
---

In this article we will work hands on with empirical distributions and
frequency analysis. First, we will compute univariate and bivariate
distributions over a dataset. Then, we will see how to perform frequency
analysis over text, implementing from scratch and then breaking a Caesar
cipher.

All the work related to this homework can be found in the
[repository](https://github.com/jcondor98/statistics), in the
`homeworks/homework-02/` directory.

For the frequency analysis part, the implementations done can be tested
directly at the end of this page with an interactive tool.

## Distribution

For this part we will create a random dataset and compute univariate and
bivariate distributions over its attributes.

### Metodology and resources

All the related work can be found in the `homeworks/homework-02/distribution`
directory of the repository.

The dataset is generated randomly with the `gen-dataset.py` Python script. The
package `faker` must be installed, as it is a Python dependency of the script.
To install it, you will most likely want to use `pip`:

```bash
pip install faker
```

The `faker` package is used to generate fake names and surnames to make the
dataset a bit more realistic. Names and surnames are not statistically relevant
in this context.

The `sqlite3` database is used to load the dataset and perform any operation on
it. Though the queries should work with any SQL database, the `run.sh` script
will use a `sqlite3` file database. Using `sqlite3` eliminates the need of a
DMBS server.

### About the dataset

The population units are represented by students. Each student has the
following attributes:

Attribute       | Type    | Description
----------------|---------|----------------------------------------------------
`name`          | string  | Name (not relevant)
`surname`       | string  | Surname (not relevant)
`fuori_sede`    | boolean | Is the student coming from outside the town?
`avg_score`     | float   | The average score, approximated by 2 decimals
`academic_year` | integer | The academic year, between 1 and 5

A database table for the dataset can be created as follows:

```sql
CREATE TABLE Person (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    fuori_sede BOOLEAN NOT NULL,
    avg_score DECIMAL(4,2) NOT NULL CHECK (avg_score >= 18 AND avg_score <= 30),
    academic_year INTEGER NOT NULL CHECK (academic_year BETWEEN 1 AND 5)
);
```

### Computing distributions

#### Univariate distribution on `fuori_sede`

The univariate distribution on `fuori_sede` has only 2 domain values and
basically tells us with which frequency a student is _fuori sede_ or not.

Univariate distributions can be computed in a quite simple way with SQL. First,
we observe we can aggregate all the people in the dataset by an arbitrary
attribute, counting how many students have that attribute set to a specific
value. For the `fuori_sede` attribute:

```sql
SELECT fuori_sede, COUNT(*) AS students
FROM Person
GROUP BY fuori_sede;
```

To compute the univariate distribution, it is sufficient to divide each count
for the total number of students:

```sql
SELECT fuori_sede,
  CAST(COUNT(*) AS FLOAT) / SUM(COUNT(*)) OVER () AS frequency
FROM Person
GROUP BY fuori_sede;
```

Notice how extra care must be taken to perform float division instead of
integer division. `SUM(COUNT(*)) OVER ()` computes the total number of rows in
the `Person` table.

The result of the query above should be something like this:

```csv
fuori_sede,frequency
0,0.42
1,0.58
```

Query results will be given in CSV, as they are readable and they can be
immediately processed further by virtually any program (you can even open them
directly with Excel or Calc).

#### Univariate distribution on `avg_score`

To compute the univariate distribution on `avg_score`, we define an interval of
width `1` to group students. In practice, the average scores will be
approximated to integer values:

```sql
SELECT CAST(avg_score AS INTEGER) AS avg_score,
  CAST(COUNT(*) AS FLOAT) / SUM(COUNT(*)) OVER () AS frequency
FROM Person
GROUP BY CAST(avg_score AS INTEGER);
```

The output should be something similar to this:

```csv
avg_score,frequency
18,0.09
19,0.09
20,0.06
21,0.12
22,0.06
23,0.09
24,0.14
25,0.06
26,0.05
27,0.07
28,0.08
29,0.09
```

#### Univariate distribution on `avg_score`

As we already computed the univariate distribution on `fuori_sede`, doing it
for `academic_year` is straightforward:

```sql
SELECT academic_year,
  CAST(COUNT(*) AS FLOAT) / SUM(COUNT(*)) OVER () AS frequency
FROM Person
GROUP BY academic_year;
```

The output should be something similar to this:

```csv
academic_year,frequency
1,0.19
2,0.26
3,0.2
4,0.21
5,0.14
```

#### Bivariate distribution on `academic_year` and `avg_score`

Computing bivariate distributions in SQL can be done in a clean way.
Using `GROUP BY` on two attributes performs a cartesian product on such
attributes, aggregating rows inwhich their values are the same.
So we can simply select the `academic_year` and `avg_score` and group the rows
by them:

```sql
SELECT academic_year, CAST(avg_score AS INTEGER) AS avg_score,
  CAST(COUNT(*) AS FLOAT) / SUM(COUNT(*)) OVER () AS frequency
FROM Person
GROUP BY academic_year, CAST(avg_score AS INTEGER);
```

The output should be something similar to this:

```csv
academic_year,avg_score,frequency
1,18,0.01
1,19,0.01
1,20,0.01
1,21,0.05
1,22,0.02
1,23,0.01
1,24,0.03
1,25,0.01
1,27,0.02
1,28,0.01
1,29,0.01
2,18,0.06
2,19,0.03
[...]
```

#### Bonus: Bivariate distribution on `academic_year` and `fuori_sede`

Suppose we want a view on the point each student is in their academic path,
taking into account if they are _fuori sede_ or not for further analysis. We
can compute the bivariate empirical distribution like in the previous case:

```sql
SELECT academic_year, fuori_sede,
  CAST(COUNT(*) AS FLOAT) / SUM(COUNT(*)) OVER () AS frequency
FROM Person
GROUP BY academic_year, fuori_sede;
```

The output should be something similar to this:

```csv
academic_year,fuori_sede,frequency
1,0,0.07
1,1,0.12
2,0,0.13
2,1,0.13
3,0,0.09
3,1,0.11
4,0,0.09
4,1,0.12
5,0,0.04
5,1,0.1
```

## Frequency analysis

In this part we will focus on _frequency analysis_. In particular, we will
implements algorithms in JavaScript to:

* perform frequency analysis on the letters of an arbitrary string
* encrypt and decrypt a string with the Caesar cipher (using an arbitrary key)
* break the Caesar cipher using frequency analysis on an arbitrary ciphertext

### Metodology and resources

All the related work can be found in the
`homeworks/homework-02/frequency-analysis` directory of the repository.

The training text snippets to compute default frequencies for various spoken
languages will be generated with
[RandomTextGenerator](https://randomtextgenerator.com/), a neat online utility
that outputs random text. This utility avoids using special characters even if
they should be used in the chosen language, making the computed frequencies
consistent when breaking the cipher and automatically guessing the language.

The sample text present in the repository used for testing is taken from [Night
Train to Lisbon](https://en.wikipedia.org/wiki/Night_Train_to_Lisbon) by Pascal
Mercier, one of my favourite novels.

The [Cryptii Caesar cipher utility](https://cryptii.com/pipes/caesar-cipher)
has been used to perform the first tests of the Caesar cipher implementation.

Generating the frequencies database and running the automated test suite in the
repository requires `nodejs` to be installed. No third-party libraries are
required.

Keep in mind that a pre-generated frequencies database is present in the
repository, along with its training data.

### Simple frequency analysis

Frequency analysis for a text string consists in computing the frequency with
which each letters appears. For example, we expect vocals to be more frequent
than consonants in most of the languages. Different spoken languages shall have
different letters distributions.

The process of programmatically performing frequency analysis for a string `s`
is quite simple. First, we eliminate every non-alphabetical character from `s`.
Then, we build a map (i.e. a dictionary) inwhich each key is represented by a
distinct character, and the corresponding value is the number of times that
character appears. Finally, all the values in the map are divided by the total
number of alphabetical character in `s`.

Below we give a working implementation in JavaScript:

```js
export function computeFrequencies(s) {
  // Initialize frequencies map
  const frequencies = {};
  for (const i of range(0, 26))
    frequencies[String.fromCharCode(LOWER_A_CODE + i)] = 0;

  // Eliminate non-alphabetical characters
  s = [...s.toLowerCase()].filter(c => c.match(/[a-z]/))

  // Count occurrencies for each letter
  for (const c of s)
    frequencies[c] += 1;

  // Compute the actual frequencies by dividing for the total number of letters
  for (const [c, count] of Object.entries(frequencies))
    frequencies[c] = count / s.length;

  return frequencies;
}
```

#### Analysing the result

Calling the given implementation on a rather long English text gives the
following result:

```json
{
  "a": 0.07104967047098537,
  "b": 0.014788619193055779,
  "c": 0.028773509082141133,
  "d": 0.05031345442854847,
  "e": 0.13984889889085356,
  "f": 0.022343674650377753,
  "g": 0.017842790548143386,
  "h": 0.033435139045169586,
  "i": 0.07458607940845523,
  "j": 0.002089696190323099,
  "k": 0.004500884102234368,
  "l": 0.0374537855650217,
  "m": 0.02652306703102395,
  "n": 0.0749075711300434,
  "o": 0.06879922841986819,
  "p": 0.028773509082141133,
  "q": 0.0024111879119112683,
  "r": 0.07024594116701495,
  "s": 0.07265712907892621,
  "t": 0.0781224883459251,
  "u": 0.03279215560199325,
  "v": 0.010287735090821412,
  "w": 0.013663398167497186,
  "x": 0.003214917215881691,
  "y": 0.020253978460054653,
  "z": 0.00032149172158816913
}
```

We can compare it with a set of frequencies taken from the [Emory Oxford
College](https://mathcenter.oxford.emory.edu/site/math125/englishLetterFreqs/)
Mathematical centre:

```json
{
  "a": 0.08167,
  "b": 0.01492,
  "c": 0.02782,
  "d": 0.04253,
  "e": 0.12702,
  "f": 0.02228,
  "g": 0.02015,
  "h": 0.06094,
  "i": 0.06966,
  "j": 0.00153,
  "k": 0.00772,
  "l": 0.04025,
  "m": 0.02406,
  "n": 0.06749,
  "o": 0.07507,
  "p": 0.01929,
  "q": 0.00095,
  "r": 0.05987,
  "s": 0.06327,
  "t": 0.09056,
  "u": 0.02758,
  "v": 0.00978,
  "w": 0.02360,
  "x": 0.00150,
  "y": 0.01974,
  "z": 0.00074
}
```

We can observe that the frequencies are similar. In particular, it can be
observed that vocals have a much higher frequencies, and unusual letters such
as `j` and `z` have lower values.

#### Bonus: Automatic language detection

It is possible to use frequency analysis to automatically detect the language
of an arbitrary text. This can be done roughly as follows:

* take the frequency analyses of all the different supported languages
* perform the frequency analysis on the chosen text
* compare the previous analysis with all the ones relative to the supported
  languages

The frequency analysis that is closest to the one of the chosen text is the one
relative to the detected language.

An implementation of the described algorithm is given below:

```js
export function detectLanguage(text, frequencies) {
  const textFrequencies = computeFrequencies(text);
  let guess = {
    language: null,
    distance: FREQ_MAX_GUESS_DISTANCE
  };

  // `frequencies` contains the frequency analyses for all the supported languages
  for (const language in frequencies) {
    const distance = computeDistance(
      textFrequencies, frequencies[language]);
    if (distance < guess.distance)
      guess = { language, distance }; // Found a better guess
  }

  return guess;
}
```

We will discuss in depth how to measure the distance between two frequency
analyses in later sections.

At the end of this article, you can try this algorithm directly with the
Caesar cipher interactive tool.

### Caesar cipher

The Caesar cipher is a simple, ancient, substitution cipher that was in use
since the Romans. It basically consists in shifting each character, so the
ciphertext becomes unreadable.

To give a more formal definition of the cipher, we quote the [Encyclopedia
Britannica](https://www.britannica.com/topic/Caesar-cipher):

> Caesar cipher, simple substitution encryption technique in which each letter
> of the text to be encrypted is replaced by a letter a fixed number of
> positions away in the alphabet. For example, using a right letter shift of
> four, A would be replaced by E, and the word CIPHER would become GMTLIV.

The cipher can be implementated as follows:

* assign a numerical position to each letter (e.g. `a` is `0`, `c` is `3`, ...)
* choose a numerical _key_ `k` (between `0` and `25` for the English alphabet)
* to _encrypt_ shift each letter forward by `k` places (consider that letters
  may overflow, so technically letters must be _rotated_ and not shifted)
* to _decrypt_ shift each letter backwards by `k` places (the same overflow
  observation applies)

Below, a complete JavaScript implementation of the cipher is given:

```js
const LOWER_A_CODE = 'a'.charCodeAt(0);
const LOWER_Z_CODE = 'z'.charCodeAt(0);
const UPPER_A_CODE = 'A'.charCodeAt(0);
const UPPER_Z_CODE = 'Z'.charCodeAt(0);

function encrypt(plaintext, key = 13) {
  return [...plaintext].map(c => {
    let code = c.charCodeAt(0);

    if (code >= LOWER_A_CODE && code <= LOWER_Z_CODE)
      code = LOWER_A_CODE + (code - LOWER_A_CODE + key) % 26;
    else if (code >= UPPER_A_CODE && code <= UPPER_Z_CODE)
      code = UPPER_A_CODE + (code - UPPER_A_CODE + key) % 26;

    return String.fromCharCode(code);
  }).join('');
}

function decrypt(ciphertext, key) {
  return [...ciphertext].map(c => {
    let code = c.charCodeAt(0);

    if (code >= LOWER_A_CODE && code <= LOWER_Z_CODE)
      code = LOWER_A_CODE + (code - LOWER_A_CODE + 26 - key) % 26;
    else if (code >= UPPER_A_CODE && code <= UPPER_Z_CODE)
      code = UPPER_A_CODE + (code - UPPER_A_CODE + 26 - key) % 26;

    return String.fromCharCode(code);
  }).join('');
}
```

We can use the [automated test in the
repository](https://github.com/jcondor98/statistics/blob/master/homework-02/frequency-analysis/test.js)
to give a try to the implementation above:

```
Testing encrypt() with key 13 (ROT13)
  Plaintext is: The quick brown fox jumps over the lazy dog.
  Computed ciphertext is: Gur dhvpx oebja sbk whzcf bire gur ynml qbt.
  Expected ciphertext is: Gur dhvpx oebja sbk whzcf bire gur ynml qbt.
  Ciphertext is correct
Testing decrypt() with key 13 (ROT13)
  Ciphertext is: Gur dhvpx oebja sbk whzcf bire gur ynml qbt.
  Computed plaintext is: The quick brown fox jumps over the lazy dog.
  Expected plaintext is: The quick brown fox jumps over the lazy dog.
  Plaintext is correct
```

At the end of this article, you can try these algorithms directly with the
Caesar cipher interactive tool.

### Breaking the Caesar cipher

The Caesar cipher can be broken using frequency analysis. The idea is that,
given a ciphertext `c`, we can perform a frequency analysis on `c` and compare
the result to the default frequencies of the spoken language for every possible
key `k`. Notice that this is not a brute-forcing technique, as it is sufficient
to shift the place of the frequencies instead of actually decrypting `c` for
every possible key.

There are a plethora of ways to compare frequency analyses. For this
implementation, we will try to compute a _cumulative distance_ between them.
Iterating every letter, we will accumulate (i.e. sum every occurrence of) the
absolute difference of the relative frequency. The final result will be
considered as the distance.

A JavaScript implementation of an algorithm automatically breaking the cipher
may look like the one given below:

```js
function _crack(ciphertext, frequencies) {
  const encFrequencies = computeFrequencies(ciphertext);
  let guess = {
    key: 0,
    distance: FREQ_MAX_GUESS_DISTANCE
  };

  // Iterate over all possible keys
  for (const key of range(0, 26)) {
    const distance = computeDistance(frequencies, encFrequencies, key);
    if (distance < guess.distance)
      guess = { key, distance }; // Found a better guess
  }

  return guess;
}

// Compute the distance between two frequency analyses
// If key is specified, it will be used to shift f2 frequencies
function computeDistance(f1, f2, key = 0) {
  let total = 0

  for (const i of range(0, 26)) {
    const c = String.fromCharCode('a'.charCodeAt(0) + i);
    total += Math.abs(f1[c] - f2[encrypt(c, key)]);
  }

  return total;
}
```

The `frequencies` argument must be a pre-computed frequency analysis performed
on a (preferrably long) plaintext string of the spoken language of choice.

#### Automatic language guessing

The given implementation for the cracking algorithm can be extended to support
multiple spoken languages and automatically guess the one used in a ciphertext.

The idea is to build an object containing the frequencies for multiple
languages structured like so:

```json
{
  "english": {
    "a": 0.07104967047098537,
    "b": 0.014788619193055779,
    "c": 0.028773509082141133,
    "d": 0.05031345442854847,
    "e": 0.13984889889085356,
    "f": 0.022343674650377753,
    "g": 0.017842790548143386,
    "h": 0.033435139045169586,
    "i": 0.07458607940845523,
    "j": 0.002089696190323099,
    "k": 0.004500884102234368,
    "l": 0.0374537855650217,
    "m": 0.02652306703102395,
    "n": 0.0749075711300434,
    "o": 0.06879922841986819,
    "p": 0.028773509082141133,
    "q": 0.0024111879119112683,
    "r": 0.07024594116701495,
    "s": 0.07265712907892621,
    "t": 0.0781224883459251,
    "u": 0.03279215560199325,
    "v": 0.010287735090821412,
    "w": 0.013663398167497186,
    "x": 0.003214917215881691,
    "y": 0.020253978460054653,
    "z": 0.00032149172158816913
  },
  "italian": {
    "a": 0.12013644600788828,
    "b": 0.0118324272465622,
    "c": 0.041679991472124506,
    "d": 0.032832320648118536,
    "e": 0.11310094872614859,
    "f": 0.012365419464875812,
    "g": 0.016309561880396548,
    "h": 0.013751199232491206,
    "i": 0.1107557829655687,
    "j": 0,
    "k": 0.00010659844366272253,
    "l": 0.045304338556657074,
    "m": 0.0312333439931777,
    "n": 0.05926873467647372,
    "o": 0.09433962264150944,
    "p": 0.027715595352307856,
    "q": 0.0027715595352307857,
    "r": 0.0719539494723377,
    "s": 0.059162136232811004,
    "t": 0.06779661016949153,
    "u": 0.030380556443875918,
    "v": 0.028994776676260527,
    "w": 0,
    "x": 0.0011725828802899478,
    "y": 0,
    "z": 0.007035497281739686
  }
}
```

Then we call the cracking algorithm multiple times, using a different language
each iteration. The outcome having the minimum frequency distance will be our
best guess.

With the cracking algorithm being already implemented, this can be done quite
easily in JavaScript:

```js
export function crack(ciphertext, frequencies, language) {
  // Give the possibility to explicitly use a specific language
  if (!!language)
    return _crack(ciphertext, frequencies[language]);

  let guess = { distance: CRACK_MAX_GUESS_DISTANCE };

  for (const l in frequencies) {
    const attempt = _crack(ciphertext, frequencies[l]);
    if (attempt.distance < guess.distance)
      guess = { language: l, ...attempt };
  }

  return guess;
}
```

#### Testing the implementation

Again, we use the [automated test in the
repository](https://github.com/jcondor98/statistics/blob/master/homework-02/frequency-analysis/test.js)
to try if the code above works:

```
Testing crack() with key 13 (ROT13)
  Frequencies database './frequencies.json' exists
  Ciphertext is: Tertbevhf ybbxrq nurnq ng gur cbvagrq gbjref bs gur Uvfgbevpny Zhfrhz bs gur
  Pvgl bs Orea, hc gb gur Thegra naq qbja gb gur Nner jvgu vgf tynpvre terra
  jngre. N thfgl jvaq qebir ybj-ylvat pybhqf bire uvz, ghearq uvf hzoeryyn vafvqr
  bhg naq juvccrq gur enva va uvf snpr. Abj ur abgvprq gur jbzna va gur zvqqyr bs
  gur oevqtr. Fur unq yrnarq ure ryobjf ba gur envyvat naq jnf ernqvat va gur
  cbhevat enva jung ybbxrq yvxr n yrggre.

  Result of the cracking process is: { language: 'english', key: 13, distance: 0.2366831509970971 }
  Computed plaintext is: Gregorius looked ahead at the pointed towers of the Historical Museum of the
  City of Bern, up to the Gurten and down to the Aare with its glacier green
  water. A gusty wind drove low-lying clouds over him, turned his umbrella inside
  out and whipped the rain in his face. Now he noticed the woman in the middle of
  the bridge. She had leaned her elbows on the railing and was reading in the
  pouring rain what looked like a letter.

  Expected plaintext is: Gregorius looked ahead at the pointed towers of the Historical Museum of the
  City of Bern, up to the Gurten and down to the Aare with its glacier green
  water. A gusty wind drove low-lying clouds over him, turned his umbrella inside
  out and whipped the rain in his face. Now he noticed the woman in the middle of
  the bridge. She had leaned her elbows on the railing and was reading in the
  pouring rain what looked like a letter.

  Plaintext is correct
```

Also, at the end of this article, you can try this algorithm directly with the
Caesar cipher interactive tool.

#### Bonus: Building a frequencies database

To make an efficient implementation of a multi-language Caesar cipher automatic
cracker, we will compile a database containing all the pre-computed letters
frequencies for various languages. Using a script (in JavaScript) we will save
the database as a JSON file, so it will be available at any time as a local
file or remote resource through the network.

Having all the algorithms already implemented, we can build and save the
database easily using the `nodejs` filesystem API:

```js
const DEFAULT_OUTPUT = './frequencies.json';
const DEFAULT_TRAINING_DIR = './training';

export async function buildFrequenciesDb(output = DEFAULT_OUTPUT, trainingDir = DEFAULT_TRAINING_DIR) {
  console.group("Building letters frequencies database");
  const frequencies = {};

  for (const file of await fs.readdir('./training/')) {
    const language = file.replace(/\.txt$/, '');
    console.log(`Processing training text for language '${language}'`);
    const text = await fs.readFile(`${trainingDir}/${language}.txt`);
    frequencies[language] = computeFrequencies(text.toString());
  }

  console.log(`Writing frequencies database to '${output}'`);
  await fs.writeFile(output, JSON.stringify(frequencies));
  console.groupEnd();
}

if (import.meta.main) {
  buildFrequenciesDb();
}
```

The complete code can be found in the [`build-frequencies-db`
file](https://github.com/jcondor98/statistics/blob/master/homework-02/frequency-analysis/build-frequencies-db.js)
of the repository.

The test suite actually given in the repository and the interactive tool at the
end of this page use the pre-computed frequencies database in order to be
efficient.

### Bonus: Interactive Caesar cipher toolkit

Here you can try all the algorithms described above interactively. Just enter
some plaintext or ciphertext and choose an operation to perform.

Of course, the specified key is ignored when cracking.

<textarea id="caesar-input" rows="8"></textarea>

<div id="caesar-controls">
    <div>
        <button type="button" onclick="window.caesar.events.onAnalyse()">Analyse</button>
        <button type="button" onclick="window.caesar.events.onEncrypt()">Encrypt</button>
        <button type="button" onclick="window.caesar.events.onDecrypt()">Decrypt</button>
        <button type="button" onclick="window.caesar.events.onCrack()">Crack</button>
        <button type="button" onclick="window.caesar.events.onDetectLanguage()">Detect Language</button>
        <button type="button" onclick="window.caesar.events.onReset()">Reset</button>
    </div>
    <div>
        <small>Language: </small>
        <span id="caesar-language">Unknown</span>
        <span class="caesar-separator"> - </span>
        <small>Key: </small>
        <input id="caesar-key" type="number" value="13" />
    </div>
</div>

<textarea readonly id="caesar-result" rows="8"></textarea>

<div>
    <small>Frequency analysis distance: </small>
    <span id="caesar-distance"></span>
</div>

## Conclusions

In this article we performed some basic distribution computations on a randomly
generated dataset.

Then, we implemented the Caesar cipher from scratch and broke it using
statistics.


<style>
    #caesar-input, #caesar-result {
        width: 100%;
        border-radius: 0.3em;
        background-color: #f3f6fa;
        margin: 0.6em 0;
    }

    #caesar-controls {
        display: flex;
        justify-content: space-between;
    }

    #caesar-key {
        width: 4em;
    }

    .caesar-separator {
        margin: 0 0.4em;
    }
</style>


<script type="importmap">
    { "imports": { "lib": "https://cdn.jsdelivr.net/gh/jcondor98/statistics@master/homeworks/homework-02/frequency-analysis/lib.js" } }
</script>
<script type="module" src="/assets/js/homework-02.js"></script>
