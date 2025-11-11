use homework_07::*;
use plotters::prelude::*;

const CHART_RES_X: u32 = 1280;
const CHART_RES_Y: u32 = 720;

fn main() {
    let sim = Simulator::new(1000, 0.5);
    let data = sim.run();
    plot_line_chart(&data, "test.png");
}

fn plot_line_chart(data: &[i8], filename: &str) {
    let data = Simulator::random_walk(data);

    let root = BitMapBackend::new(filename, (CHART_RES_X, CHART_RES_Y)).into_drawing_area();
    root.fill(&WHITE).unwrap();

    let y_min = *data.iter().min().unwrap_or(&0) as i32;
    let y_max = *data.iter().max().unwrap_or(&0) as i32;
    let x_max = data.len() as i32;

    let mut chart = ChartBuilder::on(&root)
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

    chart
        .draw_series(LineSeries::new(
            data.iter().enumerate().map(|(i, &v)| (i as i32, v as i32)),
            &RED,
        ))
        .unwrap();

    root.present().unwrap();
}
