use clap::Parser;
use homework_07::*;
use plotters::prelude::*;

#[derive(Parser)]
#[command(name = "poisson", about = "Poisson simulator and plotter")]
struct Cli {
    /// Full time period
    #[arg(short, default_value = "1")]
    pub t: f32,

    /// Time definition (i.e. number of trials)
    #[arg(short, default_value = "1000")]
    pub n: u32,

    /// Success rate
    #[arg(short, long)]
    pub lambda: f32,

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
    let sim = Simulator::new(args.t, args.n, args.lambda).run();

    let root = BitMapBackend::new(&args.output, (args.width, args.height)).into_drawing_area();
    root.fill(&WHITE).unwrap();

    let y_max: i32 = sim.iter().max().copied().unwrap_or(args.n as i32);
    let caption = format!(
        "Poisson simulation with t={}, n={}, lambda={} - Last value: {}",
        args.t,
        args.n,
        args.lambda,
        sim.final_value(),
    );

    let mut chart = ChartBuilder::on(&root)
        .caption(caption, ("sans-serif", 24))
        .margin(20)
        .x_label_area_size(40)
        .y_label_area_size(40)
        .build_cartesian_2d(0.0..args.t as f64, 0..y_max)
        .unwrap();

    chart
        .configure_mesh()
        .x_desc("Time")
        .y_desc("Value")
        .draw()
        .unwrap();

    let data: Vec<(f64, i32)> = sim
        .iter()
        .enumerate()
        .map(|(i, v)| (i as f64 * args.t as f64 / args.n as f64, *v))
        .collect();
    chart.draw_series(LineSeries::new(data, RED)).unwrap();

    root.present().unwrap();
}
