'use client';
import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';


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
  // ─── Analyze via API (Python Backend) ───────────────────────────────────────────────
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


  // ─── Manual text analysis (create a text blob) ────────────────
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


  const handleFile = useCallback((file: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    analyzeFile(file);
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
    if (/twice|bd|1-0-1/i.test(timing)) return '#4DA6E8';
    if (/thrice|tds|1-1-1/i.test(timing)) return '#7C5CFC';
    if (/night|hs|0-0-1/i.test(timing)) return '#2EC4A0';
    if (/morning|od|1-0-0/i.test(timing)) return '#F59E0B';
    return '#9CA3AF';
  };

  return (
    <div className="page-fade" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 8 }}>
          <span className="text-gradient">Prescription</span> Analysis
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: 'var(--text-muted)' }}>
            Upload a prescription image — Our AI reads and interprets every medication accurately.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.5)', padding: '6px 14px', borderRadius: 100, border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
              🐍 Powered by Python
            </span>
          </div>
        </div>
      </header>

      {/* Error banner */}
      {errorMsg && (
        <div style={{ padding: '14px 20px', borderRadius: 14, background: 'rgba(229,62,62,0.08)', border: '1.5px solid rgba(229,62,62,0.3)', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--danger-deep)', marginBottom: 2 }}>Analysis Failed</p>
            <p style={{ fontSize: '0.87rem', color: 'var(--danger-deep)' }}>{errorMsg}</p>
          </div>
          <button onClick={() => setErrorMsg(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--danger-deep)' }}>✕</button>
        </div>
      )}

      {/* Upload Stage */}
      {stage === 'upload' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Drop Zone */}
            <div
              className={`upload-zone animate-fadeInUp ${dragOver ? 'drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{ cursor: 'pointer' }}
            >
              <input ref={fileInputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFileInput} />
              <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>📋</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>Upload Prescription</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: '0.9rem' }}>
                Drag &amp; drop or click — supports JPG, PNG, PDF and even handwritten prescriptions
              </p>
              <button id="btn-upload-prescription" className="btn btn-primary" style={{ pointerEvents: 'none' }}>
                📁 Select File
              </button>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: 12 }}>
                Processed offline on your device via Python
              </p>
            </div>

            {/* Manual Input */}
            <div style={{ padding: 24, borderRadius: 20, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.7)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 4, fontSize: '1rem' }}>
                ✏️ Or type prescription text manually
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                Type drug names, dosages, and timings — Python Engine will interpret them.
              </p>
              <textarea
                className="input-field"
                rows={4}
                placeholder={'e.g.\nAmoxicillin 500mg 1-0-1 5 days\nParacetamol 650mg 1-1-1 SOS\nCetirizine 10mg 0-0-1'}
                value={manualText}
                onChange={e => setManualText(e.target.value)}
                style={{ resize: 'vertical', marginBottom: 12 }}
              />
              <button
                className="btn btn-secondary"
                onClick={analyzeManualText}
                disabled={!manualText.trim()}
              >
                🔍 Analyze Text
              </button>
            </div>
          </div>

          {/* Info Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="glass-card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.95rem' }}>🔍 How It Works</h3>
              {[
                { step: '1', text: 'Upload prescription image or PDF' },
                { step: '2', text: 'AI Vision reads text & context' },
                { step: '3', text: 'Medications extracted with dosage & timing' },
                { step: '4', text: 'Drug class, warnings & instructions shown' },
                { step: '5', text: 'AI clinical summary generated' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #4DA6E8, #7C5CFC)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>{s.step}</div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.text}</span>
                </div>
              ))}
            </div>
            <div className="glass-card" style={{ padding: 20, background: 'rgba(124,92,252,0.06)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7C5CFC' }}>🐍 Powered by Python</span>
              <ul style={{ paddingLeft: 16, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                <li>Reads handwritten prescriptions accurately</li>
                <li>Understands doctor shorthand (OD, BD, TDS…)</li>
                <li>Identifies Indian brand names</li>
                <li>Fully offline and private</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Scanning Stage */}
      {stage === 'scanning' && (
        <div className="glass-card animate-fadeInUp" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 24, animation: 'pulse 1.5s infinite' }}>🐍</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>Python Engine Scanning</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>{progressLabel}</p>
          <div style={{ maxWidth: 400, margin: '0 auto', background: 'var(--primary)', borderRadius: 100, height: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 100, background: 'linear-gradient(to right, #4DA6E8, #7C5CFC)', width: `${progress}%`, transition: 'width 0.5s ease' }} />
          </div>
          <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-light)' }}>{progress}% complete</p>
          {previewUrl && (
            <div style={{ marginTop: 24, maxHeight: 200, overflow: 'hidden', borderRadius: 12, border: '1px solid var(--border)' }}>
              <img src={previewUrl} alt="Prescription" style={{ width: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>
      )}

      {/* Results Stage */}
      {stage === 'parsed' && result && (
        <div className="page-fade" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Allergy Alert */}
          {result.allergyAlert && (
            <div style={{ padding: '18px 24px', borderRadius: 16, background: '#FFF0F0', border: '2px solid var(--danger-deep)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
              <div>
                <p style={{ fontWeight: 800, color: 'var(--danger-deep)', marginBottom: 4 }}>Allergy Alert</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--danger-deep)' }}>{result.allergyAlert}</p>
              </div>
            </div>
          )}

          {/* Top bar */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: 12 }}>
              {[
                { label: 'Medications Found', value: result.medications.length, icon: '💊' },
                { label: 'Warnings', value: result.warnings.length, icon: '⚠️' },
                { label: 'Analysis', value: 'Python', icon: '🐍' },
              ].map((s, i) => (
                <div key={i} className="glass-card" style={{ padding: '14px 20px', textAlign: 'center', minWidth: 120 }}>
                  <div style={{ fontSize: '1.2rem' }}>{s.icon}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{s.value}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {previewUrl && (
                <img src={previewUrl} alt="Prescription" style={{ height: 60, borderRadius: 10, border: '1px solid var(--border)', objectFit: 'cover' }} />
              )}
              <button className="btn btn-secondary btn-sm" onClick={reset}>↩ Upload Another</button>
            </div>
          </div>

          {/* Summary */}
          <div className="glass-card" style={{ padding: 20, background: 'rgba(124,92,252,0.06)', border: '1px solid rgba(124,92,252,0.15)' }}>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>🐍 Python Clinical Summary</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-dark)', lineHeight: 1.65 }}>{result.summary}</p>
          </div>

          {/* Medications */}
          {result.medications && result.medications.length > 0 ? (
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 20 }}>💊 Medications Detected</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {result.medications.map((med, i) => (
                  <div key={i} style={{ padding: 20, borderRadius: 16, background: 'white', border: '1.5px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(to bottom, #4DA6E8, #7C5CFC)', borderRadius: '4px 0 0 4px' }} />
                    <div style={{ paddingLeft: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                        <div>
                          <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>{med.name}</span>
                          <span style={{ marginLeft: 8, fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 600 }}>{med.drugClass}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {med.dosage && med.dosage !== 'As prescribed' && (
                            <span className="badge badge-blue">{med.dosage}</span>
                          )}
                          <span style={{ padding: '4px 12px', borderRadius: 100, background: `${timingColor(med.timing)}22`, color: timingColor(med.timing), fontSize: '0.78rem', fontWeight: 700 }}>
                            {med.timing}
                          </span>
                          <span className="badge badge-green">{med.duration}</span>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                        <strong>For:</strong> {med.purpose}
                      </p>

                      <p style={{ fontSize: '0.85rem', color: '#178A6A', background: '#E6FFF5', padding: '8px 12px', borderRadius: 8, marginBottom: 10 }}>
                        📌 {med.instructions}
                      </p>

                      {med.warnings && med.warnings.length > 0 && (
                        <div>
                          <button
                            onClick={() => setActiveWarning(activeWarning === i ? null : i)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--danger-deep)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit', padding: 0 }}
                          >
                            ⚠️ {med.warnings.length} warning{med.warnings.length > 1 ? 's' : ''} {activeWarning === i ? '▲' : '▼'}
                          </button>
                          {activeWarning === i && (
                            <ul style={{ marginTop: 8, paddingLeft: 20, fontSize: '0.83rem', color: 'var(--danger-deep)' }}>
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
            <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
              <p style={{ fontWeight: 600 }}>No medications detected</p>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: 6 }}>
                The image may be too blurry. Try a clearer photo or use manual text entry.
              </p>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={reset}>
                Try Again
              </button>
            </div>
          )}

          {/* Warnings */}
          {result.warnings && result.warnings.length > 0 && (
            <div className="glass-card" style={{ padding: 24, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: '1rem' }}>⚠️ Key Warnings for This Prescription</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.warnings.map((w, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.87rem', color: 'var(--text-dark)' }}>
                    <span style={{ color: '#F59E0B', flexShrink: 0 }}>•</span>
                    {w}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General Advice */}
          {result.generalAdvice && (
            <div className="glass-card" style={{ padding: 20 }}>
              <p style={{ fontWeight: 700, marginBottom: 6 }}>📋 General Advice</p>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{result.generalAdvice}</p>
            </div>
          )}

          <div style={{ padding: '12px 20px', borderRadius: 12, background: 'rgba(229,62,62,0.05)', border: '1px solid rgba(229,62,62,0.1)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            ⚕️ This analysis is generated by AI/OCR. Always follow your doctor's exact instructions. Do not modify dosages based on AI output alone.
          </div>
        </div>
      )}
    </div>
  );
}
