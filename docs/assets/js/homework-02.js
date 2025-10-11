import { encrypt, decrypt, crack } from "lib";

let frequencies;
fetch("https://cdn.jsdelivr.net/gh/jcondor98/statistics@master/homework-02/frequency-analysis/frequencies.json")
  .then(res => res.json())
  .then(f => {
    frequencies = f
  })

function onEncrypt() {
  const key = getKey();
  const input = getInput();
  setResult(encrypt(input, key));
  setLanguage();
}

function onDecrypt() {
  const key = getKey();
  const input = getInput();
  setResult(decrypt(input, key));
  setLanguage();
}

function onCrack() {
  console.log("Attempting to crack text");
  const input = getInput();
  const guess = crack(input, frequencies);
  setKey(guess.key);
  setResult(decrypt(input, guess.key));
  setLanguage(guess.language);
  console.log(guess);
}

function onReset() {
  document.getElementById("caesar-input").value = '';
  document.getElementById("caesar-result").value = '';
  document.getElementById("caesar-key").value = 13;
  setLanguage();
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

window.caesar = {
  events: {
    onEncrypt, onDecrypt, onReset, onCrack
  }
}
