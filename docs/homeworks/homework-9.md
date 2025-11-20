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

## Definitions of Probability

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

## The axiomatic approach

The axiomatic approach in probability was introduced by Andrey Kolmogorov in
1933, in its work [_Foundations of the theory of
probability_](https://archive.org/details/foundationsofthe00kolm/page/n11/mode/2up).
They provide an unambiguous and strict foundation for probability theory.

To quote [a great quality
article](https://www.stat.berkeley.edu/~aldous/Real_World/kolmogorov.html) from
the Berkeley University:

> The Kolmogorov axioms are technically useful in providing an agreed notion of
> what is a completely specified probability model within which questions have
> unambiguous answers. This eliminates cases like Bertrand's paradox which is
> simply an ambiguously defined model. But they encourage both a false sense of
> security (that the act of formulating a model within the mathematical
> framework somehow guarantees it is a valid representation of the real world
> phenomenon) and a narrowness of vision (that aspects of the real world that
> cannot be formulated within the framework are somehow "not probability").

### Kolmogorov axioms

In his works, Kolmogorov defined three axioms to formalize the notion of
probability. First, the following context is requried:

* let $\Omega$ be the _sample space_, i.e. the set of all possible outcomes
* let $F$ be the space of _events_; $F$ must be a $\sigma$-algegra of $\Omega$
* let $\Pr(A)$ be the _probability measure_, assigning a probability value to
  each event $A \in F$

Using the context above as a base, we can give the actual Kolmogorov axioms:

1. The probability of an event is always non-negative, i.e.:
   <div>
       $$
       \Pr(A) \ge 0 \quad \forall\ A \in F
       $$
   </div>

2. The probability that at least one outcome $\omega \in \Omega$ will occur is
   equal to $1$:
   <div>
       $$
       \Pr(\Omega) = 1
       $$
   </div>
   It follows that $0 \le \Pr(A) \le 1 \quad \forall\ A \in F$.

3. For every $E_i$ such that all $E_i$ are _mutually exclusive_
   (i.e. $\Pr(E_j \cup E_k) = 0 \ \forall\ j,k$) it holds:
   <div>
       $$
       \Pr\left( \ \bigcup_{i=1}^\infty E_i \right) = \sum_{i=1}^\infty P(E_i)
       $$
   </div>

### Derived property

#### Subadditivity property

Let $A, B \in F$ be two events. First, notice that the following holds:

<div>
    $$
    A \cup B = A \cup (B \setminus A)
    $$
</div>

This statement allows us to use the third axiom, as $A$ and $B \setminus A$ are
always disjoint. By the third axiom follows:

<div>
    $$
    \Pr(A \cup B) = \Pr(A \cup (B \setminus A)) = \Pr(A) + \Pr(B \setminus A)
    $$
</div>

As $B \subseteq B \setminus A$, it follows that:

<div>
    $$
    \Pr(B) \ge \Pr(B \setminus A)
    \quad \iff \quad
    \Pr(A \cup B) \le \Pr(A) + \Pr(B)
    $$
</div>

#### Inclusion-exclusion principle

Let $A, B \in F$ be two events. Simply by the properties of sets, the following
decomposition holds:

<div>
    $$
    B = (B \setminus A) \cup (A \cap B)
    $$
</div>

Then, by the third Kolmogorov axiom:

<div>
    $$
    \Pr(B) = \Pr(B \setminus A) + \Pr(A \cap B)
    \quad \iff \quad
    \Pr(B \setminus A) = \Pr(B) - \Pr(A \cap B)
    $$
</div>

In the previous section, we have already seen that the following holds:

<div>
    $$
    \Pr(A \cup B) = \Pr(A) + \Pr(B \setminus A)
    $$
</div>

Then:

<div>
    $$
    \Pr(A \cup B) = \Pr(A) + \Pr(B) - \Pr(A \cap B)
    $$
</div>
