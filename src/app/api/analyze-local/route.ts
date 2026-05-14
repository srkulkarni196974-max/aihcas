import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ─── Prompts (for Gemini fallback) ────────────────────────────────────────────

const PRESCRIPTION_PROMPT = `
You are an expert clinical pharmacist. Analyze this prescription and return JSON:
{
  "medications": [{"name": "Name", "dosage": "...", "timing": "...", "duration": "...", "purpose": "...", "drugClass": "...", "warnings": [], "instructions": "..."}],
  "summary": "...",
  "warnings": [],
  "generalAdvice": "...",
  "allergyAlert": null
}
`.trim();

const REPORT_PROMPT = `
You are an expert clinical pathologist. Analyze this lab report and return JSON:
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
  const result = await model.generateContent([prompt, { inlineData: { data: base64, mimeType: file.type || 'image/jpeg' } }]);
  const cleaned = result.response.text().replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  return JSON.parse(cleaned);
}

// ─── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let tempFilePath: string | null = null;
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as 'prescription' | 'report' | null;

    if (!type || !file) return NextResponse.json({ error: 'Missing type or file' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}.${file.name.split('.').pop() || 'jpg'}`);
    await fs.writeFile(tempFilePath, Buffer.from(bytes));

    const scriptPath = path.join(process.cwd(), 'src', 'scripts', 'analyzer.py');
    const isWindows = process.platform === 'win32';
    const primaryCmd = isWindows ? 'python' : 'python3';
    
    const runPython = (cmd: string) => new Promise((resolve, reject) => {
      const py = spawn(cmd, [scriptPath, tempFilePath!, type]);
      let out = '', err = '';
      py.stdout.on('data', d => out += d);
      py.stderr.on('data', d => err += d);
      py.on('close', code => {
        if (code !== 0) return reject(new Error(err || `Exit ${code}`));
        try { resolve(JSON.parse(out)); } catch { reject(new Error('JSON Parse Error')); }
      });
    });

    let data: any = null;
    let engine = 'python';

    try {
      data = await runPython(primaryCmd);
    } catch (pyErr: any) {
      console.warn('Python failed:', pyErr.message);
      if (GEMINI_API_KEY) {
        data = await analyzeWithGemini(file, type);
        engine = 'gemini';
      } else {
        throw pyErr;
      }
    }

    if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});
    return NextResponse.json({ success: true, data, engine });

  } catch (err: any) {
    if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const config = { api: { bodyParser: false } };
