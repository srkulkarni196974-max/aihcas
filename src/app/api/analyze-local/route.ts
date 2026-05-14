import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { parsePrescriptionText } from '@/lib/prescription-parser';
import { parseReportText } from '@/lib/report-parser';
import Tesseract from 'tesseract.js';

export async function POST(req: NextRequest) {
  let tempFilePath = '';
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as 'prescription' | 'report' | null;

    if (!type || !file) {
      return NextResponse.json({ error: 'Missing type or file' }, { status: 400 });
    }

    // Save file to a temporary location
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split('.').pop() || 'jpg';
    const tempDir = os.tmpdir();
    tempFilePath = path.join(tempDir, `upload_${Date.now()}.${ext}`);
    await fs.writeFile(tempFilePath, buffer);

    // 1. Try Python first (Works great for Digital PDFs)
    const scriptPath = path.join(process.cwd(), 'src', 'scripts', 'analyzer.py');
    
    const pythonResult = await new Promise((resolve) => {
      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
      const pythonProcess = spawn(pythonCmd, [scriptPath, tempFilePath, type]);
      
      let dataString = '';
      pythonProcess.stdout.on('data', (data) => { dataString += data.toString(); });
      pythonProcess.on('close', (code) => {
        try {
          resolve(JSON.parse(dataString));
        } catch (e) {
          resolve({ error: 'Python OCR failed or not installed', extracted_text: dataString });
        }
      });
    }) as any;

    let extractedText = pythonResult.extracted_text || '';
    
    // 2. If Python failed to find Tesseract (Common on Render), use Tesseract.js (Works 100%)
    const needsTesseractFallback = extractedText.includes('pytesseract') || 
                                   extractedText.includes('tesseract is not installed') ||
                                   (type === 'prescription' && extractedText.length < 10);

    if (needsTesseractFallback && !tempFilePath.toLowerCase().endsWith('.pdf')) {
      console.log('[analyze-local] Python Tesseract missing. Falling back to Tesseract.js...');
      const ocrResult = await Tesseract.recognize(tempFilePath, 'eng');
      extractedText = ocrResult.data.text;
    }

    // 3. Process with your "previously used" TypeScript Parsers
    let analysisData;
    if (type === 'prescription') {
      analysisData = parsePrescriptionText(extractedText);
    } else {
      analysisData = parseReportText(extractedText);
    }

    // Clean up
    if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});

    return NextResponse.json({ success: true, data: analysisData });

  } catch (err: any) {
    if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});
    console.error('[analyze-local] Final error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const config = { api: { bodyParser: false } };
