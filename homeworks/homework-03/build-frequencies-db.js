import { FrequencyAnalysis } from "./src/frequency.js";
import fs from "node:fs/promises"

const DEFAULT_OUTPUT = './frequencies.json';
const DEFAULT_TRAINING_DIR = './training';

export async function buildFrequenciesDb(output = DEFAULT_OUTPUT, trainingDir = DEFAULT_TRAINING_DIR) {
  console.group("Building letters frequencies database");
  const frequencies = {};

  for (const file of await fs.readdir(trainingDir)) {
    const language = file.replace(/\.txt$/, '');
    console.log(`Processing training text for language '${language}'`);
    const text = await fs.readFile(`${trainingDir}/${language}.txt`);
    const analysis = FrequencyAnalysis.of(text.toString())
    frequencies[language] = Object.fromEntries(analysis.entries())
  }

  console.log(`Writing frequencies database to '${output}'`);
  await fs.writeFile(output, JSON.stringify(frequencies));
  console.groupEnd();
}

if (import.meta.main) {
  buildFrequenciesDb();
}
