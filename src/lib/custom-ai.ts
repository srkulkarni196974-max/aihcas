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
  const q = text.toLowerCase();
  let best: { condition: Condition; score: number } | null = null;
  for (const condition of CONDITIONS) {
    let score = 0;
    for (const kw of condition.keywords) {
      const kwLow = kw.toLowerCase();
      const escapedKw = kwLow.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedKw}\\b`, 'i');
      if (regex.test(q)) {
        score += kwLow.length * 3;
      }
    }
    if (score > (best?.score || 0)) best = { condition, score };
  }
  return best && best.score > 5 ? best : null;
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

function hasFeverMention(text: string): boolean {
  return /\b(fever(ish)?|temp(erature)?|chills|body\s*hot|warm\s*body|shivering|cold\s*sweat|running\s*a\s*temp|high\s*temp)\b/i.test(text);
}

function extractTemperature(text: string): { value: number; unit: 'F' | 'C' } | null {
  const matchWithUnit = text.match(/\b(\d+(?:\.\d+)?)\s*(?:°\s*)?(f|c|fahrenheit|celsius|degrees?\s*f|degrees?\s*c|degs?\s*f|degs?\s*c|degrees?|degs?)\b/i);
  if (matchWithUnit) {
    const val = parseFloat(matchWithUnit[1]);
    const unitStr = matchWithUnit[2].toLowerCase();
    let unit: 'F' | 'C' = 'F';
    if (unitStr.includes('c')) {
      unit = 'C';
    } else if (unitStr.includes('f')) {
      unit = 'F';
    } else {
      unit = val < 45 ? 'C' : 'F';
    }
    return { value: val, unit };
  }
  
  const numbers = text.match(/\b(\d+(?:\.\d+)?)\b/g);
  if (numbers) {
    for (const numStr of numbers) {
      const val = parseFloat(numStr);
      if (val >= 95 && val <= 108) {
        return { value: val, unit: 'F' };
      }
      if (val >= 35 && val <= 43) {
        return { value: val, unit: 'C' };
      }
    }
  }
  return null;
}

function formatFeverResponse(response: string, tempAdvice: string): string {
  if (!tempAdvice) return response;
  const prefix = "I understand you have a fever. ";
  if (response.startsWith(prefix)) {
    return tempAdvice + "\n\n" + response.slice(prefix.length);
  }
  return tempAdvice + "\n\n" + response;
}
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

  // 4. Fever/Temperature Interception
  const isFeverRelated = hasFeverMention(message) || hasFeverMention(fullText);
  let tempAdvice = '';
  if (isFeverRelated) {
    const tempInfo = extractTemperature(message) || extractTemperature(getFullConversationText(history));
    if (!tempInfo) {
      const lastModelMsg = [...history].reverse().find(h => h.role === 'model')?.parts?.[0]?.text;
      const alreadyAsked = lastModelMsg && (lastModelMsg.includes('body temperature?') || lastModelMsg.includes('current body temperature?'));
      if (!alreadyAsked) {
        return `I understand you are experiencing a fever. To give you the best guidance, could you please tell me your current body temperature?`;
      }
    } else {
      const tempVal = tempInfo.value;
      const tempUnit = tempInfo.unit;
      if (tempUnit === 'C') {
        if (tempVal < 37.3) {
          tempAdvice = `Your temperature (${tempVal}°C) is in the normal range. Please rest, stay hydrated, and monitor your symptoms.`;
        } else if (tempVal <= 38.0) {
          tempAdvice = `Your temperature (${tempVal}°C) indicates a low-grade fever. This is your body's natural defense fighting off an infection. Rest, stay well-hydrated, and take Paracetamol if you feel uncomfortable.`;
        } else if (tempVal <= 39.0) {
          tempAdvice = `Your temperature (${tempVal}°C) indicates a moderate fever. Rest, stay hydrated with fluids (water, coconut water, or ORS), and take Paracetamol 650mg every 6 hours if needed.`;
        } else {
          tempAdvice = `Your temperature (${tempVal}°C) indicates a high fever. This warrants prompt medical consultation. Take Paracetamol 650mg, use tepid water sponge baths to cool down, stay hydrated, and visit a doctor as soon as possible.`;
        }
      } else {
        if (tempVal < 99.1) {
          tempAdvice = `Your temperature (${tempVal}°F) is in the normal range. Please rest, stay hydrated, and monitor your symptoms.`;
        } else if (tempVal <= 100.4) {
          tempAdvice = `Your temperature (${tempVal}°F) indicates a low-grade fever. This is your body's natural defense fighting off an infection. Rest, stay well-hydrated, and take Paracetamol if you feel uncomfortable.`;
        } else if (tempVal <= 102.2) {
          tempAdvice = `Your temperature (${tempVal}°F) indicates a moderate fever. Rest, stay hydrated with fluids (water, coconut water, or ORS), and take Paracetamol 650mg every 6 hours if needed.`;
        } else {
          tempAdvice = `Your temperature (${tempVal}°F) indicates a high fever. This warrants prompt medical consultation. Take Paracetamol 650mg, use tepid water sponge baths to cool down, stay hydrated, and visit a doctor as soon as possible.`;
        }
      }
    }
  }

  const getBaseResponse = async (): Promise<string> => {
    
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
      if (condId === 'arm_pain') return `I understand you have arm pain, numbness, or wrist discomfort. Did the pain start after a sudden movement, heavy lifting, or is it a gradual stiffness? And do you feel any tingling or weakness in your fingers?`;
      if (condId === 'anemia') return `How long have you been feeling this fatigue and weakness? And have you had a recent blood test checking your hemoglobin levels?`;
      if (condId === 'uti') return `I understand you have urinary symptoms. How long has this been going on? And do you have any fever or pain in your lower back or flanks?`;
      if (condId === 'diabetes' || condId === 'hypertension') return `Are you currently on any medication for this? And what was your most recent reading?`;
      if (condId === 'endometriosis') return `I understand you are experiencing symptoms related to endometriosis. Are you experiencing severe cramping during your periods, chronic pelvic pain, or pain during intercourse?`;
      if (condId === 'ovarian_cyst') return `I understand you have symptoms related to a possible ovarian cyst. Are you feeling pelvic pressure or lower abdomen pain on one side? Also, have you had any sudden, severe pain, nausea, or vomiting?`;
      if (condId === 'fibroids') return `I understand you have symptoms related to uterine fibroids. Have you noticed heavy or prolonged menstrual bleeding, pelvic pressure, or frequent urination?`;
      if (condId === 'yeast_infection') return `I see you have symptoms of a yeast infection. Are you having intense vaginal itching, a thick white discharge, or burning during urination?`;
      if (condId === 'prostate_enlargement') return `I see you are having urinary symptoms related to prostate enlargement (BPH). Are you having difficulty starting urination, a weak stream, or a frequent need to urinate at night?`;
      if (condId === 'erectile_dysfunction') return `I understand you are experiencing symptoms of erectile dysfunction. How long has this been happening, and do you have any underlying conditions like diabetes, stress, or high blood pressure?`;
      if (condId === 'breast_cancer') return `I understand you are concerned about breast symptoms. Have you felt a lump or thickening in the breast or underarm, or noticed any skin changes or nipple discharge?`;
      if (condId === 'lung_cancer') return `I understand you are concerned about persistent respiratory symptoms. Have you experienced a chronic cough, coughing up blood, chest pain, or unexplained weight loss?`;
      if (condId === 'colon_cancer') return `I understand you are experiencing bowel symptoms. Have you noticed blood in your stool, a persistent change in bowel habits (like constipation or diarrhea), or unexplained weight loss?`;
      if (condId === 'brain_tumor') return `I understand you have neurological symptoms. Have you had persistent headaches (especially in the morning), vision changes, seizures, or balance problems?`;
      if (condId === 'multiple_sclerosis') return `I see you have neurological symptoms. Have you experienced numbness or weakness in your limbs, vision loss, or problems with coordination and balance?`;
      if (condId === 'bells_palsy') return `I understand you have facial drooping or paralysis. Did this develop suddenly over a few hours? And are you experiencing any arm weakness or slurred speech?`;
      if (condId === 'meningitis') return `This sounds like it could be meningitis. Do you have a stiff neck, a high fever, a severe headache, or sensitivity to light?`;
      if (condId === 'bipolar_disorder') return `I understand you are concerned about mood swings. Have you noticed cycles of extreme energy and happiness (mania) alternating with periods of deep sadness or depression?`;
      if (condId === 'ocd') return `I see you have symptoms of OCD. Are you experiencing persistent, distressing thoughts (obsessions) or feeling compelled to repeat specific routines (compulsions)?`;
      if (condId === 'ptsd') return `I see you have trauma-related symptoms. Are you experiencing flashbacks, nightmares, or sudden panic reactions when reminded of the traumatic event?`;
      if (condId === 'schizophrenia') return `I understand you are concerned about these symptoms. Have you experienced hallucinations (like hearing voices), delusions, paranoia, or difficulty organizing your thoughts?`;
      if (condId === 'lupus') return `I understand you are experiencing autoimmune symptoms. Do you have a butterfly-shaped rash across your cheeks, joint pain, extreme fatigue, or sun sensitivity?`;
      if (condId === 'crohns_disease') return `I see you have chronic digestive symptoms. Are you experiencing chronic diarrhea, abdominal cramps, or unexplained weight loss?`;
      if (condId === 'celiac_disease') return `I understand you are experiencing digestive issues. Do you notice bloating, gas, or diarrhea specifically after consuming wheat or gluten?`;
      if (condId === 'deep_vein_thrombosis') return `This could indicate deep vein thrombosis (DVT). Is the swelling, redness, or pain confined to one leg, and does it feel like a severe calf cramp?`;
      if (condId === 'pulmonary_embolism') return `This could indicate a pulmonary embolism. Are you experiencing sudden breathlessness, sharp chest pain when breathing in, or coughing up blood?`;
      if (condId === 'anaphylaxis') return `This sounds like a severe allergic reaction (anaphylaxis). Are you experiencing difficulty breathing, swelling of the throat or lips, or widespread hives?`;
      if (condId === 'sepsis') return `This could be sepsis, a critical medical emergency. Do you have a high fever with confusion, a rapid heartbeat, or extreme physical weakness?`;
      if (condId === 'poisoning') return `This is a poisoning emergency. What substance was consumed, how much was ingested, and when did this occur?`;
      if (condId === 'drug_overdose') return `This is a drug overdose emergency. Is the person conscious, and are they having any difficulty breathing, seizures, or confusion?`;
      if (condId === 'hiv_aids') return `I understand you have concerns regarding HIV/AIDS. Have you experienced chronic fatigue, recurring fevers, weight loss, or frequent infections?`;
      if (condId === 'hepatitis') return `I see you are having liver-related symptoms. Have you noticed yellowing of your skin or eyes (jaundice), dark urine, or upper right abdominal pain?`;
      if (condId === 'influenza') return `I understand you have flu-like symptoms. Did the fever, chills, and body aches start suddenly, and are you experiencing extreme fatigue?`;
      if (condId === 'conjunctivitis') return `I see you have eye symptoms. Are one or both eyes red, itchy, gritty, or producing a sticky yellow-green discharge?`;
      if (condId === 'dry_eye') return `I understand you have dry eye symptoms. Are you experiencing a burning, stinging, or gritty feeling in your eyes, and does it worsen with screen use?`;
      if (condId === 'arrhythmia') return `I understand you are feeling heart palpitations. Does your heart feel like it is racing or fluttering, and do you feel dizzy or short of breath?`;
      if (condId === 'heart_failure') return `I understand you have heart concerns. Are you experiencing swollen feet or ankles, or shortness of breath when lying down flat?`;
      if (condId === 'vitamin_d_deficiency') return `I see you have symptoms of Vitamin D deficiency. Are you experiencing chronic fatigue, bone pain, lower back ache, or muscle weakness?`;
      if (condId === 'vitamin_b12_deficiency') return `I see you have symptoms of Vitamin B12 deficiency. Are you experiencing tingling or numbness in your hands or feet, memory issues, or chronic fatigue?`;
      if (condId === 'malnutrition') return `I understand you have nutritional concerns. Have you experienced unintentional weight loss, chronic weakness, or fatigue?`;
      if (condId === 'tmj_disorder') return `I see you are having jaw discomfort. Do you hear clicking or popping sounds in your jaw when chewing or opening your mouth, and is there any tenderness?`;
      if (condId === 'scabies') return `I understand you are experiencing intense itching. Does the itching become much worse at night, and have you noticed any tiny bumps or rash in the webs of your fingers or wrists?`;
      if (condId === 'shingles') return `I see you have symptoms of shingles. Are you experiencing a painful, burning rash or blisters localized on one side of your body or face?`;
      if (condId === 'appendicitis_acute') return `I understand you are experiencing stomach pain. Is the pain sharp and located in the lower right side of your abdomen, and do you have a fever or nausea?`;
      if (condId === 'intestinal_obstruction') return `This could indicate an intestinal blockage. Are you experiencing severe abdominal swelling, vomiting, or an inability to pass stool or gas?`;
      if (condId === 'ibs') return `I see you have symptoms of Irritable Bowel Syndrome (IBS). Are you experiencing alternating periods of diarrhea and constipation, bloating after meals, or stress-related stomach pain?`;
      if (condId === 'ulcerative_colitis') return `I understand you are experiencing colitis symptoms. Have you noticed bloody diarrhea, abdominal cramping, or a frequent, urgent need to have a bowel movement?`;
      if (condId === 'diverticulitis') return `I understand you have symptoms related to diverticulitis. Do you have persistent pain in your lower left abdomen, along with a fever or chills?`;
      if (condId === 'kidney_failure') return `These symptoms are concerning for kidney dysfunction. Have you noticed a significant reduction in urination, swelling in your body, or high creatinine levels?`;
      if (condId === 'nephrotic_syndrome') return `I understand you have symptoms of nephrotic syndrome. Have you noticed protein in your urine (causing it to look foamy), or swelling in your face or legs?`;
      if (condId === 'glomerulonephritis') return `I see you have symptoms of glomerulonephritis. Have you noticed blood in your urine, swelling, or high blood pressure?`;
      if (condId === 'migraine_with_aura') return `I understand you are experiencing a migraine with aura. Are you seeing flashing lights or zigzag patterns, or having visual spots before the headache starts?`;
      if (condId === 'cluster_headache') return `I see you have symptoms of a cluster headache. Is the severe, throbbing pain concentrated behind or around one eye, and is that eye watering or red?`;
      if (condId === 'trigeminal_neuralgia') return `I understand you are experiencing facial nerve pain. Does the pain feel like sudden, severe electric shocks in your face, and is it triggered by touching your face, washing, or chewing?`;
      if (condId === 'neuropathy') return `I see you have symptoms of peripheral neuropathy. Are you experiencing burning, tingling, or a "pins and needles" sensation in your feet or legs?`;
      if (condId === 'guillain_barre') return `This ascending weakness requires urgent assessment. Did the weakness or tingling start in your feet and legs, and is it spreading upward to your arms? Also, do you have any difficulty breathing?`;
      if (condId === 'myasthenia_gravis') return `I understand you are experiencing muscle weakness. Do you have drooping eyelids, double vision, or difficulty swallowing and chewing?`;
      if (condId === 'encephalitis') return `This could indicate brain inflammation. Are you experiencing a high fever accompanied by confusion, seizures, or extreme sleepiness?`;
      if (condId === 'autism_spectrum_disorder') return `I understand you have questions about Autism Spectrum Disorder. Are you noticing speech delays, poor eye contact, or repetitive behaviors in social settings?`;
      if (condId === 'eating_disorder') return `I understand you are concerned about eating behaviors. Are you experiencing a fear of weight gain, severe restriction of food, or episodes of bingeing and purging?`;
      if (condId === 'substance_abuse') return `I understand you have concerns related to substance use. Are you experiencing strong cravings, a high tolerance, or withdrawal symptoms when trying to stop?`;
      if (condId === 'suicidal_ideation') return `I see you are going through a very difficult time. Are you having active thoughts of suicide or self-harm? Please know that support is available.`;
      if (condId === 'addisons_disease') return `I understand you are experiencing symptoms of Addison's disease. Have you noticed severe fatigue, darkening of your skin (hyperpigmentation), or cravings for salt?`;
      if (condId === 'cushings_syndrome') return `I understand you are experiencing symptoms of Cushing's syndrome. Have you noticed a rounder face ("moon face"), a fatty hump between your shoulders ("buffalo hump"), or rapid weight gain?`;
      if (condId === 'hyperthyroidism') return `I understand you have symptoms of hyperthyroidism. Have you noticed unexplained weight loss, a rapid or irregular heartbeat, or heat intolerance?`;
      if (condId === 'hypothyroidism') return `I understand you have symptoms of hypothyroidism. Have you noticed chronic fatigue, unexplained weight gain, or cold intolerance?`;
      if (condId === 'pcos') return `I understand you are experiencing symptoms of PCOS. Have you noticed irregular or missed periods, excess facial or body hair growth, or acne?`;
      if (condId === 'ectopic_pregnancy') return `An ectopic pregnancy requires immediate medical attention. Are you experiencing severe pelvic pain or bleeding during early pregnancy?`;
      if (condId === 'placenta_previa') return `This is a pregnancy concern. Are you experiencing painless, bright red bleeding during your second half of pregnancy?`;
      if (condId === 'preeclampsia') return `Preeclampsia is a serious pregnancy concern. Are you experiencing high blood pressure, sudden swelling in your face or hands, or severe headaches?`;
      if (condId === 'mastitis') return `I understand you have breast discomfort. Is the breast red, swollen, or painful to the touch, and do you have a fever or flu-like symptoms?`;
      if (condId === 'orchitis') return `I understand you are experiencing testicle pain. Is the scrotum swollen, red, or tender, and do you have a fever or nausea?`;
      if (condId === 'testicular_torsion') return `Testicular torsion is a medical emergency. Did the testicle pain start suddenly and severely, and is the scrotum swollen or red?`;
      if (condId === 'copd') return `I understand you have respiratory symptoms. Do you have a chronic smoker's cough or progressive difficulty breathing, and how long has this been occurring?`;
      if (condId === 'pleural_effusion') return `I understand you are experiencing shortness of breath. Does the breathing difficulty worsen when you lie down flat, and do you have sharp chest pain?`;
      if (condId === 'pneumothorax') return `A collapsed lung requires urgent care. Did you experience sudden, sharp chest pain on one side and sudden shortness of breath?`;
      if (condId === 'sleep_paralysis') return `I understand you are experiencing sleep paralysis. Are you awake but unable to move or speak for several seconds or minutes when waking up or falling asleep?`;
      if (condId === 'restless_leg_syndrome') return `I see you have symptoms of restless legs. Do you experience an irresistible urge to move your legs, along with crawling sensations that worsen at night?`;
      if (condId === 'frozen_shoulder') return `I see you are experiencing shoulder stiffness. Is it difficult or painful to raise your arm or sleep on the affected side?`;
      if (condId === 'tennis_elbow') return `I see you have elbow pain. Is the pain located on the outer side of your elbow, and does it worsen when gripping objects or twisting your wrist?`;
      if (condId === 'acl_injury') return `I understand you have a knee injury. Did you hear or feel a "pop" in your knee, followed by rapid swelling and joint instability?`;
      if (condId === 'meniscus_tear') return `I see you have knee pain. Does the knee lock, catch, or hurt specifically when twisting or rotating your leg?`;
      if (condId === 'osteomyelitis') return `I understand you have bone pain. Is there severe pain, swelling, or redness over a specific bone, along with a fever or chills?`;
      if (condId === 'scurvy') return `I see you have symptoms of vitamin C deficiency. Are you experiencing bleeding gums, easy bruising, or slow wound healing?`;
      if (condId === 'rickets') return `I understand you have concerns about bone development. Are you noticing soft bones, bowed legs, or delayed teething in your child?`;
      if (condId === 'dehydration_severe') return `This is a severe dehydration concern. Are you experiencing sunken eyes, a very dry mouth, extreme thirst, or minimal to no urination?`;
      if (condId === 'heat_exhaustion') return `I understand you are experiencing heat exhaustion. Have you had heavy sweating, dizziness, headaches, or muscle cramps after being in the heat?`;
      if (condId === 'altitude_sickness') return `I see you have symptoms of altitude sickness. Have you developed a headache, dizziness, or nausea after traveling to a high-altitude area?`;
      if (condId === 'motion_sickness') return `I see you have travel discomfort. Do you experience nausea, dizziness, or vomiting during car, boat, or air travel?`;
      if (condId === 'rabies') return `This is a critical rabies concern. Have you been bitten or scratched by an animal (especially a dog or bat) recently, and have you washed the wound with soap and water? Also, do you have any fever or hydrophobia (fear of water)?`;
      if (condId === 'tetanus') return `This is a critical tetanus concern. Did you sustain a wound, cut, or puncture from rusted metal or dirt recently, and are you feeling any stiffness or spasms in your jaw (lockjaw) or neck?`;
      if (condId === 'lyme_disease') return `I see you have symptoms of Lyme disease. Did you notice a tick bite or an expanding circular 'bullseye' rash on your skin, and are you having joint pain or fever?`;
      if (condId === 'amoebiasis') return `I see you have symptoms of amoebiasis. Are you experiencing loose stools with mucus or blood, and do you have severe abdominal cramps?`;
      if (condId === 'giardiasis') return `I see you have symptoms of giardiasis. Are you experiencing watery, foul-smelling diarrhea, along with stomach bloating and cramping?`;
      if (condId === 'tapeworm_infection') return `I understand you have tapeworm concerns. Have you noticed any white, segmented worms in your stool, or have you experienced unexplained weight loss or abdominal pain?`;
      if (condId === 'oral_thrush') return `I see you have symptoms of oral thrush. Do you have creamy white patches on your tongue or inner cheeks, or any pain when swallowing?`;
      if (condId === 'candida_infection') return `I see you have symptoms of a candida infection. Are you experiencing an itchy, red skin rash in body folds or a white coating in your mouth/throat?`;
      if (condId === 'cellulitis') return `I see you have symptoms of cellulitis. Is the redness and swelling on your skin spreading rapidly, and does the area feel hot and tender?`;
      if (condId === 'abscess') return `I see you have symptoms of an abscess. Do you have a painful, swollen, pus-filled lump under your skin, and do you have a fever?`;
      if (condId === 'vitiligo') return `I understand you have vitiligo concerns. Have you noticed patches of skin losing their pigment and turning white, and are they spreading to other areas?`;
      if (condId === 'warts') return `I see you are concerned about warts. Do you have rough, grainy skin growths on your hands, fingers, or feet, and are they painful?`;
      if (condId === 'rosacea') return `I see you have symptoms of rosacea. Are you experiencing persistent redness or flushing across your cheeks and nose, or any acne-like bumps?`;
      if (condId === 'sunburn') return `I see you have a sunburn. Is your skin red, painful, and warm to the touch, and have you noticed any skin peeling or blistering?`;
      if (condId === 'herpes_simplex') return `I see you have symptoms of herpes simplex. Do you have painful, tingling fluid-filled blisters on your lips or genital area?`;
      if (condId === 'peripheral_artery_disease') return `I see you have symptoms of peripheral artery disease (PAD). Do you experience painful leg cramping while walking that goes away with rest, or cold feet?`;
      if (condId === 'angina') return `This chest discomfort could indicate angina. Does the tightness or pain occur during physical exertion, and does it spread to your neck, jaw, or left arm?`;
      if (condId === 'atrial_fibrillation') return `I understand you are experiencing symptoms of atrial fibrillation. Does your pulse feel irregular, or are you having a rapid, fluttering heartbeat along with dizziness?`;
      if (condId === 'cardiac_arrest') return `This is a cardiac arrest emergency. Did the person collapse suddenly, and are they unresponsive with no breathing or pulse?`;
      if (condId === 'deep_burn') return `This severe burn requires urgent medical attention. Does the skin look charred, white, or leathery, and is the burned area painful?`;
      if (condId === 'internal_bleeding') return `This is an internal bleeding emergency. Have you recently suffered abdominal trauma, and are you vomiting blood or passing black, tarry stools?`;
      if (condId === 'shock') return `This is a medical shock emergency. Does the person have cold, clammy skin, a weak rapid pulse, or rapid shallow breathing?`;
      if (condId === 'respiratory_failure') return `This is a respiratory failure emergency. Are you experiencing extreme difficulty breathing, or are your lips/fingernails turning blue?`;
      if (condId === 'dvt_pregnancy') return `This is a pregnancy-related DVT concern. Are you experiencing sudden swelling, constant pain, warmth, or redness in one of your legs?`;
      if (condId === 'miscarriage') return `This is a pregnancy miscarriage concern. Are you experiencing vaginal bleeding, spotting, or severe cramping in your lower abdomen during pregnancy?`;
      if (condId === 'menopause') return `I see you have menopausal symptoms. Are you experiencing hot flashes, night sweats, sleep issues, or have your menstrual periods stopped?`;
      if (condId === 'pelvic_inflammatory_disease') return `I understand you have PID concerns. Do you have a persistent dull ache in your pelvis, abnormal vaginal discharge, or pain during intercourse?`;
      if (condId === 'bacterial_vaginosis') return `I see you have symptoms of bacterial vaginosis. Have you noticed a thin grayish-white vaginal discharge with a strong fishy odor?`;
      if (condId === 'infertility_female') return `I understand you have female infertility concerns. How long have you been trying to conceive, and have you been diagnosed with PCOS or thyroid issues?`;
      if (condId === 'infertility_male') return `I understand you have male infertility concerns. How long have you been trying to conceive, and have you had a semen analysis done?`;
      if (condId === 'hydrocele') return `I see you have symptoms of a hydrocele. Do you have painless swelling in your scrotum, and does it feel heavy or enlarged?`;
      if (condId === 'varicocele') return `I see you have symptoms of a varicocele. Do you feel a dull ache or heaviness in your testicles, or notice swollen, 'bag of worms' veins in your scrotum?`;
      if (condId === 'sickle_cell_disease') return `I understand you have sickle cell disease concerns. Are you currently experiencing a sudden, severe pain crisis in your bones or joints, or chronic fatigue?`;
      if (condId === 'thalassemia') return `I understand you have thalassemia concerns. Have you experienced chronic fatigue, weakness, pale skin, or been diagnosed with inherited anemia?`;
      if (condId === 'hemophilia') return `I see you have hemophilia concerns. Are you experiencing excessive bleeding from minor cuts, or painful swelling in your joints?`;
      if (condId === 'leukemia') return `I understand you are concerned about leukemia. Have you been experiencing persistent fatigue, frequent infections, or easy bruising and bleeding?`;
      if (condId === 'lymphoma') return `I understand you are concerned about lymphoma. Have you noticed painless swelling in your lymph nodes (neck, armpit, groin) or drenching night sweats?`;
      if (condId === 'oral_cancer') return `I see you are concerned about oral cancer. Do you have a mouth sore or ulcer that has not healed for over two weeks, or a lump in your mouth?`;
      if (condId === 'skin_cancer') return `I see you are concerned about skin cancer. Have you noticed a new or changing mole, a bleeding mole, or an abnormal growth on your skin?`;
      if (condId === 'cervical_cancer') return `I understand you are concerned about cervical cancer. Have you experienced abnormal vaginal bleeding, bleeding after intercourse, or pelvic pain?`;
      if (condId === 'prostate_cancer') return `I understand you are concerned about prostate cancer. Are you experiencing difficulty urinating, blood in your urine/semen, or pelvic discomfort?`;
      if (condId === 'retinal_detachment') return `This is a critical vision concern. Have you experienced a sudden increase in floaters, flashes of light, or a curtain-like shadow over your vision?`;
      if (condId === 'color_blindness') return `I understand you have concerns about color blindness. Do you have difficulty distinguishing between red, green, blue, or yellow colors?`;
      if (condId === 'laryngitis') return `I see you have laryngitis symptoms. Do you have hoarseness or voice loss, and how long has this vocal irritation been going on?`;
      if (condId === 'deviated_septum') return `I understand you are concerned about a deviated septum. Are you experiencing a blocked nostril, nasal breathing difficulty, or snoring?`;
      if (condId === 'nasal_polyps') return `I see you have symptoms of nasal polyps. Are you experiencing chronic nasal blockage, a loss of smell, or postnasal drip?`;
      if (condId === 'septic_shock') return `This sounds like a severe infection septic shock concern. Do you have extremely low blood pressure, rapid breathing, or confusion along with the infection?`;
      if (condId === 'multi_organ_failure') return `This is a critical organ dysfunction concern. Are you experiencing symptoms of failure in multiple systems, such as reduced urination, breathing distress, or yellow skin?`;
      if (condId === 'brain_hemorrhage') return `This is a critical brain hemorrhage concern. Did you experience a sudden, severe headache, weakness on one side of your face or body, or any slurred speech?`;
      if (condId === 'subarachnoid_hemorrhage') return `This is an emergency subarachnoid hemorrhage concern. Did you experience a sudden 'thunderclap' headache (the worst headache of your life), stiff neck, or vomiting?`;
      if (condId === 'transient_ischemic_attack') return `This sounds like a Transient Ischemic Attack (TIA / mini-stroke). Did you experience temporary weakness in your limbs, facial drooping, or speech difficulty that has now resolved?`;
      if (condId === 'cerebral_palsy') return `I see you have concerns about cerebral palsy. Is the child showing delayed motor milestones (sitting, walking), muscle stiffness, or coordination issues?`;
      if (condId === 'muscular_dystrophy') return `I see you have concerns about muscular dystrophy. Is there progressive muscle weakness, frequent falls, or difficulty walking in a child?`;
      if (condId === 'als') return `I understand you have ALS concerns. Are you experiencing progressive muscle wasting, muscle twitching, or weakness starting in your limbs, hands, or feet?`;
      if (condId === 'narcolepsy') return `I see you have symptoms of narcolepsy. Are you experiencing sudden daytime sleep attacks, or temporary muscle weakness triggered by emotions (cataplexy)?`;
      if (condId === 'somnambulism') return `I understand you have sleepwalking concerns. Are you walking or performing complex tasks while asleep, and is the bedroom environment safe?`;
      if (condId === 'bruxism') return `I see you have symptoms of bruxism. Are you grinding or clenching your teeth during sleep, or waking up with jaw soreness and headache?`;
      if (condId === 'tmj_lockjaw') return `I see you have jaw lock concerns. Are you completely unable to open your mouth fully, and have you had jaw clicking or pain?`;
      if (condId === 'dry_socket') return `I see you have symptoms of a dry socket. Did you have a recent tooth extraction, and are you feeling a severe, throbbing pain with exposed bone in the socket?`;
      if (condId === 'gingivitis') return `I see you have symptoms of gingivitis. Are your gums swollen, red, or bleeding easily when you brush or floss?`;
      if (condId === 'periodontitis') return `I understand you have periodontitis concerns. Have you noticed loose teeth, receding gums, or persistent bad breath?`;
      if (condId === 'wisdom_tooth_impaction') return `I see you have wisdom tooth pain. Is there swelling or redness at the back of your jaw, or difficulty opening your mouth?`;
      if (condId === 'sjogrens_syndrome') return `I understand you have Sjogren syndrome concerns. Are you experiencing severe dry eyes and dry mouth, or joint pain?`;
      if (condId === 'ankylosing_spondylitis') return `I understand you have symptoms of ankylosing spondylitis. Is your lower back stiffness worse in the morning and does it improve with movement/exercise?`;
      if (condId === 'vasculitis') return `I understand you have vasculitis concerns. Do you have symptoms of inflamed blood vessels, such as purplish skin spots, fever, or joint pain?`;
      if (condId === 'sarcoidosis') return `I see you have symptoms of sarcoidosis. Do you have a persistent dry cough, shortness of breath, fatigue, or skin bumps?`;
      if (condId === 'celiac_sprue') return `I see you have celiac sprue concerns. Do you experience abdominal pain, bloating, or chronic diarrhea after eating wheat or gluten?`;
      if (condId === 'gastroparesis') return `I see you have symptoms of gastroparesis. Are you feeling full very quickly after starting a meal, or vomiting undigested food hours later?`;
      if (condId === 'achalasia') return `I see you have symptoms of achalasia. Are you having difficulty swallowing both solids and liquids, or a feeling of food being stuck in your throat?`;
      if (condId === 'esophageal_spasm') return `I see you have esophageal spasm concerns. Do you experience sudden pain while swallowing, or chest pain after swallowing?`;
      if (condId === 'barretts_esophagus') return `I understand you are concerned about Barrett's esophagus. Have you had chronic, severe acid reflux (GERD) or difficulty swallowing for years?`;
      if (condId === 'fatty_liver_disease') return `I see you have concerns about fatty liver disease. Have you had an abdominal ultrasound showing fat accumulation, or do you have fatigue and upper right abdominal ache?`;
      if (condId === 'cirrhosis') return `I understand you have cirrhosis concerns. Have you experienced jaundice, abdominal swelling due to fluid (ascites), or easy bruising?`;
      if (condId === 'portal_hypertension') return `I understand you have portal hypertension concerns. Have you noticed enlarged abdominal veins, fluid in your abdomen, or passed dark/bloody stools?`;
      if (condId === 'metabolic_syndrome') return `I see you have metabolic syndrome concerns. Do you have a combination of increased waist size, high blood pressure, high cholesterol, or high blood sugar?`;
      if (condId === 'insulin_resistance') return `I understand you have insulin resistance concerns. Have you noticed velvety dark patches of skin on your neck or armpits (acanthosis nigricans), or high fasting insulin?`;
      if (condId === 'hyperparathyroidism') return `I see you have hyperparathyroidism concerns. Are you experiencing bone pain, kidney stones, or have you had a blood test showing high calcium levels?`;
      if (condId === 'pituitary_tumor') return `I see you have symptoms of a pituitary tumor. Are you experiencing vision changes (like loss of side vision), persistent headaches, or hormonal imbalances?`;
      if (condId === 'adrenal_crisis') return `This is an adrenal crisis emergency. Are you experiencing severe vomiting, sudden lower back/abdominal pain, and extremely low blood pressure?`;
      if (condId === 'osteopenia') return `I see you have osteopenia concerns. Have you had a DEXA bone density scan showing mild bone thinning, or do you take calcium and vitamin D?`;
      if (condId === 'avascular_necrosis') return `I understand you have AVN concerns. Do you have deep hip or groin pain that worsens with weight-bearing, or have you taken steroids for a long time?`;
      if (condId === 'bursitis') return `I see you have symptoms of bursitis. Is there painful swelling and stiffness over a joint (like shoulder, elbow, or hip), especially during movement?`;
      if (condId === 'plantar_fasciitis') return `I see you have symptoms of plantar fasciitis. Do you feel a stabbing heel pain with your first steps in the morning, or arch pain?`;
      if (condId === 'shin_splints') return `I see you have symptoms of shin splints. Do you experience aching pain along the front or inner side of your shinbones during or after running?`;
      if (condId === 'compartment_syndrome') return `This is a compartment syndrome emergency. Are you experiencing severe leg/arm swelling, intense pain out of proportion to the injury, or numbness in the limb?`;
      if (condId === 'flat_feet') return `I see you have concerns about flat feet. Do you have pain or fatigue in your foot arches, calves, or knees after standing or running?`;
      if (condId === 'clubfoot') return `I see you have concerns about clubfoot in an infant. Is the child's foot turned downward and inward at birth, and has treatment started?`;
      if (condId === 'rsv_infection') return `I see you have symptoms of RSV infection. Is the child experiencing wheezing, rapid breathing, or a persistent cough, and how old are they?`;
      if (condId === 'croup') return `This is a croup concern. Is the child experiencing a barking cough or a high-pitched whistling sound when inhaling (stridor)?`;
      if (condId === 'hand_foot_mouth_disease') return `I see you have symptoms of hand, foot, and mouth disease. Does the child have painful sores in their mouth, or a red blistery rash on their hands and feet?`;
      if (condId === 'febrile_seizure') return `This is a febrile seizure concern. Did the child experience a convulsion or jerking limbs during a sudden high fever, and did it last less than 5 minutes?`;
      if (condId === 'failure_to_thrive') return `I see you have concerns about failure to thrive. Has the child's growth rate or weight dropped below the normal percentiles on their chart?`;
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
      if (condId === 'arm_pain' && !hasAssociated) {
        return `Is the pain or numbness present in both arms or just one (specifically the left arm)? And does it get worse when typing or repeating hand movements?`;
      }
      if (condId === 'headache' && !hasAssociated) {
        return `Is this a recurring headache that you get often, or is this a new type of pain for you?`;
      }
      if (condId === 'dry_eye' && !hasAssociated) {
        return `Are you currently using any lubricating eye drops? And does the irritation get worse after reading or using digital screens?`;
      }
      if (condId === 'bipolar_disorder' && !hasAssociated) {
        return `Have these mood fluctuations started recently or have they been occurring over several years? And are they affecting your daily tasks or sleep?`;
      }
      if (condId === 'shingles' && !hasAssociated) {
        return `Is the pain concentrated in one localized band on one side of your body, and have the blisters started to crust over?`;
      }
      if (condId === 'meningitis' && !hasAssociated) {
        return `Do you have any rash that does not fade when pressed with a glass, or have you experienced any vomiting or confusion?`;
      }
      if (condId === 'vitamin_b12_deficiency' && !hasAssociated) {
        return `Are you following a strictly vegetarian or vegan diet? And have you noticed any difficulty with balance or memory?`;
      }
      if (condId === 'deep_vein_thrombosis' && !hasAssociated) {
        return `Have you recently taken a long flight or been immobile for a long period? And is the leg warmth or swelling getting worse?`;
      }
      if (condId === 'appendicitis_acute' && !hasAssociated) {
        return `Is the abdominal pain worsening rapidly, and does it hurt to walk or touch the lower right side?`;
      }
      if (condId === 'preeclampsia' && !hasAssociated) {
        return `Are you experiencing any blurred vision, flashing lights in your eyes, or a severe headache along with the blood pressure spike?`;
      }
      if (condId === 'testicular_torsion' && !hasAssociated) {
        return `Did the pain start suddenly, and are you having any nausea, vomiting, or scrotal swelling?`;
      }
      if (condId === 'substance_abuse' && !hasAssociated) {
        return `Have you experienced any withdrawal symptoms like shaking, sweating, or severe anxiety when trying to stop?`;
      }
      if (condId === 'copd' && !hasAssociated) {
        return `Are you a current or former chronic smoker? And is the breathing difficulty present even when you are resting?`;
      }
      if (condId === 'intestinal_obstruction' && !hasAssociated) {
        return `Have you been completely unable to pass gas or stool, and have you had any vomiting?`;
      }
      if (condId === 'rabies' && !hasAssociated) {
        return `Have you washed the bite wound immediately with soap and water, and did you receive a rabies vaccine booster recently?`;
      }
      if (condId === 'tetanus' && !hasAssociated) {
        return `Was the wound caused by rusted metal or dirt, and did you receive a Tetanus Toxoid shot in the last 5 years?`;
      }
      if (condId === 'angina' && !hasAssociated) {
        return `Does the chest pain resolve within a few minutes of rest or using a Sorbitrate tablet?`;
      }
      if (condId === 'miscarriage' && !hasAssociated) {
        return `Are you passing any tissue or fluid, and is the lower abdominal cramping severe?`;
      }
      if (condId === 'cardiac_arrest' && !hasAssociated) {
        return `Is the person completely unresponsive, and has someone started chest compressions (CPR)?`;
      }
      if (condId === 'deep_burn' && !hasAssociated) {
        return `Is the skin charred, white, or leathery, and is the burned area larger than the palm of your hand?`;
      }
      if (condId === 'internal_bleeding' && !hasAssociated) {
        return `Have you had any vomiting of blood or passed black, tarry stools following the injury?`;
      }
      if (condId === 'shock' && !hasAssociated) {
        return `Is the person's pulse weak and rapid, and are they showing signs of confusion or breathing rapidly?`;
      }
      if (condId === 'respiratory_failure' && !hasAssociated) {
        return `Is there any cyanosis (blue tint to lips/nails), and what is the current oxygen level (SpO2)?`;
      }
      if (condId === 'dvt_pregnancy' && !hasAssociated) {
        return `Is the leg swelling and pain located in only one leg, and is the calf warm to the touch?`;
      }
      if (condId === 'retinal_detachment' && !hasAssociated) {
        return `Are you seeing flashing lights, a sudden burst of floaters, or a shadow blocking your side vision?`;
      }
      if (condId === 'septic_shock' && !hasAssociated) {
        return `Do you have a known source of infection, and is the person experiencing extreme confusion or drowsiness?`;
      }
      if (condId === 'multi_organ_failure' && !hasAssociated) {
        return `Which specific organs are failing, and is there any significant reduction in urine output or yellowing of the skin?`;
      }
      if (condId === 'brain_hemorrhage' && !hasAssociated) {
        return `Did the headache start suddenly, and are you having any weakness on one side of your body or difficulty speaking?`;
      }
      if (condId === 'subarachnoid_hemorrhage' && !hasAssociated) {
        return `Did the headache reach its maximum intensity within seconds, and do you have a stiff neck or sensitivity to light?`;
      }
      if (condId === 'transient_ischemic_attack' && !hasAssociated) {
        return `Did the weakness or speech difficulty last for only a few minutes, and has it completely resolved now?`;
      }
      if (condId === 'adrenal_crisis' && !hasAssociated) {
        return `Have you recently stopped taking steroid medications suddenly, or do you have severe abdominal pain and vomiting?`;
      }
      if (condId === 'compartment_syndrome' && !hasAssociated) {
        return `Did the pain follow a bone fracture or crush injury, and is the limb feeling pale, cold, or numb?`;
      }
      if (condId === 'febrile_seizure' && !hasAssociated) {
        return `Is the child fully conscious now, and has this kind of seizure happened to them before?`;
      }
      if (condId === 'croup' && !hasAssociated) {
        return `Does the barking cough worsen at night, and has the child shown any blue coloring around their lips or difficulty swallowing?`;
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

  };

  const baseResponse = await getBaseResponse();
  return formatFeverResponse(baseResponse, tempAdvice);
}

export function analyzeDocument(
  type: 'report' | 'prescription',
  text?: string
): object {
  if (type === 'prescription') return parsePrescriptionText(text || '');
  if (type === 'report') return parseReportText(text || '');
  return {};
}
