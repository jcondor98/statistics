---
title: Probability
description: >-
    Review the main interpretations of probability.<br/>
    Explain how the axiomatic approach resolves conceptual inconsistencies.
author: Paolo Lucchesi
date: 2025-11-19 14:00:00 +0200
permalink: /homework-9/
---

{% include mathjax.html %}

In this article we will discuss the concept of probability. We will review the
main interpretations of probability, among with their incompatibilities.

Then, we will explain how the axiomatic approach resolves such inconsistencies.

## Probability

Intuitively, probability can be seen as the likelihood of an event occurring.
In probability theory, many different formlizations of this key concept have
been done.

### Classical probability

The first and so-called _classical_ approach to probability have been
formalized by the notorious mathematician Pierre-Simon Laplace in his work
_Théorie analytique des probabilités_:

> The probability of an event is the ratio of the number of cases favorable to
> it, to the number of all cases possible when nothing leads us to expect that
> any one of these cases should occur more than any other, which renders them,
> for us, equally possible.

We can formalize the definition above even further. Let $A$ be an event. Then:

<div>
    $$
    \Pr(A) = \frac{\text{# favorable cases}}{\text{# possible cases}}
    $$
</div>

This definition is simple, intuitive and very easily appliable to a vast number
of scenarios. Hence we can immediately see its drawbacks: each event must have
the exact same probability.

As an example, let's consider the roll of a dice with 6 possible outcomes. Let
us examine the event $A_i$ such that $A_i$ occurs if the outcome of a dice roll
is $i$. Then:

<div>
    $$
    \begin{align*}
    \text{# favorable cases} &= 1 \\
    \text{# possible cases} &= 6 \\
    \Pr(A) = \frac{\text{# favorable cases}}{\text{# possible cases}} &= \frac{1}{6}
    \end{align*}
    $$
</div>

Nevertheless, we must notice that if the dice is weighted, then it is not
anymore true that all the events $A_i$ have the same likelihood. The definition
of classical probability does not support such scenario.

### Frequentist probability

The _frequentism_ can be thought as an approach to probability that is more
close to statistics. It can be defined as the relative frequency of an event in
an infinite number of trials.

We can try to give a more formal definition of the frequentist probability. Let
$A$ be an event, $N_n(A)$ be the number of occurrences of $A$ in $n$ trials.
Then:

<div>
    $$
    \Pr(A) = \lim_{n \to \infty} \frac{N_n(A)}{n}
    $$
</div>

We can immediately notice the empirical nature of frequentism. While this
approach can potentially lead to easier analyses for complex phoenomena, its
major drawback is that it may not be appliable to non-repeatable events.

### Bayesian probability

_Bayesianism_ is an approach to probability partly based on belief. An
introductory definition of Bayesian probability is given by
[ScienceDirect](https://www.sciencedirect.com/topics/mathematics/bayesian-probability):

> Bayesian probability is defined as a probability that is relative to
> evidence, used to analyze statistical inferences by incorporating prior
> information and rational degrees of belief. It is characterized by its
> application in decision-making and hypothesis testing, generating updated
> probabilities at the conclusion of statistical tests.

The key idea of Bayesianism is that, given an uncertain _hypothesis_ which can
be either true or false, we give a _prior probability_ partly based on belief
(therefore potentially biased). Then, we can use _evidence_ (i.e. newly
acquired relevant data) to update it to a _posterior probability_.

#### Bayes theorem

The Bayes theorem is crucial in probability theory. Formally, it allows to
define the joint probability of two events $H$ and $D$ in terms of _conditioned
probability_:

<div>
    $$
    \Pr(H \cup D) = \Pr(H | D) \cdot \Pr(D) = \Pr(D | H) \cdot \Pr(H)
    $$
</div>

Deriving the last two terms of the equation above, we can obtain the mostly
usual formulation of the Bayes theorem:

<div>
    $$
    \Pr(H | D) \cdot \Pr(D) = \Pr(D | H) \cdot \Pr(H)
    \quad \iff \quad
    \Pr(H | D) = \frac{\Pr(D | H) \cdot \Pr(H)}{\Pr(D)}
    $$
</div>

Now, let $H$ be our _hypothesis_ and $D$ be the _evidence_ data. We can derive
the Bayes theorem to formulate a so-called _posterior distribution_:

<div>
    $$
    \Pr(D) = \sum_h \Pr(D | h) P(h)
    $$
</div>

where each $h$ is a possible outcome of the $H$ random variable.

### Geometric probability

_Geometric probability_ is a powerful approach to deal with probability when an
event is represented as a _continuous random variable_ (i.e. its spectrum is a
continuous interval).

An example of how geometric probability works is given in [a beautiful article
by
brilliant.org](https://brilliant.org/wiki/1-dimensional-geometric-probability/).
Let's say we are waiting for the bus. Let $X \in [0,60]$ be a random variable
representing the time of arrival of the bus. If the bus arrives between $0$ and
$30$ (i.e. $X \in [0,30]$), we miss the bus, otherwise we catch it.

It is clear that in this scenario the definitions of probability given earlier
cannot be applied. For example, we cannot even define a number of possible
outcomes for a continuous interval. However, we can model the problem in a
geometric fashion. Let's define $X$ geometrically (credits brilliant.org):

![Geometric definition of H](/assets/img/homework-09/geometric-probability-example-brilliant.png)

We can easily understand that in this case $\Pr(X) = \frac{1}{2}$, as we can
compare the probabilities of arrival times collectively as lengths of segments.
