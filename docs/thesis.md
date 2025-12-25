---
title: Autoregressive Moving Models in anomaly and threat detection
description: How ARMMs can lead to precise, efficient detection of suspicious behaviours
author: Paolo Lucchesi
date: 2025-12-20 12:00:00 +0200
permalink: /thesis/
---

{% include mathjax.html %}

## Introduction

The world of cyber threats has evolved massively. The complexity,
sophistication and diversification of modern cyberattacks called for the
development of novel, technique-agnostic detection methods in the field of
cybersecurity.

In this context, statistics plays a crucial role. Indeed, in many scenarios it
allows to build detection systems capable of identifying threats regardless of
their technical nature, and in the presence of usual, legit activity.

In particular, statistical _online algorithms_ allow building real-time,
numerically stable, noise-resistant, computationally efficient models for fast
and reliable threat detection.

Statistical _Autoregressive Moving Average_ models can be very effective in
achieving such goal. They are often relatively easy to build and deploy,
customizable via parameterization, and can take into account contextual
stochastic processes (e.g. noise or errors). Moreover, they can be built to be
self-adjusting to some extent, especially when they are needed to evolve in
relation to time.

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
properly understand the presented research works.

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

The _Autoregressive Moving Average_ (_ARMA_ from now on) is a statistical
metric used to identify trends in time-series data. The key idea is that, in
contrast to simple average metrics, the influence of past observed data
gradually fades, so newer data weights more on the metric value. ARMA models
are built on top of _Autoregressive Models_ (i.e. _AR_ models) and _Moving
Average_ models (i.e. _MA_ models).

