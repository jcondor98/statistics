---
title: Mean and variance as recurrence relations
description: >-
  Empirically prove recurrence relationships for arithmetic mean and variance.<br/>
  Compare the batch and recurrence-based algorithms for mean and variance.
author: Paolo Lucchesi
date: 2025-11-05 20:00:00 +0200
permalink: /homework-6/
---

{% include mathjax.html %}

In this article we will study _recurrence relationships_ in the context of
arithmetic mean and variance, bringing empirical proof of the correctness of
such algorithms.

We will also give a comparison between straightforward batch algorithms and
recurrence-based ones for mean and variance.

All the work related to this homework can be found in the
[repository](https://github.com/jcondor98/statistics), in the
`homeworks/homework-06/` directory.

## Recurrence relationships algorithms

Many statistics indicator can be expressed through _recurrence relations_.
A recurrence relation is a definition of the $n$-th sample of a sequence as a
function of the previous terms.

Recurrence relations are very useful in data science, as they allow to develop
algorithms that do not need the entire dataset every time to incrementally
compute their output.

## Methodology and resources

As in previous articles, all the related work is structured as an `npm`
package, under the `homeworks/homework-06/` directory.

The [`yargs`](https://yargs.js.org/) library has been used to conveniently
parameterize the test suite.

In order to craft a clean and convenient test suite for our experiments, let's
define the following classes as infrastructure:

```js
export class Mean {
  constructor() { }

  /**
   * Construct a Mean instance from an array of values
   * @param _values the values to use
   * @returns {Mean} the constructed Mean instance
   */
  static from(_values) {
    throw new Error("from() not implemented for abstract class Mean")
  }

  /** @returns {number} the current value for the mean */
  mean() {
    throw new Error("mean() not implemented for abstract class Mean")
  }

  /**
   * Push another value for the computation of the mean
   * @param _x the value to push
   * @returns {Mean} this Mean instance
   */
  push(_x) {
    throw new Error("push() not implemented for abstract class Mean")
  }
}

export class Variance {
  constructor() { }
  /**
   * Construct a Variance instance from an array of values
   * @param _values the values to use
   * @returns {Variance} the constructed Variance instance
   */
  static from(_values) {
    throw new Error("from() not implemented for abstract class Variance")
  }

  /** @returns {number} the current value for the variance */
  variance() {
    throw new Error("variance() not implemented for abstract class Variance")
  }

  /**
   * Push another value for the computation of the variance
   * @param _x the value to push
   * @returns {Variance} this Variance instance
   */
  push(_x) {
    throw new Error("push() not implemented for abstract class Variance")
  }
}
```

## Arithmetic mean

Recalling from the previous article, the _arithmetic mean_ is defined as:

<div>
$$
    \bar{x} = \mu = \frac{1}{n} \sum_{i=0}^n x_i
$$
</div>

### Batch algorithm

Given its very definition, we can implement a batch algorithm to compute the
arithmetic mean of a sequence of samples in a very simple way:

```js
export class BatchMean extends Mean {
  constructor(values) {
    super()
    this.values = values
  }

  static from(values) {
    return new BatchMean(values)
  }

  mean() {
    this.values.reduce((mu, x) => mu + x / this.values.length, 0)
  }

  push(x) {
    this.values.push(x)
  }
}
```

Notice that in the JavaScript implementation each sample is eagerly divided by
the cardinality of the sequence, so no overflow shall occur.

### Recurrent sum algorithm

The most straightforward way to express the aritmetic mean in terms of a
recurrent relation is to keep track of the total sum of the samples with their
number. Whenever there is a new sample, it is simply added to the sum, and the
sum is divided again for the (incremented) number of items. More formally:

<div>
$$
    S_n = S_{n-1} + x_n, \qquad \mu = \frac{S_n}{n}
$$
</div>

```js
export class RecurrentSumMean extends Mean {
  constructor(sum, n) {
    super()
    this.sum = sum
    this.n = n
  }

  static from(values) {
    const sum = values.reduce((x, y) => x + y, 0)
    const n = values.length
    return new RecurrentSumMean({ sum, n })
  }

  mean() {
    return this.sum / this.n
  }

  push(x) {
    this.sum += x
    this.n += 1
    return this
  }
}
```

This approach has a fundamental problem of numerical stability. For a large
number of elements the `sum` variable is likely to overflow, undermining the
correctness itself of the algorithm.

### Online mean

The so-called _online mean_ or _recursive mean_ is an algorithm designed to
incrementally update the mean of a set of values without storing neither them
or their total sum.

Formally, it is defined as follows:

<div>
$$
    \bar{x}_n = \bar{x}_{n-1} + \frac{x_n - \bar{x}_{n-1}}{n}
$$
</div>

The general idea is to use the previously computed mean value until the
$(n-1)$-th element to compute the mean $\bar{x}_n$ after inserting $x_n$.

We can implement this algorithm in JavaScript:

```js
export class OnlineMean extends Mean {
  constructor(values = []) {
    super()
    this.mu = 0
    for (const x of values)
      this.push(x)
  }

  static from(values) {
    return new OnlineMean(values)
  }

  mean() {
    return this.mu
  }

  push(x) {
    this.mu = this.mu + (x - this.mu) / this.n
    return this
  }
}
```

We can see that no overflow issues shall happen. Moreover, the error
accumulated at each `push()` call is small and of the same magnitude, so we
shall consider this algorithm quite sound from the perspective of numerical
stability.

The online mean algorithm is used in the Welford algorithm, which we will
introduce shortly.

## Variance

Recalling from the previous article, the _arithmetic mean_ is defined as:

<div>
$$
    \sigma^2 = \frac{1}{n-1} \sum_{i=1}^n (x_i - \mu)^2
$$
</div>

### Batch algorithm

As for the arithmetic mean, we can implement a batch algorithm to compute the
variance of a sequence of samples:

```js
export class BatchVariance extends Variance {
  constructor(values = []) {
    super()
    this.values = values
  }

  static from(values) {
    return new BatchVariance(values)
  }

  variance() {
    const mu = BatchMean.from(this.values).mean()
    const sum = this.values.reduce((acc, x) => acc + Math.pow(x - mu, 2), 0)
    return sum / (this.values.length - 1)
  }

  push(x) {
    this.values.push(x)
    return this
  }
}
```

Notice we did not use any optimized or inline algorithm for computing the mean.
For didactic purposes, we might want implement a full, more naive version
recomputing the mean each time (i.e. directly from the definition formula of
variance). However, since we already discussed various implementations for
computing the mean, we will take advantage of them.

### Welford algorithm

The Welford algorithm is capable of online incremental computation of the
variance for large sequences of samples. Under the hood, it uses the online
mean algorithm (which we already implemented as the `OnlineMean` class) to keep
track of $\mu$, and a similar approach to actually compute the variance each
time a new item is pushed to the sequence.

Formally, it is defined as follows:

<div>
$$
    \begin{cases}
        \sigma^2_n &= \frac{M_{2, n}}{n-1} \\
        M_{2, n} &= M_{2, n-1} + \delta_n (x_n - \mu_n) \\
        \mu_n &= \mu_{n-1} + \frac{\delta_n}{n} \\
        \delta_n &= x_n - \mu_{n-1}
    \end{cases}
$$
</div>

Having already implemented the online mean algorithm, we can simplify the above
definition by omitting the explicit computation of the mean:

<div>
$$
    \begin{cases}
        \sigma^2_n &= \frac{M_{2, n}}{n-1} \\
        M_{2, n} &= M_{2, n-1} + (x_n - \mu_{n-1}) (x_n - \mu_n)
    \end{cases}
$$
</div>

We can proceed to implement the Welford algorithm in JavaScript:

```js
export class WelfordVariance extends Variance {
  constructor(values = []) {
    super()
    this.mean = new OnlineMean()
    this.m = 0
    this.n = 0
    for (const x of values)
      this.push(x)
  }

  static from(values) {
    return new WelfordVariance(values)
  }

  variance() {
    return this.m / (this.n - 1)
  }

  push(x) {
    const muPrev = this.mean.mean()
    const mu = this.mean.push(x).mean()
    this.m += (x - muPrev) * (x - mu)
    this.n += 1
    return this
  }
}
```

## Testing the implementations

### Executing the test suite

In order to test and analyse the implemented algorithm, a test suite has been
written. The `yargs` library is used to parameterize the produced code.

The test suite can be invoked as follows:

```
$ yarn test --help
Commands:
  hw06-test test  Test all the implemented algorithms

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
Done in 0.09s.

$ yarn test --help test
Test all the implemented algorithms

Options:
      --version  Show version number                                   [boolean]
      --help     Show help                                             [boolean]
  -n             Number of samples                      [number] [default: 1000]
      --max      Maximum value of a sample               [number] [default: 100]
```

For example:

```bash
yarn test test -n 100000 --max 2000
```

### Test suite source code

As usual, `yargs` offers a succint syntax to write CLI applications:

```js
#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { BatchMean, RecurrentSumMean, OnlineMean, BatchVariance, WelfordVariance } from './src/index.js';

yargs()
  .scriptName("hw06-test")
  .usage('$0 test')
  .command('test', 'Test all the implemented algorithms',
    y => y
      .option('n', { type: 'number', describe: 'Number of samples', default: 1000 })
      .option('max', { type: 'number', describe: 'Maximum value of a sample', default: 100 }), test)
  .help()
  .strict()
  .parse(hideBin(process.argv))

function test({ n, max }) {
  const dataset = Array.from({ length: n }, () => Math.random() * max)

  testMeanBlock(dataset)
  testMeanIncremental(dataset)
  testVarianceBlock(dataset)
  testVarianceIncremental(dataset)
}

function testMeanBlock(dataset) {
  function _test(name, createAlgorithm) {
    const [creationTime, algo] = measure(createAlgorithm)
    const [computationTime, value] = measure(() => algo.mean())
    return { name, creationTime, computationTime, value }
  }

  console.log("Testing mean algorithms (block)")
  const results = [
    _test('BatchMean', () => BatchMean.from(dataset)),
    _test('RecurrentSumMean', () => RecurrentSumMean.from(dataset)),
    _test('OnlineMean', () => OnlineMean.from(dataset)),
  ]

  console.table(results)
}

function testMeanIncremental(dataset) {
  function _test(name, algo) {
    const [computationTime, value] = measure(() => {
      for (const x of dataset)
        algo.push(x)
      return algo.mean()
    })
    return { name, computationTime, value }
  }

  console.log("Testing mean algorithms (incremental)")
  const results = [
    _test('BatchMean', BatchMean.from([])),
    _test('RecurrentSumMean', RecurrentSumMean.from([])),
    _test('OnlineMean', OnlineMean.from([])),
  ]

  console.table(results)
}

function testVarianceBlock(dataset) {
  function _test(name, createAlgorithm) {
    const [creationTime, algo] = measure(createAlgorithm)
    const [computationTime, value] = measure(() => algo.variance())
    return { name, creationTime, computationTime, value }
  }

  console.log("Testing variance algorithms (block)")
  const results = [
    _test('BatchVariance', () => BatchVariance.from(dataset)),
    _test('WelfordVariance', () => WelfordVariance.from(dataset)),
  ]

  console.table(results)
}

function testVarianceIncremental(dataset) {
  function _test(name, algo) {
    const [computationTime, value] = measure(() => {
      for (const x of dataset)
        algo.push(x)
      return algo.variance()
    })
    return { name, computationTime, value }
  }

  console.log("Testing variance algorithms (incremental)")
  const results = [
    _test('BatchVariance', BatchVariance.from([])),
    _test('WelfordVariance', WelfordVariance.from([])),
  ]

  console.table(results)
}

function measure(f) {
  const start = performance.now()
  const ret = f()
  const end = performance.now()
  return [end - start, ret]
}
```

### Testing semantics

All the algorithms are tested in two modalities, _block_ and _incremental_.

In _block_ mode, the algorithms are created with the `from()` factory method,
passing the dataset as argument (e.g. `OnlineMean.from(dataset)`), so the
construction is done directly with the entire dataset.

In _incremental_ mode, the algorithms are created with an empty dataset (e.g.
`OnlineMean.from([])`), and all the elements are pushed separately and one at a
time.

The results are printed with the handy `console.table()` method. For each table
showing the test result, the following data can be included:

Column            | Description
------------------|------------------------------------------------------------
`(index)`         | Irrelevant
`name`            | Name of the algorithm
`creationTime`    | Time (milliseconds) to instance the algorithm
`computationTime` | Time (milliseconds) to execute the algorithm
`value`           | Value returned by the algorithm execution


### Test results

First, let's make a test with a low number of samples:

```
$ yarn test test -n 100

Testing mean algorithms (block)
┌─────────┬────────────────────┬──────────────────────┬──────────────────────┬────────────────────┐
│ (index) │ name               │ creationTime         │ computationTime      │ value              │
├─────────┼────────────────────┼──────────────────────┼──────────────────────┼────────────────────┤
│ 0       │ 'BatchMean'        │ 0.029330000000001633 │ 0.027290000000000703 │ 51.73628240902337  │
│ 1       │ 'RecurrentSumMean' │ 0.05194999999999794  │ 0.006399999999999295 │ 51.73628240902335  │
│ 2       │ 'OnlineMean'       │ 0.06687999999999761  │ 0.006219999999999004 │ 51.736282409023374 │
└─────────┴────────────────────┴──────────────────────┴──────────────────────┴────────────────────┘
Testing mean algorithms (incremental)
┌─────────┬────────────────────┬──────────────────────┬────────────────────┐
│ (index) │ name               │ computationTime      │ value              │
├─────────┼────────────────────┼──────────────────────┼────────────────────┤
│ 0       │ 'BatchMean'        │ 0.03857999999999606  │ 51.73628240902337  │
│ 1       │ 'RecurrentSumMean' │ 0.027570000000004313 │ 51.73628240902335  │
│ 2       │ 'OnlineMean'       │ 0.012419999999998765 │ 51.736282409023374 │
└─────────┴────────────────────┴──────────────────────┴────────────────────┘
Testing variance algorithms (block)
┌─────────┬───────────────────┬─────────────────────┬──────────────────────┬───────────────────┐
│ (index) │ name              │ creationTime        │ computationTime      │ value             │
├─────────┼───────────────────┼─────────────────────┼──────────────────────┼───────────────────┤
│ 0       │ 'BatchVariance'   │ 0.04118000000000421 │ 0.05227999999999611  │ 965.4718065467796 │
│ 1       │ 'WelfordVariance' │ 0.08854000000000184 │ 0.007149999999995771 │ 965.4718065467802 │
└─────────┴───────────────────┴─────────────────────┴──────────────────────┴───────────────────┘
Testing variance algorithms (incremental)
┌─────────┬───────────────────┬─────────────────────┬───────────────────┐
│ (index) │ name              │ computationTime     │ value             │
├─────────┼───────────────────┼─────────────────────┼───────────────────┤
│ 0       │ 'BatchVariance'   │ 0.04762999999999806 │ 965.4718065467796 │
│ 1       │ 'WelfordVariance' │ 0.03179999999999694 │ 965.4718065467802 │
└─────────┴───────────────────┴─────────────────────┴───────────────────┘
```

First, we notice that the values are consistent across different algorithms, so
we are confident they are all correct.

The important thing here is to notice that in _block_ mode offline algorithms
tend to be faster (often marginally), while in _incremental_ mode we can
already see the speed superiority of online algorithms, even with these small
numbers.

Let's repeat the experiment with larger numbers:

```
$ yarn test test -n 100000000

Testing mean algorithms (block)
┌─────────┬────────────────────┬─────────────────────┬─────────────────────┬───────────────────┐
│ (index) │ name               │ creationTime        │ computationTime     │ value             │
├─────────┼────────────────────┼─────────────────────┼─────────────────────┼───────────────────┤
│ 0       │ 'BatchMean'        │ 0.03032000000075641 │ 743.5055269999993   │ 50.00232861632963 │
│ 1       │ 'RecurrentSumMean' │ 671.1946180000004   │ 0.01224999999976717 │ 50.00232861632069 │
│ 2       │ 'OnlineMean'       │ 728.6134789999996   │ 0.0623699999996461  │ 50.00232861632664 │
└─────────┴────────────────────┴─────────────────────┴─────────────────────┴───────────────────┘
Testing mean algorithms (incremental)
┌─────────┬────────────────────┬────────────────────┬───────────────────┐
│ (index) │ name               │ computationTime    │ value             │
├─────────┼────────────────────┼────────────────────┼───────────────────┤
│ 0       │ 'BatchMean'        │ 1981.5769959999998 │ 50.00232861632963 │
│ 1       │ 'RecurrentSumMean' │ 750.8903819999996  │ 50.00232861632069 │
│ 2       │ 'OnlineMean'       │ 779.2778670000007  │ 50.00232861632664 │
└─────────┴────────────────────┴────────────────────┴───────────────────┘
Testing variance algorithms (block)
┌─────────┬───────────────────┬─────────────────────┬────────────────────┬───────────────────┐
│ (index) │ name              │ creationTime        │ computationTime    │ value             │
├─────────┼───────────────────┼─────────────────────┼────────────────────┼───────────────────┤
│ 0       │ 'BatchVariance'   │ 0.04079999999885331 │ 1553.1909309999992 │ 833.3008530705453 │
│ 1       │ 'WelfordVariance' │ 810.2725350000001   │ 0.0482800000008865 │ 833.300853070591  │
└─────────┴───────────────────┴─────────────────────┴────────────────────┴───────────────────┘
Testing variance algorithms (incremental)
┌─────────┬───────────────────┬────────────────────┬───────────────────┐
│ (index) │ name              │ computationTime    │ value             │
├─────────┼───────────────────┼────────────────────┼───────────────────┤
│ 0       │ 'BatchVariance'   │ 2688.4455240000007 │ 833.3008530705453 │
│ 1       │ 'WelfordVariance' │ 880.353113000001   │ 833.300853070591  │
└─────────┴───────────────────┴────────────────────┴───────────────────┘
```

These tests are obviously more significative compared to the previous ones.

For the mean algorithms in block mode, we can see that the creation time is
much higher for online algorithms. This is due to the initialization routine
having a cost of `O(n)`. However, we can observe that computing the mean is
istantaneous for online algorithms. As there is a single call to `mean()` and
no direct calls to `push()`, we can conclude that online algorithms are
marginally faster in this test.

For the mean algorithms in incremental mode, we can observe that online
algorithms are way faster. Also remember that `mean()` is called just once in
the tests, so in a more realistic scenario the difference may be much bigger.

For the variance algorithms in block mode, we can see the Welford algorithm is
surprisingly much faster than its counterpart. An even greater difference in
speed is not surprising for the same test performed in incremental mode.
Again, notice that the creation time is higher for the offline `BatchVariance`
algorithm, due to the initialization routine.

## Conclusions

We implemented quite a number of offline and online algorithms for computing
the arithmetic mean and the variance of arbitrary sequences.

Then we performed tests to measure the correctness and comparative performances
of such algorithms.
