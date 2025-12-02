---
title: Wiener process
description: >-
    Define the Wiener process and discuss its theoretical properties.<br/>
    Simulate an approximation of the Brownian motion.
author: Paolo Lucchesi
date: 2025-12-01 04:00:00 +0200
permalink: /homework-11/
---

{% include mathjax.html %}

In this article we will try to understand what a Brownian motion is. First and
foremost, we will discuss its definition and theoretical properties. Then, we
will perform a simulation of an actual Brownian motion, approximating it in a
way similar to the one used in the previous article.

The stochastic process behind the Brownian motion is known as the _Wiener
process_. Nevertheless, the expression "Brownian motion" is often used also to
describe the stochastic process itself, and not only the physical phoenomenon.
We will use Brownian motion and Wiener process in an interchangeable way.

## Theoretical background

The _Brownian motion_ was discovered by the botanist Henry Brown in 1827.
Richard Feynman, in [one of his
lectures](https://www.feynmanlectures.caltech.edu/I_41.html), roughly explains
how:

> The Brownian movement was discovered in 1827 by Robert Brown, a botanist.
> While he was studying microscopic life, he noticed little particles of plant
> pollens jiggling around in the liquid he was looking at in the microscope,
> and he was wise enough to realize that these were not living, but were just
> little pieces of dirt moving around in the water. In fact he helped to
> demonstrate that this had nothing to do with life by getting from the ground
> an old piece of quartz in which there was some water trapped. It must have
> been trapped for millions and millions of years, but inside he could see the
> same motion. What one sees is that very tiny particles are jiggling all the
> time.

The Brownian motion can be intuitively defined as the motion in a fluid of a
particle so small that gravity is negligible. The phoenomenon itself is not
stochastic, as one could theoretically compute collision angles and
trajectories of a particle with the proper tools, at least for a sufficiently
small time span. However, for a relatively long period or with a relatively
rough sampling, the Brownian motion can be seen as completely stochastic.

### Wiener process

The _Wiener process_ $W_t$ is the stochastic process behind the Brownian
motion. It is defined by four properties:

1. $\Pr(W_0 = 0) = 1$
2. $W_t$ has _independent increments_
3. $W_t$ has _Gaussian increments_, i.e. $W_t - W_s \sim N(0, t - s)$ for $0
   \le s \lt t$
4. $W_t$ is _continuous_ in $[0, t]\ \forall t$


### Random walk convergence

A Wiener process can be constructed starting with a random walk. Recalling the
[Homework 7](/homework-7), a random walk $S_n$ can be defined as follows:

<div>
    $$
    S_n = \sum_{i=1}^n X_i\ \quad \text{with}\ X_i \sim \text{Rad}(p),\ p \in [0,1]
    $$
</div>

Then, we can define a new stochastic process $W_n(t)$:

<div>
    $$
    W_n(t) = \frac{1}{\sqrt{n}} S_{\lfloor nt \rfloor}
    $$
</div>

First, we can notice that the way $W_n$ is defined implies the following:

* $W_n(0) = 0$ always, so $\Pr(W_n(0) = 0) = 1$
* $X_i, X_j$ are independent $\forall i, j : i \ne j$, so $W_n$ has independent
  increments
* As $S_n$ is scaled by a factor of $\sqrt{n}$, the _Gaussian increments_
  property is satisfied

Finally, to obtain an actual Wiener process $W_t$, we can make $n$ diverge:

<div>
    $$
    W_t = \lim_{n \to \infty} W_n(t) =
    \lim_{n \to \infty} \frac{1}{\sqrt{n}} S_{\lfloor nt \rfloor} =
    \lim_{n \to \infty} \frac{1}{\sqrt{n}} \sum_{i=1}^{\lfloor nt \rfloor} X_i
    $$
</div>

### 2-dimensional Wiener process

Let $X_i \sim \text{Rad}(p), Y_i \sim \text{Rad}(p)$. Then we can define a
2-dimensional Wiener process in a way that is very similar to the one we just
used to define a 1-dimensional Wiener process:

<div>
    $$
    W_t = \lim_{n \to \infty} \frac{1}{\sqrt{n}} \sum_{i=1}^{\lfloor nt \rfloor} (X_i, Y_i)
    $$
</div>

## Simulation
