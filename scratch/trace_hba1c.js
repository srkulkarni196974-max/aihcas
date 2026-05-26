const { parseReportText } = require('../src/lib/report-parser');

const line44 = "8.7 HbA1c < 5.7 %";
const line219 = "% 8.7 H.P.L.C HbA1c";

console.log("Tracing Line 44 parsing:");
traceLine(line44);

console.log("\nTracing Line 219 parsing:");
traceLine(line219);

function traceLine(line) {
  const cleanLine = line.toLowerCase().replace(/[^\w\s\.\-\/\%–<>]/g, ' ');
  console.log("  cleanLine:", JSON.stringify(cleanLine));
  const allNumbersOnLine = cleanLine.match(/\d+(?:\.\d+)?/g);
  console.log("  allNumbersOnLine:", allNumbersOnLine);

  if (allNumbersOnLine && allNumbersOnLine.length > 0) {
    const excludedNumbers = new Set();
    excludedNumbers.add(1.73);
    excludedNumbers.add(2);

    const rangeRegex = /(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)/gi;
    let rangeMatch;
    while ((rangeMatch = rangeRegex.exec(cleanLine)) !== null) {
      excludedNumbers.add(parseFloat(rangeMatch[1]));
      excludedNumbers.add(parseFloat(rangeMatch[2]));
      console.log("    Excluded by range:", rangeMatch[1], rangeMatch[2]);
    }

    const limitRegex = /(?:<|>|<=|>=|ref|bio)\s*(\d+(?:\.\d+)?)/gi;
    let limitMatch;
    while ((limitMatch = limitRegex.exec(cleanLine)) !== null) {
      excludedNumbers.add(parseFloat(limitMatch[1]));
      console.log("    Excluded by limit:", limitMatch[1]);
    }

    const candidateNumbers = allNumbersOnLine.filter(numStr => {
      const val = parseFloat(numStr);
      for (const excl of excludedNumbers) {
        if (Math.abs(val - excl) < 0.001) return false;
      }
      return true;
    });
    console.log("    candidateNumbers:", candidateNumbers);
  }
}
