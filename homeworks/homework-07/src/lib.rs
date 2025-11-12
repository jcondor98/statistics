use rand::prelude::*;

#[derive(Debug, Clone)]
pub struct Simulator {
    pub n: u32,
    pub m: u32,
    pub p: f32,
}

pub fn scale(x: u32, p: f32) -> u32 {
    (p * x as f32).trunc() as u32
}

impl Simulator {
    pub fn new(n: u32, m: u32, p: f32) -> Self {
        Self { n, m, p }
    }

    pub fn random_walk(&self) -> Vec<i32> {
        let mut rng = rand::rng();
        let mut walk: Vec<i32> = Vec::with_capacity(self.n as usize);
        let mut sum: i32 = 0;

        for _ in 0..self.n {
            sum += self.random_step(&mut rng) as i32;
            walk.push(sum);
        }

        walk
    }

    fn random_step(&self, rng: &mut ThreadRng) -> i8 {
        let violated = (0..self.m)
            .map(|_| rng.random_bool(self.p as f64))
            .any(|v| v);
        if violated { -1 } else { 1 }
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
