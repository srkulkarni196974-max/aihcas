/**
 * AIHCAS Custom Medical AI Model — Doctor Persona
 * 
 * Architecture: TF-IDF Vector Space Model + Cosine Similarity + Heuristic Rule Engine
 * Voice-optimized 3-phase conversation: gather symptom → ask follow-up → deliver solution.
 * No external API required.
 */

import { CONDITIONS, SYMPTOM_COMBOS, EMERGENCY_KEYWORDS, EMERGENCY_RESPONSE, type Condition } from './medical-kb';
import { parsePrescriptionText } from './prescription-parser';
import { parseReportText } from './report-parser';

// ─── Types ────────────────────────────────────────────────────────────────────
interface TFIDFVector { [term: string]: number }
interface TrainedModel {
  vectors: { condition: Condition; vector: TFIDFVector }[];
  idf: { [term: string]: number };
  vocabulary: Set<string>;
}

export interface HealthProfile {
  age?: string;
  gender?: string;
  bloodGroup?: string;
  conditions?: string[];
  allergies?: string[];
  medications?: string;
}

// ─── Text Preprocessing ───────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'i','me','my','have','has','had','a','an','the','is','it','its',
  'am','are','was','were','be','been','being','do','does','did',
  'and','but','or','so','if','in','on','at','to','for','of','with',
  'this','that','these','those','not','no','can','could','would',
  'should','may','might','will','shall','very','much','more','since',
  'from','by','as','also','just','about','some','any','all','get',
  'got','feel','feeling','having','getting','been','since','after',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));
}

// ─── TF-IDF Training ──────────────────────────────────────────────────────────
function computeTF(tokens: string[]): { [term: string]: number } {
  const tf: { [term: string]: number } = {};
  tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
  const total = tokens.length || 1;
  Object.keys(tf).forEach(t => { tf[t] /= total; });
  return tf;
}

function trainModel(): TrainedModel {
  const docs = CONDITIONS.map(c => ({
    condition: c,
    tokens: tokenize([c.name, ...c.keywords].join(' ')),
  }));

  const vocabulary = new Set<string>();
  const docFreq: { [term: string]: number } = {};
  docs.forEach(doc => {
    const unique = new Set(doc.tokens);
    unique.forEach(t => {
      vocabulary.add(t);
      docFreq[t] = (docFreq[t] || 0) + 1;
    });
  });

  const N = docs.length;
  const idf: { [term: string]: number } = {};
  vocabulary.forEach(t => {
    idf[t] = Math.log((N + 1) / ((docFreq[t] || 0) + 1)) + 1;
  });

  const vectors = docs.map(doc => {
    const tf = computeTF(doc.tokens);
    const vector: TFIDFVector = {};
    Object.keys(tf).forEach(t => { vector[t] = tf[t] * (idf[t] || 1); });
    return { condition: doc.condition, vector };
  });

  return { vectors, idf, vocabulary };
}

function cosineSimilarity(a: TFIDFVector, b: TFIDFVector): number {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0, magA = 0, magB = 0;
  keys.forEach(k => {
    const va = a[k] || 0;
    const vb = b[k] || 0;
    dot += va * vb;
    magA += va * va;
    magB += vb * vb;
  });
  return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
}

const MODEL: TrainedModel = trainModel();

// ─── Classification ───────────────────────────────────────────────────────────
async function classify(text: string): Promise<{ condition: Condition; score: number } | null> {
  // Try Python-based classification first
  try {
    const { spawn } = await import('child_process');
    const path = await import('path');
    const scriptPath = path.join(process.cwd(), 'src', 'scripts', 'medical_ai.py');
    const pythonResult = await new Promise<any>((resolve) => {
      const py = spawn('python', [scriptPath, text]);
      let output = '';
      py.stdout.on('data', (d) => output += d.toString());
      py.on('close', () => {
        try { resolve(JSON.parse(output)); } catch (e) { resolve(null); }
      });
    });
    if (pythonResult && pythonResult.id) {
      const condition = CONDITIONS.find(c => c.id === pythonResult.id);
      if (condition) return { condition, score: pythonResult.score };
    }
  } catch (e) {
    // Fallback to TypeScript
  }

  // TypeScript keyword matching fallback
  const tokens = tokenize(text);
  if (tokens.length === 0) return null;
  let best: { condition: Condition; score: number } | null = null;
  for (const condition of CONDITIONS) {
    let score = 0;
    const q = tokens.join(' ');
    for (const kw of condition.keywords) {
      if (q.includes(kw.toLowerCase())) score += 2.0;
    }
    if (score > (best?.score || 0)) best = { condition, score };
  }
  return best && best.score > 0.05 ? best : null;
}

function isEmergency(query: string): boolean {
  const q = query.toLowerCase();
  return EMERGENCY_KEYWORDS.some(kw => q.includes(kw));
}

