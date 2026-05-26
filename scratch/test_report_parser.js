const { parseReportText } = require('../src/lib/report-parser');

const testCases = [
  {
    name: "Standard CBC format (Result first)",
    text: "Hemoglobin (Hb)   14.5 g/dL   (12.0 - 16.5)\nWBC Count         6500 /mm3   (4000 - 11000)\nPlatelet Count    2.5 lakh/mm3 (1.5 - 4.5)",
    expected: {
      "Hemoglobin": 14.5,
      "WBC Count": 6500,
      "Platelet Count": 2.5
    }
  },
  {
    name: "Ref range first format",
    text: "Total Cholesterol  125 - 200 mg/dL  190\nHDL Cholesterol    40 - 60 mg/dL    45\nLDL Cholesterol    0 - 100 mg/dL    120",
    expected: {
      "Total Cholesterol": 190,
      "HDL (Good) Cholesterol": 45,
      "LDL (Bad) Cholesterol": 120
    }
  },
  {
    name: "Single value formats",
    text: "Fasting Glucose: 95 mg/dL\nHbA1c: 5.8 %",
    expected: {
      "Fasting Glucose": 95,
      "HbA1c": 5.8
    }
  },
  {
    name: "Noise numbers (Age and Dates)",
    text: "Patient Age: 45 Years   Date: 2026-05-26\nHemoglobin: 13.2 g/dL\nRandom Blood Sugar: 125 mg/dL",
    expected: {
      "Hemoglobin": 13.2,
      "Random Blood Sugar": 125
    }
  }
];

function runTests() {
  console.log("Running Report Parser Tests...\n");
  let passedAll = true;

  for (const tc of testCases) {
    console.log(`--- Test Case: ${tc.name} ---`);
    const result = parseReportText(tc.text);
    
    // Check results
    for (const [paramName, expectedVal] of Object.entries(tc.expected)) {
      const parsed = result.results.find(r => r.name === paramName);
      if (!parsed) {
        console.error(`❌ FAILED: Parameter ${paramName} not found!`);
        passedAll = false;
      } else if (parsed.value !== expectedVal) {
        console.error(`❌ FAILED: Parameter ${paramName} parsed as ${parsed.value}, expected ${expectedVal}`);
        passedAll = false;
      } else {
        console.log(`✓ PASSED: ${paramName} -> ${parsed.value}`);
      }
    }
    console.log();
  }

  if (passedAll) {
    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
  } else {
    console.error("❌ SOME TESTS FAILED.");
  }
}

runTests();
