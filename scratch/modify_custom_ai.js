const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'lib', 'custom-ai.ts');
let content = fs.readFileSync(filePath, 'utf8');

const splitStr1 = 'export async function getChatResponse(';
const splitStr2 = 'export function analyzeDocument(';

if (!content.includes(splitStr1) || !content.includes(splitStr2)) {
  console.error('Error: Could not find target functions in file.');
  process.exit(1);
}

const parts1 = content.split(splitStr1);
const part1 = parts1[0];
const rest1 = parts1[1];

const parts2 = rest1.split(splitStr2);
const originalBodyWithSignature = parts2[0].trim();
const part3 = parts2[1];

// The original body signature starts with the parameters and goes down to the closing brace.
// Since we split by 'export async function getChatResponse(', the originalBodyWithSignature starts with:
// "message: string,\n  history: ..."
// And ends with the closing brace of getChatResponse.
// Let's remove the closing brace at the very end of originalBodyWithSignature.
const lastBraceIndex = originalBodyWithSignature.lastIndexOf('}');
if (lastBraceIndex === -1) {
  console.error('Error: Could not find closing brace of getChatResponse.');
  process.exit(1);
}

const originalBody = originalBodyWithSignature.substring(0, lastBraceIndex);

// Let's extract the parameters part of the signature
const paramsEndIndex = originalBody.indexOf('): Promise<string> {');
if (paramsEndIndex === -1) {
  console.error('Error: Could not find parameters end.');
  process.exit(1);
}
const bodyInside = originalBody.substring(paramsEndIndex + '): Promise<string> {'.length);

const helpers = `
function hasFeverMention(text: string): boolean {
  return /\\b(fever(ish)?|temp(erature)?|chills|body\\s*hot|warm\\s*body|shivering|cold\\s*sweat|running\\s*a\\s*temp|high\\s*temp)\\b/i.test(text);
}

function extractTemperature(text: string): { value: number; unit: 'F' | 'C' } | null {
  const matchWithUnit = text.match(/\\b(\\d+(?:\\.\\d+)?)\\s*(?:°\\s*)?(f|c|fahrenheit|celsius|degrees?\\s*f|degrees?\\s*c|degs?\\s*f|degs?\\s*c|degrees?|degs?)\\b/i);
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
  
  const numbers = text.match(/\\b(\\d+(?:\\.\\d+)?)\\b/g);
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
    return tempAdvice + "\\n\\n" + response.slice(prefix.length);
  }
  return tempAdvice + "\\n\\n" + response;
}
`;

const newFunction = `export async function getChatResponse(
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
    return \`I am Dr. AIHCAS, your private AI health assistant. I help evaluate symptoms and analyze medical documents. What brings you in today?\`;
  }

  // 3. Gratitude / Closing
  if (/\\b(thank(s| you)|great|helpful|better now|feeling better|ok thanks|bye|goodbye|that helps|all good)\\b/.test(msgLow)) {
    return \`Glad I could help! Come back if symptoms persist or worsen. Always see a doctor in person for serious concerns. Take care!\`;
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
        return \`I understand you are experiencing a fever. To give you the best guidance, could you please tell me your current body temperature?\`;
      }
    } else {
      const tempVal = tempInfo.value;
      const tempUnit = tempInfo.unit;
      if (tempUnit === 'C') {
        if (tempVal < 37.3) {
          tempAdvice = \`Your temperature (\${tempVal}°C) is in the normal range. Please rest, stay hydrated, and monitor your symptoms.\`;
        } else if (tempVal <= 38.0) {
          tempAdvice = \`Your temperature (\${tempVal}°C) indicates a low-grade fever. This is your body's natural defense fighting off an infection. Rest, stay well-hydrated, and take Paracetamol if you feel uncomfortable.\`;
        } else if (tempVal <= 39.0) {
          tempAdvice = \`Your temperature (\${tempVal}°C) indicates a moderate fever. Rest, stay hydrated with fluids (water, coconut water, or ORS), and take Paracetamol 650mg every 6 hours if needed.\`;
        } else {
          tempAdvice = \`Your temperature (\${tempVal}°C) indicates a high fever. This warrants prompt medical consultation. Take Paracetamol 650mg, use tepid water sponge baths to cool down, stay hydrated, and visit a doctor as soon as possible.\`;
        }
      } else {
        if (tempVal < 99.1) {
          tempAdvice = \`Your temperature (\${tempVal}°F) is in the normal range. Please rest, stay hydrated, and monitor your symptoms.\`;
        } else if (tempVal <= 100.4) {
          tempAdvice = \`Your temperature (\${tempVal}°F) indicates a low-grade fever. This is your body's natural defense fighting off an infection. Rest, stay well-hydrated, and take Paracetamol if you feel uncomfortable.\`;
        } else if (tempVal <= 102.2) {
          tempAdvice = \`Your temperature (\${tempVal}°F) indicates a moderate fever. Rest, stay hydrated with fluids (water, coconut water, or ORS), and take Paracetamol 650mg every 6 hours if needed.\`;
        } else {
          tempAdvice = \`Your temperature (\${tempVal}°F) indicates a high fever. This warrants prompt medical consultation. Take Paracetamol 650mg, use tepid water sponge baths to cool down, stay hydrated, and visit a doctor as soon as possible.\`;
        }
      }
    }
  }

  const getBaseResponse = async (): Promise<string> => {
    ${bodyInside}
  };

  const baseResponse = await getBaseResponse();
  return formatFeverResponse(baseResponse, tempAdvice);
}

`;

const finalContent = part1 + helpers + newFunction + splitStr2 + part3;
fs.writeFileSync(filePath, finalContent, 'utf8');
console.log('Successfully modified custom-ai.ts!');
