import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { parsePrescriptionText } from '@/lib/prescription-parser';
import { parseReportText } from '@/lib/report-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  let tempFilePath = '';
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as 'prescription' | 'report' | null;

    if (!type || !file) {
      return NextResponse.json({ error: 'Missing type or file' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split('.').pop() || 'jpg';
    const tempDir = os.tmpdir();
    tempFilePath = path.join(tempDir, `upload_${Date.now()}.${ext}`);
    await fs.writeFile(tempFilePath, buffer);

    const scriptPath = path.join(process.cwd(), 'src', 'scripts', 'analyzer.py');
    
    // 1. Run Python Analysis
    const pythonResult = await new Promise((resolve) => {
      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
      const pythonPath = path.join(process.cwd(), 'python_lib');
      const env = { 
        ...process.env, 
        PYTHONPATH: process.env.PYTHONPATH ? `${pythonPath}:${process.env.PYTHONPATH}` : pythonPath 
      };

      const pythonProcess = spawn(pythonCmd, [scriptPath, tempFilePath, type], { env });
      let dataString = '';
      pythonProcess.stdout.on('data', (data) => { dataString += data.toString(); });
      pythonProcess.on('close', (code) => {
        try {
          resolve(JSON.parse(dataString));
        } catch (e) {
          resolve({ error: 'Invalid JSON from Python', extracted_text: dataString });
        }
      });
    }) as any;

    const extractedText = pythonResult.extracted_text || '';
    
    // 2. Check for OCR/Tesseract Errors (Specifically for prescriptions)
    const isError = extractedText.includes('OCR Error') || 
                    extractedText.includes('tesseract is not installed') || 
                    extractedText.length < 5;

    if (type === 'prescription' && isError) {
      console.log('[analyze-local] Local OCR failed. Triggering Gemini Fallback...');
      
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('Local OCR failed and Gemini API Key is missing.');
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const base64 = buffer.toString('base64');
      
      const prompt = "You are an expert clinical pharmacist. Analyze this prescription image and return a JSON object with medications, dosages, timings, duration, purpose, drugClass, warnings, and instructions. Return ONLY raw JSON.";

      const geminiResult = await model.generateContent([
        prompt,
        { inlineData: { data: base64, mimeType: `image/${ext}` } }
      ]);

      const responseText = geminiResult.response.text().replace(/```json|```/g, '').trim();
      const parsedData = JSON.parse(responseText);

      // Clean up before returning
      if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});
      return NextResponse.json({ success: true, data: parsedData, source: 'cloud' });
    }

    // 3. Process with Standard TypeScript Parsers
    let analysisData;
    if (type === 'prescription') {
      analysisData = parsePrescriptionText(extractedText);
    } else {
      // REPORT ANALYSIS: Remains untouched as requested
      analysisData = parseReportText(extractedText);
    }

    // Final clean up
    if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});
    return NextResponse.json({ success: true, data: analysisData, source: 'local' });

  } catch (err: any) {
    if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});
    console.error('[analyze-local] Final error:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}

export const config = { api: { bodyParser: false } };
