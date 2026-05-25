import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ─── Prompts ──────────────────────────────────────────────────────────────────

const PRESCRIPTION_PROMPT = `
You are an expert clinical pharmacist analyzing a prescription image.

Carefully read ALL text visible in this prescription image and return a JSON object with EXACTLY this structure:

{
  "medications": [
    {
      "name": "Drug name (brand or generic)",
      "dosage": "e.g. 500mg or As prescribed",
      "timing": "e.g. 1-0-1 (Twice daily) or Once daily",
      "duration": "e.g. 5 days or Ongoing",
      "purpose": "What this drug treats",
      "drugClass": "Drug category (e.g. Antibiotic, Antacid)",
      "warnings": ["Warning 1", "Warning 2"],
      "instructions": "How/when to take it"
    }
  ],
  "summary": "A clear 2-3 sentence summary of this prescription and what conditions it appears to be treating.",
  "warnings": ["Important cross-drug or general warnings"],
  "generalAdvice": "General advice for this prescription",
  "allergyAlert": null
}

Rules:
- Extract EVERY medication visible in the image, even handwritten ones.
- For timing, convert doctor's shorthand (OD, BD, TDS, QID, HS, SOS, 1-0-1, etc.) to human-readable format.
- If a field is unclear, use "As prescribed" or "See doctor".
- allergyAlert should remain null unless you can specifically see allergy information.
- Return ONLY the raw JSON object. No markdown, no code fences, no explanation.
`.trim();

const REPORT_PROMPT = `
You are an expert clinical pathologist analyzing a medical lab report image.

Carefully read ALL values, parameters, and text visible in this report image and return a JSON object with EXACTLY this structure:

{
  "results": [
    {
      "name": "Parameter name (e.g. Hemoglobin, Blood Glucose)",
      "value": 12.5,
      "unit": "g/dL",
      "range": [11.5, 16.5],
      "status": "normal",
      "interpretation": "Brief clinical meaning of this value",
      "category": "Category (e.g. CBC, Liver Function, Thyroid)"
    }
  ],
  "summary": "A clear 3-4 sentence clinical summary of all findings.",
  "risks": ["Risk 1 if any abnormal values exist"],
  "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2"],
  "alerts": ["Any critical/panic values that need urgent attention"],
  "urgency": "routine"
}

Rules:
- status must be exactly one of: "normal", "high", or "low"
- urgency must be exactly one of: "routine", "soon", or "urgent"
- value must be a number (not a string)
- range must be [min, max] as numbers
- Extract EVERY parameter visible in the report image.
- If the report image contains multiple sections (e.g. CBC + LFT + KFT), extract all of them.
- Return ONLY the raw JSON object. No markdown, no code fences, no explanation.
`.trim();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Route Handler ────────────────────────────────────────────────────────────

