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

    // ─── Cloud Fallback Logic (ONLY for Prescription) ─────────────────────────
    // If local OCR fails for a prescription (common on Render due to Tesseract missing), 
    // we use Gemini as a seamless fallback. We do NOT change this for reports as requested.
    const isOCRError = extractedText.includes('tesseract is not installed') || 
                       extractedText.includes('OCR Error') ||
                       extractedText.length < 5;

    if (type === 'prescription' && isOCRError) {
      console.log('[analyze-local] Local OCR failed for prescription. Falling back to Gemini...');
      
      try {
        const genAI = new (require('@google/generative-ai').GoogleGenerativeAI)(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        const fileBuffer = await fs.readFile(tempFilePath);
        const base64 = fileBuffer.toString('base64');
        
        const prompt = "You are an expert clinical pharmacist. Analyze this prescription image and return a JSON object with medications, dosages, timings, duration, purpose, drugClass, warnings, and instructions. Return ONLY raw JSON.";

        const geminiResult = await model.generateContent([
          prompt,
          { inlineData: { data: base64, mimeType: `image/${ext}` } }
        ]);

        const responseText = geminiResult.response.text().replace(/```json|```/g, '').trim();
        const parsedData = JSON.parse(responseText);

        return NextResponse.json({ success: true, data: parsedData, source: 'cloud-fallback' });
      } catch (geminiErr) {
        console.error('[analyze-local] Cloud Fallback also failed:', geminiErr);
        throw new Error('Analysis failed. Please ensure the prescription image is clear and readable.');
      }
    }
    
    // ─── Standard Logic (Used for Reports and successful Prescription OCR) ─────
    let analysisData;
    if (type === 'prescription') {
      analysisData = parsePrescriptionText(extractedText);
    } else {
      // This path remains exactly as it was for report analysis
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
