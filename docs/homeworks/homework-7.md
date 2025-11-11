---
title: Random walks
description: Simulate the assessment of a server security through random walks.
author: Paolo Lucchesi
date: 2025-11-09 10:00:00 +0200
permalink: /homework-7/
---

{% include mathjax.html %}

In this article we will simulate the cybersecurity assesment of a production
server using random walks.

## Theoretical background

### Bernoulli distribution

In [a previous article](https://statistics.jcondor.me/homework-4) we mentioned
the _Bernoulli random variable_. We will now explore the topic of random
variables more in depth.

The Bernoulli random variable is a discrete variable that can be defined as
follows:

<div>
$$
    X \sim \text{Bernoulli} (p) =
    \begin{cases}
        1 & \text{with probability } p \\
        0 & \text{with probability } q = 1 - p
    \end{cases}
$$
</div>

The Bernoulli variable and distribution can be used to model binary events
(i.e. events that can either success or fail, e.g. a coin toss) with arbitrary
probability.

### Binomial distribution

The _Binomial distribution_ is used to model repeated Bernoulli trials. Let $Y_i
\sim \text{Bernoulli}(p) \  \forall \ i \in [1..n]$. We can define the Binomial
random variable as follows:

<div>
$$
    X \sim B(p) = \sum_{i=0}^n Y_n
$$
</div>

### Rademacher distribution

The _Rademacher random variable_ is defined as follows:

<div>
$$
    X \sim \text{Rad}(p) =
    \begin{cases}
        1 & \text{with probability } p \\
        -1 & \text{with probability }  q = 1 - p
    \end{cases}
$$
</div>

Unsurprisingly, the Rademacher distribution can be (and usually is) expressed
in terms of the Bernoulli distribution. Let $Y \sim \text{Bernoulli}(p)$.
Then:

<div>
$$
    X \sim \text{Rad}(p) = 2 Y - 1
$$
</div>

We can prove this relation very straightforwardly:

<div>
$$
    \begin{split}
        Y = 1 & \implies X = 2 Y - 1 = 2 \cdot 1 - 1 = 1 \\
        Y = 0 & \implies X = 2 Y - 1 = 2 \cdot 0 - 1 = -1
    \end{split}
$$
</div>

### Random walks

Quoting the [definition of the Merriam-Webster
dictionary](https://www.merriam-webster.com/dictionary/random%20walk), a random
walk is:

> a process (such as Brownian motion or genetic drift) consisting of a sequence
> of steps (such as movements or changes in gene frequency) each of whose
> characteristics (such as magnitude and direction) is determined by chance

We can model a random walk in the following way.
Let $X_i \sim \text{Bernoulli}(p) \ \forall \ i \in [1,n]$.
Imagine that, while moving forward, we can go either left or right. At each
Bernoulli trial $X_i$, if $X_i = 0$ we move left, otherwise we move right.

A random walk can be obtained even more easily using the Rademacher
distribution. If we repeat $n$ Rademacher trials and plot the result in a line
chart, the line itself represents the walk. Further, we will see this more in
depth.

## Server score simulation

We will consider an exposed server which is upgraded every week for $n$ weeks.
Each week the server is attacked by hackers. The perpetrated cyberattacks can
either be successful or fail. If the server is violated, the score is
decremented by $1$; if not, the score is incremented by $1$.

### Formal problem definition

We will define a formal problem out of the above specification. Let:

<div>
$$
    X_i \sim \text{Rad}(p) = \text{"the server is violated"} =
    \begin{cases}
        1 & \text{if the server is violated} \\
        -1 & \text{otherwise}
    \end{cases}
$$
</div>

Let $s_i$ be the score of the server at the $i$-th week. Then:

<div>
$$
    s_i =
    \begin{cases}
        0 & \text{if } i = 0 \\
        s_{i-1} - X_i & \text{if } i \ne 0
    \end{cases}
$$
</div>

Notice how $s_i$ is defined in terms of a concurrent relation.

Of course, the Rademacher distribution could be easily replaced with a
Bernoulli, hence using the first one it is even more trivial to define $s_i$.

### Implementing the simulation

In all the previous articles, all the proposed implementation were given in
JavaScript. This time, we will make a step further and implement our simulation
in [rust](https://rust-lang.org). Rust is a compiled, strongly-typed,
blazing-fast, memory-safe language that has some incredible features.

#### Introduction to rust projects

First, let's initialize a rust library project:

```bash
cargo init --lib homeworks/homework-07
```

The _cargo_ utility is the official all-in-one tool to manage packages and
projects in rust.

Rust library projects are very convenient to work with. The embedded test
framework is quite powerful and convenent, and they even support the creation
of multiple standalone binaries.

Let's see what cargo created for us:

```
$ cd homeworks/homework-07
$ ls
Cargo.toml src
```

The `Cargo.toml` file is used for the project configuration. It contains stuff
like metadata and dependencies. The `src` directory contains the actual source
code.

#### Implementing the simulation



### Running the simulation

## Conclusions

