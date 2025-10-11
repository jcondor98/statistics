import { computeFrequencies, encrypt, decrypt, crack, detectLanguage } from "lib";

let frequencies;
fetch("https://cdn.jsdelivr.net/gh/jcondor98/statistics@master/homework-02/frequency-analysis/frequencies.json")
  .then(res => res.json())
  .then(f => {
    frequencies = f
  })

function onAnalyse() {
  const result = computeFrequencies(getInput());
  setResult(JSON.stringify(result, null, 2));
  setDistance();
}

function onEncrypt() {
  const key = getKey();
  const input = getInput();
  setResult(encrypt(input, key));
  setLanguage();
  setDistance();
}

function onDecrypt() {
  const key = getKey();
  const input = getInput();
  setResult(decrypt(input, key));
  setLanguage();
  setDistance();
}

function onCrack() {
  console.log("Attempting to crack text");
  const input = getInput();
  const { key, language, distance } = crack(input, frequencies);
  setKey(key);
  setResult(decrypt(input, key));
  setLanguage(language);
  setDistance(distance);
}

function onDetectLanguage() {
  const { language, distance } = detectLanguage(getInput(), frequencies);
  setLanguage(language);
  setDistance(distance);
}

function onReset() {
  document.getElementById("caesar-input").value = '';
  setResult('');
  setKey(13);
  setLanguage();
  setDistance();
}

function getKey() {
  return parseInt(document.getElementById("caesar-key").value);
}

function setKey(key) {
  document.getElementById("caesar-key").value = `${key}`;
}

function getInput() {
  return document.getElementById("caesar-input").value;
}

function setResult(text) {
  document.getElementById("caesar-result").value = text;
}

function setLanguage(lang) {
  lang = lang ? lang.charAt(0).toUpperCase() + lang.slice(1) : "Unknown"
  document.getElementById("caesar-language").innerText = lang;
}

function setDistance(distance) {
  distance = distance ? distance.toString() : '';
  document.getElementById("caesar-distance").innerText = distance;
}

window.caesar = {
  events: {
    onAnalyse, onEncrypt, onDecrypt, onCrack, onDetectLanguage, onReset,
  }
}
