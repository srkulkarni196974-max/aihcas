import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ─── Prompts (for Gemini fallback) ────────────────────────────────────────────

const PRESCRIPTION_PROMPT = `
You are an expert clinical pharmacist. Analyze this prescription image and return EXACT JSON:
{
  "medications": [{"name": "Name", "dosage": "...", "timing": "...", "duration": "...", "purpose": "...", "drugClass": "...", "warnings": [], "instructions": "..."}],
  "summary": "...",
  "warnings": [],
  "generalAdvice": "...",
  "allergyAlert": null
}
`.trim();

const REPORT_PROMPT = `
You are an expert clinical pathologist. Analyze this lab report image and return EXACT JSON:
{
  "results": [{"name": "...", "value": 0, "unit": "...", "range": [0,0], "status": "normal/high/low", "interpretation": "...", "category": "..."}],
  "summary": "...",
  "risks": [],
  "recommendations": [],
  "alerts": [],
  "urgency": "routine/soon/urgent"
}
`.trim();

async function analyzeWithGemini(file: File, type: 'prescription' | 'report') {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');
  
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = type === 'prescription' ? PRESCRIPTION_PROMPT : REPORT_PROMPT;
  
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');
  
  const result = await model.generateContent([
    prompt, 
    { inlineData: { data: base64, mimeType: file.type || 'image/jpeg' } }
  ]);
  
  const raw = result.response.text();
  const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  return JSON.parse(cleaned);
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

    const bytes = await file.arrayBuffer();
    const ext = file.name.split('.').pop() || 'jpg';
    tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}.${ext}`);
    await fs.writeFile(tempFilePath, Buffer.from(bytes));

    const scriptPath = path.join(process.cwd(), 'src', 'scripts', 'analyzer.py');
    const isWindows = process.platform === 'win32';
    const primaryCmd = isWindows ? 'python' : 'python3';
    
    const runPython = (cmd: string) => new Promise((resolve, reject) => {
      console.log(`[analyze-local] Spawning ${cmd} with script ${scriptPath}`);
      const py = spawn(cmd, [scriptPath, tempFilePath!, type], {
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
      });
      
      let out = '', err = '';
      py.stdout.on('data', d => { out += d.toString(); });
      py.stderr.on('data', d => { err += d.toString(); });
      
      py.on('error', e => reject(e));
      
      py.on('close', code => {
        if (code !== 0) {
          return reject(new Error(err || `Python exited with code ${code}`));
        }
        try {
          // Find the last line of output in case there's debug text
          const lines = out.trim().split('\n');
          const lastLine = lines[lines.length - 1];
          resolve(JSON.parse(lastLine));
        } catch (parseErr) {
          console.error('[analyze-local] Parse Error. Raw Output:', out);
          reject(new Error('Python output was not valid JSON. Check logs.'));
        }
      });
    });

    let analysisData: any = null;
    let usedEngine = 'python';

    try {
      analysisData = await runPython(primaryCmd);
    } catch (pyErr: any) {
      console.warn('[analyze-local] Python failed:', pyErr.message);
      
      // Secondary attempt with 'python' if primary was 'python3'
      if (!isWindows) {
        try {
          analysisData = await runPython('python');
        } catch {
          // Fallback to Gemini
        }
      }

      if (!analysisData && GEMINI_API_KEY) {
        console.log('[analyze-local] Falling back to Gemini AI...');
        try {
          analysisData = await analyzeWithGemini(file, type);
          usedEngine = 'gemini';
        } catch (geminiErr: any) {
          throw new Error(`Both engines failed. Python: ${pyErr.message} | Gemini: ${geminiErr.message}`);
        }
      } else if (!analysisData) {
        throw pyErr;
      }
    }

    if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});
    return NextResponse.json({ success: true, data: analysisData, engine: usedEngine });

  } catch (err: any) {
    console.error('[analyze-local] Route Error:', err);
    if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const config = { api: { bodyParser: false } };
