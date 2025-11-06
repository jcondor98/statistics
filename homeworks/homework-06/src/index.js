export class Mean {
  constructor() { }

  /**
   * Construct a Mean instance from an array of values
   * @param _values the values to use
   * @returns {Mean} the constructed Mean instance
   */
  static from(_values) {
    throw new Error("from() not implemented for abstract class Mean")
  }

  /** @returns {number} the current value for the mean */
  mean() {
    throw new Error("mean() not implemented for abstract class Mean")
  }

  /**
   * Push another value for the computation of the mean
   * @param _x the value to push
   * @returns {Mean} this Mean instance
   */
  push(_x) {
    throw new Error("push() not implemented for abstract class Mean")
  }
}

export class Variance {
  constructor() { }
  /**
   * Construct a Variance instance from an array of values
   * @param _values the values to use
   * @returns {Variance} the constructed Variance instance
   */
  static from(_values) {
    throw new Error("from() not implemented for abstract class Variance")
  }

  /** @returns {number} the current value for the variance */
  variance() {
    throw new Error("variance() not implemented for abstract class Variance")
  }

  /**
   * Push another value for the computation of the variance
   * @param _x the value to push
   * @returns {Variance} this Variance instance
   */
  push(_x) {
    throw new Error("push() not implemented for abstract class Variance")
  }
}

export class BatchMean extends Mean {
  constructor(values) {
    super()
    this.values = values
  }

  static from(values) {
    return new BatchMean(values)
  }

  mean() {
    return this.values.reduce((mu, x) => mu + x / this.values.length, 0)
  }

  push(x) {
    this.values.push(x)
    return this
  }
}

export class RecurrentSumMean extends Mean {
  constructor({ sum, n }) {
    super()
    this.sum = sum
    this.n = n
  }

  static from(values = []) {
    const sum = values.reduce((x, y) => x + y, 0)
    const n = values.length
    return new RecurrentSumMean({ sum, n })
  }

  mean() {
    return this.sum / this.n
  }

  push(x) {
    this.sum += x
    this.n += 1
    return this
  }
}

export class OnlineMean extends Mean {
  constructor(values = []) {
    super()
    this.mu = 0
    this.n = 0
    for (const x of values)
      this.push(x)
  }

  static from(values) {
    return new OnlineMean(values)
  }

  mean() {
    return this.mu
  }

  push(x) {
    this.n += 1
    this.mu += (x - this.mu) / this.n
    return this
  }
}

export class BatchVariance extends Variance {
  constructor(values = []) {
    super()
    this.values = values
  }

  static from(values) {
    return new BatchVariance(values)
  }

  variance() {
    const mu = BatchMean.from(this.values).mean()
    const sum = this.values.reduce((acc, x) => acc + Math.pow(x - mu, 2), 0)
    return sum / (this.values.length - 1)
  }

  push(x) {
    this.values.push(x)
    return this
  }
}

export class WelfordVariance extends Variance {
  constructor(values = []) {
    super()
    this.mean = new OnlineMean()
    this.m = 0
    this.n = 0
    for (const x of values)
      this.push(x)
  }

  static from(values) {
    return new WelfordVariance(values)
  }

  variance() {
    return this.m / (this.n - 1)
  }

  push(x) {
    const muPrev = this.mean.mean()
    const mu = this.mean.push(x).mean()
    this.m += (x - muPrev) * (x - mu)
    this.n += 1
    return this
  }
}
