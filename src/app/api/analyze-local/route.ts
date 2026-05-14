import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { parsePrescriptionText } from '@/lib/prescription-parser';
import { parseReportText } from '@/lib/report-parser';
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
  "summary": "A clear 2-3 sentence summary of this prescription.",
  "warnings": ["Important cross-drug or general warnings"],
  "generalAdvice": "General advice for this prescription",
  "allergyAlert": null
}

Rules:
- Extract EVERY medication visible in the image, even handwritten ones.
- For timing, convert doctor's shorthand (OD, BD, TDS, QID, HS, SOS, 1-0-1, etc.) to human-readable format.
- If a field is unclear, use "As prescribed" or "See doctor".
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

// ─── Gemini Fallback ──────────────────────────────────────────────────────────

async function analyzeWithGemini(file: File, type: 'prescription' | 'report') {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
  const prompt = type === 'prescription' ? PRESCRIPTION_PROMPT : REPORT_PROMPT;

  const SUPPORTED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  let mimeType = file.type || 'image/jpeg';
  if (!SUPPORTED_MIMES.includes(mimeType)) mimeType = 'image/jpeg';

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64, mimeType } }
  ]);

  const rawText = result.response.text();
  const cleaned = rawText
    .replace(/^```(?:json)?\n?/i, '')
    .replace(/\n?```$/i, '')
    .trim();

  return JSON.parse(cleaned);
}

// ─── Python+Tesseract OCR ──────────────────────────────────────────────────────

async function analyzeWithPython(
  file: File,
  type: 'prescription' | 'report',
  tempFilePath: string
): Promise<any> {
  const scriptPath = path.join(process.cwd(), 'src', 'scripts', 'analyzer.py');

  const runPython = (cmd: string) => new Promise((resolve, reject) => {
    const pythonProcess = spawn(cmd, [scriptPath, tempFilePath, type]);

    let dataString = '';
    let errorString = '';

    pythonProcess.stdout.on('data', (data) => { dataString += data.toString(); });
    pythonProcess.stderr.on('data', (data) => { errorString += data.toString(); });

    pythonProcess.on('error', (err) => reject(err));

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(errorString || `Python process exited with code ${code}`));
        return;
      }
      try {
        resolve(JSON.parse(dataString));
      } catch {
        reject(new Error('Failed to parse Python output'));
      }
    });
  });

  let result: any;
  try {
    result = await runPython('python3');
  } catch {
    result = await runPython('python');
  }

  if (result.error) throw new Error(result.error);

  const extractedText = result.extracted_text || '';

  if (extractedText.startsWith('[Image OCR Error:') || extractedText.startsWith('[PDF Extraction Error:')) {
    throw new Error(extractedText);
  }

  if (type === 'prescription') {
    return parsePrescriptionText(extractedText);
  } else {
    return parseReportText(extractedText);
  }
}

// ─── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as 'prescription' | 'report' | null;

    if (!type || !file) {
      return NextResponse.json({ error: 'Missing type or file' }, { status: 400 });
    }

    // Save uploaded file to temp dir for Python
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split('.').pop() || 'jpg';
    tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}.${ext}`);
    await fs.writeFile(tempFilePath, buffer);

    let analysisData: any = null;
    let usedEngine = 'python';

    // ── 1. Try Python + Tesseract OCR first ──────────────────────────────────
    try {
      console.log('[analyze-local] Attempting Python + Tesseract OCR...');
      analysisData = await analyzeWithPython(file, type, tempFilePath);
      console.log('[analyze-local] Python OCR succeeded.');
    } catch (pythonErr: any) {
      console.warn('[analyze-local] Python/Tesseract failed:', pythonErr.message);

      // ── 2. Fall back to Gemini AI (cloud) ────────────────────────────────
      if (GEMINI_API_KEY) {
        try {
          console.log('[analyze-local] Falling back to Gemini API...');
          analysisData = await analyzeWithGemini(file, type);
          usedEngine = 'gemini';
          console.log('[analyze-local] Gemini fallback succeeded.');
        } catch (geminiErr: any) {
          console.error('[analyze-local] Gemini fallback also failed:', geminiErr.message);
          throw new Error(`OCR failed. Python: ${pythonErr.message} | Gemini: ${geminiErr.message}`);
        }
      } else {
        throw new Error(`Tesseract OCR is not available on this server. Please ensure Python and Tesseract are installed, or configure GEMINI_API_KEY for cloud analysis.`);
      }
    }

    // Clean up
    if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});

    return NextResponse.json({ success: true, data: analysisData, engine: usedEngine });

  } catch (err: any) {
    console.error('[analyze-local] Final error:', err);
    if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});

    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const config = { api: { bodyParser: false } };
