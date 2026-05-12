'use server';

import { getChatResponse, analyzeMedicalDocument, type HealthProfile } from "@/lib/gemini";

export async function chatAction(
  message: string,
  history: any,
  profile?: HealthProfile | null
) {
  // Parse history if it comes as a string, otherwise use as-is (with fallback)
  const safeHistory = typeof history === 'string' ? JSON.parse(history) : (history || []);
  const safeProfile = profile ? JSON.parse(JSON.stringify(profile)) : null;
  
  return getChatResponse(message, safeHistory, safeProfile);
}

export async function analyzeAction(
  fileBase64: string,
  fileType: string,
  type: 'report' | 'prescription',
  profile?: HealthProfile | null,
  text?: string
) {
  const safeProfile = profile ? JSON.parse(JSON.stringify(profile)) : null;
  return analyzeMedicalDocument(fileBase64, fileType, type, safeProfile, text);
}
