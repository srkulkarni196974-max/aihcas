const line178 = "80-200 ng/dL 87 E.C.L.I.A TOTAL TRIIODOTHYRONINE (T3)";
const regexes = [/\bt3\b/i, /triiodothyronine/i, /total t3/i];

console.log("Tracing Line 178 parsing with parameter name clearing:");
traceLine(line178, regexes);

function traceLine(line, regexList) {
  let lineWithClearedNames = line.toLowerCase();
  for (const reg of regexList) {
    const nameRegex = new RegExp(reg.source, 'gi');
    lineWithClearedNames = lineWithClearedNames.replace(nameRegex, (m) => " ".repeat(m.length));
  }

  const cleanLine = lineWithClearedNames.replace(/[^\w\s\.\-\/\%–<>]/g, ' ');
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
    }

    const limitRegex = /(?:<|>|<=|>=|ref|bio)\s*(\d+(?:\.\d+)?)/gi;
    let limitMatch;
    while ((limitMatch = limitRegex.exec(cleanLine)) !== null) {
      excludedNumbers.add(parseFloat(limitMatch[1]));
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
