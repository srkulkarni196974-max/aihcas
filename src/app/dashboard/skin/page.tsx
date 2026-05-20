'use client';
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Camera, Scan, AlertTriangle, CheckCircle, XCircle,
  ShieldAlert, Activity, Zap, Eye, RotateCcw, FileImage,
  ArrowRight, Info, ChevronDown, ChevronUp, Sparkles, Heart
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AbcdeItem {
  score: number;
  observation: string;
  concern: 'LOW' | 'MODERATE' | 'HIGH';
}

interface SkinAnalysis {
  overallRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  primaryObservation: string;
  possibleConditions: string[];
  abcde: {
    asymmetry: AbcdeItem;
    border: AbcdeItem;
    color: AbcdeItem;
    diameter: AbcdeItem;
    evolving: AbcdeItem;
  };
  skinCharacteristics: {
    texture: string;
    colorPattern: string;
    borders: string;
    surfaceFeatures: string;
  };
  visualConcerns: string[];
  reassuringFeatures: string[];
  recommendedActions: { action: string; urgency: string; reason: string }[];
  specialistReferral: 'URGENT' | 'RECOMMENDED' | 'OPTIONAL' | 'NOT_INDICATED';
  selfCareAdvice: string[];
  redFlagWarnings: string[];
  disclaimer: string;
}

type Stage = 'upload' | 'scanning' | 'results';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const RISK_CONFIG = {
  LOW:      { color: '#0D9488', bg: 'rgba(13,148,136,0.08)',  border: 'rgba(13,148,136,0.2)',  label: 'Low Risk',      icon: '✅' },
  MODERATE: { color: '#D97706', bg: 'rgba(217,119,6,0.08)',   border: 'rgba(217,119,6,0.2)',   label: 'Moderate Risk', icon: '⚠️' },
  HIGH:     { color: '#DC2626', bg: 'rgba(220,38,38,0.08)',   border: 'rgba(220,38,38,0.2)',   label: 'High Risk',     icon: '🚨' },
  CRITICAL: { color: '#7C2D12', bg: 'rgba(124,45,18,0.1)',    border: 'rgba(124,45,18,0.3)',   label: 'Critical',      icon: '🆘' },
};

const CONCERN_COLOR = {
  LOW:      '#0D9488',
  MODERATE: '#D97706',
  HIGH:     '#DC2626',
};

const URGENCY_CONFIG: Record<string, { color: string; label: string }> = {
  IMMEDIATE:     { color: '#DC2626', label: 'Immediate' },
  WITHIN_WEEK:   { color: '#D97706', label: 'Within a Week' },
  WITHIN_MONTH:  { color: '#1E3A8A', label: 'Within a Month' },
  ROUTINE:       { color: '#0D9488', label: 'Routine' },
};

const ABCDE_INFO = {
  asymmetry: { full: 'Asymmetry', desc: 'One half differs from the other', letter: 'A' },
  border:    { full: 'Border',    desc: 'Irregular, ragged or blurred edges', letter: 'B' },
  color:     { full: 'Color',     desc: 'Multiple shades or uneven distribution', letter: 'C' },
  diameter:  { full: 'Diameter',  desc: 'Larger than 6mm (pencil eraser)', letter: 'D' },
  evolving:  { full: 'Evolving',  desc: 'Changing in size, shape or color', letter: 'E' },
};

