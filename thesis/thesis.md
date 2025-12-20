# Statistical online algorithms for anomaly and threat detection

## Abstract

## Introduction

The world of cyber threats has evolved massively. The complexity,
sophistication and diversification of modern cyberattacks called for the
development of novel, technique-agnostic detection methods in the field of
cybersecurity.

In this context, statistics plays a crucial role. Indeed, in many scenarios it
allows to build detection systems capable of identifying threats regardless of
their technical nature, and in the presence of usual, legit activity.

In particular, statistical _online algorithms_ allow to build real-time,
numerically stable, noise-resistant, computationally efficient models for fast
and reliable threat detection.

### Solutions for anomaly and threat detection

Threat detection is a key field in cybersecurity. Many solutions have been
developed to tackle the necessity of early detection in order to preemptively
deal with ongoing threats. Many of such solutions make extensive use of
statistical algorithms.

_Intrusion Detection Systems_ are a perfect example in this context. An IDS is
a piece of software that monitors a system or network in order to detect
suspicious activity or policy violations. Such solutions often work with high
volumes of data, so the algorithms used must be efficient and scalable.

Examples of widely used Intrusion Detection Systems are
[Wazuh](https://wazuh.com/) (OSSEC), [Zeek](https://zeek.org/) (formerly Bro
IDS) and [Suricata](https://suricata.io/).

## Theoretical background

In this section we will give a brief theoretical background necessary to
properly understand the presented reaserch works.

### Online algorithms

An online algorithm is a statistical algorithm defined in terms of a recurrence
relation. In practice, this means an online algorithm can compute a metric over
a huge number of samples by performing small, incremental updates. In the
context of computer science, this brings a number of advantages.

First, online algorithm offer far stronger numerical stability compared to
batch algorithms. There is a much higher risk of computational errors in
floating-point operations if big and small numbers are used together. Using
incremental updates hugely mitigates such risk.

Moreover, a distinctive characteristic of online algorithms is that updating
the metric is usually computationally cheap. This enables the construction of
fast and efficient real-time detection systems that can process events
incrementally.

Lastly, online algorithms are likely to not keep explicit memory of past
samples, often even being _inline_ by nature. For example, an online algorithm
to compute the _mean_ on a dataset numerical attribute does not need to keep
memory of all the values of such attribute, and just needs a fixed amount of
memory to work with any number of values.

### Autoregressive Moving Average

### Exponentially Weighted Moving Average

## Statistical algorithms analysis

In the following sections we will analyse some of the most known statistical
online algorithms. For each algorithm, we will:

* give a theoretical background
* give an example implementation
* show how the algorithm is used in widely deployed solutions
* reference some relative cutting-edge research

### Exponential Weighted Moving Average

The _Exponential Weighted Moving Average_ (_EWMA_ from now on) is a statistical
metric used to identify trends in time-series data. The key idea is that past
observed data fades exponentially, so newer data weights more on the metric
value.

#### Theoretical definition

An extensive theoretical explaination on how EWMA works and can be implemented
in moving models is given in [an awesome article from the Stanford
University](https://web.stanford.edu/~boyd/papers/pdf/ewmm.pdf).

Let $x = x_1, x_2, \dots, x_n$ be a vector (i.e. our data). Let $\beta \in
(0,1)$ be the _forgetting factor_. The _Exponential Weighted Moving Average_ is
defined as follows:

$$
\tilde{x}_t = \alpha_t \sum_{\tau = 1}^t \beta^{t - \tau} x_{\tau}
$$

where the _normalization constant_ $\alpha_t$ is defined as:

$$
\alpha_t = \frac{1 - \beta}{1 - \beta^t}
$$

The EWMA can be defined as a recurrent relation, allowing for efficient, online
implementations:

$$
\tilde{x}_{t+1} = \frac{\alpha_{t+1}}{\alpha_t} \beta \tilde{x}_t + \alpha_{t+1} x_{t+1}
$$

#### Implementation

In order to understand how EWMA can work in a practical application, we give a
basic JavaScript implementation below:

```js
export class Ewma {
    constructor({ beta, current = 0, t = 0, increment = 1 }) {
        this.beta = beta
        this.current = current
        this.t = t
        this.increment = increment
    }

    update(value, tau = self.t + self.increment) {
        const alphaT = this.alpha()
        const alphaTau = this.alpha(tau)
        this.current =
            alphaTau / alphaT * this.beta * this.current + alphaTau * value
        return this.current
    }

    alpha(t = this.t) {
        return (1 - this.beta) / (1 - Math.pow(beta, t))
    }

    batch(data = []) {
        return data.map((x, i) =>
            this.update(value, i + self.t + self.increment))
    }
}
```

The class defined above can be used like so:

```js
const ewma = new Ewma({ beta: 0.5 })
const data = [1, 1.1, 1.2, 2, 1.5, 2]

// Batch use: Perform EWMA computation over a given dataset
let ewmaValues = ewma.batch(beta, data)

// Incremental use: Update the EWMA value online with a new datum
const updated = ewma.update(1)
ewmaValues.push(updated) // Do something with the updated EWMA value
```

#### Usage in threat detection

In the context of cybersecurity, the EWMA is a useful metric to early detect
anomalies, especially for network traffic and CPU usage. More specifically, it
can be used to detect strong and deviations from an expected trend.

EWMA and EWMA-like algorithms can be easily implemented in widely used IDS
solutions. In Zeek, we can compute real EWMA metrics using its own scripting
language. For example, to detect network traffic anomaly per-host:

```zeek
global ewma: table[addr] of double = table();
global alpha = 0.2;
global threshold_factor = 5;

event connection_state_remove(c: connection) {
    local host = c$id$orig_h;
    local x = c$orig$size;

    if (host !in ewma)
        ewma[host] = x;
    else
        ewma[host] = alpha * x + (1 - alpha) * ewma[host];

    if (x > threshold_factor * ewma[h])
        NOTICE([$note=Traffic_Anomaly,
                $msg=fmt("Traffic anomaly detected for host: %s", host)]);
}
```

We can notice that in this implementation we used a slightly, simplified EWMA
definition with a fixed value $\alpha$. This works perfectly fine in practical
applications.

In other solutions not supporting real EWMA estimation, we can mimick an
EWMA-like metric using frequency-based analysis. For example, in Wazuh we can
monitor the login failure rate of a given service and signal an anomaly if the
actual value exceeds the expected trend:

```xml
<rule id="123456" level="7">
  <if_matched_sid>1234</if_matched_sid>
  <frequency>10</frequency>
  <timeframe>60</timeframe>
  <description>Possible brute-force (rate anomaly)</description>
</rule>
```

#### Research

Lately, sophisticated detection models making use of EWMA and EWMA-like metrics
have been developed.

The article [_Hourly Network Anomaly Detection on HTTP Using Exponential Random
Graph Models and Autoregressive Moving Average_ (R. Li, M. Tsikerdekis, A.
Emanuelson - 2022)](https://www.mdpi.com/2624-800X/3/3/22) formalizes a model
for anomaly detection in structured network infrastructures:

> We use exponential random graph models (ERGMs) in order to flatten hourly
> network topological characteristics into a time series, and Autoregressive
> Moving Average (ARMA) to analyze that time series and to detect potential
> attacks. In particular, we extend our previous method in not only
> demonstrating detection over hourly data but also through labeling of nodes
> and over the HTTP protocol. We demonstrate the effectiveness of our method
> using real-world data for creating exfiltration scenarios.

In this context, _Autoregressive Moving Average_ can be considered as a more
general, stochastic EWMA metric which also takes random noise into
consideration.

In the article, the authors point out that the formulated model showed quite
promising results against _DNS exfiltration_.

### Isolation Forest


