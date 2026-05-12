/**
 * Local Prescription Parser
 * Extracts medications, dosages, durations, and purposes from raw OCR text.
 * Uses a curated database of common Indian medications.
 */

import medicationsData from '@/data/medications.json';

export interface ParsedMedication {
  name: string;
  dosage: string;
  timing: string;
  duration: string;
  purpose: string;
  drugClass: string;
  warnings: string[];
  instructions: string;
}

export interface PrescriptionResult {
  medications: ParsedMedication[];
  summary: string;
  warnings: string[];
  generalAdvice: string;
  allergyAlert: string | null;
}

// ─── Indian Medication Database ───────────────────────────────────────────────
interface DrugInfo {
  names: string[];          // brand + generic names
  purpose: string;
  drugClass: string;
  warnings: string[];
  instructions: string;
}

export const DRUG_DATABASE: DrugInfo[] = medicationsData as DrugInfo[];


// ─── Dosage / Timing Pattern Matchers ─────────────────────────────────────────
function extractDosage(line: string): string {
  const mg = line.match(/\d+\.?\d*\s*(?:mg|mcg|ml|g|iu|units?)/i);
  if (mg) return mg[0].trim();
  const tab = line.match(/\d+\s*(?:tab(?:let)?s?|cap(?:sule)?s?)/i);
  return tab ? tab[0].trim() : 'As prescribed';
}

function extractTiming(line: string): string {
  // Match 1-0-1 style patterns
  const schedule = line.match(/\b([01]-[01]-[01])\b/);
  if (schedule) {
    const [m, a, n] = schedule[1].split('-').map(Number);
    const parts = [];
    if (m) parts.push('Morning');
    if (a) parts.push('Afternoon');
    if (n) parts.push('Night');
    return `${schedule[1]} (${parts.join(' + ')})`;
  }
  if (/once\s*daily|od\b/i.test(line)) return '1-0-0 (Once daily)';
  if (/twice\s*daily|bd\b|bid\b/i.test(line)) return '1-0-1 (Twice daily)';
  if (/thrice\s*daily|tds\b|tid\b/i.test(line)) return '1-1-1 (Thrice daily)';
  if (/four\s*times|qid\b/i.test(line)) return '1-1-1-1 (Four times daily)';
  if (/at\s*night|hs\b|bedtime/i.test(line)) return '0-0-1 (Night)';
  if (/morning/i.test(line)) return '1-0-0 (Morning)';
  if (/sos\b|as\s*needed|prn\b|when\s*required/i.test(line)) return 'SOS (As needed)';
  return 'As directed';
}

function extractDuration(text: string): string {
  const match = text.match(/(\d+)\s*(day|days|week|weeks|month|months)/i);
  if (match) return `${match[1]} ${match[2]}`;
  if (/continue|ongoing|long[\s-]term/i.test(text)) return 'Ongoing';
  if (/sos|as\s*needed|prn/i.test(text)) return 'As needed';
  return 'As prescribed';
}

// ─── Fuzzy Matching Utility ───────────────────────────────────────────────────
function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return matrix[a.length][b.length];
}

function isFuzzyMatch(word: string, target: string): boolean {
  if (word.length < 3) return word === target;
  const distance = levenshtein(word, target);
  const threshold = Math.floor(target.length * 0.35); // 35% error allowed for handwriting
  return distance <= threshold;
}

// ─── Main Parser ───────────────────────────────────────────────────────────────
export function parsePrescriptionText(
  rawText: string,
  allergies: string[] = []
): PrescriptionResult {
  const text = rawText.toLowerCase();
  const words = text.split(/[\s,.;:]+/).filter(w => w.length > 2);
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  const found: ParsedMedication[] = [];
  const globalWarnings: string[] = [];
  let allergyAlert: string | null = null;

  for (const drug of DRUG_DATABASE) {
    let matched = false;
    for (const name of drug.names) {
      const lowerName = name.toLowerCase();

      // 1. Direct match (Fast)
      if (text.includes(lowerName)) {
        matched = true;
      }
      // 2. Fuzzy match per word (Slow but handles handwriting noise)
      else {
        matched = words.some(word => isFuzzyMatch(word, lowerName));
      }

      if (matched) {
        // Find the line containing this drug name (or a word that fuzzy matches it)
        const matchedLine = lines.find(l => {
          const lLow = l.toLowerCase();
          return lLow.includes(lowerName) || lLow.split(/\s+/).some(w => isFuzzyMatch(w, lowerName));
        }) || name;

        // Check for allergy
        if (allergies.some(a => drug.drugClass.toLowerCase().includes(a.toLowerCase()) ||
          drug.names.some(n => n.toLowerCase().includes(a.toLowerCase())))) {
          allergyAlert = `⚠️ ALLERGY ALERT: ${drug.names[0]} — patient is allergic to this drug class (${drug.drugClass}). Consult your doctor immediately.`;
        }

        found.push({
          name: drug.names[0].replace(/\b\w/g, c => c.toUpperCase()),
          dosage: extractDosage(matchedLine),
          timing: extractTiming(matchedLine),
          duration: extractDuration(rawText),
          purpose: drug.purpose,
          drugClass: drug.drugClass,
          warnings: drug.warnings,
          instructions: drug.instructions,
        });

        // Collect critical warnings for global display
        drug.warnings.forEach(w => {
          if (!globalWarnings.includes(w)) globalWarnings.push(w);
        });

        break; // found match for this drug, move on
      }
    }
  }

  // Build summary
  const classes = [...new Set(found.map(f => f.drugClass.split('–')[0].trim()))];
  const summary = found.length > 0
    ? `Found ${found.length} medication${found.length > 1 ? 's' : ''} in this prescription. ` +
    `This appears to be treating: ${classes.slice(0, 3).join(', ')}. ` +
    `Always follow your doctor's instructions exactly.`
    : 'Could not automatically identify medications from the image. Please ensure the image is clear, or type the prescription text manually.';

  return {
    medications: found,
    summary,
    warnings: globalWarnings.slice(0, 6),
    generalAdvice: 'Complete all antibiotic courses fully. Never share prescription medications. Store away from heat and moisture. Keep all medications out of reach of children.',
    allergyAlert,
  };
}
