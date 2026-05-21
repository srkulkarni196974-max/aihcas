'use client';
import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  FileSpreadsheet, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Cpu, 
  Bot, 
  Layers, 
  ChevronRight, 
  Heart,
  TrendingUp,
  Activity,
  Briefcase
} from 'lucide-react';

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
  routine: { color: '#0D9488', bg: 'rgba(13, 148, 136, 0.05)', label: 'Routine Follow-up', icon: <CheckCircle className="w-4 h-4 text-[#0D9488]" /> },
  soon:    { color: '#D97706', bg: 'rgba(217, 119, 6, 0.05)', label: 'Consult Clinician Soon', icon: <AlertTriangle className="w-4 h-4 text-[#D97706]" /> },
  urgent:  { color: '#DC2626', bg: 'rgba(220, 38, 38, 0.05)', label: 'Urgent Medical Attention', icon: <ShieldAlert className="w-4 h-4 text-[#DC2626]" /> },
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
  const [engine, setEngine] = useState<'python' | 'gemini'>('python');

  // Analyze via API (Python + Gemini Fallback)
  const analyzeFile = useCallback(async (file: File) => {
    setStage('scanning');
    setProgress(10);
    setProgressLabel('Sending to Python + Tesseract Engine...');
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'report');
      if (user?.userId) formData.append('userId', user.userId);

      setProgress(40);
      setProgressLabel('Extracting lab values with OCR (this may take a moment)...');

      const res = await fetch('/api/analyze-local', {
        method: 'POST',
        body: formData,
      });

      setProgress(85);
      setProgressLabel('Parsing local results...');

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Analysis failed.');
      }

      setProgress(100);
      setProgressLabel('Done!');
      const data = json.data as AnalysisResult;
      setAnalysisResult(data);
      setEngine(json.engine === 'gemini' ? 'gemini' : 'python');
      
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
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 855, letterSpacing: '-0.02em', marginBottom: 8, color: '#0F172A' }}>
          <span style={{ background: 'linear-gradient(135deg, #1E3A8A 30%, #B38F5D 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Report</span> Analysis
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Upload medical pathology or lab results — our offline sandboxed OCR extracts and explains parameters.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.85)', padding: '6px 14px', borderRadius: 100, border: '1.5px solid var(--border)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dark)' }}>
            {stage === 'results' && engine === 'gemini' ? (
              <>
                <Bot className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>Gemini Diagnostics</span>
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Python OCR Engine</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Error dialog banner */}
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
          <div
            className="upload-zone animate-fadeInUp"
            style={{
              border: '2px dashed var(--border)',
              background: 'rgba(255, 255, 255, 0.65)',
              borderRadius: '20px',
              padding: '64px 32px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s var(--transition)'
            }}
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
            <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'white', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
              <FileSpreadsheet className="w-6 h-6 text-[#B38F5D]" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: 8 }}>Load Pathology Report</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.85rem', lineHeight: 1.5 }}>
              Blood tests, HbA1c panels, Liver function, Kidney function, Lipid panels, or Thyroid parameters.
            </p>
            <button 
              className="btn btn-primary" 
              style={{ borderRadius: 100, fontWeight: 700 }}
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            >
              <Upload className="w-4 h-4" /> Choose Report File
            </button>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: 16, fontWeight: 600 }}>
              Scanned internally via Python local engines
            </p>
          </div>

          {/* Sidebar info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="glass-card" style={{ padding: 24, background: 'white', border: '1.5px solid var(--border)' }}>
              <h3 style={{ fontWeight: 800, marginBottom: 16, fontSize: '0.95rem', color: 'var(--text-dark)', textAlign: 'left' }}>Supported Panels</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                {['Complete Blood Count (CBC)', 'Blood Glucose / HbA1c', 'Liver Function Test (LFT)', 'Kidney Function Test (KFT)', 'Thyroid Profiles (TSH, T3, T4)', 'Lipid Profile Panels'].map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    <CheckCircle className="w-4 h-4 text-[#0D9488]" /> {r}
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card" style={{ padding: 24, background: 'rgba(179,143,93,0.03)', border: '1px solid rgba(179,143,93,0.12)', borderRadius: 20, textAlign: 'left' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#B38F5D', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <TrendingUp className="w-4 h-4 text-[#B38F5D]" /> AI Benefits
              </span>
              <ul style={{ paddingLeft: 16, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.7, listStyleType: 'disc' }}>
                <li>Auto-detects reference ranges</li>
                <li>Highlights abnormal test markers</li>
                <li>Categorizes diagnostic modules</li>
                <li>Preserves private offline workflows</li>
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
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: 8 }}>Parsing Diagnostic Parameters</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: '0.88rem' }}>{progressLabel}</p>
          <div style={{ maxWidth: 400, margin: '0 auto', background: 'var(--primary)', borderRadius: 100, height: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 100, background: 'linear-gradient(to right, #1E3A8A, #B38F5D)', width: `${progress}%`, transition: 'width 0.5s ease' }} />
          </div>
          <p style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 700 }}>{progress}% scan complete</p>
          {previewUrl && (
            <div style={{ marginTop: 24, maxHeight: 180, overflow: 'hidden', borderRadius: 16, border: '1.5px solid var(--border)', maxWidth: 400, margin: '24px auto 0' }}>
              <img src={previewUrl} alt="Pathology Report" style={{ width: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>
      )}

      {/* Results Stage */}
      {stage === 'results' && analysisResult && urgency && (
        <div className="page-fade" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Critical Alerts */}
          {analysisResult.alerts && analysisResult.alerts.length > 0 && (
            <div style={{ padding: '16px 20px', borderRadius: 16, background: '#FFF0F0', border: '1.5px solid #DC262625', display: 'flex', gap: 12, alignItems: 'flex-start', textAlign: 'left' }}>
              <ShieldAlert className="w-5 h-5 text-[#DC2626] flex-shrink-0" />
              <div>
                <p style={{ fontWeight: 800, color: '#DC2626', fontSize: '0.9rem', marginBottom: 4 }}>Out-of-Range Critical Values</p>
                <ul style={{ paddingLeft: 16, fontSize: '0.82rem', color: '#DC2626', lineHeight: 1.6, listStyleType: 'disc' }}>
                  {analysisResult.alerts.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            </div>
          )}

          {/* Quick Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
            {[
              { icon: <ShieldAlert className="w-5 h-5 text-[#DC2626]" />, label: 'High Markers', val: analysisResult.results.filter(r => r.status === 'high').length, c: '#DC2626' },
              { icon: <AlertTriangle className="w-5 h-5 text-[#D97706]" />, label: 'Low Markers', val: analysisResult.results.filter(r => r.status === 'low').length, c: '#D97706' },
              { icon: <CheckCircle className="w-5 h-5 text-[#0D9488]" />, label: 'Normal Ranges', val: analysisResult.results.filter(r => r.status === 'normal').length, c: '#0D9488' },
              { icon: <Layers className="w-5 h-5 text-[#1E3A8A]" />, label: 'Total Parameters', val: analysisResult.results.length, c: '#1E3A8A' },
            ].map((item, i) => (
              <div key={i} className="glass-card" style={{ padding: '20px', background: 'white', border: '1.5px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.icon}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 850, color: item.c }}>{item.val}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Urgency follow-up bar */}
          <div style={{ padding: '14px 24px', borderRadius: 16, background: urgency.bg, border: `1px solid ${urgency.color}25`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontWeight: 800, color: urgency.color, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              {urgency.icon}
              {urgency.label}
            </span>
            <button className="btn btn-secondary btn-sm" onClick={reset} style={{ borderRadius: 100, fontWeight: 700, border: '1px solid var(--border)' }}>↩ Scan Another Report</button>
          </div>

          {/* Grouped findings */}
          {analysisResult.results.length > 0 ? (
            <div className="glass-card" style={{ padding: 28, background: 'white', border: '1.5px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: 24, textAlign: 'left' }}>📋 Pathology Findings Overview</h3>

              {Object.entries(groupedResults).map(([category, tests]) => (
                <div key={category} style={{ marginBottom: 28 }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid rgba(226,232,240,0.6)', textAlign: 'left' }}>
                    {category}
                  </p>
                  {/* Table headers */}
                  <div className="hide-mobile" style={{ display: 'flex', padding: '0 20px', fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.04em' }}>
                    <div style={{ flex: 2, textAlign: 'left' }}>Diagnostic Parameter</div>
                    <div style={{ flex: 1, textAlign: 'center' }}>Extracted Value</div>
                    <div style={{ flex: 1, textAlign: 'center' }}>Reference Range</div>
                    <div style={{ flex: 1, textAlign: 'right' }}>Status Tag</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {tests.map((test, i) => {
                      const colors = { high: '#DC2626', low: '#D97706', normal: '#0D9488' };
                      const bgs = { high: 'rgba(220,38,38,0.03)', low: 'rgba(217,119,6,0.03)', normal: 'rgba(13, 148, 136, 0.03)' };
                      const c = colors[test.status];
                      return (
                        <div key={i} className="stack-mobile" style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderRadius: 14, background: bgs[test.status], border: `1px solid ${c}15`, position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: c }} />
                          <div style={{ flex: 2, paddingLeft: 8, textAlign: 'left' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-dark)' }}>{test.name}</div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>{test.interpretation}</p>
                          </div>
                          <div style={{ flex: 1, textAlign: 'center', fontWeight: 850, fontSize: '1.05rem', color: c }}>
                            {test.value} <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-light)' }}>{test.unit}</span>
                          </div>
                          <div style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {test.range[0]} – {test.range[1]}
                          </div>
                          <div style={{ flex: 1, textAlign: 'right' }}>
                            <span style={{ padding: '4px 12px', borderRadius: 100, background: `${c}12`, color: c, fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.04em' }}>
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
            <div className="glass-card" style={{ padding: 40, textAlign: 'center', background: 'white', border: '1.5px solid var(--border)' }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(220, 38, 38, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
              </div>
              <p style={{ fontWeight: 800, color: 'var(--text-dark)' }}>No parameters parsed</p>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginTop: 6, maxWidth: 300, margin: '6px auto 0' }}>
                The uploaded page may be too low contrast. Try writing in manual mode above or providing a higher resolution file.
              </p>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 18, borderRadius: 100, fontWeight: 700 }} onClick={reset}>
                Try Scanning Again
              </button>
            </div>
          )}

          {/* AI/OCR Summary */}
          <div className="glass-card" style={{ padding: 28, background: 'rgba(179,143,93,0.03)', border: '1px solid rgba(179,143,93,0.12)', borderRadius: 20 }}>
            <h4 style={{ fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'left', color: '#B38F5D', fontSize: '0.92rem' }}>
              {engine === 'gemini' ? <Bot className="w-4.5 h-4.5 text-[#B38F5D]" /> : <Cpu className="w-4.5 h-4.5 text-[#B38F5D]" />}
              <span>{engine === 'gemini' ? 'AI Diagnostic Summary (Gemini)' : 'Python Pathology Synthesis'}</span>
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-dark)', lineHeight: 1.65, textAlign: 'left' }}>
              {analysisResult.summary}
            </p>

            {analysisResult.risks && analysisResult.risks.length > 0 && (
              <div style={{ marginTop: 20, textAlign: 'left' }}>
                <p style={{ fontWeight: 800, fontSize: '0.78rem', color: 'var(--danger-deep)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Potential Risks</p>
                <ul style={{ paddingLeft: 20, fontSize: '0.82rem', color: 'var(--text-dark)', lineHeight: 1.6, listStyleType: 'disc' }}>
                  {analysisResult.risks.map((risk, i) => <li key={i}>{risk}</li>)}
                </ul>
              </div>
            )}

            {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
              <div style={{ marginTop: 20, textAlign: 'left' }}>
                <p style={{ fontWeight: 800, fontSize: '0.78rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Recommended Actions</p>
                <ul style={{ paddingLeft: 20, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, listStyleType: 'disc' }}>
                  {analysisResult.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                </ul>
              </div>
            )}
          </div>

          <div style={{ padding: '16px 24px', borderRadius: 16, background: 'rgba(30, 58, 138, 0.03)', border: '1px solid rgba(30, 58, 138, 0.08)', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <Activity className="w-4 h-4 text-[#1E3A8A] flex-shrink-0" />
            <span>Disclaimer: This analysis is generated via Local OCR engines. Always consult a certified healthcare professional before shifting dietary or prescription routines.</span>
          </div>
        </div>
      )}
    </div>
  );
}
