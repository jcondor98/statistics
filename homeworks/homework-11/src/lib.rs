use rand::{
    distr::{Bernoulli, BernoulliError},
    prelude::*,
};
use std::ops::Deref;

/// Rademacher distribution
pub struct Rademacher(Bernoulli);

impl Rademacher {
    fn new(p: f64) -> Result<Self, BernoulliError> {
        Bernoulli::new(p).map(Rademacher)
    }
}

impl Distribution<i8> for Rademacher {
    fn sample<R: Rng + ?Sized>(&self, rng: &mut R) -> i8 {
        if self.0.sample(rng) { 1 } else { -1 }
    }
}

#[derive(Debug, Clone)]
pub struct Simulator {
    /// Full time period
    pub t: f32,

    /// Time definition (i.e. number of trials)
    pub n: u32,

    /// Probability of a single step
    pub p: f64,
}

impl Simulator {
    /// Instance a new simulator
    pub fn new(t: f32, n: u32, p: f64) -> Self {
        Self { t, n, p }
    }

    /// Generate a simulation
    pub fn run(&self) -> Simulation {
        let scale_factor = (self.n as f64).sqrt();
        let nt = ((self.n as f64) * (self.t as f64)).floor() as usize;

        let rad = Rademacher::new(self.p).unwrap();
        let rng = rand::rng();

        let mut data: Vec<f64> = Vec::with_capacity(nt);
        let mut sum: i32 = 0;

        for step in rad.sample_iter(rng).take(nt) {
            sum += step as i32;
            data.push(sum as f64 / scale_factor);
        }

        Simulation(data)
    }
}

pub struct Simulation(Vec<f64>);

impl Simulation {
    pub fn final_value(&self) -> f64 {
        self.0.last().copied().unwrap_or(0.0)
    }
}

impl Deref for Simulation {
    type Target = Vec<f64>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl<'a> IntoIterator for &'a Simulation {
    type Item = &'a f64;
    type IntoIter = std::slice::Iter<'a, f64>;

    fn into_iter(self) -> Self::IntoIter {
        self.0.iter()
    }
}
