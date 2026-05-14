import { NextRequest, NextResponse } from 'next/server';
import { parsePrescriptionText } from '@/lib/prescription-parser';
import { parseReportText } from '@/lib/report-parser';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ─── Gemini Vision OCR (fast, cloud-based) ────────────────────────────────────
async function extractTextWithGemini(buffer: Buffer, mimeType: string, docType: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('No Gemini API key configured.');

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

// ─── Tesseract.js fallback (slow but works offline) ───────────────────────────
async function extractTextWithTesseract(buffer: Buffer): Promise<string> {
  const Tesseract = (await import('tesseract.js')).default;
  const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
  return text;
}

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

    // Detect MIME type - default to jpeg for images
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg',
      png: 'image/png', webp: 'image/webp',
      pdf: 'application/pdf',
    };
    const mimeType = mimeMap[ext] || 'image/jpeg';

    let extractedText = '';

    // 1. Try Gemini Vision first (fast, accurate, handles handwriting well)
    try {
      console.log('[analyze-local] Using Gemini Vision API...');
      extractedText = await extractTextWithGemini(buffer, mimeType, type);
      console.log('[analyze-local] Gemini extraction successful. Length:', extractedText.length);
    } catch (geminiErr: any) {
      // 2. Fall back to Tesseract.js if Gemini fails
      console.warn('[analyze-local] Gemini failed, falling back to Tesseract.js:', geminiErr.message);
      try {
        extractedText = await extractTextWithTesseract(buffer);
        console.log('[analyze-local] Tesseract.js extraction done. Length:', extractedText.length);
      } catch (tessErr: any) {
        throw new Error(`OCR failed: ${tessErr.message}`);
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
