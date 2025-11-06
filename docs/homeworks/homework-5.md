---
title: Location and Dispersion
description: Research on dispersion and location concepts and metrics.
author: Paolo Lucchesi
date: 2025-11-05 20:00:00 +0200
permalink: /homework-5/
---

{% include mathjax.html %}

In this article we will perform a research on the concepts on _location_ and
_dispersion_. We will explore some of the most common ways to measure
quantities related to such things.

We will also study _recurrence relationships_ in the context of arithmetic mean
and variance, bringing empirical proof of the correctness of such algorithms.

We will also give a comparison between straightforward batch algorithms and
recurrence-based ones for mean and variance.

## Theoretical background

_Location_ and _dispersion_ are used to describe datasets.

### Location

About location, we will refer to [a NIST
article](https://www.itl.nist.gov/div898/handbook/eda/section3/eda351.htm),
giving an intuitive but clear definition:

> A fundamental task in many statistical analyses is to estimate a location
> parameter for the distribution; i.e., to find a typical or central value that
> best describes the data.

There are many ways to define and measure location. For univariate datasets, we
will give the most common ones below.

#### Arithmetic mean

The _arithmetic mean_ is defined as the sum of all the samples in a collection
divided by their number. Formally:

<div>
$$
    \bar{x} = \mu = \sum_{i=1}^n \frac{1}{n} x_i = \frac{1}{n} \sum_{i=1}^n x_i
$$
</div>

As an example, computing the arithmetic mean in JavaScript is fairly
straightforward:

```js
export function mean(values) {
    if (!values.length) // Avoid division by 0
        return 0
    return values.reduce((x, y) => x + y, 0) / values.length
}
```

#### Median

The _median_ is defined as the point $\tilde{x}$ such that half the samples are
smaller than $\tilde{x}$ and half the samples are larger than $\tilde{x}$.

Formally, let $X = { x_1, x_2, \dots, x_n }$ be a sorted sequence of samples
(in growing order). Then the median is defined as:

<div>
$$
    \begin{cases}
        \tilde{x} = x_{\frac{n + 1}{2}} & \text{if $n$ is odd} \\
        \tilde{x} = \frac{1}{2} (x_{n / 2} + x_{n / 2 + 1}) & \text{if $n$ is even}
    \end{cases}
$$
</div>

As above, we give a very simple (and quite inefficient) JavaScript
implementation to compute the median:

```js
export function median(values) {
  const n = values.length
  values = values.sort()
  return (values.length % 2 === 0)
    ? (values[(n / 2) - 1] + values[n / 2]) / 2
    : values[((n + 1) / 2) - 1]
}
```

#### Mode

The _mode_ is defined as the most recurring sample in a collection. Formally,
being $P(x = x_i)$ the probability (or frequency) distribution of the
collection, the mode is defined as follows:

<div>
$$
    \text{mode} = \text{argmax}_{x_i} P_{x_i}
$$
</div>

i.e. it is the value $x_i$ for which the probability distribution $P(x_i)$ has
the highest value.

Notice that unlike the arithmetic mean and the median, there is no guarantee to
have a defined value for the mode. In fact, there could be multiple values for
it (e.g. in a uniform distribution).

Below, a very simplistic JavaScript function to identify the mode of a
collection is given:

```js
export function mode(values) {
  const counts = new Map()

  for (const x of values) {
    if (!counts.has(x))
      counts.set(x, 0)
    counts.set(x, counts.get(x) + 1)
  }

  let current = { c: 0 }, unique;
  for (const [x, c] of counts.entries()) {
    if (c === current.c)
      unique = false
    else if (c > current.c) {
      current = {x, c}
      unique = true
    }
  }

  return unique ? current.x : null
}
```

### Dispersion

_Dispersion_ is another important concept in statistics. Intuitively, it
measures how spread or variable a probability or frequency distribution is.

Dispersion can be measured with a number; the higher the dispersion, the more
spread the distribution is.

#### Range

Perhaps the most simple and easy way to measure dispersion is using the _range
dispersion_. Range dispersion is defined as follows:

<div>
$$
    d_{\text{range}} = \max_i x_i - \min_i x_i
$$
</div>

Below, we give a basic JavaScript function to compute the range dispersion of a
set of samples:

```js
export function dispersion_range(values) {
    return Math.max(...values) - Math.min(...values)
}
```

#### Variance

A very common way to measure dispersion is computing the _variance_, which is
defined as follows (for a known population, not for a theoretical
distribution):

<div>
$$
    \sigma^2 = \frac{1}{n - 1} \sum_{i=1}^n (x_i - \mu)^2
$$
</div>

The variance can be easily computed in JavaScript:

```js
export function variance(values) {
  const mu = mean(values)
  const sum = values.reduce((acc, x) => acc + Math.pow(x - mu, 2), 0)
  return sum / (values.length - 1)
}
```

#### Standard deviation

The _standard deviation_ immediately follows from the definition of variance as
it is defined as its square root:

<div>
$$
    \sigma = \sqrt{\sigma^2}
$$
</div>

The standard deviation is an important measure in statistics, as it is, for
example, a key parameter of the Normal distribution.

Also given the code we just gave, computing the standard deviation in
JavaScript is straightforward:

```js
export function standard_deviation(values) {
    return Math.sqrt(variance(values))
}
```

## Conclusions

We explored the concepts of location and dispersion in statistics, giving some
preliminary theoretical notions.

We also gave definitions and JavaScript implementations of the most used
location and dispersion metrics, such as mean and variance.
