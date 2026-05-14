import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { parsePrescriptionText } from '@/lib/prescription-parser';
import { parseReportText } from '@/lib/report-parser';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ─── Detect Mobile / Capacitor WebView ───────────────────────────────────────
function isMobileRequest(req: NextRequest): boolean {
  const ua = req.headers.get('user-agent') || '';
  // Android WebView always contains "wv" and "Android"
  // Capacitor adds "CapacitorApp" or just runs in Android WebView
  return /Android.*wv\b|CapacitorApp/i.test(ua) || /android/i.test(ua);
}

// ─── 1. Gemini Vision (for mobile — fast, cloud-based) ───────────────────────
async function extractTextWithGemini(buffer: Buffer, mimeType: string, docType: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('No Gemini API key configured on server.');

  const base64 = buffer.toString('base64');

  const prompt = docType === 'prescription'
    ? `You are a medical OCR assistant. Extract ALL text from this prescription image exactly as written. Include: patient name, date, all medications with their dosages (e.g. 625mg), frequencies (e.g. 1-0-1), durations (e.g. 5 days), and any other instructions. Output only the raw extracted text, no explanation.`
    : `You are a medical OCR assistant. Extract ALL text from this lab report image exactly as written. Include all test names, numerical values, units, and reference ranges. Output only the raw extracted text, no explanation.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType, data: base64 } }
          ]
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 2048 }
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${err}`);
  }

  const json = await response.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!text) throw new Error('Gemini returned empty text.');
  return text;
}

// ─── 2. Python/Tesseract (for desktop — local, private) ──────────────────────
async function extractTextWithPython(buffer: Buffer, ext: string, type: string): Promise<string> {
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, `upload_${Date.now()}.${ext}`);
  await fs.writeFile(tempFilePath, buffer);

  const scriptPath = path.join(process.cwd(), 'src', 'scripts', 'analyzer.py');

  const runPython = (cmd: string) => new Promise<string>((resolve, reject) => {
    const proc = spawn(cmd, [scriptPath, tempFilePath, type]);
    let out = '';
    let err = '';
    proc.stdout.on('data', (d) => { out += d.toString(); });
    proc.stderr.on('data', (d) => { err += d.toString(); });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code !== 0) { reject(new Error(err || `Python exited with code ${code}`)); return; }
      try {
        const parsed = JSON.parse(out);
        if (parsed.error) reject(new Error(parsed.error));
        else resolve(parsed.extracted_text || '');
      } catch {
        reject(new Error('Failed to parse Python output.'));
      }
    });
  });

  try {
    const text = await runPython('python3');
    await fs.unlink(tempFilePath).catch(() => {});
    return text;
  } catch {
    try {
      const text = await runPython('python');
      await fs.unlink(tempFilePath).catch(() => {});
      return text;
    } catch (err: any) {
      await fs.unlink(tempFilePath).catch(() => {});
      throw new Error(`Python OCR failed: ${err.message}`);
    }
  }
}

// ─── Main Route ───────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as 'prescription' | 'report' | null;

    if (!type || !file) {
      return NextResponse.json({ error: 'Missing type or file' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg',
      png: 'image/png', webp: 'image/webp',
      pdf: 'application/pdf',
    };
    const mimeType = mimeMap[ext] || 'image/jpeg';

    const mobile = isMobileRequest(req);
    let extractedText = '';

    if (mobile) {
      // ── Mobile: Use Gemini Vision (cloud, fast, handles handwriting) ──
      console.log('[analyze-local] Mobile request → Using Gemini Vision API');
      extractedText = await extractTextWithGemini(buffer, mimeType, type);
    } else {
      // ── Desktop: Use Python + Tesseract (local, private, offline) ──
      console.log('[analyze-local] Desktop request → Using Python/Tesseract OCR');
      try {
        extractedText = await extractTextWithPython(buffer, ext, type);
      } catch (pyErr: any) {
        // Desktop fallback: try Gemini if Python fails
        console.warn('[analyze-local] Python failed, falling back to Gemini:', pyErr.message);
        extractedText = await extractTextWithGemini(buffer, mimeType, type);
      }
    }

    if (!extractedText || extractedText.trim().length < 5) {
      throw new Error('Could not extract enough text from the document. Please ensure the image is clear and try again.');
    }

    console.log('[analyze-local] Extracted text preview:', extractedText.substring(0, 200));

    let analysisData;
    if (type === 'prescription') {
      analysisData = parsePrescriptionText(extractedText);
    } else {
      analysisData = parseReportText(extractedText);
    }

    return NextResponse.json({ success: true, data: analysisData });

  } catch (err: any) {
    console.error('[analyze-local] Final error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const config = { api: { bodyParser: false } };
