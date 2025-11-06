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

### Arithmetic mean

### Variance

#### Welford algorithm
