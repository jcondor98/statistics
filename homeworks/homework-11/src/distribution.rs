use crate::simulator::StochasticProcess;
use rand::{
    distr::{Bernoulli, BernoulliError},
    prelude::*,
};
use rand_distr::{Normal, NormalError};

/// Rademacher distribution
#[derive(Debug, Clone)]
pub struct Rademacher(Bernoulli);

/// Wiener stochastic process with Gaussian increments
#[derive(Debug, Clone)]
pub struct WienerProcess {
    pub gaussian: Normal<f64>,
    pub current: f64,
}

impl Rademacher {
    pub fn new(p: f64) -> Result<Self, BernoulliError> {
        Bernoulli::new(p).map(Rademacher)
    }
}

impl Distribution<i8> for Rademacher {
    fn sample<R: Rng + ?Sized>(&self, rng: &mut R) -> i8 {
        if self.0.sample(rng) { 1 } else { -1 }
    }
}

impl Distribution<f64> for Rademacher {
    fn sample<R: Rng + ?Sized>(&self, rng: &mut R) -> f64 {
        if self.0.sample(rng) { 1.0 } else { -1.0 }
    }
}

impl WienerProcess {
    pub fn new(dt: f64) -> Result<Self, NormalError> {
        Normal::new(0.0, dt).map(Self::from)
    }
}

impl From<Normal<f64>> for WienerProcess {
    fn from(value: Normal<f64>) -> Self {
        WienerProcess {
            gaussian: value,
            current: 0.0,
        }
    }
}

impl StochasticProcess<f64> for WienerProcess {
    fn next<R: Rng + ?Sized>(&mut self, rng: &mut R) -> f64 {
        let dw = self.gaussian.sample(rng);
        self.current = self.current + dw;
        self.current
    }
}
