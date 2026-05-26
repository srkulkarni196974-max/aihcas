import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { parsePrescriptionText } from '@/lib/prescription-parser';
import { parseReportText } from '@/lib/report-parser';
import { supabase, supabaseAdmin } from '@/lib/supabase';

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
  let tempFilePath = '';
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as 'prescription' | 'report' | null;
    const userId = formData.get('userId') as string | undefined;

    if (!type || !file) {
      return NextResponse.json({ error: 'Missing type or file' }, { status: 400 });
    }

    // Save file to a temporary location
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a temporary file with the correct extension
    let ext = 'jpg';
    if (file.name && file.name.includes('.')) {
      const parsedExt = file.name.split('.').pop()?.toLowerCase();
      if (parsedExt) ext = parsedExt;
    } else if (file.type) {
      const mimeExt = file.type.split('/').pop()?.toLowerCase();
      if (mimeExt) {
        ext = mimeExt === 'jpeg' ? 'jpg' : mimeExt;
      }
    }
    const tempDir = os.tmpdir();
    tempFilePath = path.join(tempDir, `upload_${Date.now()}.${ext}`);

    await fs.writeFile(tempFilePath, buffer);

    // Call Python script
    const scriptPath = path.join(process.cwd(), 'src', 'scripts', 'analyzer.py');

    const result = await new Promise((resolve, reject) => {
      // Use python3 on Linux (Render) and python on Windows
      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

      // Ensure Python can find the modules we installed in python_lib (for Render)
      const pythonPath = path.join(process.cwd(), 'python_lib');
      const env = {
        ...process.env,
        PYTHONPATH: process.env.PYTHONPATH
          ? `${pythonPath}:${process.env.PYTHONPATH}`
          : pythonPath
      };

      const pythonProcess = spawn(pythonCmd, [scriptPath, tempFilePath, type], { env });

      let dataString = '';
      let errorString = '';

      pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error('[analyze-local] Python Error:', errorString);
          reject(new Error(`Python processing failed: ${errorString}`));
          return;
        }

        try {
          const parsed = JSON.parse(dataString);
          resolve(parsed);
        } catch (e) {
          console.error('[analyze-local] JSON Parse Error. Raw Output:', dataString);
          reject(new Error('Failed to parse Python output'));
        }
      });
    });

    const typedResult = result as any;

    // If Python returned an error, check if we can fall back to Gemini
    let extractedText = typedResult.extracted_text || '';
    let pythonError = typedResult.error || '';

    if (pythonError) {
      extractedText = pythonError;
    }

    // ─── Cloud Fallback Logic ──────────────────────────────────────────────────
    const isOCRError = !!pythonError ||
                       extractedText.includes('tesseract is not installed') || 
                       extractedText.includes('OCR Error') ||
                       extractedText.includes('Extraction Error') ||
                       extractedText.includes('Unsupported file type') ||
                       extractedText.trim().length < 15;

    if (isOCRError) {
      console.log(`[analyze-local] Local OCR failed for ${type}. Falling back to Gemini...`);
      
      try {
        const genAI = new (require('@google/generative-ai').GoogleGenerativeAI)(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        const fileBuffer = await fs.readFile(tempFilePath);
        const base64 = fileBuffer.toString('base64');
        
        const prompt = type === 'prescription' 
          ? `You are an expert clinical pharmacist. Analyze this prescription image and return a JSON object with medications, summary, warnings, generalAdvice, and allergyAlert. 
             Each entry in the "medications" array must have:
             - "name": Drug name
             - "dosage": Dosage
             - "timing": Timing shorthand translation
             - "duration": Duration
             - "purpose": Purpose
             - "drugClass": Class
             - "warnings": list of warnings
             - "instructions": detailed instructions
             - "bounding_box": [ymin, xmin, ymax, xmax] coordinates (0-1000 scale) enclosing the text line of this medication in the image.
             Return ONLY raw JSON.`
          : `You are an expert clinical pathologist. Analyze this medical lab report image. Extract all parameters, values, units, and reference ranges. Return a JSON object with results (array), summary, risks, recommendations, alerts, and urgency. 
             Each entry in the "results" array must have:
             - "name": Parameter name
             - "value": numeric value
             - "unit": unit string
             - "range": [min, max] reference range as numbers
             - "status": "normal", "high", or "low"
             - "interpretation": clinical meaning
             - "category": section category
             - "bounding_box": [ymin, xmin, ymax, xmax] coordinates (0-1000 scale) enclosing the text line of this parameter in the image.
             Return ONLY raw JSON.`;

        let mimeType = file.type || '';
        const SUPPORTED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'];
        if (!mimeType || mimeType === 'application/octet-stream' || !SUPPORTED_MIMES.includes(mimeType)) {
          const lowerExt = ext.toLowerCase();
          if (lowerExt === 'pdf') mimeType = 'application/pdf';
          else if (lowerExt === 'png') mimeType = 'image/png';
          else if (lowerExt === 'webp') mimeType = 'image/webp';
          else if (lowerExt === 'heic') mimeType = 'image/heic';
          else if (lowerExt === 'heif') mimeType = 'image/heif';
          else mimeType = 'image/jpeg';
        }
        if (mimeType === 'image/jpg') mimeType = 'image/jpeg';

        const geminiResult = await model.generateContent([
          prompt,
          { inlineData: { data: base64, mimeType } }
        ]);

        const responseText = geminiResult.response.text().replace(/```json|```/g, '').trim();
        const parsedData = JSON.parse(responseText);

        // Store biomarker data for reports
        if (type === 'report') {
          await storeBiomarkerRecords(userId, parsedData.results, file?.name);
        }

        return NextResponse.json({ 
          success: true, 
          data: parsedData, 
          source: 'cloud-fallback',
          engine: 'gemini' 
        });
      } catch (geminiErr) {
        console.error('[analyze-local] Cloud Fallback also failed:', geminiErr);
        throw new Error(`Analysis failed. Local error: ${extractedText}. Cloud error: ${geminiErr instanceof Error ? geminiErr.message : 'Unknown error'}`);
      }
    }
    
    // ─── Standard Logic (Successful Local OCR) ────────────────────────────────
    let analysisData;
    if (type === 'prescription') {
      analysisData = parsePrescriptionText(extractedText);
    } else {
      analysisData = parseReportText(extractedText);
    }

    // ─── Smart Gemini Fallback for images with poor OCR ─────────────────────
    // If the local regex parser found 0 results from an image, OCR text was
    // likely garbled. Fall back to Gemini vision which can read the image directly.
    const parsedResults = (analysisData as any).results;
    const hasNoResults = !parsedResults || !Array.isArray(parsedResults) || parsedResults.length === 0;
    const isImageFile = ext !== 'pdf' && ext !== 'txt';

    if (hasNoResults && isImageFile && process.env.GEMINI_API_KEY) {
      console.log(`[analyze-local] Local parser found 0 results from image. Falling back to Gemini vision...`);
      try {
        const genAI = new (require('@google/generative-ai').GoogleGenerativeAI)(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const fileBuffer = await fs.readFile(tempFilePath);
        const base64 = fileBuffer.toString('base64');

        const imgPrompt = type === 'prescription'
          ? `You are an expert clinical pharmacist. Analyze this prescription image and return a JSON object with medications, summary, warnings, generalAdvice, and allergyAlert. 
             Each entry in the "medications" array must have:
             - "name": Drug name
             - "dosage": Dosage
             - "timing": Timing shorthand translation
             - "duration": Duration
             - "purpose": Purpose
             - "drugClass": Class
             - "warnings": list of warnings
             - "instructions": detailed instructions
             - "bounding_box": [ymin, xmin, ymax, xmax] coordinates (0-1000 scale) enclosing the text line of this medication in the image.
             Return ONLY raw JSON.`
          : `You are an expert clinical pathologist. Analyze this medical lab report image. Extract all parameters, values, units, and reference ranges. Return a JSON object with results (array), summary, risks, recommendations, alerts, and urgency. 
             Each entry in the "results" array must have:
             - "name": Parameter name
             - "value": numeric value
             - "unit": unit string
             - "range": [min, max] reference range as numbers
             - "status": "normal", "high", or "low"
             - "interpretation": clinical meaning
             - "category": section category
             - "bounding_box": [ymin, xmin, ymax, xmax] coordinates (0-1000 scale) enclosing the text line of this parameter in the image.
             Return ONLY raw JSON.`;

        let mimeType = file.type || '';
        const SUPPORTED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
        if (!mimeType || mimeType === 'application/octet-stream' || !SUPPORTED_MIMES.includes(mimeType)) {
          const lowerExt = ext.toLowerCase();
          if (lowerExt === 'png') mimeType = 'image/png';
          else if (lowerExt === 'webp') mimeType = 'image/webp';
          else if (lowerExt === 'heic') mimeType = 'image/heic';
          else if (lowerExt === 'heif') mimeType = 'image/heif';
          else mimeType = 'image/jpeg';
        }
        if (mimeType === 'image/jpg') mimeType = 'image/jpeg';

        const geminiResult = await model.generateContent([
          imgPrompt,
          { inlineData: { data: base64, mimeType } }
        ]);

        const responseText = geminiResult.response.text().replace(/```json|```/g, '').trim();
        const parsedData = JSON.parse(responseText);

        if (type === 'report') {
          await storeBiomarkerRecords(userId, parsedData.results, file?.name);
        }

        return NextResponse.json({
          success: true,
          data: parsedData,
          source: 'image-vision-fallback',
          engine: 'gemini'
        });
      } catch (geminiFallbackErr) {
        console.error('[analyze-local] Gemini image fallback also failed:', geminiFallbackErr);
        // Continue and return the empty local result below
      }
    }

    // Store biomarker data for reports (local OCR path)
    if (type === 'report') {
      await storeBiomarkerRecords(userId, (analysisData as any).results, file?.name);
    }

    return NextResponse.json({ 
      success: true, 
      data: analysisData,
      engine: 'python'
    });

  } catch (err: any) {
    console.error('[analyze-local] Final error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (tempFilePath) {
      await fs.unlink(tempFilePath).catch(console.error);
    }
  }
}

export const config = { api: { bodyParser: false } };
