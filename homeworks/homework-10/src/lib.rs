use std::ops::Deref;

use rand::{distr::Bernoulli, prelude::*};

#[derive(Debug, Clone)]
pub struct Simulator {
    /// Full time period
    pub t: f32,

    /// Time definition (i.e. number of trials)
    pub n: u32,

    /// Success rate
    pub lambda: f32,
}

pub struct Simulation(Vec<i32>);

impl Deref for Simulation {
    type Target = Vec<i32>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl<'a> IntoIterator for &'a Simulation {
    type Item = &'a i32;
    type IntoIter = std::slice::Iter<'a, i32>;

    fn into_iter(self) -> Self::IntoIter {
        self.0.iter()
    }
}

impl Simulation {
    pub fn final_value(&self) -> i32 {
        self.0.last().copied().unwrap_or(0)
    }
}

impl Simulator {
    /// Instance a new simulator
    pub fn new(t: f32, n: u32, lambda: f32) -> Self {
        Self { t, n, lambda }
    }

    /// Generate a simulation
    pub fn run(&self) -> Simulation {
        let p = (self.lambda as f64) / (self.n as f64);

        let bernoulli = Bernoulli::new(p).unwrap();
        let rng = rand::rng();

        let mut data: Vec<i32> = Vec::with_capacity(self.n as usize);
        let mut sum: i32 = 0;

        for success in bernoulli.sample_iter(rng).take(self.n as usize) {
            sum += if success { 1 } else { 0 };
            data.push(sum);
        }

        Simulation(data)
    }
}