const SCAN_STEPS = [
  'Initializing dermoscopy AI engine...',
  'Applying spectral image enhancement...',
  'Running ABCDE melanoma checklist...',
  'Evaluating pigmentation patterns...',
  'Analyzing border morphology...',
  'Cross-referencing dermatological database...',
  'Generating clinical risk assessment...',
  'Compiling structured report...',
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function SkinAnalysisPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage]             = useState<Stage>('upload');
  const [previewUrl, setPreviewUrl]   = useState<string | null>(null);
  const [analysis, setAnalysis]       = useState<SkinAnalysis | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [dragOver, setDragOver]       = useState(false);
  const [notes, setNotes]             = useState('');
  const [scanStep, setScanStep]       = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [expandedAbcde, setExpandedAbcde] = useState<string | null>(null);
  const [fileRef, setFileRef]         = useState<File | null>(null);

  // ── File handling ────────────────────────────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image is too large. Please upload an image under 10 MB.');
      return;
    }
    setError(null);
    setFileRef(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setStage('upload');
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // ── Analysis pipeline ─────────────────────────────────────────────────────
  const runAnalysis = async () => {
    if (!fileRef) return;

    setStage('scanning');
    setAnalysis(null);
    setError(null);
    setScanStep(0);
    setScanProgress(0);

    // Animated scan step progression
    const interval = setInterval(() => {
      setScanStep(prev => {
        if (prev < SCAN_STEPS.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
      setScanProgress(prev => Math.min(prev + (100 / SCAN_STEPS.length), 95));
    }, 600);

    try {
      const formData = new FormData();
      formData.append('image', fileRef);
      formData.append('notes', notes);

      const res = await fetch('/api/analyze-skin', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      setScanProgress(100);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Analysis failed');
      }

      const data = await res.json();
      
      // Brief pause so progress reaches 100% visually
      await new Promise(r => setTimeout(r, 500));
      setAnalysis(data.analysis);
      setStage('results');

    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || 'Analysis failed. Please try again.');
      setStage('upload');
    }
  };

  const reset = () => {
    setStage('upload');
    setPreviewUrl(null);
    setAnalysis(null);
    setError(null);
    setNotes('');
    setFileRef(null);
    setScanProgress(0);
    setScanStep(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const risk = analysis ? RISK_CONFIG[analysis.overallRiskLevel] : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="page-fade" style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, #1E3A8A, #0D9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Scan className="w-5 h-5 text-white" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h1 style={{ fontSize: '1.55rem', fontWeight: 850, color: 'var(--text-dark)', lineHeight: 1.2 }}>
              AI Dermatology Scanner
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Gemini Vision • ABCDE Melanoma Protocol • Clinical-Grade Analysis
            </p>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div style={{
          padding: '10px 16px',
          background: 'rgba(217,119,6,0.06)',
          border: '1px solid rgba(217,119,6,0.18)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <ShieldAlert className="w-4 h-4 text-[#D97706] flex-shrink-0" />
          <p style={{ fontSize: '0.78rem', color: '#92400E', fontWeight: 600, lineHeight: 1.5 }}>
            <strong>Medical Disclaimer:</strong> This is an AI-assisted informational analysis and <strong>NOT a medical diagnosis</strong>.
            Always consult a qualified dermatologist or healthcare professional for proper evaluation.
          </p>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* ────────────── UPLOAD STAGE ────────────────────────────── */}
        {stage === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ display: 'grid', gridTemplateColumns: previewUrl ? '1fr 1fr' : '1fr', gap: 24 }}
            className="stack-mobile"
          >
            {/* Drop Zone */}
            <div>
              <div
                className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: previewUrl ? '32px' : '64px 32px',
                  borderColor: dragOver ? 'var(--primary-deep)' : 'rgba(30,58,138,0.15)',
                  background: dragOver ? 'rgba(30,58,138,0.04)' : 'rgba(248,250,252,0.7)',
                  cursor: 'pointer', borderRadius: 20,
                  border: '2px dashed rgba(30,58,138,0.15)',
                  transition: 'all 0.3s'
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(30,58,138,0.08), rgba(13,148,136,0.08))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Upload className="w-6 h-6 text-[#1E3A8A]" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: '1rem', marginBottom: 4 }}>
                      {previewUrl ? 'Upload Different Image' : 'Upload Skin Image'}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Drag & drop or click to browse
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: 4 }}>
                      JPG, PNG, WEBP • Max 10 MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Supported Conditions */}
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Supported Conditions
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['Moles / Nevi', 'Skin Rashes', 'Acne', 'Pigmentation', 'Lesions', 'Allergic Reactions', 'Eczema', 'Psoriasis'].map(c => (
                    <span key={c} style={{
                      padding: '4px 10px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700,
                      background: 'rgba(30,58,138,0.05)', color: 'var(--primary-deep)',
                      border: '1px solid rgba(30,58,138,0.1)'
                    }}>{c}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview + Notes + Analyze */}
            {previewUrl && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Image Preview with scan reticle overlay */}
                <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: '1.5px solid var(--border)', aspectRatio: '4/3', background: '#F8FAFC' }}>
                  <img
                    src={previewUrl}
                    alt="Skin preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Scan reticle corners */}
                  {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => (
                    <div key={pos} style={{
                      position: 'absolute',
                      width: 20, height: 20,
                      borderColor: 'rgba(30,58,138,0.6)',
                      borderStyle: 'solid',
                      borderWidth: pos.includes('top') ? '2px 0 0 0' : '0 0 2px 0',
                      [pos.includes('left') ? 'left' : 'right']: 12,
                      [pos.includes('top') ? 'top' : 'bottom']: 12,
                      borderLeftWidth: pos.includes('left') ? 2 : 0,
                      borderRightWidth: pos.includes('right') ? 2 : 0,
                    }} />
                  ))}
                  <div style={{
                    position: 'absolute', bottom: 10, left: 10,
                    background: 'rgba(255,255,255,0.9)', borderRadius: 8,
                    padding: '4px 10px', fontSize: '0.68rem', fontWeight: 800,
                    color: 'var(--primary-deep)', display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    <FileImage className="w-3 h-3" /> Ready for analysis
                  </div>
                </div>

                {/* Clinical Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    className="input-field"
                    rows={3}
                    placeholder="Describe symptoms, duration, changes noticed, any relevant history..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    style={{ resize: 'none', fontSize: '0.85rem', borderRadius: 14 }}
                  />
                </div>

                {/* Error message */}
                {error && (
                  <div style={{ padding: '10px 14px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 10, display: 'flex', gap: 8 }}>
                    <XCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
                    <p style={{ fontSize: '0.8rem', color: '#DC2626', fontWeight: 600 }}>{error}</p>
                  </div>
                )}

                {/* CTA Buttons */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-secondary btn-sm" onClick={reset} style={{ borderRadius: 100, fontWeight: 700 }}>
                    <RotateCcw className="w-3.5 h-3.5" /> Clear
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={runAnalysis}
                    style={{ flex: 1, justifyContent: 'center', borderRadius: 100, fontWeight: 800 }}
                  >
                    <Zap className="w-4 h-4" /> Run AI Dermatology Scan
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ────────────── SCANNING STAGE ───────────────────────────── */}
        {stage === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' }}
            className="stack-mobile"
          >
            {/* Image with live scan beam */}
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: '1.5px solid rgba(30,58,138,0.2)', aspectRatio: '4/3', background: '#F0F4F8' }}>
              <img src={previewUrl!} alt="Scanning" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

              {/* Semi-transparent blue tint overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(30,58,138,0.06)' }} />

              {/* Animated scan beam */}
              <motion.div
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', left: 0, right: 0, height: 3,
                  background: 'linear-gradient(90deg, transparent, rgba(30,58,138,0.7), rgba(179,143,93,0.6), transparent)',
                  boxShadow: '0 0 12px rgba(30,58,138,0.4)',
                }}
              />

              {/* Scanning corner reticles */}
              {[
                { top: 10, left: 10, borderTop: '2px solid rgba(30,58,138,0.7)', borderLeft: '2px solid rgba(30,58,138,0.7)' },
                { top: 10, right: 10, borderTop: '2px solid rgba(30,58,138,0.7)', borderRight: '2px solid rgba(30,58,138,0.7)' },
                { bottom: 10, left: 10, borderBottom: '2px solid rgba(179,143,93,0.7)', borderLeft: '2px solid rgba(179,143,93,0.7)' },
                { bottom: 10, right: 10, borderBottom: '2px solid rgba(179,143,93,0.7)', borderRight: '2px solid rgba(179,143,93,0.7)' },
              ].map((style, i) => (
                <div key={i} style={{ position: 'absolute', width: 24, height: 24, ...style }} />
              ))}

              {/* Pulsing center crosshair */}
              <motion.div
                animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 48, height: 48, border: '1.5px solid rgba(30,58,138,0.5)',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <div style={{ width: 8, height: 8, background: 'rgba(30,58,138,0.6)', borderRadius: '50%' }} />
              </motion.div>

              {/* Scanning label */}
              <div style={{
                position: 'absolute', bottom: 12, left: 0, right: 0,
                display: 'flex', justifyContent: 'center'
              }}>
                <div style={{
                  background: 'rgba(30,58,138,0.85)', color: 'white', backdropFilter: 'blur(8px)',
                  padding: '6px 14px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '0.04em'
                }}>
                  <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                    <Activity className="w-3.5 h-3.5" />
                  </motion.div>
                  AI DERMOSCOPY ACTIVE
                </div>
              </div>
            </div>

            {/* Scan progress panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="glass-card" style={{ padding: 24, background: 'white', border: '1.5px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 36, height: 36, border: '2px solid rgba(30,58,138,0.15)', borderTopColor: 'var(--primary-deep)', borderRadius: '50%' }}
                  />
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: '0.95rem' }}>Analyzing Skin Image</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Gemini Vision AI Processing</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>Analysis Progress</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary-deep)' }}>{Math.round(scanProgress)}%</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(30,58,138,0.08)', borderRadius: 100, overflow: 'hidden' }}>
                    <motion.div
                      animate={{ width: `${scanProgress}%` }}
                      transition={{ ease: 'easeOut' }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, #1E3A8A, #0D9488)', borderRadius: 100 }}
                    />
                  </div>
                </div>

                {/* Step list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {SCAN_STEPS.map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem',
                        background: i < scanStep ? 'rgba(13,148,136,0.15)' : i === scanStep ? 'rgba(30,58,138,0.1)' : 'rgba(226,232,240,0.5)',
                        border: `1.5px solid ${i < scanStep ? 'rgba(13,148,136,0.3)' : i === scanStep ? 'rgba(30,58,138,0.3)' : 'transparent'}`,
                        transition: 'all 0.4s'
                      }}>
                        {i < scanStep ? (
                          <CheckCircle className="w-3 h-3 text-[#0D9488]" />
                        ) : i === scanStep ? (
                          <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
                            <div style={{ width: 5, height: 5, background: 'var(--primary-deep)', borderRadius: '50%' }} />
                          </motion.div>
                        ) : (
                          <div style={{ width: 5, height: 5, background: 'rgba(148,163,184,0.4)', borderRadius: '50%' }} />
                        )}
                      </div>
                      <p style={{
                        fontSize: '0.74rem', fontWeight: i <= scanStep ? 700 : 500,
                        color: i < scanStep ? '#0D9488' : i === scanStep ? 'var(--primary-deep)' : 'var(--text-light)',
                        transition: 'all 0.4s'
                      }}>{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ABCDE teaser cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                {Object.entries(ABCDE_INFO).map(([key, info]) => (
                  <motion.div
                    key={key}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: Object.keys(ABCDE_INFO).indexOf(key) * 0.3 }}
                    style={{
                      background: 'white', border: '1px solid var(--border)', borderRadius: 10,
                      padding: '8px 6px', textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary-deep)', marginBottom: 2 }}>{info.letter}</div>
                    <div style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{info.full}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ────────────── RESULTS STAGE ────────────────────────────── */}
        {stage === 'results' && analysis && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            {/* Results header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="stack-mobile">
              
              {/* Image with risk overlay */}
              <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: `1.5px solid ${risk!.border}`, aspectRatio: '4/3' }}>
                <img src={previewUrl!} alt="Analyzed" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `linear-gradient(to top, ${risk!.bg} 0%, transparent 60%)`
                }} />
                {/* Risk badge */}
                <div style={{
                  position: 'absolute', top: 12, left: 12,
                  background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
                  padding: '6px 12px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 800,
                  color: risk!.color, border: `1px solid ${risk!.border}`,
                  display: 'flex', alignItems: 'center', gap: 5
                }}>
                  <span>{risk!.icon}</span> {risk!.label}
                </div>
                {/* Re-analyze button */}
                <button
                  onClick={reset}
                  style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'rgba(255,255,255,0.9)', border: '1px solid var(--border)',
                    borderRadius: 100, padding: '5px 10px', fontSize: '0.7rem', fontWeight: 700,
                    cursor: 'pointer', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 4
                  }}
                >
                  <RotateCcw className="w-3 h-3" /> New Scan
                </button>
              </div>

              {/* Overall assessment card */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="glass-card" style={{ padding: 20, background: risk!.bg, border: `1px solid ${risk!.border}`, flex: 1 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: risk!.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    Overall Risk Assessment
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: risk!.color, marginBottom: 8 }}>
                    {risk!.icon} {risk!.label}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-dark)', lineHeight: 1.6, fontWeight: 600 }}>
                    {analysis.primaryObservation}
                  </p>
                </div>

                {/* Specialist referral */}
                <div style={{
                  padding: '12px 16px', borderRadius: 14,
                  background: analysis.specialistReferral === 'URGENT' ? 'rgba(220,38,38,0.06)' : 'rgba(30,58,138,0.04)',
                  border: `1px solid ${analysis.specialistReferral === 'URGENT' ? 'rgba(220,38,38,0.15)' : 'rgba(30,58,138,0.1)'}`,
                  display: 'flex', alignItems: 'center', gap: 10
                }}>
                  <Heart className={`w-4 h-4 ${analysis.specialistReferral === 'URGENT' ? 'text-[#DC2626]' : 'text-[#1E3A8A]'}`} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                      Specialist Referral
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: analysis.specialistReferral === 'URGENT' ? '#DC2626' : 'var(--primary-deep)' }}>
                      {analysis.specialistReferral.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                {/* Possible conditions */}
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    Possible Conditions (Non-Diagnostic)
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {analysis.possibleConditions.map(c => (
                      <span key={c} style={{
                        padding: '4px 10px', borderRadius: 100, fontSize: '0.74rem', fontWeight: 700,
                        background: 'white', border: '1px solid var(--border)', color: 'var(--text-dark)'
                      }}>{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── ABCDE Checklist ─────────────────────────────────── */}
            <div className="glass-card" style={{ padding: 24, background: 'white', border: '1.5px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <Eye className="w-4 h-4 text-[#1E3A8A]" />
                <h2 style={{ fontWeight: 850, fontSize: '1rem', color: 'var(--text-dark)' }}>ABCDE Melanoma Checklist</h2>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 600, marginLeft: 'auto' }}>
                  Click each criterion to expand
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(Object.entries(analysis.abcde) as [string, AbcdeItem][]).map(([key, item]) => {
                  const info = ABCDE_INFO[key as keyof typeof ABCDE_INFO];
                  const isExpanded = expandedAbcde === key;
                  const concernColor = CONCERN_COLOR[item.concern];
                  return (
                    <div
                      key={key}
                      style={{
                        border: `1px solid ${isExpanded ? concernColor + '30' : 'rgba(226,232,240,0.8)'}`,
                        borderRadius: 14, overflow: 'hidden',
                        background: isExpanded ? concernColor + '06' : 'transparent',
                        transition: 'all 0.3s'
                      }}
                    >
                      <button
                        onClick={() => setExpandedAbcde(isExpanded ? null : key)}
                        style={{
                          width: '100%', padding: '14px 16px', background: 'none', border: 'none',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left'
                        }}
                      >
                        {/* Letter badge */}
                        <div style={{
                          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                          background: `${concernColor}15`, border: `1.5px solid ${concernColor}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 900, fontSize: '1rem', color: concernColor
                        }}>
                          {info.letter}
                        </div>
                        {/* Label & score bar */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-dark)' }}>{info.full}</span>
                            <span style={{
                              padding: '2px 8px', borderRadius: 100, fontSize: '0.65rem', fontWeight: 800,
                              background: `${concernColor}15`, color: concernColor
                            }}>{item.concern}</span>
                          </div>
                          {/* Score progress bar */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 4, background: 'rgba(226,232,240,0.8)', borderRadius: 100 }}>
                              <div style={{
                                height: '100%', width: `${item.score * 10}%`,
                                background: concernColor, borderRadius: 100, transition: 'width 0.8s ease-out'
                              }} />
                            </div>
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: concernColor, flexShrink: 0 }}>
                              {item.score}/10
                            </span>
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-[var(--text-light)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-light)]" />}
                      </button>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ padding: '0 16px 14px 60px' }}>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
                                <strong style={{ color: 'var(--text-dark)' }}>Definition:</strong> {info.desc}
                              </p>
                              <p style={{ fontSize: '0.78rem', color: 'var(--text-dark)', lineHeight: 1.55, fontWeight: 600 }}>
                                <strong>Observation:</strong> {item.observation}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Skin Characteristics ─────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="stack-mobile">
              <div className="glass-card" style={{ padding: 20, background: 'white', border: '1.5px solid var(--border)' }}>
                <h3 style={{ fontWeight: 850, fontSize: '0.9rem', color: 'var(--text-dark)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles className="w-4 h-4 text-[#B38F5D]" /> Skin Characteristics
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Object.entries(analysis.skinCharacteristics).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0, paddingTop: 2, minWidth: 80 }}>{k}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dark)', fontWeight: 600, lineHeight: 1.5 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Concerns & Reassuring Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {analysis.visualConcerns.length > 0 && (
                  <div style={{ padding: 16, background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.12)', borderRadius: 14 }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                      ⚠ Visual Concerns
                    </div>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 5, paddingLeft: 16 }}>
                      {analysis.visualConcerns.map(c => (
                        <li key={c} style={{ fontSize: '0.78rem', color: 'var(--text-dark)', fontWeight: 600, lineHeight: 1.5 }}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.reassuringFeatures.length > 0 && (
                  <div style={{ padding: 16, background: 'rgba(13,148,136,0.04)', border: '1px solid rgba(13,148,136,0.12)', borderRadius: 14 }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                      ✓ Reassuring Features
                    </div>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 5, paddingLeft: 16 }}>
                      {analysis.reassuringFeatures.map(f => (
                        <li key={f} style={{ fontSize: '0.78rem', color: 'var(--text-dark)', fontWeight: 600, lineHeight: 1.5 }}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* ── Red Flag Warnings ──────────────────────────────────── */}
            {analysis.redFlagWarnings.length > 0 && (
              <div style={{
                padding: '16px 20px', background: 'rgba(220,38,38,0.05)', border: '1.5px solid rgba(220,38,38,0.2)',
                borderRadius: 14, display: 'flex', gap: 12, alignItems: 'flex-start'
              }}>
                <AlertTriangle className="w-5 h-5 text-[#DC2626] flex-shrink-0 mt-0.5" />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontWeight: 800, fontSize: '0.88rem', color: '#DC2626', marginBottom: 6 }}>🚨 Red Flag Warnings</p>
                  <ul style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {analysis.redFlagWarnings.map(w => (
                      <li key={w} style={{ fontSize: '0.8rem', color: '#7F1D1D', fontWeight: 700, lineHeight: 1.5 }}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* ── Recommended Actions ────────────────────────────────── */}
            <div className="glass-card" style={{ padding: 24, background: 'white', border: '1.5px solid var(--border)' }}>
              <h3 style={{ fontWeight: 850, fontSize: '0.95rem', color: 'var(--text-dark)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity className="w-4 h-4 text-[#1E3A8A]" /> Recommended Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {analysis.recommendedActions.map((action, i) => {
                  const urg = URGENCY_CONFIG[action.urgency] || { color: '#1E3A8A', label: action.urgency };
                  return (
                    <div key={i} style={{
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                      padding: '12px 14px', borderRadius: 12,
                      background: `${urg.color}06`, border: `1px solid ${urg.color}20`
                    }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: 6, background: `${urg.color}15`,
                        border: `1px solid ${urg.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, fontWeight: 900, fontSize: '0.75rem', color: urg.color
                      }}>{i + 1}</div>
                      <div style={{ textAlign: 'left', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                          <p style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--text-dark)' }}>{action.action}</p>
                          <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: '0.65rem', fontWeight: 800, background: `${urg.color}15`, color: urg.color }}>
                            {urg.label}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>{action.reason}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Self-Care Advice ─────────────────────────────────── */}
            {analysis.selfCareAdvice.length > 0 && (
              <div style={{ padding: 20, background: 'rgba(30,58,138,0.03)', border: '1px solid rgba(30,58,138,0.1)', borderRadius: 16 }}>
                <h3 style={{ fontWeight: 850, fontSize: '0.88rem', color: 'var(--primary-deep)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Info className="w-4 h-4" /> Self-Care Guidance
                </h3>
                <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }} className="stack-mobile">
                  {analysis.selfCareAdvice.map(tip => (
                    <li key={tip} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <CheckCircle className="w-4 h-4 text-[#0D9488] flex-shrink-0 mt-0.5" />
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-dark)', fontWeight: 600, lineHeight: 1.5 }}>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Final Disclaimer ─────────────────────────────────── */}
            <div style={{
              padding: '14px 18px', background: 'rgba(217,119,6,0.05)', border: '1.5px solid rgba(217,119,6,0.15)',
              borderRadius: 14, display: 'flex', gap: 10, alignItems: 'flex-start'
            }}>
              <ShieldAlert className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
              <p style={{ fontSize: '0.76rem', color: '#92400E', fontWeight: 600, lineHeight: 1.6, textAlign: 'left' }}>
                {analysis.disclaimer}
              </p>
            </div>

            {/* New scan CTA */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 8 }}>
              <button className="btn btn-primary" onClick={reset} style={{ borderRadius: 100, paddingInline: 32 }}>
                <RotateCcw className="w-4 h-4" /> Start New Skin Analysis
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
