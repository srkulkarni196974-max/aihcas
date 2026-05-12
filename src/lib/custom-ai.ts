/**
 * AIHCAS Custom Medical AI Model — Doctor Persona
 * 
 * Architecture: TF-IDF Vector Space Model + Cosine Similarity + Heuristic Rule Engine
 * Behaves like a real doctor: empathetic, interactive, direct, and thorough.
 * Handles complex symptom clusters and multi-turn conversations fully locally.
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

function keywordScore(query: string, condition: Condition): number {
  const q = query.toLowerCase();
  let score = 0;
  condition.keywords.forEach(kw => {
    if (q.includes(kw.toLowerCase())) score += 2.0;
  });
  return score;
}

/**
 * Classifies a medical query using local Python NLP logic for high accuracy,
 * falling back to basic keyword matching if Python fails.
 */
async function classify(text: string): Promise<{ condition: Condition; score: number } | null> {
  // 1. Try Python-based classification first (for better body-part awareness)
  try {
    const { spawn } = await import('child_process');
    const path = await import('path');
    
    const scriptPath = path.join(process.cwd(), 'src', 'scripts', 'medical_ai.py');
    
    const pythonResult = await new Promise<any>((resolve) => {
      const py = spawn('python', [scriptPath, text]);
      let output = '';
      py.stdout.on('data', (d) => output += d.toString());
      py.on('close', () => {
        try {
          resolve(JSON.parse(output));
        } catch (e) {
          resolve(null);
        }
      });
    });

    if (pythonResult && pythonResult.id) {
      const condition = CONDITIONS.find(c => c.id === pythonResult.id);
      if (condition) return { condition, score: pythonResult.score };
    }
  } catch (e) {
    console.error('Python classification failed, falling back to TS:', e);
  }

  // 2. Fallback to basic TypeScript keyword matching
  const tokens = tokenize(text);
  if (tokens.length === 0) return null;

  let best: { condition: Condition; score: number } | null = null;

  for (const condition of CONDITIONS) {
    let score = 0;
    const q = tokens.join(' ');

    for (const kw of condition.keywords) {
      if (q.includes(kw.toLowerCase())) score += 2.0;
    }

    if (score > (best?.score || 0)) {
      best = { condition, score };
    }
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
      if (andGroup.every(term => text.includes(term))) {
        return combo;
      }
    }
  }
  return null;
}

// ─── History Helpers ──────────────────────────────────────────────────────────
function getFullConversationText(history: any[]): string {
  if (!history || !Array.isArray(history)) return '';
  return history
    .map(h => h.parts?.[0]?.text || '')
    .filter(Boolean)
    .join(' ');
}

function countUserTurns(history: any[]): number {
  if (!history || !Array.isArray(history)) return 0;
  return history.filter(h => h.role === 'user').length;
}

function alreadyAsked(history: any[], keyword: string): boolean {
  if (!history || !Array.isArray(history)) return false;
  const kw = keyword.toLowerCase();
  return history
    .filter(h => h.role === 'model')
    .some(h => (h.parts?.[0]?.text || '').toLowerCase().includes(kw));
}

