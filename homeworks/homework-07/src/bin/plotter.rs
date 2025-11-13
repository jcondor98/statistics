use clap::Parser;
use homework_07::*;
use plotters::prelude::*;
use rand::Rng;

#[derive(Parser)]
#[command(name = "walk", about = "Random walk generator and plotter")]
struct Cli {
    /// Number of weeks
    #[arg(short)]
    pub n: u32,

    /// Number of attackers
    #[arg(short, default_value = "1")]
    pub m: u32,

    /// Probability of violating the server.
    /// If not specified, it will be computed such that the probability of violating the server at
    /// least once is 0.5
    #[arg(short)]
    pub p: Option<f32>,

    /// Number of different trajectories.
    /// A simulation will be performed for each trajectory
    #[arg(short, long, default_value = "1")]
    pub trajectories: u32,

    /// Width of the graph in pixels
    #[arg(short = 'W', long, default_value = "1920")]
    pub width: u32,

    /// Height of the graph in pixels
    #[arg(short = 'H', long, default_value = "1080")]
    pub height: u32,

    /// Output file
    #[arg(short, long)]
    pub output: String,
}

fn main() {
    let args = Cli::parse();
    let p = args.p.unwrap_or_else(|| compute_fair_p(args.m, 0.5));

    let sim = Simulator::new(args.n, args.m, p);
    let walks: Vec<RandomWalk> = (0..args.trajectories).map(|_| sim.random_walk()).collect();

    let root = BitMapBackend::new(&args.output, (args.width, args.height)).into_drawing_area();
    root.fill(&WHITE).unwrap();

    let (y_min, y_max) = y_bounds(&walks, args.n as i32);
    let x_max = args.n as i32;

    let caption = if args.trajectories == 1 {
        let final_value = walks.get(0).unwrap().final_value();
        format!(
            "Random walk with n={}, m={}, p={:.3} - Last value: {}",
            args.n, args.m, p, final_value,
        )
    } else {
        format!("Random walk with n={}, m={}, p={:.3}", args.n, args.m, p)
    };

    let mut chart = ChartBuilder::on(&root)
        .caption(caption, ("sans-serif", 24))
        .margin(20)
        .x_label_area_size(40)
        .y_label_area_size(40)
        .build_cartesian_2d(0..x_max, y_min..y_max)
        .unwrap();

    chart
        .configure_mesh()
        .x_desc("Time (weeks)")
        .y_desc("Server score")
        .draw()
        .unwrap();

    for w in walks {
        let w: Vec<(i32, i32)> = w
            .as_slice()
            .iter()
            .enumerate()
            .map(|(i, v)| (i as i32, *v))
            .collect();
        chart
            .draw_series(LineSeries::new(w, &random_color()))
            .unwrap();
    }

    root.present().unwrap();
}

fn compute_fair_p(m: u32, target: f32) -> f32 {
    1.0 - (1.0 - target).powf(1.0 / (m as f32))
}

fn y_bounds(walks: &Vec<RandomWalk>, n: i32) -> (i32, i32) {
    let y_min = walks.iter().flatten().min().copied().unwrap_or(-n);
    let y_max = walks.iter().flatten().max().copied().unwrap_or(n);
    (y_min, y_max)
}

fn random_color() -> RGBColor {
    let mut rng = rand::rng();
    RGBColor(
        rng.random_range(0..=255),
        rng.random_range(0..=255),
        rng.random_range(0..=255),
    )
}
