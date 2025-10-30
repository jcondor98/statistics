export class Simulator {
  constructor({ paths, trials, p = 0.5 }) {
    this.paths = paths
    this.trials = trials
    this.p = p
  }

  simulate() {
    const data = Array.from({ length: this.paths })
      .map(() => this.simulatePath(this.trials))
    return new Simulation({ data, p: this.p })
  }

  simulatePath() {
    return Array.from({ length: this.trials })
      .map(() => Math.random() < this.p ? 1 : -1)
  }
}

/**
 * Compute the average of an array of numbers
 * @param {number[]} data the array of numbers
 * @returns {number} the computed average value
 */
export default function average(data) {
  return data.map(s => s.reduce((x, y) => x + y, 0) / s.length)
}

export class Simulation {
  constructor({ data, p }) {
    this.data = data
    this.p = p
    this.paths = data.length
    this.trials = data[0]?.length || 0
  }

  relativeFrequency() {
    return this.data.map(path => {
      const a = Array.from(path)
      let sum = 0
      for (let i = 0; i < a.length; ++i) {
        sum += a[i]
        a[i] = sum / (i + 1)
      }
      return a
    })
  }

  cumulative() {
    return this.data.map(path => {
      const a = Array.from(path)
      let sum = 0
      for (let i = 0; i < a.length; ++i) {
        sum += a[i]
        a[i] = sum
      }
      return a
    })
  }

  gaussianFrequency() {
    const data = this.cumulative()
    const { mean, sigma } = this.getGaussianParameters()

    return data.map(path => path.map((x, i) => {
      const n = i + 1
      return (x - n * mean) / (sigma * Math.sqrt(n))
    }))
  }

  getGaussianParameters() {
    return {
      mean: 2 * this.p - 1,
      sigma: 2 * Math.sqrt(this.p * (1 - this.p))
    }
  }
}

export class Plotter {
  constructor({ data, xLabel, yLabel }) {
    this.data = data
    this.xLabel = xLabel
    this.yLabel = yLabel
  }

  static configureChartDefaults(Chart) {
    Chart.defaults.datasets.line.borderWidth = 1
    Chart.defaults.elements.point.radius = 0
    Chart.defaults.plugins.legend.display = false
  }

  plot() {
    throw new Error("Not implemented")
  }
}

export class LinePlotter extends Plotter {
  constructor({ min, max, ...args }) {
    super({ ...args })
    this.min = min
    this.max = max
  }

  plot() {
    const labels = Array.from({ length: this.data[0]?.length || 0 }, (_, i) => i)
    const labelStep = Math.ceil(this.data.length / 10)

    return {
      type: 'line',
      data: {
        labels,
        datasets: this.data.map(data => ({ data })),
      },
      options: {
        scales: {
          x: {
            title: { display: true, text: this.xLabel },
            ticks: {
              callback: (_, i) => (i % labelStep === 0 ? i.toString() : '')
            }
          },
          y: {
            title: { display: true, text: this.yLabel },
            min: this.min,
            max: this.max,
          },
        },
      },
      plugins: {
        decimation: { algorithm: 'lttb' },
      }
    }
  }
}

export class BarPlotter extends Plotter {
  constructor({ min, max, bars, step, ...args }) {
    super({ ...args })
    this.min = min
    this.max = max
    this.bars = bars
    this.step = step || Math.abs(max - min) / bars
  }

  plot() {
    const bars = this.#computeBarValues()
    const labels = Array.from({ length: bars.length },
      (_, i) => this.min + i * this.step)
      .map(x => x.toFixed(2))

    return {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data: bars,
            backgroundColor: 'rgb(75, 192, 192)',
          },
        ],
      },
      options: {
        scales: {
          x: { title: { display: true, text: this.xLabel } },
          y: { title: { display: true, text: this.yLabel } },
        },
      },
    }
  }

  #computeBarValues() {
    const bars = new Array(this.bars).fill(0)
    for (const path of this.data) {
      for (const z of path) {
        if (z < this.min || z > this.max)
          continue
        const i = Math.floor((z - this.min) / this.step)
        bars[i]++
      }
    }
    for (let i = 0; i < bars.length; ++i)
      bars[i] /= this.data.length * this.data[0]?.length
    return bars
  }
}
