'use server';

import { getChatResponse, analyzeMedicalDocument, type HealthProfile } from "@/lib/gemini";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabase";

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

export async function generateSummaryAction() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.userId || (session?.user as any)?.id;
    if (!userId) {
      return { success: false, error: "Unauthorized: Patient session not found" };
    }

    // 1. Fetch patient demographics
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    // 2. Fetch the most recent active conversation and its messages
    const { data: lastConv } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let chatMessages: any[] = [];
    if (lastConv) {
      const { data: msgs } = await supabaseAdmin
        .from('messages')
        .select('*')
        .eq('conversation_id', lastConv.id)
        .order('created_at', { ascending: true });
      if (msgs) {
        chatMessages = msgs;
      }
    }

    // 3. Fetch recent prescriptions (max 3)
    const { data: prescriptions } = await supabaseAdmin
      .from('medical_documents')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'prescription')
      .order('created_at', { ascending: false })
      .limit(3);

    // 4. Fetch recent lab pathology reports (max 3)
    const { data: pathologyReports } = await supabaseAdmin
      .from('medical_documents')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'report')
      .order('created_at', { ascending: false })
      .limit(3);

    // 5. Build expert clinical synthesis
    let synthesis = "";
    const age = profile?.age ? `${profile.age}-year-old` : "patient";
    const gender = profile?.gender ? profile.gender.toLowerCase() : "";
    const conditions = profile?.medical_history ? profile.medical_history : "";
    const allergies = profile?.allergies && profile.allergies.length > 0 ? profile.allergies.join(", ") : "";

    synthesis += `Patient is a ${age} ${gender}. `;
    if (conditions) {
      synthesis += `Presents with a known clinical history of ${conditions}. `;
    }
    if (allergies) {
      synthesis += `Contraindicated for ${allergies} due to specified drug/chemical allergies. `;
    }

    // Chat symptom extraction
    let recentSymptoms: string[] = [];
    let detectedTriage: string = "consult";
    if (chatMessages.length > 0) {
      const userText = chatMessages
        .filter((m: any) => m.role === 'user')
        .map((m: any) => m.content.toLowerCase())
        .join(" ");

      const commonSymptoms = ["fever", "headache", "chest pain", "cough", "stomach pain", "fatigue", "breathlessness", "dizziness", "rash", "nausea"];
      commonSymptoms.forEach(symptom => {
        if (userText.includes(symptom)) recentSymptoms.push(symptom);
      });

      // Triage evaluation
      const assistantText = chatMessages
        .filter((m: any) => m.role === 'assistant')
        .map((m: any) => m.content.toLowerCase())
        .join(" ");

      if (assistantText.includes("emergency") || assistantText.includes("ambulance") || assistantText.includes("immediately")) {
        detectedTriage = "emergency";
      } else if (assistantText.includes("self-care") || assistantText.includes("rest and hydration")) {
        detectedTriage = "self";
      }
    }

    if (recentSymptoms.length > 0) {
      synthesis += `Recent consultations highlighted active symptoms of ${recentSymptoms.join(", ")}. `;
    }

    // Lab reports out-of-bounds synthesis
    let abnormalMarkers: string[] = [];
    if (pathologyReports && pathologyReports.length > 0) {
      pathologyReports.forEach((doc: any) => {
        const results = doc.analysis_json?.results;
        if (Array.isArray(results)) {
          results.forEach((r: any) => {
            if (r.status === 'high' || r.status === 'low') {
              abnormalMarkers.push(`${r.name} (${r.value} ${r.unit} - ${r.status.toUpperCase()})`);
            }
          });
        }
      });
    }

    if (abnormalMarkers.length > 0) {
      synthesis += `Pathology screening identified critical out-of-range indicators: ${abnormalMarkers.slice(0, 4).join(", ")}. `;
    }

    // Active prescriptions synthesis
    let activeMedicationNames: string[] = [];
    if (prescriptions && prescriptions.length > 0) {
      prescriptions.forEach((doc: any) => {
        const meds = doc.analysis_json?.medications;
        if (Array.isArray(meds)) {
          meds.forEach((m: any) => {
            if (m.name && !activeMedicationNames.includes(m.name)) {
              activeMedicationNames.push(m.name);
            }
          });
        }
      });
    }

    if (activeMedicationNames.length > 0) {
      synthesis += `Current therapeutic regime consists of: ${activeMedicationNames.join(", ")}. `;
    } else if (profile?.medications) {
      synthesis += `Current self-reported routine includes: ${profile.medications}. `;
    }

    // Concluding advice
    if (detectedTriage === "emergency") {
      synthesis += `WARNING: Immediate medical emergency dispatch or critical clinical consult is advised.`;
    } else if (detectedTriage === "consult") {
      synthesis += `Recommended routine clinical follow-up is indicated to review diagnostic metrics.`;
    } else {
      synthesis += `Indicated home recovery with general lifestyle management and follow-up as required.`;
    }

    return {
      success: true,
      data: {
        profile,
        lastConv,
        chatMessages,
        prescriptions,
        pathologyReports,
        synthesis,
        triageLevel: detectedTriage
      }
    };
  } catch (error: any) {
    console.error("Error in generateSummaryAction:", error);
    return { success: false, error: error.message || "Failed to aggregate medical summary" };
  }
}