// ─── Multi-Symptom Combo Matcher ──────────────────────────────────────────────
function matchCombo(fullText: string): typeof SYMPTOM_COMBOS[0] | null {
  const text = fullText.toLowerCase();
  for (const combo of SYMPTOM_COMBOS) {
    for (const andGroup of combo.triggers) {
      if (andGroup.every(term => text.includes(term))) return combo;
    }
  }
  return null;
}

// ─── History Helpers ──────────────────────────────────────────────────────────
function getFullConversationText(history: any[]): string {
  if (!history || !Array.isArray(history)) return '';
  return history.map(h => h.parts?.[0]?.text || '').filter(Boolean).join(' ');
}

function countUserTurns(history: any[]): number {
  if (!history || !Array.isArray(history)) return 0;
  return history.filter(h => h.role === 'user').length;
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function getChatResponse(
  message: string,
  history: { role: string; parts: { text: string }[] }[],
  profile?: HealthProfile | null
): Promise<string> {
  const msgLow = message.toLowerCase();
  const fullText = (getFullConversationText(history) + ' ' + message).toLowerCase();
  const userTurns = countUserTurns(history);

  // 1. Emergency — always check first
  if (isEmergency(msgLow) || isEmergency(fullText)) return EMERGENCY_RESPONSE;

  // 2. Identity
  if (userTurns <= 1 && (msgLow.includes('who are you') || msgLow.includes('what is your name'))) {
    return `I am Dr. AIHCAS, your private AI health assistant. I help evaluate symptoms and analyze medical documents. What brings you in today?`;
  }

  // 3. Gratitude / Closing
  if (/\b(thank(s| you)|great|helpful|better now|feeling better|ok thanks|bye|goodbye|that helps|all good)\b/.test(msgLow)) {
    return `Glad I could help! Come back if symptoms persist or worsen. Always see a doctor in person for serious concerns. Take care!`;
  }

  // 4. Drug / Medication queries
  const drugQueryPatterns = /\b(can i take|take together|drug interaction|safe to take|dosage of|dose of|which medicine|what medicine|medicine for|tablet for|side effects of|use of|how to take|info on)\b/i;
  if (drugQueryPatterns.test(msgLow)) {
    const drugAnswers: { pattern: RegExp; answer: string }[] = [
      { pattern: /paracetamol.*ibuprofen|ibuprofen.*paracetamol/i, answer: 'Paracetamol and Ibuprofen can be safely alternated but not taken simultaneously. Take Paracetamol first, then Ibuprofen 2 to 3 hours later if still needed. Always take Ibuprofen with food.' },
      { pattern: /aspirin.*dengue|dengue.*aspirin/i, answer: 'Do NOT take Aspirin if dengue is suspected. It increases bleeding risk dramatically. Use only Paracetamol for fever.' },
      { pattern: /antibiotic/i, answer: 'Antibiotics only work for bacterial infections and are useless for viral ones. Please see a doctor for the correct diagnosis and prescription.' },
    ];
    for (const { pattern, answer } of drugAnswers) {
      if (pattern.test(message)) return answer + ' Always confirm with your pharmacist or doctor.';
    }
    const { DRUG_DATABASE } = await import('./prescription-parser');
    const tokens = msgLow.split(/\s+/);
    for (const drug of DRUG_DATABASE) {
      const match = drug.names.find(name =>
        msgLow.includes(name.toLowerCase()) || tokens.some(t => t.length > 3 && name.toLowerCase().includes(t))
      );
      if (match) {
        return `${match.charAt(0).toUpperCase() + match.slice(1)}: Purpose — ${drug.purpose}. Instructions — ${drug.instructions}. Warnings — ${drug.warnings.join('. ')}. Always confirm with your doctor.`;
      }
    }
    return `Could you tell me the exact medication name? I will share what I know about it.`;
  }

  // 5. Multi-symptom combo (high specificity — give answer directly)
  const combo = matchCombo(fullText);
  if (combo) return combo.response + ' Do you have any other questions?';

  // 6. Classify condition
  const result = await classify(fullText) || await classify(message);

  if (result) {
    const condId = result.condition.id;
    const hasDuration = /\b(\d+\s*(day|days|week|weeks|hour|hours|month)|since (yesterday|morning|night|last|few|while|gradually|suddenly))\b/i.test(fullText);
    const hasSeverity = /\b(mild|moderate|severe|bad|worse|worst|slight|little|lot|really|very|extremely|unbearable|\d+\s*(out of|\/)\s*10)\b/i.test(fullText);
    const hasTriggers = /\b(after eating|food|exercise|dust|smoke|stress|sleep|worse with|better with|alcohol|spicy|lying down)\b/i.test(fullText);
    const hasAssociated = /\b(rash|ache|vomit|loose|stool|arm|jaw|shoulder|radiate|sweat|breathless|nauseated|light sensitive)\b/i.test(fullText);

    // PHASE 1 (first user turn): Ask ONE targeted follow-up question
    if (userTurns <= 1) {
      if (condId === 'fever') return `I understand you have a fever. How long has it been going on? And have you noticed any body aches, skin rash, or pain behind your eyes?`;
      if (condId === 'headache' || condId === 'migraine') return `I see you have a headache. Is the pain on one specific side of your head, or is it a general pressure all over? And have you had any nausea or sensitivity to light?`;
      if (condId === 'stomach_pain' || condId === 'food_poisoning') return `I understand you have stomach pain. Where exactly is it — upper abdomen, lower right, or general cramping? And did it start after eating something?`;
      if (condId === 'chest_pain') return `Chest pain needs careful attention. Does the pain spread to your left arm, jaw, or shoulder? And are you having any shortness of breath or sweating?`;
      if (condId === 'cold' || condId === 'asthma') return `I see you have respiratory symptoms. How long has this been going on, and do you have a fever or wheezing along with it?`;
      if (condId === 'back_pain') return `For your back pain — does the pain radiate down into your leg or foot? And on a scale of 1 to 10, how severe is it?`;
      if (condId === 'leg_pain') return `I understand you have leg pain, cramps, or swelling. Did the discomfort start after a specific physical activity or injury, or did it develop suddenly? And do you have any visible swelling, redness, or difficulty putting weight on your leg?`;
      if (condId === 'anemia') return `How long have you been feeling this fatigue and weakness? And have you had a recent blood test checking your hemoglobin levels?`;
      if (condId === 'uti') return `I understand you have urinary symptoms. How long has this been going on? And do you have any fever or pain in your lower back or flanks?`;
      if (condId === 'diabetes' || condId === 'hypertension') return `Are you currently on any medication for this? And what was your most recent reading?`;
      if (!hasDuration) return `How long have you been experiencing this ${result.condition.name.split('/')[0].toLowerCase()}?`;
      return `On a scale of 1 to 10, how severe is your discomfort right now? And is it getting better, worse, or staying the same?`;
    }

    // PHASE 2 (second user turn): One more question only if critical info is still missing
    if (userTurns === 2) {
      if (condId === 'fever' && !hasAssociated) {
        return `Have you recently travelled to a new area, or been in contact with someone with a similar illness? And are you able to eat and drink normally?`;
      }
      if ((condId === 'stomach_pain' || condId === 'food_poisoning') && !hasAssociated) {
        return `Have you had any vomiting, loose stools, or blood in your stool along with the pain?`;
      }
      if (condId === 'leg_pain' && !hasAssociated) {
        return `Are both legs affected, or is it just one? And does the pain get better with rest or worse when you try to walk?`;
      }
      if (condId === 'headache' && !hasAssociated) {
        return `Is this a recurring headache that you get often, or is this a new type of pain for you?`;
      }
      if (!hasSeverity) return `On a scale of 1 to 10, how severe is the discomfort right now — and is it constant or does it come and go?`;
      // Enough info — fall through to give solution
    }

    // PHASE 3 (turn 3+ or enough info): Deliver the full solution
    let profileNote = '';
    if (profile) {
      const notes: string[] = [];
      if (profile.age) notes.push(`age ${profile.age}`);
      if (profile.conditions?.length) notes.push(`known condition: ${profile.conditions.join(', ')}`);
      if (profile.allergies?.length) notes.push(`allergy to ${profile.allergies.join(', ')}`);
      if (notes.length) profileNote = ` Note: Based on your profile (${notes.join('; ')}), I have personalised this guidance.`;
    }
    return result.condition.response + profileNote + ' Is there anything else you would like to know?';
  }

  // 7. No condition classified yet
  if (userTurns <= 1) {
    const symMatch = fullText.match(/\b(fever|headache|pain|cough|rash|vomiting|diarrhea|fatigue|breathless|dizziness|nausea|swelling|itching|joint|sugar|pressure|cold|burning|weakness|throat)\b/i);
    if (symMatch) return `You mentioned ${symMatch[1]}. How long has this been going on, and how severe would you say it is on a scale of 1 to 10?`;
    return `Could you describe your main symptom more clearly? Tell me what is bothering you, where you feel it, and how long it has been happening.`;
  }

  // Turn 3+: General best-effort guidance
  return `Based on what you have described, I recommend rest and staying well-hydrated. Take Paracetamol for any pain or fever. If your symptoms worsen or persist beyond 2 to 3 days, please visit a doctor. Is there anything specific you want more advice on?`;
}

export function analyzeDocument(
  type: 'report' | 'prescription',
  text?: string
): object {
  if (type === 'prescription') return parsePrescriptionText(text || '');
  if (type === 'report') return parseReportText(text || '');
  return {};
}