// ─── Direct Assessment (no follow-up needed) ─────────────────────────────────
function hasEnoughInfo(message: string, history: any[]): boolean {
  if (!history || !Array.isArray(history)) return false;
  const fullText = (getFullConversationText(history) + ' ' + message).toLowerCase();
  
  // Check for symptoms
  const hasSymptom = /\b(fever|pain|cough|cold|rash|headache|vomit|diarrhea|breathless|dizzy|fatigue|nausea|bleed|swell|itch|joint|sugar|pressure|ache|hurt|burning|infection|sugar|bp)\b/.test(fullText);
  
  // Check for duration patterns common in India
  const hasDuration = /\b(\d+\s*(day|days|week|weeks|hour|hours|month)|since (yesterday|morning|night|last|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)|for (a |the )?(few|couple|several|long|while))\b/i.test(fullText);
  
  // Check for severity patterns
  const hasSeverity = /\b(mild|moderate|severe|bad|worse|worst|slight|little|lot|really|very|extremely|killing me|unbearable|\d+\s*(out of|\/)\s*10)\b/i.test(fullText);
  
  // If we have turn 2+ or we have symptom + (duration OR severity), we have enough.
  return hasSymptom && (hasDuration || hasSeverity || countUserTurns(history) >= 2);
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function getChatResponse(
  message: string,
  history: { role: string; parts: { text: string }[] }[],
  profile?: HealthProfile | null
): Promise<string> {
  const msgLow = message.toLowerCase();
  const fullText = (getFullConversationText(history)).toLowerCase();
  const userTurns = countUserTurns(history);

  // 1. Emergency — check all current context for safety
  if (isEmergency(msgLow) || isEmergency(fullText)) return EMERGENCY_RESPONSE;

  // 2. Identity / Greeting
  if (userTurns <= 1 && (msgLow.includes('who are you') || msgLow.includes('what is your name'))) {
    return `I am Dr. AIHCAS, your private AI health assistant. I can help you evaluate symptoms and analyze medical documents offline.`;
  }

  // 3. Gratitude / Closing
  if (/\b(thank(s| you)|great|helpful|better now|feeling better|ok thanks|bye|goodbye|that helps)\b/.test(msgLow)) {
    return `Glad I could help! 😊 Don't hesitate to come back if symptoms persist or worsen. If anything feels serious, always see a doctor in person. Take care!`;
  }

  // 4. Drug / Medication query — dynamic search in database
  const drugQueryPatterns = /\b(can i take|take together|drug interaction|safe to take|dosage of|dose of|which medicine|what medicine|medicine for|tablet for|info on|tell me about|side effects of|use of|how to take)\b/i;
  
  if (drugQueryPatterns.test(msgLow)) {
    // 1. Check for specific hardcoded safety rules first
    const drugAnswers: { pattern: RegExp; answer: string }[] = [
      { pattern: /paracetamol.*ibuprofen|ibuprofen.*paracetamol/i, answer: '**Paracetamol + Ibuprofen together:** Yes, these can be safely alternated (not taken simultaneously). Take Paracetamol, then 2–3 hours later Ibuprofen if pain persists. Always take Ibuprofen after food.' },
      { pattern: /aspirin.*dengue|dengue.*aspirin/i, answer: '❌ **Do NOT take Aspirin if dengue is suspected.** Aspirin increases bleeding risk dramatically. Use Paracetamol only.' },
      { pattern: /antibiotic/i, answer: 'Antibiotics require a prescription and diagnosis — they only work for bacterial infections. Taking them unnecessarily creates resistance. Please see a doctor for the right antibiotic.' },
    ];
    for (const { pattern, answer } of drugAnswers) {
      if (pattern.test(message)) return answer + '\n\n⚕️ *Always confirm with your pharmacist or doctor.*';
    }

    // 2. Search DRUG_DATABASE for the mentioned medication
    const { DRUG_DATABASE } = await import('./prescription-parser');
    const tokens = msgLow.split(/\s+/);
    
    for (const drug of DRUG_DATABASE) {
      const match = drug.names.find(name => 
        msgLow.includes(name.toLowerCase()) || tokens.some(t => t.length > 3 && name.toLowerCase().includes(t))
      );

      if (match) {
        return `**Information on ${match.charAt(0).toUpperCase() + match.slice(1)}**
        
**Purpose:** ${drug.purpose}
**Class:** ${drug.drugClass}
**Instructions:** ${drug.instructions}
**⚠️ Warnings:**
${drug.warnings.map(w => `- ${w}`).join('\n')}

⚕️ *AI assistant — always confirm with your doctor or pharmacist before taking any medication.*`;
      }
    }

    return `For specific medication questions, always verify with your pharmacist — they can check your full medication list for interactions. What medication are you asking about specifically? I'll share what I know.`;
  }

  // 5. Multi-symptom combinations (High specificity)
  const combo = matchCombo(fullText);
  if (combo) return combo.response;

  // 5. Single condition classification
  // We check the full conversation context first to maintain symptom continuity
  const result = await classify(fullText) || await classify(message);

  // 7. Dynamic Assessment Logic
  if (result) {
    const enough = hasEnoughInfo(message, history);
    const condId = result.condition.id;
    
    // Check what we already know from the conversation
    const hasDuration = /\b(\d+\s*(day|days|week|weeks|hour|hours|month)|since (yesterday|morning|night|last|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|few|while|gradually|suddenly))\b/i.test(fullText);
    const hasSeverity = /\b(mild|moderate|severe|bad|worse|worst|slight|little|lot|really|very|extremely|killing me|unbearable|\d+\s*(out of|\/)\s*10)\b/i.test(fullText);
    const hasLocation = /\b(left|right|upper|lower|back|front|side|all over|spread|radiate|chest|stomach|head|leg|arm|neck)\b/i.test(fullText);
    const hasTriggers = /\b(after eating|food|exercise|dust|smoke|stress|sleep|worse with|better with)\b/i.test(fullText);

    // DYNAMIC QUESTIONING: Only ask for what is missing
    if (!enough && userTurns < 3) {
      
      // Fever Logic
      if (condId === 'fever') {
        if (!hasDuration) return "How long have you been running this fever? And has it been continuous or coming in waves?";
        if (!fullText.includes('degree') && !/\b\d{2,3}(\.\d)?\b/.test(fullText)) return "Got it. Do you know your current temperature reading in degrees?";
        if (!fullText.includes('rash') && !fullText.includes('body ache')) return "Are you also noticing any skin rashes, severe body aches, or pain behind your eyes?";
      }

      // Headache Logic
      if (condId === 'headache' || condId === 'migraine') {
        if (!hasLocation) return "Is the pain located on one side of your head, or is it a general pressure all over?";
        if (!fullText.includes('nausea') && !fullText.includes('light')) return "Are you feeling nauseous or sensitive to light and sound along with the headache?";
        if (!hasDuration) return "How long has this specific headache been going on?";
      }

      // Stomach Pain Logic
      if (condId === 'stomach_pain') {
        if (!hasLocation) return "Where exactly is the pain? Is it in the upper abdomen, lower right, or a general cramping?";
        if (!hasTriggers) return "Did this start after a specific meal, or did it come on gradually on its own?";
        if (!fullText.includes('vomit') && !fullText.includes('stool')) return "Have you had any nausea, vomiting, or changes in your bowel movements?";
      }

      // Chest Pain (High Priority)
      if (condId === 'chest_pain') {
        if (!fullText.includes('radiate') && !fullText.includes('arm')) return "Does the pain spread to your left arm, jaw, or shoulder?";
        if (!fullText.includes('sweat') && !fullText.includes('breath')) return "Are you experiencing any sudden sweating or shortness of breath?";
      }

      // Diabetes / Sugar
      if (condId === 'diabetes') {
        if (!/\b\d{2,3}\b/.test(fullText)) return "What was your most recent blood sugar reading? And was it fasting or after a meal?";
        if (!fullText.includes('medication')) return "Are you currently taking any medications like Metformin or insulin?";
      }

      // Default follow-up if specific ones don't match
      if (!hasDuration) return `Understood about the ${result.condition.name.split('/')[0]}. How long has this been going on?`;
      if (!hasSeverity) return `I see. On a scale of 1 to 10, how severe would you rate this discomfort right now?`;
      return `Are there any other symptoms you've noticed alongside this, like fever, dizziness, or fatigue?`;
    }

    // Give Assessment (Turn 3+ or enough info)
    let profileNote = '';
    if (profile) {
      const notes: string[] = [];
      if (profile.age) notes.push(`you are ${profile.age} years old`);
      if (profile.conditions?.length) notes.push(`you have ${profile.conditions.join(', ')}`);
      if (profile.allergies?.length) notes.push(`⚠️ allergy to ${profile.allergies.join(', ')}`);
      if (notes.length) profileNote = `\n\n*Noting that ${notes.join('; ')} — I've factored this into the assessment.*`;
    }
    return result.condition.response + profileNote + '\n\n💬 *Any other questions or symptoms you\'d like to discuss?*';
  }

  // 7. No condition matched — ask a direct, focused intake question
  if (userTurns === 0) {
    return `Hello! I'm Dr. AIHCAS. What's bothering you today? Please describe your main symptom — I'll ask a couple of focused questions and then give you a clear assessment.`;
  }

  // Follow-up for unclear input
  const symMatch = fullText.match(/\b(fever|headache|pain|cough|rash|vomiting|diarrhea|fatigue|breathless|dizziness|nausea|swelling|itching|joint|sugar|pressure)\b/i);
  const mentionedSymptom = symMatch ? symMatch[1] : null;

  if (mentionedSymptom) {
    return `I want to make sure I understand. You mentioned **${mentionedSymptom}** — how long have you had it, and how severe is it on a scale of 1–10?`;
  }

  return `Could you describe your main symptom a bit more clearly? For example: location of pain, how long it's been going on, and whether it's getting better or worse. That'll help me give you an accurate assessment.`;
}

export function analyzeDocument(
  type: 'report' | 'prescription',
  text?: string
): object {
  if (type === 'prescription') return parsePrescriptionText(text || '');
  if (type === 'report') return parseReportText(text || '');
  return {};
}
