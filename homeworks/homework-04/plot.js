import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import * as fs from 'fs/promises';
import { Simulator, Plotter, LinePlotter, BarPlotter } from './src/index.js'

const CHART_WIDTH = 1240;
const CHART_HEIGHT = 720;

async function exportSimulation(plotter, outfile) {
  const configuration = plotter.plot()

  function chartCallback(ChartJS) {
    ChartJS.defaults.responsive = true
    ChartJS.defaults.maintainAspectRatio = false
    Plotter.configureChartDefaults(ChartJS)
  }

  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: CHART_WIDTH, height: CHART_HEIGHT, chartCallback })
  const buffer = await chartJSNodeCanvas.renderToBuffer(configuration)
  await fs.writeFile(outfile, buffer, 'base64')
}

const simulation = new Simulator({
  paths: 20,
  trials: 40000,
  p: 0.5,
}).simulate()

const gaussianFrequency = simulation.gaussianFrequency()

exportSimulation(new LinePlotter({
  data: simulation.relativeFrequency(),
  min: -0.2,
  max: 0.2,
}), './charts/relative-frequency.png')

exportSimulation(new LinePlotter({
  data: gaussianFrequency,
}), './charts/gaussian-frequency.png')

exportSimulation(new BarPlotter({
  data: gaussianFrequency,
  min: -3,
  max: 3,
  bars: 150,
}), './charts/gaussian-bell.png')