A very clear and high-quality introduction to ARMA models is given in [a
distinguished lecture by the Berkeley
University](https://www.stat.berkeley.edu/~ryantibs/timeseries-f23/lectures/arima.pdf).

#### Autoregressive models

An AR model represents a stochastic differential equation in which the output
variable is linearly dependant (in time) on the previous deterministic and
random input.

The formal definition for an AR model of order $p$ is given below:

<div>
$$
\text{AR}(p): \quad x_t = \sum_{i = 1}^p \phi_i x_{t - i} + \omega_t
$$
</div>

Where $\phi_1, \dots, \phi_p$ are fixed parameters, $p \in \mathbb{N}$ and
$\omega_*$ are stochastic parameters.

#### Moving Average models

MA models can be seen as a complement of AR models. Unlike their counterpart,
MA models evolve linearly with the _error_ (i.e. the stochastic process)
instead of a deterministic input.

The formal definition for an MA model of order $q$ is given below:

<div>
$$
\text{MA}(p): \quad x_t
    = \omega_t + \sum_{i = 1}^q \theta_i \omega_{t - i}
    = \sum_{i = 0}^q \theta_i \omega_{t - i}
$$
</div>

Where $\theta_1, \dots, \theta_p$ are fixed parameters, $q \in \mathbb{N}$ and
$\omega_*$ are stochastic parameters.

#### Autoregressive Moving Average models

On top of the $\text{AR}(p)$ and $\text{MA}(q)$ definitions, the _ARMA model_
can be formalized:

<div>
$$
\text{ARMA}(p, q): \quad x_t =
    \omega_t + \sum_{i = 1}^p \phi_i x_{t - i} + \sum_{i = 1}^q \theta_{t - i} \omega_{t - i}
$$
</div>

As by definition ARMA models take into account the influence of stochastic
processes (e.g. noise), they are often suitable to describe realistic
scenarios.

### Exponential Weighted Moving Average

The _Exponential Weighted Moving Average_ (_EWMA_ from now on) is a statistical
metric which can be defined as a special case of the ARMA. Specifically, it is
a completely deterministic ARMA metric that does not take into account the
potential influence of stochastic processes.

An extensive theoretical explaination on how EWMA works and can be implemented
in moving models is given in [an awesome article from the Stanford
University](https://web.stanford.edu/~boyd/papers/pdf/ewmm.pdf).

Let $x = x_1, x_2, \dots, x_n$ be a vector (i.e. our data). Let $\beta \in
(0,1)$ be the _forgetting factor_. The _Exponential Weighted Moving Average_ is
defined as follows, as a recurrent relation:

<div>
$$
\tilde{x}_{t+1} = \frac{\alpha_{t+1}}{\alpha_t} \beta \ \tilde{x}_t + \alpha_{t+1} \ x_{t+1}
$$
</div>

where the _normalization constant_ $\alpha_t$ is defined as:

<div>
$$
\alpha_t = \frac{1 - \beta}{1 - \beta^t}
$$
</div>

This EWMA definition allows for efficient, online implementations.

The EWMA can also be defined in a simplified manner with a fixed $alpha$
parameter $\forall t$:

<div>
$$
\tilde{x}_{t+1} = (1 - \alpha) \tilde{x}_t + \alpha x_{t+1}, \quad \alpha \in (0, 1)
$$
</div>

As already stated, the EWMA can be defined in terms of an $\text{ARMA}(1, 0)$:

<div>
$$
\text{ARMA}(1, 0) = y_t = \omega_t + \phi \ y_{t - i}
$$
</div>

In order to eliminate the stochastic process $\omega_t$ and obtain the EWMA
definition given before, let:

<div>
$$
\begin{cases}
    \omega_t &= \alpha x_t \\
    \phi &= 1 - \alpha
\end{cases}
$$
</div>

With those identifications, we can therefore obtain the exact definition of an
EWMA model. Such obtained definition can be turned into the recurrent relation
defined at the beginning of this section by induction.

## Implementations and practical use

In this section we will explore how ARMA models can be used in practice. We
will give some example implementations, and we will also see how modern and
widely used cybersecurity solution can make use of them. A particular focus
will be dedicated to the EWMA-based models, which are the simplest yet powerful
ARMA model to use.

### EWMA example implementation

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

    update(value, tau = this.t + this.increment) {
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
            this.update(value, i + this.t + this.increment))
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

### EWMA usage in threat detection

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

In other solutions not supporting real EWMA estimation, we can mimic an
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

## Research

Lately, sophisticated detection models making use of ARMA models, EWMA and
EWMA-like metrics have been developed.

### ARMA for anomaly detection in HTTP applications

The article [_Hourly Network Anomaly Detection on HTTP Using Exponential Random
Graph Models and Autoregressive Moving Average_ (R. Li, M. Tsikerdekis, A.
Emanuelson - 2022)](https://www.mdpi.com/2624-800X/3/3/22) formalizes a model
for anomaly detection in structured network infrastructures. The model has been
used to detect suspicious behaviors in the context of HTTP applications. Citing
the article itself:

> We use exponential random graph models (ERGMs) in order to flatten hourly
> network topological characteristics into a time series, and Autoregressive
> Moving Average (ARMA) to analyze that time series and to detect potential
> attacks. In particular, we extend our previous method in not only
> demonstrating detection over hourly data but also through labeling of nodes
> and over the HTTP protocol. We demonstrate the effectiveness of our method
> using real-world data for creating exfiltration scenarios.

_Exponential Random Graph Models_ (_ERGM_), in this context, can be used to
produce so-called _log-odds coefficients_. Such coefficients are useful to
estimate if the state of a network is usual or not.

An ARMA model analogous to the one defined in the theoretical introduction was
used to produce predictions that enable to detect suspicious traffic volumes:

> In our approach, the ARMA is trained first; then, it calculates
> variable-sized prediction windows for a few points into the future; and if
> the observations fall outside the range, an alert is raised for an anomalous
> event.

In the article, the authors point out that the formulated model showed quite
promising results against exfiltration techniques.

### Enhanced EWMA for false positives reduction

The article [An Enhanced EWMA for Alert Reduction and Situation Awareness in
Industrial Control Networks (B. Jiang, Y. Liu et al. -
2022)](https://ieeexplore.ieee.org/document/9926545) shows how an enhanced
version of EWMA can be used to drastically reduce the number of alerts raised
by IDSs. Citing the article itself:

> IDSs typically generate a huge number of alerts, which are time-consuming for
> system operators to process. Most of the alerts are individually
> insignificant false alarms. However, it is not the best solution to discard
> these alerts, as they can still provide useful information about network
> situation. Based on the study of characteristics of alerts in the industrial
> control systems, we adopt an enhanced method of exponentially weighted moving
> average (EWMA) control charts to help operators in processing alerts.

The work is developed in the context of _Industrial Control Networks_ (_ICNs_),
in which a huge number of alerts is triggered, most of them being false
positives. The key idea is that an EWMA model is used on the number of alerts
itself to determine if, at a given time, the volume and type of them is usual
(and therefore not representing suspicious activity) or not.

#### Enhanced EWMA

The _Enhanced EWMA_ sets upper and lower control limits (i.e. _UCL_ and _LCL_)
to mitigate EWMA over-adjusting. Such values are used as thresholds in outlier
detection. Formally, they are defined like below:

<div>
$$
    \begin{cases}
        \text{UCL} &= U \dot e_p(i) \\
        \text{LCL} &= -U \dot e_p(i)
    \end{cases}
$$
</div>

First, $U$ is the _control limit factor_, i.e. a parameter scaling acceptable
ranges. $e_p(i)$ is the _estimate prediction error_ for the actual prediction
error $e(i + 1)$ (i.e. the _one-step-ahead prediction error_) and is defined as
follows:

<div>
$$
    e^2_p(i) = \max \{ \alpha e^2(i) + (1 - \alpha) e^2_p(i - 1) \quad , \quad \sigma^2_e  \}
$$
</div>

Where $\sigma^2_e$ is the variance of the prediction error. This definition of
$e_p$ actually makes the EWMA model _residual-based_.

#### Experiments and results

Experiments and performance measurements were conducted over a real, big,
reliable dataset:

> We obtained nearly 600,000 alerts generated by the IDS of a power grid
> company’s automation control system in June, 2021. This is a typical
> communication network in the ICS scenario where encryption and isolation
> measures are adopted to the communication between hosts. The network
> behaviors of the hosts are strictly restricted, and rigorous signatures are
> applied to the IDS for the sake of security.

Regarding the results and evaluations, the authors immediately pointed out the
intrinsic evaluation difficulties:

> As the real-world data set lacks labels for malicious network attacks and
> other security events, it is difficult to evaluate our method using metrics
> like accuracy, precision and recall.

However, the actual volume of alerts raised by the model was drastically
reduced. Moreover, cases in the resulting data were spot; in such cases, it was
quite clear that the level of alerts increased drastically, in a much more
recognizable way compared to a bare IDS.

### $\phi$-entropy and EWMA for anomaly detection

The article [Self-adaptive Threshold Traffic Anomaly Detection Based on
$\phi$-Entropy and the Improved EWMA Model (M. Deng, B. Wu -
2020)](https://ieeexplore.ieee.org/document/9084673) formalizes an enhanced
EWMA model featuring self-adaptive threshold based on $\phi$-entropy.

The article is very technical, formal analysis of a novel EWMA model for
anomaly detection. It delivers own proved theorems and is a wonderful piece of
research.

In the abstract, the authors clearly explain the rationale behind their work:

> Most of traffic anomaly detection algorithms use a fixed threshold for
> anomaly judgment, but these methods cannot keep a high detection accuracy in
> numerous cases. Aiming at this problem, this paper proposes a method to
> generate a self-adaptive threshold based on the improved Exponentially
> Weighted Moving Average (EWMA) model. The method predicts the value of
> $phi$-Entropy at the next moment and further generate the threshold. Results
> of simulation and experiment show that the algorithm can effectively detect
> abnormal network traffic

#### Model description

The idea behind the proposed model is quite clever and creative. Again, the
article itself provide a succinct and crystal clear explanation:

> The $phi$-Entropy is used to describe the autocorrelation of network traffic.
> The improved EWMA model is used to predict the $phi$-Entropy at the next
> moment and further generate the adaptive threshold. The obtained threshold is
> used to determine whether the traffic at the next moment is anomaly traffic
> or not.

The improvement of the classic EWMA model is achieved with two modifications:

1. a slide-window model using just a few recent data is used to
   compute the next predicted value
2. the $\alpha$ parameter is recomputed at each prediction; the computation is
   done by interpolation of two intermediate values $\alpha_{\text{high}}$ and
   $\alpha_{\text{low}}$, which are based on the speed of data change

The model thresholds can be adapted at every prediction as below:

<div>
$$
    [\overline{y} - \sigma, \overline{y} + \sigma]
$$
</div>

Where \sigma is the floating range and $\overline{y}$ is the predicted value.
The traffic can be evaluated in the following way:

<div>
$$
\begin{cases}
    \text{traffic is normal} & \text{if} \overline{y_t} - \sigma \le y_t \le \overline{y_t} + \sigma \\
    \text{traffic is suspicious} & \text{otherwise}
\end{cases}
$$
</div>

#### Experiments and results

In order to evaluate the performance of the model, the following metrics have
been used:

* _ACC_: Accuracy
* _DR_: Detection Rate
* _FAR_: False Alarm Rate

With various parameters, the model showed very good results:

* The estimated _ACC_ was always over 90% but for one time
* The estimated _DR_ was consistently around 98%, being at 97% just once
* The estimated _FAR_ was always under 5%

Complete results are given below with the corresponding parameters.

| $w$  | $\beta$ | $\alpha$ | ACC/% | DR/%  | FAR/% |
|------|---------|----------|-------|-------|-------|
| 5    | 0.5     | 0.6      | 93.81 | 98.71 | 3.61  |
| 10   | 0.5     | 0.6      | 94.01 | 98.54 | 3.42  |
| 20   | 0.5     | 0.6      | 95.17 | 98.10 | 3.17  |
| 5    | 1.0     | 0.6      | 93.01 | 98.91 | 3.87  |
| 10   | 1.0     | 0.6      | 93.71 | 98.11 | 3.71  |
| 20   | 1.0     | 0.6      | 94.21 | 97.13 | 3.65  |
| 5    | 1.5     | 0.6      | 93.17 | 99.11 | 4.01  |
| 10   | 1.5     | 0.6      | 94.31 | 98.67 | 3.94  |
| 20   | 1.5     | 0.6      | 95.71 | 98.77 | 3.83  |
| 20   | 1.5     | 0.5      | 93.81 | 98.71 | 4.07  |
| 20   | 1.5     | 0.4      | 90.74 | 98.66 | 4.51  |
| 20   | 1.5     | 0.3      | 87.64 | 98.70 | 4.55  |

The authors claimed that their model actually outperformed existing
alternatives (such as joint-entropy or Shannon entropy based models) in both
_DR_ and _FAR_.

| Algorithm                 | DR/%  | FAR/% |
|---------------------------|-------|-------|
| Based on joint-entropy    | 95.30 | 4.76  |
| Based on entropy and DNN  | 93.78 | 6.21  |
| Based on Shannon entropy  | 93.50 | 5.5   |
| Proposed algorithm        | 98.71 | 4.07  |

## Conclusions

We have shown how Autoregressive Moving Average models can play a key role in
anomaly and threat detection. After giving a theoretical introduction, we have
shown how such models can be used in both existing, widely adopted solutions
and cutting-edge research applications.

For the latter, we have shown how ARMA models can be used to both improve the
detection process and overall accuracy and enhance existing anomaly detection
solutions. Of course, in this context we have shown just a small portion of
existing works. The research ecosystem in this field is vast and continuously
evolving.
