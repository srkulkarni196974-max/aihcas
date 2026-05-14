import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import Tesseract from 'tesseract.js';
import { parsePrescriptionText } from '@/lib/prescription-parser';
import { parseReportText } from '@/lib/report-parser';

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
    
    // 1. Try Tesseract.js (Node-native, works on Render/Mobile)
    console.log('[analyze-local] Starting Tesseract.js OCR...');
    let extractedText = '';
    
    try {
      const { data: { text } } = await Tesseract.recognize(buffer, 'eng', {
        logger: m => console.log(m.status, (m.progress * 100).toFixed(2) + '%')
      });
      extractedText = text;
      console.log('[analyze-local] Tesseract.js OCR complete.');
    } catch (nodeOcrErr: any) {
      console.error('[analyze-local] Tesseract.js failed, falling back to Python...', nodeOcrErr.message);
      
      // 2. Fallback to Python (if Tesseract.js fails or if special processing is needed)
      const ext = file.name.split('.').pop() || 'jpg';
      const tempDir = os.tmpdir();
      tempFilePath = path.join(tempDir, `upload_${Date.now()}.${ext}`);
      await fs.writeFile(tempFilePath, buffer);

      const scriptPath = path.join(process.cwd(), 'src', 'scripts', 'analyzer.py');
      
      const runPython = (cmd: string) => new Promise((resolve, reject) => {
        const pythonProcess = spawn(cmd, [scriptPath, tempFilePath, type]);
        let dataString = '';
        let errorString = '';

        pythonProcess.stdout.on('data', (data) => { dataString += data.toString(); });
        pythonProcess.stderr.on('data', (data) => { errorString += data.toString(); });

        pythonProcess.on('error', (err) => { reject(err); });

        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            reject(new Error(errorString || `Process exited with code ${code}`));
            return;
          }
          try {
            resolve(JSON.parse(dataString));
          } catch (e) {
            reject(new Error('Failed to parse Python output.'));
          }
        });
      });

      let pyResult: any;
      try {
        pyResult = await runPython('python3');
      } catch (err3: any) {
        try {
          pyResult = await runPython('python');
        } catch (err: any) {
          throw new Error(`AI Engine Error: Both Tesseract.js and Python OCR failed. ${err.message}`);
        }
      }
      
      if (pyResult.error) throw new Error(pyResult.error);
      extractedText = pyResult.extracted_text || '';
    }

    if (tempFilePath) {
      await fs.unlink(tempFilePath).catch(console.error);
    }

    if (!extractedText || extractedText.trim().length < 5) {
      throw new Error("Could not extract enough text from the document. Please ensure the image is clear.");
    }

    let analysisData;
    if (type === 'prescription') {
      analysisData = parsePrescriptionText(extractedText);
    } else {
      analysisData = parseReportText(extractedText);
    }

    return NextResponse.json({ success: true, data: analysisData });

  } catch (err: any) {
    if (tempFilePath) {
      await fs.unlink(tempFilePath).catch(console.error);
    }
    console.error('[analyze-local] Final error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const config = { api: { bodyParser: false } };

