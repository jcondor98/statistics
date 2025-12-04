use clap::Parser;
use homework_11::*;
use plotters::prelude::*;

#[derive(Parser)]
#[command(name = "brownian", about = "Brownian motion plotter")]
struct Cli {
    /// Full time period
    #[arg(short, default_value = "10.0")]
    pub t: f64,

    /// Time definition (i.e. number of trials)
    #[arg(short, default_value = "1000")]
    pub n: u32,

    /// Time delta (dt)
    #[arg(short, long)]
    pub dt: Option<f64>,

    /// Drift
    #[arg(long, default_value = "0.0")]
    pub drift: f64,

    /// Diffusion factor
    #[arg(long, default_value = "1.0")]
    pub diffusion: f64,

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
    let n = args
        .dt
        .map(|dt| (args.t / dt).ceil() as usize)
        .unwrap_or(args.n as usize);
    let dt = args.dt.unwrap_or(args.t / n as f64);

    let wiener_process = WienerProcess::new(dt).unwrap();
    let mut simulator = EulerMaruyamaSimulatorBuilder::default()
        .process(wiener_process)
        .t(args.t)
        .dt(dt)
        .drift(args.drift)
        .diffusion(args.diffusion)
        .build()
        .unwrap();

    let sim = simulator.run();

    let root = BitMapBackend::new(&args.output, (args.width, args.height)).into_drawing_area();
    root.fill(&WHITE).unwrap();

    let y_min = sim
        .iter()
        .min_by(|x, y| x.partial_cmp(y).unwrap())
        .copied()
        .unwrap_or(-(n as f64));

    let y_max = sim
        .iter()
        .max_by(|x, y| x.partial_cmp(y).unwrap())
        .copied()
        .unwrap_or(n as f64);

    let caption = format!(
        "Brownian motion simulation with t={}, dt={}, a={}, b={} - Last value: {:.3}",
        args.t,
        dt,
        args.drift,
        args.diffusion,
        sim.final_value(),
    );

    let mut chart = ChartBuilder::on(&root)
        .caption(caption, ("sans-serif", 24))
        .margin(20)
        .x_label_area_size(40)
        .y_label_area_size(40)
        .build_cartesian_2d(0.0..args.t, y_min..y_max)
        .unwrap();

    chart
        .configure_mesh()
        .x_desc("t")
        .y_desc("W(t)")
        .draw()
        .unwrap();

    let data: Vec<(f64, f64)> = sim
        .into_iter()
        .enumerate()
        .map(|(i, v)| (i as f64 / n as f64 * simulator.t, *v))
        .collect();
    chart.draw_series(LineSeries::new(data, RED)).unwrap();

    root.present().unwrap();
}
