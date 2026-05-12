/**
 * AIHCAS AI Engine
 *
 * Uses the custom-trained local AI model (TF-IDF + medical knowledge base).
 * No external APIs for chat/voice — runs fully offline.
 */

import { getChatResponse as localChat, analyzeDocument, type HealthProfile } from './custom-ai';

export type { HealthProfile };

export async function getChatResponse(
  message: string,
  history: any[],
  profile?: HealthProfile | null
): Promise<string> {
  // Use locally trained model — no API call
  return localChat(message, history, profile);
}

export async function analyzeMedicalDocument(
  fileBase64: string,
  fileType: string,
  type: 'report' | 'prescription',
  profile?: HealthProfile | null,
  text?: string
): Promise<any> {
  // Local analysis — returns structured medical data
  return analyzeDocument(type, text);
}