async function storeBiomarkerRecords(userId: string | undefined, results: any[] | undefined, fileName: string = 'report') {
  if (!userId || !results || !Array.isArray(results) || results.length === 0) return;

  const client = supabaseAdmin || supabase;

  // 1. Structure A (Legacy biomarker_history schema)
  const rowsLegacy = results
    .filter((r: any) => r.name && r.value != null && !isNaN(Number(r.value)))
    .map((r: any) => ({
      user_id: userId,
      biomarker: r.name,
      value: Number(r.value),
      unit: r.unit || '',
      recorded_at: new Date().toISOString(),
    }));

  // 2. Structure B (User-requested schema: biomarker_name, biomarker_value, normal_range, etc.)
  const rowsUser = results
    .filter((r: any) => r.name && r.value != null && !isNaN(Number(r.value)))
    .map((r: any) => ({
      user_id: userId,
      biomarker_name: r.name,
      biomarker_value: Number(r.value),
      normal_range: r.range ? JSON.stringify(r.range) : null,
      report_date: new Date().toISOString(),
      report_reference: fileName,
    }));

  // Attempt insertions silently using try-catch blocks
  if (rowsLegacy.length > 0) {
    try {
      const { error } = await client.from('biomarker_history').insert(rowsLegacy);
      if (!error) console.log(`[storeBiomarkerRecords] Stored ${rowsLegacy.length} legacy-schema records in biomarker_history`);
    } catch (e) {}

    try {
      const { error } = await client.from('biomarkers').insert(rowsLegacy);
      if (!error) console.log(`[storeBiomarkerRecords] Stored ${rowsLegacy.length} legacy-schema records in biomarkers`);
    } catch (e) {}
  }

  if (rowsUser.length > 0) {
    try {
      const { error } = await client.from('biomarker_history').insert(rowsUser);
      if (!error) console.log(`[storeBiomarkerRecords] Stored ${rowsUser.length} user-schema records in biomarker_history`);
    } catch (e) {}

    try {
      const { error } = await client.from('biomarkers').insert(rowsUser);
      if (!error) console.log(`[storeBiomarkerRecords] Stored ${rowsUser.length} user-schema records in biomarkers`);
    } catch (e) {}
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as 'prescription' | 'report' | null;
    const textOnly = formData.get('text') as string | null;
    const userId = formData.get('userId') as string | undefined;

    if (!type) {
      return NextResponse.json({ error: 'Missing type' }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured in .env.local' }, { status: 500 });
    }

    const prompt = type === 'prescription' ? PRESCRIPTION_PROMPT : REPORT_PROMPT;
    
    let rawText = '';

    // ─── 1. Try Gemini API (Free Tier) First ──────────────────────────────────
    if (GEMINI_API_KEY) {
      try {
        console.log(`[analyze-medical] Calling Gemini API`);
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        let result;
        if (textOnly && textOnly.trim()) {
          const textPrompt = `${prompt}\n\nHere is the prescription text to analyze:\n\n${textOnly.trim()}`;
          result = await model.generateContent(textPrompt);
        } else if (file) {
          const SUPPORTED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'];
          let mimeType = file.type || 'image/jpeg';
          if (mimeType === 'image/jpg') mimeType = 'image/jpeg';
          if (!mimeType || mimeType === 'application/octet-stream' || !SUPPORTED_MIMES.includes(mimeType)) {
            const ext = file.name?.split('.').pop()?.toLowerCase() || 'jpg';
            if (ext === 'pdf') mimeType = 'application/pdf';
            else if (ext === 'png') mimeType = 'image/png';
            else if (ext === 'webp') mimeType = 'image/webp';
            else if (ext === 'heic') mimeType = 'image/heic';
            else if (ext === 'heif') mimeType = 'image/heif';
            else mimeType = 'image/jpeg';
          }
          
          const bytes = await file.arrayBuffer();
          const base64 = Buffer.from(bytes).toString('base64');
          
          result = await model.generateContent([
            prompt,
            { inlineData: { data: base64, mimeType } }
          ]);
        }

        if (result && result.response) {
          rawText = result.response.text();
        }
      } catch (err: any) {
        console.warn('[analyze-medical] Gemini API Failed:', err.message);
        throw new Error(`Gemini API Error: ${err.message}`);
      }
    }

    if (!rawText) {
      throw new Error('Analysis failed: No output generated from AI model.');
    }

    // Strip markdown code fences if wrapped
    const cleaned = rawText
      .replace(/^```(?:json)?\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: 'Could not parse AI response. The image may be too blurry or unreadable.', raw: rawText },
        { status: 422 }
      );
    }

    // Store biomarker data only for report analyses
    if (type === 'report') {
      await storeBiomarkerRecords(userId, parsed.results, file?.name || 'report');
    }
    return NextResponse.json({ success: true, data: parsed });

  } catch (err: any) {
    console.error('[analyze-medical] Final error:', err);

    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const config = { api: { bodyParser: false } };
