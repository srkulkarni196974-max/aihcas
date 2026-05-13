'use client';
import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';


interface ReportResult {
  name: string;
  value: number;
  unit: string;
  range: [number, number];
  status: 'normal' | 'high' | 'low';
  interpretation: string;
  category?: string;
}

interface AnalysisResult {
  summary: string;
  risks: string[];
  recommendations: string[];
  results: ReportResult[];
  alerts: string[];
  urgency: 'routine' | 'soon' | 'urgent';
}

const urgencyConfig = {
  routine: { color: '#2EC4A0', bg: 'rgba(46,196,160,0.08)', label: '✅ Routine Follow-up' },
  soon:    { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', label: '🟡 See Doctor Soon' },
  urgent:  { color: '#E53E3E', bg: 'rgba(229,62,62,0.08)',  label: '🔴 Urgent Attention' },
};

export default function ReportsPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<'upload' | 'scanning' | 'results'>('upload');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // ─── Analyze via API (Python Backend) ───────────────────────────────────────────────
  const analyzeFile = useCallback(async (file: File) => {
    setStage('scanning');
    setProgress(10);
    setProgressLabel('Sending to Python Engine...');
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'report');

      setProgress(40);
      setProgressLabel('Python & Tesseract extracting lab values (this may take a moment)...');

      const res = await fetch('/api/analyze-local', {
        method: 'POST',
        body: formData,
      });

      setProgress(85);
      setProgressLabel('Parsing local results...');

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Analysis failed. Make sure Python and Tesseract are installed.');
      }

      setProgress(100);
      setProgressLabel('Done!');
      const data = json.data as AnalysisResult;
      setAnalysisResult(data);
      
      // Save to Supabase
      if (user?.userId) {
        await supabase.from('medical_documents').insert({
          user_id: user.userId,
          name: file.name,
          type: 'report',
          analysis_json: data,
          created_at: new Date().toISOString(),
        });
      }

      setStage('results');
    } catch (err: any) {
      console.error('OCR error:', err);
      setErrorMsg(err?.message || 'Could not analyze. Check if Python and Tesseract are working.');
      setStage('upload');
    }
  }, [user?.userId]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    analyzeFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      analyzeFile(file);
    }
  };

  const reset = () => {
    setStage('upload');
    setAnalysisResult(null);
    setPreviewUrl(null);
    setProgress(0);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const urgency = analysisResult ? urgencyConfig[analysisResult.urgency] ?? urgencyConfig.routine : null;

  // Group results by category
  const groupedResults = analysisResult?.results.reduce<Record<string, ReportResult[]>>((acc, r) => {
    const cat = r.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(r);
    return acc;
  }, {}) ?? {};

  return (
    <div className="page-fade" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 8 }}>
          <span className="text-gradient">Report</span> Analysis
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: 'var(--text-muted)' }}>
            Upload any medical lab report — Our AI extracts and interprets every parameter accurately.
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
        <div className="grid-2">
          <div
            className="upload-zone animate-fadeInUp"
            style={{ padding: '64px 32px', textAlign: 'center', cursor: 'pointer' }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="image/*,.pdf"
            />
            <div style={{ fontSize: '4.5rem', marginBottom: 24 }}>📊</div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 12 }}>Upload Medical Report</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: '1.05rem' }}>
              Blood test, CBC, Glucose, Thyroid, LFT, KFT, Lipid profile and more
            </p>
            <button className="btn btn-primary btn-lg" style={{ width: '100%', maxWidth: 280, pointerEvents: 'none' }}>
              Select File
            </button>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: 16 }}>
              Processed entirely offline on your device via Python
            </p>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="glass-card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.95rem' }}>📋 Supported Reports</h3>
              {['Complete Blood Count (CBC)', 'Blood Glucose / HbA1c', 'Liver Function Test (LFT)', 'Kidney Function Test (KFT)', 'Thyroid (TSH, T3, T4)', 'Lipid Profile', 'Vitamin D / B12', 'Urine Routine'].map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: '#2EC4A0', fontWeight: 700 }}>✓</span> {r}
                </div>
              ))}
            </div>
            <div className="glass-card" style={{ padding: 20, background: 'rgba(124,92,252,0.06)' }}>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>✨ AI Advantages</p>
              <ul style={{ paddingLeft: 16, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                <li>Reads all values & reference ranges</li>
                <li>Flags high/low/critical values</li>
                <li>Groups by test category</li>
                <li>Gives actionable recommendations</li>
                <li>Works with scanned or photo reports</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Scanning Stage */}
      {stage === 'scanning' && (
        <div className="glass-card animate-fadeInUp" style={{ padding: 64, textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 24, animation: 'pulse 1.5s infinite' }}>🐍</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>Python Engine Scanning</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>{progressLabel}</p>
          <div style={{ maxWidth: 400, margin: '0 auto', background: 'var(--primary)', borderRadius: 100, height: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 100, background: 'linear-gradient(to right, #4DA6E8, #7C5CFC)', width: `${progress}%`, transition: 'width 0.5s ease' }} />
          </div>
          <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-light)' }}>{progress}% complete</p>
          {previewUrl && (
            <div style={{ marginTop: 24, maxHeight: 200, overflow: 'hidden', borderRadius: 12, border: '1px solid var(--border)' }}>
              <img src={previewUrl} alt="Report" style={{ width: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>
      )}

      {/* Results Stage */}
      {stage === 'results' && analysisResult && urgency && (
        <div className="page-fade" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Critical Alerts */}
          {analysisResult.alerts && analysisResult.alerts.length > 0 && (
            <div style={{ padding: '18px 24px', borderRadius: 16, background: 'rgba(229,62,62,0.08)', border: '2px solid rgba(229,62,62,0.35)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem' }}>🚨</span>
              <div>
                <p style={{ fontWeight: 800, color: '#E53E3E', marginBottom: 6 }}>Critical Values — Consult a Doctor</p>
                <ul style={{ paddingLeft: 16, fontSize: '0.88rem', color: '#E53E3E', lineHeight: 1.6 }}>
                  {analysisResult.alerts.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            </div>
          )}

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>

            {[
              { icon: '🔴', label: 'High', val: analysisResult.results.filter(r => r.status === 'high').length },
              { icon: '🟡', label: 'Low', val: analysisResult.results.filter(r => r.status === 'low').length },
              { icon: '🟢', label: 'Normal', val: analysisResult.results.filter(r => r.status === 'normal').length },
              { icon: '📊', label: 'Total Parameters', val: analysisResult.results.length },
            ].map((item, i) => (
              <div key={i} className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{item.icon}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{item.val}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Urgency badge */}
          <div style={{ padding: '14px 24px', borderRadius: 14, background: urgency.bg, border: `1.5px solid ${urgency.color}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontWeight: 700, color: urgency.color, fontSize: '1rem' }}>{urgency.label}</span>
            <button className="btn btn-secondary btn-sm" onClick={reset}>↩ Upload Another</button>
          </div>

          {/* Results grouped by category */}
          {analysisResult.results.length > 0 ? (
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 24 }}>📋 Detailed Findings</h3>

              {Object.entries(groupedResults).map(([category, tests]) => (
                <div key={category} style={{ marginBottom: 28 }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                    {category}
                  </p>
                  {/* Header row - Hidden on mobile */}
                  <div className="hide-mobile" style={{ display: 'flex', padding: '0 20px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: 8 }}>
                    <div style={{ flex: 2 }}>Parameter</div>
                    <div style={{ flex: 1, textAlign: 'center' }}>Result</div>
                    <div style={{ flex: 1, textAlign: 'center' }}>Reference</div>
                    <div style={{ flex: 1, textAlign: 'right' }}>Status</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {tests.map((test, i) => {
                      const colors = { high: '#E53E3E', low: '#F59E0B', normal: '#2EC4A0' };
                      const bgs = { high: 'rgba(229,62,62,0.04)', low: 'rgba(245,158,11,0.04)', normal: 'rgba(46,196,160,0.04)' };
                      const c = colors[test.status];
                      return (
                        <div key={i} className="stack-mobile" style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderRadius: 14, background: bgs[test.status], border: `1.5px solid ${c}25`, position: 'relative', overflow: 'hidden' }}>

                          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: c, borderRadius: '3px 0 0 3px' }} />
                          <div style={{ flex: 2, paddingLeft: 8 }}>
                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{test.name}</div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>{test.interpretation}</p>
                          </div>
                          <div style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: '1.15rem', color: c }}>
                            {test.value} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>{test.unit}</span>
                          </div>
                          <div style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {test.range[0]} – {test.range[1]}
                          </div>
                          <div style={{ flex: 1, textAlign: 'right' }}>
                            <span style={{ padding: '4px 12px', borderRadius: 100, background: `${c}20`, color: c, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                              {test.status === 'high' ? '▲ HIGH' : test.status === 'low' ? '▼ LOW' : '✓ NORMAL'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🤷‍♂️</div>
              <p style={{ fontWeight: 600 }}>No parameters detected</p>
              <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>Try a clearer image or higher resolution scan.</p>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={reset}>Try Again</button>
            </div>
          )}

          {/* AI Summary */}
          <div className="glass-card" style={{ padding: 28, background: 'rgba(124,92,252,0.05)', border: '1px solid rgba(124,92,252,0.15)' }}>
            <h4 style={{ fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🐍</span> Python Clinical Summary
            </h4>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-dark)', lineHeight: 1.7 }}>
              {analysisResult.summary}
            </p>

            {analysisResult.risks && analysisResult.risks.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--danger-deep)', textTransform: 'uppercase', marginBottom: 8 }}>Potential Health Risks</p>
                <ul style={{ paddingLeft: 20, fontSize: '0.9rem', color: 'var(--text-dark)', lineHeight: 1.6 }}>
                  {analysisResult.risks.map((risk, i) => <li key={i}>{risk}</li>)}
                </ul>
              </div>
            )}

            {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: 8 }}>Recommendations</p>
                <ul style={{ paddingLeft: 20, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {analysisResult.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                </ul>
              </div>
            )}
          </div>

          <div style={{ padding: '16px 24px', borderRadius: 16, background: 'rgba(229,62,62,0.05)', border: '1px solid rgba(229,62,62,0.1)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            ⚕️ <strong>Disclaimer:</strong> This analysis is generated by Local Python OCR & Logic and is for informational purposes only. It is not a clinical diagnosis. Always share your full report with a qualified healthcare professional.
          </div>
        </div>
      )}
    </div>
  );
}
