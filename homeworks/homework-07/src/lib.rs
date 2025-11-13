use std::ops::Deref;

use rand::prelude::*;

#[derive(Debug, Clone)]
pub struct Simulator {
    /// Number of weeks
    pub n: u32,

    /// Number of attackers
    pub m: u32,

    /// Probability of violating the server
    pub p: f32,
}

pub struct RandomWalk(Vec<i32>);

impl Deref for RandomWalk {
    type Target = Vec<i32>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl<'a> IntoIterator for &'a RandomWalk {
    type Item = &'a i32;
    type IntoIter = std::slice::Iter<'a, i32>;

    fn into_iter(self) -> Self::IntoIter {
        self.0.iter()
    }
}

impl RandomWalk {
    pub fn final_value(&self) -> i32 {
        self.0.last().copied().unwrap_or(0)
    }
}

impl Simulator {
    pub fn new(n: u32, m: u32, p: f32) -> Self {
        Self { n, m, p }
    }

    /// Generate a random walk
    pub fn random_walk(&self) -> RandomWalk {
        let mut rng = rand::rng();
        let mut walk: Vec<i32> = Vec::with_capacity(self.n as usize);
        let mut sum: i32 = 0;

        for _ in 0..self.n {
            sum += self.random_step(&mut rng) as i32;
            walk.push(sum);
        }

        RandomWalk(walk)
    }

    /// Generate a random step
    fn random_step(&self, rng: &mut ThreadRng) -> i8 {
        let violated = (0..self.m)
            .map(|_| rng.random_bool(self.p as f64))
            .any(|v| v);
        if violated { -1 } else { 1 }
    }
}
