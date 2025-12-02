use clap::Parser;
use homework_11::*;
use plotters::prelude::*;

#[derive(Parser)]
#[command(name = "brownian", about = "Brownian motion plotter")]
struct Cli {
    /// Full time period
    #[arg(short, default_value = "10")]
    pub t: f32,

    /// Time definition (i.e. number of trials)
    #[arg(short, default_value = "1000")]
    pub n: u32,

    /// Success probability for Rademacher trials
    #[arg(short, default_value = "0.5")]
    pub p: f64,

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
    let sim = Simulator::new(args.t, args.n, args.p).run();

    let root = BitMapBackend::new(&args.output, (args.width, args.height)).into_drawing_area();
    root.fill(&WHITE).unwrap();

    let y_min = sim
        .iter()
        .map(|x| x.floor() as isize)
        .min()
        .unwrap_or(-(args.n as isize)) as f64;

    let y_max = sim
        .iter()
        .map(|x| x.ceil() as isize)
        .max()
        .unwrap_or(args.n as isize) as f64;

    println!("Max y value is {y_max}");

    let caption = format!(
        "Brownian motion simulation with t={}, n={}, p={} - Last value: {}",
        args.t,
        args.n,
        args.p,
        sim.final_value(),
    );

    let mut chart = ChartBuilder::on(&root)
        .caption(caption, ("sans-serif", 24))
        .margin(20)
        .x_label_area_size(40)
        .y_label_area_size(40)
        .build_cartesian_2d(0.0..args.t as f64, y_min..y_max)
        .unwrap();

    chart
        .configure_mesh()
        .x_desc("t")
        .y_desc("W(t)")
        .draw()
        .unwrap();

    let data: Vec<(f64, f64)> = sim
        .iter()
        .enumerate()
        .map(|(i, v)| (i as f64 / args.n as f64, *v))
        .collect();
    chart.draw_series(LineSeries::new(data, RED)).unwrap();

    root.present().unwrap();
}
