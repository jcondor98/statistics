---
layout: post
title: Statistics and Cybersecurity
subtitle: What is statistics, and why can it be useful for cybersecurity?
author: Paolo Lucchesi
date: 2025-10-09 12:00:00 +0200
toc: true
permalink: /homework-1/
---

## What is Statistics

According to the [Merriam-Webster
dictionary](https://www.merriam-webster.com/dictionary/statistics), statistics
is:

> a branch of mathematics dealing with the collection, analysis,
> interpretation, and presentation of masses of numerical data.

Many other sources define statistics in a similar fashion.

In an informal manner, it can be said that statistics is about extracting a
meaning out of some data. Although interpretation might be sometimes arbitrary
or speculative, the analysis method must be rigorous, as after all it is a
branch of mathematics.

In the following article we will first give some basic notions to understand
statistics. Then, we will further analyse its relationship with Cybersecurity.

### Dataset: the object of statistics

_Data_ is a key concept in statistics. The whole analysis and presentation
performed in statistics is done starting from a _dataset_. A dataset is a
collection of _population units_ along with their _attributes_.

For example, we can consider a population as all the students attending the
Cybersecurity course in La Sapienza, and attributes as properties of such
students (e.g. weight, height, color of hair, ...). The collection of all such
attributes, referencing the population unit, forms a dataset.

From the perspective of Information Theory, a dataset can be seen as a table,
with the rows being the population units and each column being an attribute.

Supporting the statements above, we quote the [Eurostat definition of
Dataset](https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Glossary:Data_set):

> Data set (or dataset) refers to any organised collection of data. The data
> set lists values for each of the variables and for each member of the
> dataset. Each value is known as a datum.

### Descriptive and Inferential statistics

Statistics is a vast and complex world. There are different approaches for data
analysis, interpretation and presentation. Therefore, we can divide it into
smaller branches or categories.

An important distinction can be made between _Descriptive_ and _Inferential_
statistics.

In order to understand in depth what descriptive statistics is, we will
reference multiple times [a brilliant article from
ScienceDirect](https://www.sciencedirect.com/topics/social-sciences/descriptive-statistics).
We start from its very definition:

> The aim of descriptive statistics is to summarize categorical and numerical
> data in an informative way, both numerically and graphically. Descriptive
> statistics are used to help describe key features or characteristics of data,
> such as the shape of their distribution, where the center lies, and how the
> data vary about that center. Ideally, a collection of descriptive statistics
> is chosen to convey the data's salient features in a more concise, but just
> as effective, manner as reporting each individual value.

A key concept here concerns the nature of conclusions and interpretations we
can make in descriptive statistics. The given dataset is all we have, and
statements outside such data can never be made. For example, if our dataset
gives information about the age of every person living in Italy, we can draw
conclusions on the mean age in Italy, but we can not extend such conclusions to
all people in Europe.

Inferential statistics, in contrast, is about making observations that can
hopefully be extended and generalized outside a chosen _sample_, i.e. a limited
(often random) portion of an unknown population.

The relationship between descriptive and inferential statistics is well
described in the article we cited above:

> Descriptive statistics form a basis for all quantitative analysis and are a
> precursor for inferential statistics, which uses properties of a data set to
> make inference and predictions beyond the data.

Inferential statistics can be a powerful tool, hence further difficulties may
arise in the process. Extending conclusions and interpretation from a limited
sample usually require extra care to make sure they are valid in the bigger
picture.

### Distribution

The notion of _distribution_ is crucial for understanding statistics.
Intuitively, the distribution is a function mapping each value of an attribute
of a dataset to the _frequency_ (in this case we talk about _empirical
distribution_) or _probability_ (in this case we talk about _theoretical
distribution_) of such value.

While empirical distribution, which is a concept belonging to the descriptive
statistics, comes exclusively from the available data, theoretical distribution
is based on logical and mathematical reasoning.

The American Psychology Association dictionary gives [a very good definition of
theoretical distribution](https://dictionary.apa.org/theoretical-distribution),
describing it as:

> a distribution that is derived from certain principles or assumptions by
> logical and mathematical reasoning, as opposed to one derived from real-world
> data obtained by empirical research.

## Statistics in Cybersecurity

The infosphere is an ever-growing universe of data and information. The
analysis and interpretation of such data through statistics is a crucial
process for protecting assets and identify threats.

In the following sections, we will give a non-exhaustive but representative
overview of why such process is useful in a wide range of ways.

### State of the art of Cybersecurity

Every time a cybersecurity breach or cybercrime happens, traces are left (e.g.
in application logs or reports by victims). Those traces are, of course,
representable through data. Collecting and interpreting such data using a
statistical approach is key to understand the state of the art of
cybersecurity, so one is able to develop solid and effective strategies to
protect assets.

At high level, a number of statistical reports are done frequently to track the
evolution of both threats and the effectiveness of cybersecurity
countermeasures. For example, the European Union conduct a large number of
statistical analyses, such as the [EU Cybersecurity
Index](https://www.enisa.europa.eu/publications/the-eu-cybersecurity-index-2024),
to adjust its high-level cybersecurity posture and strategies.

Also, many security companies conduct metastudies giving a large number useful
statistical insights concerning cybersecurity. These reports can drive
cybersecurity decisions for companies, increasing threat awareness and giving
indications on what risks must be prioritized. Examples of such studies are the
[192 Key Cybersecurity
Statistics](https://www.indusface.com/blog/key-cybersecurity-statistics) from
Indusface and the [157 Cybersecurity Statistics and
Trends](https://www.varonis.com/blog/cybersecurity-statistics) from Varonis.

### A key tool for testing ciphers

A fundamental discipline in cybersecurity is cryptography, as it allows
confidentiality and integrity of arbitrary data. Statistical analysis plays a
crucial role in ensuring ciphers are secure and safe to use.

#### Randomness tests

First of all, the security of both stream and block ciphers depends on how
"random" is the chosen key. If the encryption key is poorly chosen, it can be
guessed relatively easily, in particular with modern computational resources.
Also, many ciphers require some source of random or pseudo-random data in order
to work properly.

Ensuring the randomness of some bitstring can be achieved via statistical tests.
The NIST, which is well-known and authoritative, gives a full suite of
statistical tests for random and pseudo-random number generators in the [800-22
Special Publication](https://github.com/terrillmoore/NIST-Statistical-Test-Suite/raw/master/assets/nistspecialpublication800-22r1a.pdf).

Many high-quality random number test suites have been implemented and are
usable out of the box. For example, the notorious
[DieHarder](https://webhome.phy.duke.edu/~rgb/General/dieharder.php)
incorporates the NIST 800-22 tests (along with other ones), and claims the
following:

> dieharder is a tool designed to permit one to push a weak generator to
> unambiguous failure (at the e.g. 0.0001% level), not leave one in the "limbo"
> of 1% or 5% maybe-failure.

#### Ciphertext analysis

If a cipher is poorly designed, statistical cryptoanalysis attacks can be used
to guess the key (and therefore break encryption) even if the key is fully
random.

A very common attack of this nature is _frequency analysis_ for simple
substitution ciphers. The idea is that by analysing the frequency of letters
recurring in plaintext language, and relating them to the ones observed in the
ciphertext, an attacker is able to guess the key efficiently and without
brute-forcing techniques.

The Greensboro University of North Carolina gives [a neat definition of
frequency analysis](https://math-sites.uncg.edu/sites/pauli/112/HTML/secfrequency.html),
supplying examples and even practical exercises.

### Anomaly detection

In large, modern, information systems the magnitude of processed data makes
nearly impossible to the human eye to detect anomalies. Statistics allow to
analyse and interpret such data and perform automated anomaly and threat
detection.

As a representative study case, we will consider the publication [Bayesian
Models Applied to Cyber Security Anomaly Detection
Problems](https://arxiv.org/abs/2003.10360) (Perusquia, Griffin, Villa). In
this important work, the authors develop multiple methods to efficiently detect
anomalies and attacks based on Bayesian statistical models.

For example, in the context of volume-traffic anomaly detection, they
demonstrate that _change-point analysis_ is an effective statistical method to
identify anomalies in a matter of seconds. In a reproduction of an _ICMP
Reflector attack_ (which is a type of DDoS attack) the autors observed:

> It can be appreciated that the true attack is detected 22 seconds after it
> started and that the procedure raised two false alarms. It is clear that this
> model works reasonably well since the attack was detected (even though at
> first sight it was not visible) not long after the attack started.

## Conclusions

Statistics is a powerful tool to extract meaning and interpretations from data.
In order to understand so, some basic notions have been given.

It has then been shown how statistics plays a key role in cybersecurity, in
particular in identifying threats, testing the security of IT systems and
driving cybersecurity governance decisions and strategies.
