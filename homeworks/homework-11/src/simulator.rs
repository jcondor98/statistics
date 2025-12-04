use derive_builder::Builder;
use rand::Rng;
use rand_distr::Distribution;
use std::ops::Deref;

/// Memory-capable stochastic process.
/// Similar to `rand::Distribution`, offering `sample`-like capabilities with mutable self reference.
pub trait StochasticProcess<T> {
    fn next<R: Rng + ?Sized>(&mut self, rng: &mut R) -> T;
}

impl<T, D: Distribution<T>> StochasticProcess<T> for D {
    fn next<R: Rng + ?Sized>(&mut self, rng: &mut R) -> T {
        self.sample(rng)
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

#[derive(Builder)]
pub struct EulerMaruyamaSimulator<S: StochasticProcess<f64>> {
    pub process: S,
    pub drift: f64,
    pub diffusion: f64,
    pub dt: f64,
    pub t: f64,
}

impl<S: StochasticProcess<f64>> EulerMaruyamaSimulator<S> {
    pub fn n(&self) -> usize {
        (self.t / self.dt).ceil() as usize
    }

    pub fn run(&mut self) -> Simulation {
        let n = (self.t / self.dt).ceil() as usize;
        let mut data: Vec<f64> = Vec::with_capacity(n);
        let mut rng = rand::rng();

        data.push(0.0);
        for i in 1..self.n() {
            let step = self.step(data[i - 1], &mut rng);
            data.push(step);
        }

        Simulation(data)
    }

    pub fn step<R: Rng + ?Sized>(&mut self, prev: f64, rng: &mut R) -> f64 {
        let w = self.process.next(rng);
        prev + self.drift + self.diffusion * w
    }
}
