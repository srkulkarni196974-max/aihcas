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

    // Call Python script
    const scriptPath = path.join(process.cwd(), 'src', 'scripts', 'analyzer.py');

    const result = await new Promise((resolve, reject) => {
      // Use python3 on Linux (Render) and python on Windows
      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
      const pythonProcess = spawn(pythonCmd, [scriptPath, tempFilePath, type]);

      let dataString = '';
      let errorString = '';

      pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
      });

      pythonProcess.on('close', (code) => {
        // Clean up temp file
        fs.unlink(tempFilePath).catch(console.error);

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
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const config = { api: { bodyParser: false } };
