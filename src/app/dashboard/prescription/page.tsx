'use client';
import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  FileText, 
  Upload, 
  Search, 
  AlertTriangle, 
  Cpu, 
  Pill, 
  CheckCircle, 
  HelpCircle, 
  Plus, 
  Trash2, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  Heart,
  Briefcase,
  Layers,
  Info
} from 'lucide-react';

interface Medication {
  name: string;
  dosage: string;
  timing: string;
  duration: string;
  purpose: string;
  drugClass: string;
  warnings: string[];
  instructions: string;
}

interface PrescriptionResult {
  medications: Medication[];
  summary: string;
  warnings: string[];
  generalAdvice: string;
  allergyAlert: string | null;
}

type Stage = 'upload' | 'scanning' | 'parsed';

const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }
    if (file.size <= 1.5 * 1024 * 1024) {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_DIM = 1600;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.82
          );
        } else {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

export default function PrescriptionPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('upload');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [result, setResult] = useState<PrescriptionResult | null>(null);
  const [manualText, setManualText] = useState('');
  const [activeWarning, setActiveWarning] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Analyze via API (Python Backend)
  const analyzeFile = useCallback(async (file: File) => {
    setStage('scanning');
    setProgress(10);
    setProgressLabel('Sending to Python Engine...');
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'prescription');

      setProgress(40);
      setProgressLabel('Python extracting text and analyzing (this may take a moment)...');

      const res = await fetch('/api/analyze-local', {
        method: 'POST',
        body: formData,
      });

      setProgress(85);
      setProgressLabel('Parsing results...');

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Analysis failed. Make sure Python and Tesseract are installed.');
      }

      setProgress(100);
      setProgressLabel('Done!');
      const data = json.data as PrescriptionResult;
      setResult(data);
      
      // Save to Supabase
      if (user?.userId) {
        await supabase.from('medical_documents').insert({
          user_id: user.userId,
          name: file.name,
          type: 'prescription',
          analysis_json: data,
          created_at: new Date().toISOString(),
        });
      }

      setStage('parsed');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMsg(err?.message || 'Could not analyze the file. Please try again.');
      setStage('upload');
    }
  }, [user?.userId]);

  // Manual text analysis
  const analyzeManualText = useCallback(async () => {
    if (!manualText.trim()) return;

    setStage('scanning');
    setProgress(20);
    setProgressLabel('Sending text to Python Engine...');
    setErrorMsg(null);

    try {
      // Convert text to a text file blob so the same API route can handle it
      const blob = new Blob([manualText], { type: 'text/plain' });
      const file = new File([blob], 'prescription.txt', { type: 'text/plain' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'prescription');

      setProgress(50);
      setProgressLabel('Parsing medications from text...');

      const res = await fetch('/api/analyze-local', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Analysis failed');
      }

      setProgress(100);
      const data = json.data as PrescriptionResult;
      setResult(data);
      
      // Save to Supabase
      if (user?.userId) {
        await supabase.from('medical_documents').insert({
          user_id: user.userId,
          name: 'Manual Entry',
          type: 'prescription',
          analysis_json: data,
          created_at: new Date().toISOString(),
        });
      }

      setStage('parsed');
    } catch (err: any) {
      console.error('Manual analysis error:', err);
      setErrorMsg(err?.message || 'Could not analyze the text. Please try again.');
      setStage('upload');
    }
  }, [manualText, user?.userId]);

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;
    let fileToUpload = file;
    try {
      fileToUpload = await compressImage(file);
    } catch (e) {
      console.error("Compression failed, using original file:", e);
    }
    const url = URL.createObjectURL(fileToUpload);
    setPreviewUrl(url);
    analyzeFile(fileToUpload);
  }, [analyzeFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      handleFile(file);
    }
  };

  const reset = () => {
    setStage('upload');
    setResult(null);
    setPreviewUrl(null);
    setProgress(0);
    setManualText('');
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const timingColor = (timing: string) => {
    if (/twice|bd|1-0-1/i.test(timing)) return '#1E3A8A';
    if (/thrice|tds|1-1-1/i.test(timing)) return '#B38F5D';
    if (/night|hs|0-0-1/i.test(timing)) return '#0D9488';
    if (/morning|od|1-0-0/i.test(timing)) return '#D97706';
    return '#64748B';
  };

  return (
    <div className="page-fade full-width-mobile" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 850, letterSpacing: '-0.02em', marginBottom: 8, color: '#0F172A' }}>
          <span style={{ background: 'linear-gradient(135deg, #1E3A8A 30%, #B38F5D 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Prescription</span> Understanding
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Upload medication charts — our secure local engine parses handwriting and active alerts.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.85)', padding: '6px 14px', borderRadius: 100, border: '1.5px solid var(--border)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dark)' }}>
            <Cpu className="w-3.5 h-3.5 text-[#0D9488]" />
            <span>Active Tesseract Backend</span>
          </div>
        </div>
      </header>

      {/* Error dialog */}
      {errorMsg && (
        <div style={{ padding: '14px 20px', borderRadius: 16, background: '#FFF0F0', border: '1.5px solid #DC262630', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
          <ShieldAlert className="w-5 h-5 text-[#DC2626]" />
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontWeight: 800, color: 'var(--danger-deep)', fontSize: '0.88rem', marginBottom: 2 }}>Analysis Failed</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--danger-deep)' }}>{errorMsg}</p>
          </div>
          <button onClick={() => setErrorMsg(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--danger-deep)' }}>✕</button>
        </div>
      )}

      {/* Upload Stage */}
      {stage === 'upload' && (
        <div className="grid-2" style={{ gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Drop Zone */}
            <div
              className={`upload-zone animate-fadeInUp ${dragOver ? 'drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                border: '2px dashed var(--border)',
                background: 'rgba(255, 255, 255, 0.65)',
                borderRadius: '20px',
                padding: '48px 32px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s var(--transition)'
              }}
            >
              <input ref={fileInputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFileInput} />
              <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'white', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                <FileText className="w-6 h-6 text-[#B38F5D]" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: 8 }}>Load Prescription</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.85rem', lineHeight: 1.5 }}>
                Drag &amp; drop or click to upload — supports PNG, JPG, or PDF formats.
              </p>
              <button 
                id="btn-upload-prescription" 
                className="btn btn-primary" 
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                style={{ borderRadius: 100, fontWeight: 700 }}
              >
                <Upload className="w-4 h-4" /> Choose File Record
              </button>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: 16, fontWeight: 600 }}>
                Processed fully in private client sandbox
              </p>
            </div>

            {/* Manual Entry */}
            <div style={{ padding: 24, borderRadius: 20, border: '1.5px solid var(--border)', background: 'white', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontWeight: 800, color: 'var(--text-dark)', marginBottom: 4, fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers className="w-4 h-4 text-[#1E3A8A]" /> Manual Transcription Input
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                Type drug lists manually — our OCR fallback parser will interpret clinical dosages.
              </p>
              <textarea
                className="input-field"
                rows={4}
                placeholder={'Amoxicillin 500mg 1-0-1 5 days\nParacetamol 650mg 1-1-1 SOS\nCetirizine 10mg 0-0-1'}
                value={manualText}
                onChange={e => setManualText(e.target.value)}
                style={{ resize: 'vertical', marginBottom: 16, borderRadius: '12px', fontSize: '0.85rem', background: '#F8FAFC' }}
              />
              <button
                className="btn btn-secondary"
                onClick={analyzeManualText}
                disabled={!manualText.trim()}
                style={{ width: '100%', justifyContent: 'center', borderRadius: 100, fontWeight: 700 }}
              >
                <Search className="w-4 h-4" /> Analyze Transcription
              </button>
            </div>
          </div>

          {/* Info Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="glass-card" style={{ padding: 24, background: 'white', border: '1.5px solid var(--border)' }}>
              <h3 style={{ fontWeight: 800, marginBottom: 16, fontSize: '0.95rem', color: 'var(--text-dark)' }}>Workflow Steps</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { step: '1', text: 'Provide physical prescription page image' },
                  { step: '2', text: 'Tesseract OCR runs localized text scan' },
                  { step: '3', text: 'AI clinical entities map active timings' },
                  { step: '4', text: 'System identifies drug alerts and class' },
                  { step: '5', text: 'Safe clinical summary is populated' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', textAlign: 'left' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #1E3A8A, #B38F5D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>{s.step}</div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{s.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card" style={{ padding: 24, background: 'rgba(179,143,93,0.03)', border: '1px solid rgba(179,143,93,0.12)', borderRadius: 20 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#B38F5D', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Info className="w-4 h-4 text-[#B38F5D]" /> Pipeline Overview
              </span>
              <ul style={{ paddingLeft: 16, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.7, listStyleType: 'disc', textAlign: 'left' }}>
                <li>Interprets doctor abbreviations (BD, OD, HS)</li>
                <li>Extracts Indian pharmaceutical brands</li>
                <li>Fully sandboxed personal health record</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Scanning Stage */}
      {stage === 'scanning' && (
        <div className="glass-card animate-fadeInUp" style={{ padding: 48, textAlign: 'center', background: 'white', border: '1.5px solid var(--border)' }}>
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(30, 58, 138, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'pulse 1.8s infinite' }}>
            <Cpu className="w-6 h-6 text-[#1E3A8A]" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: 8 }}>Analyzing Prescription Record</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: '0.88rem' }}>{progressLabel}</p>
          <div style={{ maxWidth: 400, margin: '0 auto', background: 'var(--primary)', borderRadius: 100, height: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 100, background: 'linear-gradient(to right, #1E3A8A, #B38F5D)', width: `${progress}%`, transition: 'width 0.5s ease' }} />
          </div>
          <p style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 700 }}>{progress}% parsing complete</p>
          {previewUrl && (
            <div style={{ marginTop: 24, maxHeight: 180, overflow: 'hidden', borderRadius: 16, border: '1.5px solid var(--border)', maxWidth: 400, margin: '24px auto 0' }}>
              <img src={previewUrl} alt="Prescription Upload" style={{ width: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>
      )}

      {/* Results Stage */}
      {stage === 'parsed' && result && (
        <div className="page-fade" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Allergy alert flag */}
          {result.allergyAlert && (
            <div style={{ padding: '16px 20px', borderRadius: 16, background: '#FFF0F0', border: '1.5px solid #DC262625', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <AlertTriangle className="w-5 h-5 text-[#DC2626] flex-shrink-0" />
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontWeight: 800, color: 'var(--danger-deep)', fontSize: '0.9rem', marginBottom: 2 }}>Clinical Allergy Alert</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--danger-deep)', lineHeight: 1.5 }}>{result.allergyAlert}</p>
              </div>
            </div>
          )}

          {/* Metric parameters summary */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: 12 }}>
              {[
                { label: 'Active Drugs', value: result.medications.length, icon: <Pill className="w-4 h-4 text-[#1E3A8A]" /> },
                { label: 'Alert Highlights', value: result.warnings.length, icon: <AlertTriangle className="w-4 h-4 text-[#D97706]" /> },
                { label: 'OCR Pipeline', value: 'Sandbox', icon: <Cpu className="w-4 h-4 text-[#0D9488]" /> },
              ].map((s, i) => (
                <div key={i} className="glass-card" style={{ padding: '14px 24px', textAlign: 'center', minWidth: 130, background: 'white', border: '1.5px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div>{s.icon}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 850, color: 'var(--text-dark)' }}>{s.value}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-light)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {previewUrl && (
                <img src={previewUrl} alt="Prescription Thumbnail" style={{ height: 56, width: 56, borderRadius: 10, border: '1px solid var(--border)', objectFit: 'cover' }} />
              )}
              <button className="btn btn-secondary btn-sm" onClick={reset} style={{ borderRadius: 100, fontWeight: 700, border: '1px solid var(--border)' }}>↩ Upload Another</button>
            </div>
          </div>

          {/* Clinical summary block */}
          <div className="glass-card" style={{ padding: 24, background: 'rgba(179,143,93,0.03)', border: '1px solid rgba(179,143,93,0.12)', borderRadius: 20 }}>
            <p style={{ fontWeight: 800, marginBottom: 8, color: '#B38F5D', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'left' }}>
              <Heart className="w-4 h-4 text-[#B38F5D]" /> Local Clinical Overview
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dark)', lineHeight: 1.65, textAlign: 'left' }}>{result.summary}</p>
          </div>

          {/* Medications list detected */}
          {result.medications && result.medications.length > 0 ? (
            <div className="glass-card" style={{ padding: 28, background: 'white', border: '1.5px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 20, color: 'var(--text-dark)', textAlign: 'left' }}>💊 Detected Medications</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {result.medications.map((med, i) => (
                  <div key={i} style={{ padding: 20, borderRadius: 16, background: '#F8FAFC', border: '1px solid rgba(226, 232, 240, 0.8)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(to bottom, #1E3A8A, #B38F5D)' }} />
                    <div style={{ paddingLeft: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-dark)' }}>{med.name}</span>
                          <span style={{ marginLeft: 10, fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{med.drugClass}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {med.dosage && med.dosage !== 'As prescribed' && (
                            <span className="badge badge-blue" style={{ fontWeight: 700 }}>{med.dosage}</span>
                          )}
                          <span style={{ padding: '4px 12px', borderRadius: 100, background: `${timingColor(med.timing)}12`, color: timingColor(med.timing), fontSize: '0.72rem', fontWeight: 800 }}>
                            {med.timing}
                          </span>
                          <span className="badge badge-green" style={{ fontWeight: 700 }}>{med.duration}</span>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 10, textAlign: 'left' }}>
                        <strong>Diagnostic Purpose:</strong> {med.purpose}
                      </p>

                      <p style={{ fontSize: '0.8rem', color: 'var(--secondary-deep)', background: 'rgba(13, 148, 136, 0.04)', border: '1px solid rgba(13, 148, 136, 0.08)', padding: '10px 14px', borderRadius: 10, marginBottom: 12, textAlign: 'left' }}>
                        📌 <strong>Instructions:</strong> {med.instructions}
                      </p>

                      {med.warnings && med.warnings.length > 0 && (
                        <div style={{ textAlign: 'left' }}>
                          <button
                            onClick={() => setActiveWarning(activeWarning === i ? null : i)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--danger-deep)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit', padding: 0 }}
                          >
                            <ShieldAlert className="w-3.5 h-3.5" /> {med.warnings.length} clinical alert{med.warnings.length > 1 ? 's' : ''} {activeWarning === i ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                          {activeWarning === i && (
                            <ul style={{ marginTop: 8, paddingLeft: 20, fontSize: '0.8rem', color: 'var(--danger-deep)', listStyleType: 'disc', lineHeight: 1.5 }}>
                              {med.warnings.map((w, j) => <li key={j} style={{ marginBottom: 4 }}>{w}</li>)}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center', background: 'white', border: '1.5px solid var(--border)' }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(220, 38, 38, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
              </div>
              <p style={{ fontWeight: 800, color: 'var(--text-dark)' }}>No medications parsed</p>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginTop: 6, maxWidth: 300, margin: '6px auto 0' }}>
                The uploaded page may be too low contrast. Try writing in manual mode above or providing a higher resolution file.
              </p>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 18, borderRadius: 100, fontWeight: 700 }} onClick={reset}>
                Try Scanning Again
              </button>
            </div>
          )}

          {/* Safe key warnings */}
          {result.warnings && result.warnings.length > 0 && (
            <div className="glass-card" style={{ padding: 24, background: 'rgba(217, 119, 6, 0.03)', border: '1px solid rgba(217, 119, 6, 0.12)', borderRadius: 20 }}>
              <h3 style={{ fontWeight: 800, marginBottom: 14, fontSize: '0.92rem', color: '#D97706', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'left' }}>
                <ShieldAlert className="w-4 h-4 text-[#D97706]" /> Key Clinical Exclusions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                {result.warnings.map((w, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.82rem', color: 'var(--text-dark)', lineHeight: 1.5 }}>
                    <span style={{ color: '#D97706', fontWeight: 800 }}>•</span>
                    {w}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advice details */}
          {result.generalAdvice && (
            <div className="glass-card" style={{ padding: 20, background: 'white', border: '1.5px solid var(--border)', textAlign: 'left' }}>
              <p style={{ fontWeight: 800, color: 'var(--text-dark)', marginBottom: 6, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Briefcase className="w-4 h-4 text-[#1E3A8A]" /> Professional Advice
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{result.generalAdvice}</p>
            </div>
          )}

          <div style={{ padding: '12px 20px', borderRadius: 12, background: 'rgba(30, 58, 138, 0.03)', border: '1px solid rgba(30, 58, 138, 0.08)', fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <Info className="w-4 h-4 text-[#1E3A8A] flex-shrink-0" />
            <span>This report is an automated parsing analysis. Do not adjust prescribed medication dosages without authentic clinician oversight.</span>
          </div>
        </div>
      )}
    </div>
  );
}
