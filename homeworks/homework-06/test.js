#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { BatchMean, RecurrentSumMean, OnlineMean, BatchVariance, WelfordVariance } from './src/index.js';

yargs()
  .scriptName("hw06-test")
  .usage('$0 test')
  .command('test', 'Test all the implemented algorithms',
    y => y
      .option('n', { type: 'number', describe: 'Number of samples', default: 1000 })
      .option('max', { type: 'number', describe: 'Maximum value of a sample', default: 100 }), test)
  .help()
  .strict()
  .parse(hideBin(process.argv))

function test({ n, max }) {
  const dataset = Array.from({ length: n }, () => Math.random() * max)

  testMeanBlock(dataset)
  testMeanIncremental(dataset)
  testVarianceBlock(dataset)
  testVarianceIncremental(dataset)
}

function testMeanBlock(dataset) {
  function _test(name, createAlgorithm) {
    const [creationTime, algo] = measure(createAlgorithm)
    const [computationTime, value] = measure(() => algo.mean())
    return { name, creationTime, computationTime, value }
  }

  console.log("Testing mean algorithms (block)")
  const results = [
    _test('BatchMean', () => BatchMean.from(dataset)),
    _test('RecurrentSumMean', () => RecurrentSumMean.from(dataset)),
    _test('OnlineMean', () => OnlineMean.from(dataset)),
  ]

  console.table(results)
}

function testMeanIncremental(dataset) {
  function _test(name, algo) {
    const [computationTime, value] = measure(() => {
      for (const x of dataset)
        algo.push(x)
      return algo.mean()
    })
    return { name, computationTime, value }
  }

  console.log("Testing mean algorithms (incremental)")
  const results = [
    _test('BatchMean', BatchMean.from([])),
    _test('RecurrentSumMean', RecurrentSumMean.from([])),
    _test('OnlineMean', OnlineMean.from([])),
  ]

  console.table(results)
}

function testVarianceBlock(dataset) {
  function _test(name, createAlgorithm) {
    const [creationTime, algo] = measure(createAlgorithm)
    const [computationTime, value] = measure(() => algo.variance())
    return { name, creationTime, computationTime, value }
  }

  console.log("Testing variance algorithms (block)")
  const results = [
    _test('BatchVariance', () => BatchVariance.from(dataset)),
    _test('WelfordVariance', () => WelfordVariance.from(dataset)),
  ]

  console.table(results)
}

function testVarianceIncremental(dataset) {
  function _test(name, algo) {
    const [computationTime, value] = measure(() => {
      for (const x of dataset)
        algo.push(x)
      return algo.variance()
    })
    return { name, computationTime, value }
  }

  console.log("Testing variance algorithms (incremental)")
  const results = [
    _test('BatchVariance', BatchVariance.from([])),
    _test('WelfordVariance', WelfordVariance.from([])),
  ]

  console.table(results)
}

function measure(f) {
  const start = performance.now()
  const ret = f()
  const end = performance.now()
  return [end - start, ret]
}
