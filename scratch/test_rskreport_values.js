const fs = require('fs');
const path = require('path');
const { parseReportText } = require('../src/lib/report-parser');

const textPath = path.join(__dirname, 'rskreport_text.txt');
const text = fs.readFileSync(textPath, 'utf8');

console.log("Parsing rskreport_text.txt with updated report-parser...");
const analysis = parseReportText(text);

const assertions = {
  "HbA1c": 8.7,
  "Total Cholesterol": 182,
  "LDL (Bad) Cholesterol": 86,
  "HDL (Good) Cholesterol": 28,
  "Triglycerides": 457,
  "eGFR": 101,
  "Creatinine": 0.84,
  "Uric Acid": 3.94
};

console.log("\n--- Verification Assertions ---");
let passedAll = true;

for (const [name, expected] of Object.entries(assertions)) {
  const result = analysis.results.find(r => r.name === name);
  if (!result) {
    console.error(`❌ FAILED: ${name} not found in parsed results!`);
    passedAll = false;
  } else if (result.value !== expected) {
    console.error(`❌ FAILED: ${name} value is ${result.value}, expected ${expected}`);
    passedAll = false;
  } else {
    console.log(`✓ PASSED: ${name} -> ${result.value}`);
  }
}

// Assert potassium is not matched
const potassium = analysis.results.find(r => r.name === "Potassium");
if (potassium) {
  console.error(`❌ FAILED: Potassium was matched as ${potassium.value}, but it is not in this report!`);
  passedAll = false;
} else {
  console.log(`✓ PASSED: Potassium is not matched (correctly absent).`);
}

// Assert no ZIP codes or years matched as CPK
const cpk = analysis.results.find(r => r.name === "Total CK (CPK)");
if (cpk && cpk.value === 560043) {
  console.error(`❌ FAILED: Total CK (CPK) incorrectly matched address ZIP code 560043!`);
  passedAll = false;
} else {
  console.log(`✓ PASSED: Total CK (CPK) did not match ZIP code noise.`);
}

console.log("\n--- Full Extracted List ---");
for (const res of analysis.results) {
  console.log(`- ${res.name.padEnd(28)}: ${res.value.toString().padEnd(8)} (Normal: ${res.range[0]}-${res.range[1]} ${res.unit})`);
}

if (passedAll) {
  console.log("\n🎉 ALL RSK REPORT ASSERTIONS PASSED!");
} else {
  console.error("\n❌ SOME ASSERTIONS FAILED.");
  process.exit(1);
}
