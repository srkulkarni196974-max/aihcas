import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { parsePrescriptionText } from '@/lib/prescription-parser';
import { parseReportText } from '@/lib/report-parser';

export async function POST(req: NextRequest) {
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
    
    // Create a temporary file with the correct extension
    const ext = file.name.split('.').pop() || 'jpg';
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `upload_${Date.now()}.${ext}`);
    
    await fs.writeFile(tempFilePath, buffer);

    // Call Python script - Try python3 first (common on Render/Linux), then python
    const scriptPath = path.join(process.cwd(), 'src', 'scripts', 'analyzer.py');
    
    const runPython = (cmd: string) => new Promise((resolve, reject) => {
      const pythonProcess = spawn(cmd, [scriptPath, tempFilePath, type]);
      
      let dataString = '';
      let errorString = '';

      pythonProcess.stdout.on('data', (data) => { dataString += data.toString(); });
      pythonProcess.stderr.on('data', (data) => { errorString += data.toString(); });

      pythonProcess.on('error', (err) => {
        reject(err);
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(errorString || `Process exited with code ${code}`));
          return;
        }
        try {
          resolve(JSON.parse(dataString));
        } catch (e) {
          reject(new Error('Failed to parse Python output. Is Tesseract installed?'));
        }
      });
    });

    let result;
    try {
      // Try python3 first
      result = await runPython('python3');
    } catch (err3: any) {
      console.log('python3 failed, trying python...', err3.message);
      try {
        // Fallback to python
        result = await runPython('python');
      } catch (err: any) {
        // Clean up temp file
        await fs.unlink(tempFilePath).catch(console.error);
        throw new Error(`AI Engine Error: Could not find python3 or python on server. Error: ${err.message}`);
      }
    }

    // Clean up temp file
    await fs.unlink(tempFilePath).catch(console.error);


    const typedResult = result as any;
    
    if (typedResult.error) {
      throw new Error(typedResult.error);
    }
    
    const extractedText = typedResult.extracted_text || '';
    
    if (extractedText.startsWith('[Image OCR Error:') || extractedText.startsWith('[PDF Extraction Error:')) {
       throw new Error(extractedText);
    }
    
    let analysisData;
    
    if (type === 'prescription') {
      analysisData = parsePrescriptionText(extractedText);
    } else {
      analysisData = parseReportText(extractedText);
    }

    return NextResponse.json({ success: true, data: analysisData });

  } catch (err: any) {
    console.error('[analyze-local] Final error:', err);
    let msg = err?.message || 'Internal server error';
    if (msg.includes('python') || msg.includes('Tesseract')) {
      msg = "Server Configuration Error: Tesseract OCR or Python is not installed on the production server. Please use manual entry for now.";
    }
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }

}

export const config = { api: { bodyParser: false } };
