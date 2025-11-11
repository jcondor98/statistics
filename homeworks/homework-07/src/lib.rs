use std::i16;

use rand::prelude::*;

#[derive(Debug, Clone)]
pub struct Simulator {
    n: u64,
    p: f32,
}

pub fn scale(x: u32, p: f32) -> u32 {
    (p * x as f32).trunc() as u32
}

impl Simulator {
    pub fn new(n: u64, p: f32) -> Self {
        Self { n, p }
    }

    pub fn run(&self) -> Vec<i8> {
        let mut rng = rand::rng();
        (0..self.n)
            .map(|_| rng.next_u32())
            .map(|r| if r < scale(u32::MAX, self.p) { 1 } else { -1 })
            .collect()
    }

    pub fn random_walk(trials: &[i8]) -> Vec<i16> {
        let mut walk: Vec<i16> = Vec::with_capacity(trials.len());
        let mut sum: i16 = 0;

        for x in trials {
            sum += *x as i16;
            walk.push(sum);
        }

        walk
    }
}

#[cfg(test)]
mod tests {
    use crate::scale;

    #[test]
    fn should_scale_properly() {
        assert_eq!(100, scale(200, 0.5));
        assert_eq!(2, scale(4, 0.5));
        assert_eq!(100, scale(400, 0.25));
        assert_eq!(0, scale(100, 0.0));
        assert_eq!(100, scale(100, 1.0));
    }
}
