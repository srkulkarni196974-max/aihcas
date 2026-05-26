const { parseReportText } = require('../src/lib/report-parser');

const conflictTestCases = [
  {
    name: "Hb A1c vs Hemoglobin separation",
    text: "Hemoglobin: 14.2 g/dL\nHb A1c: 5.8 %",
    expected: {
      "Hemoglobin": 14.2,
      "HbA1c": 5.8
    }
  },
  {
    name: "Free T3 vs T3 separation",
    text: "Free T3: 3.2 pg/mL\nT3: 120 ng/dL",
    expected: {
      "Free T3": 3.2,
      "T3": 120
    }
  },
  {
    name: "Free T4 vs T4 separation",
    text: "Free T4: 1.2 ng/dL\nT4: 7.5 ug/dL",
    expected: {
      "Free T4": 1.2,
      "T4": 7.5
    }
  },
  {
    name: "BUN vs Blood Urea separation",
    text: "Blood Urea Nitrogen (BUN): 15 mg/dL\nBlood Urea: 32 mg/dL",
    expected: {
      "Blood Urea Nitrogen (BUN)": 15,
      "Blood Urea": 32
    }
  }
];

function runTests() {
  console.log("Running Parameter Conflict Tests...\n");
  let passedAll = true;

  for (const tc of conflictTestCases) {
    console.log(`--- Test Case: ${tc.name} ---`);
    const result = parseReportText(tc.text);
    console.log("Extracted results:", result.results.map(r => `${r.name}: ${r.value}`));
    
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
    console.log("🎉 ALL CONFLICT TESTS PASSED SUCCESSFULLY!");
  } else {
    console.error("❌ SOME CONFLICT TESTS FAILED.");
  }
}

runTests();
