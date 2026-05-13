'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserStorage, StorageKeys } from '@/lib/storage';

type Speaker = 'user' | 'ai';
type Transcript = { speaker: Speaker; text: string; time: string };
type CallPhase = 'idle' | 'greeting' | 'listening' | 'processing' | 'speaking' | 'ended';

// ─── Speech helpers ────────────────────────────────────────────────────────────
function stripForSpeech(text: string): string {
  return text
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    .replace(/[*_`#~>]/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '')
    .replace(/⚕️|🩺|✅|🚨|💬|⚠️|❌/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function VoicePage() {
  const { user } = useAuth();

  const [phase, setPhase] = useState<CallPhase>('idle');
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(14).fill(8));

  // Refs so callbacks always see current values without re-creating
  const phaseRef = useRef<CallPhase>('idle');
  const speechRateRef = useRef(1.0);
  const recognitionRef = useRef<any>(null);
  const transcriptsRef = useRef<Transcript[]>([]);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const recognitionActiveRef = useRef(false);

  // Keep refs in sync
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { speechRateRef.current = speechRate; }, [speechRate]);
  useEffect(() => { transcriptsRef.current = transcripts; }, [transcripts]);
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Waveform animation
  useEffect(() => {
    const isActive = phase !== 'idle' && phase !== 'ended';
    if (!isActive) { setWaveHeights(Array(14).fill(8)); return; }
    const id = setInterval(() => {
      setWaveHeights(Array.from({ length: 14 }, () => Math.floor(Math.random() * 40) + 8));
    }, 120);
    return () => clearInterval(id);
  }, [phase]);

  // ─── TTS speak ──────────────────────────────────────────────────────────────
  const speak = useCallback((text: string, onDone?: () => void) => {
    window.speechSynthesis.cancel();
    setPhase('speaking');
    phaseRef.current = 'speaking';

    const cleaned = stripForSpeech(text);
    if (!cleaned) { onDone?.(); return; }

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = 'en-IN';
    utterance.rate = speechRateRef.current;

    const finish = () => {
      if (phaseRef.current === 'speaking') {
        onDone?.();
      }
    };

    utterance.onend = finish;
    utterance.onerror = (e) => {
      // 'interrupted' is expected when we cancel manually — ignore it
      if ((e as any).error !== 'interrupted') finish();
    };

    window.speechSynthesis.speak(utterance);

    // Chromium bug: onend sometimes never fires — force-finish after duration
    const estimatedMs = Math.max((cleaned.length / speechRateRef.current) * 60, 5000);
    const guard = setTimeout(() => {
      if (phaseRef.current === 'speaking') finish();
    }, estimatedMs);
    utterance.onend = () => { clearTimeout(guard); finish(); };
  }, []);

  // ─── Speech Recognition ─────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Voice recognition requires Chrome or Edge.'); return; }

    // Clean up any existing instance
    if (recognitionRef.current) {
      recognitionActiveRef.current = false;
      try { recognitionRef.current.abort(); } catch (_) {}
      recognitionRef.current = null;
    }

    setPhase('listening');
    phaseRef.current = 'listening';

    const recog = new SR();
    recog.lang = 'en-IN';
    recog.continuous = false;
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    recognitionRef.current = recog;
    recognitionActiveRef.current = true;

    recog.onresult = (e: any) => {
      recognitionActiveRef.current = false;
      const text = e.results[0]?.[0]?.transcript?.trim();
      if (text) handleUserInput(text);
    };

    recog.onerror = (e: any) => {
      if (e.error === 'no-speech') {
        // Restart listening silently on no-speech
        if (phaseRef.current === 'listening') {
          setTimeout(() => {
            if (phaseRef.current === 'listening') startListening();
          }, 300);
        }
        return;
      }
      if (e.error === 'aborted') return;
      console.error('SR error:', e.error);
    };

    recog.onend = () => {
      recognitionRef.current = null;
      // If still in listening phase and no result received, restart
      if (phaseRef.current === 'listening' && recognitionActiveRef.current) {
        recognitionActiveRef.current = false;
        setTimeout(() => {
          if (phaseRef.current === 'listening') startListening();
        }, 200);
      }
    };

    try { recog.start(); } catch (e) { console.error('recog.start error', e); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── AI Processing ───────────────────────────────────────────────────────────
  const handleUserInput = useCallback(async (text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated: Transcript[] = [...transcriptsRef.current, { speaker: 'user', text, time }];
    setTranscripts(updated);
    setPhase('processing');
    phaseRef.current = 'processing';

    try {
      const { chatAction } = await import('@/app/actions');
      let profile = null;
      try {
        const saved = UserStorage.getItem(StorageKeys.PROFILE, user?.userId);
        if (saved) profile = JSON.parse(saved);
      } catch (_) {}

      const history = updated.map(t => ({
        role: t.speaker === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: t.text }],
      }));

      const response = await chatAction(text, JSON.stringify(history), profile);
      const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const withAI: Transcript[] = [...updated, { speaker: 'ai', text: response, time: aiTime }];
      setTranscripts(withAI);

      // Speak the response, then go back to listening
      speak(response, () => {
        if (phaseRef.current !== 'ended') startListening();
      });
    } catch (err) {
      console.error('AI error:', err);
      const errMsg = "I'm sorry, I had trouble processing that. Could you repeat your question?";
      const errTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setTranscripts(prev => [...prev, { speaker: 'ai', text: errMsg, time: errTime }]);
      speak(errMsg, () => {
        if (phaseRef.current !== 'ended') startListening();
      });
    }
  }, [speak, startListening, user?.userId]);

  // ─── Call Controls ───────────────────────────────────────────────────────────
  const startCall = useCallback(() => {
    setTranscripts([]);
    setPhase('greeting');
    phaseRef.current = 'greeting';

    const greeting = "Hello! I'm Dr. AIHCAS, your AI health assistant. Please tell me — what's been bothering you today?";
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTranscripts([{ speaker: 'ai', text: greeting, time }]);

    speak(greeting, () => {
      if (phaseRef.current !== 'ended') startListening();
    });
  }, [speak, startListening]);

  const endCall = useCallback(() => {
    setPhase('ended');
    phaseRef.current = 'ended';
    recognitionActiveRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
      recognitionRef.current = null;
    }
    window.speechSynthesis.cancel();
    setTimeout(() => { setPhase('idle'); phaseRef.current = 'idle'; }, 2000);
  }, []);

  const toggleCall = useCallback(() => {
    if (phase === 'idle' || phase === 'ended') startCall();
    else endCall();
  }, [phase, startCall, endCall]);

  const toggleSpeed = useCallback(() => {
    const next = speechRate === 1.0 ? 1.5 : speechRate === 1.5 ? 2.0 : 1.0;
    setSpeechRate(next);
    speechRateRef.current = next;
  }, [speechRate]);

  // ─── Derived state for UI ────────────────────────────────────────────────────
  const isActive = phase !== 'idle' && phase !== 'ended';
  const statusLabel = phase === 'idle' ? 'Standby'
    : phase === 'greeting' ? 'Starting...'
    : phase === 'listening' ? '🎙 Listening...'
    : phase === 'processing' ? '⚡ Processing...'
    : phase === 'speaking' ? '🔊 Speaking...'
    : 'Call Ended';

  const statusBg = !isActive ? '#EAF6FF'
    : phase === 'speaking' ? '#E6FFF5'
    : phase === 'processing' ? '#FFFBEA'
    : '#FFD6D6';

  const statusColor = !isActive ? '#4DA6E8'
    : phase === 'speaking' ? '#178A6A'
    : phase === 'processing' ? '#92400E'
    : '#E53E3E';

  return (
    <div className="page-fade stack-mobile" style={{ display: 'flex', gap: '32px', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Left – Controls */}
      <div className="full-width-mobile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: '0 0 360px', gap: '28px' }}>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '10px' }}>
            AI <span className="text-gradient">Voice Consultation</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 300 }}>
            Talk naturally. Dr. AIHCAS will ask you questions and then give you a tailored solution.
          </p>
        </div>

        {/* Mic Button */}
        <div style={{ position: 'relative', width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isActive && (
            <>
              <div className="mic-ripple" style={{ animationDelay: '0s' }} />
              <div className="mic-ripple" style={{ animationDelay: '0.7s' }} />
              <div className="mic-ripple" style={{ animationDelay: '1.4s' }} />
            </>
          )}
          <button
            id="btn-voice-toggle"
            onClick={toggleCall}
            className={`mic-button ${isActive ? 'active' : ''}`}
            style={{ width: 130, height: 130, fontSize: '3.2rem' }}
          >
            {isActive ? '⏹' : '🎤'}
          </button>
        </div>

        {/* Status */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <span style={{
            padding: '8px 22px', borderRadius: 100,
            fontWeight: 700, fontSize: '0.88rem',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            background: statusBg, color: statusColor,
            transition: 'all 0.3s ease',
          }}>
            {statusLabel}
          </span>

          {/* Waveform */}
          <div className="waveform" style={{ height: 48 }}>
            {waveHeights.map((h, i) => (
              <div key={i} className="wave-bar" style={{
                height: `${h}px`, width: 5,
                animationName: isActive ? 'waveBar' : 'none',
                animationDuration: `${0.6 + i * 0.05}s`,
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationDelay: `${i * 0.07}s`,
                opacity: isActive ? 1 : 0.2,
              }} />
            ))}
          </div>
        </div>

        {/* Tip card */}
        <div className="glass-card" style={{ padding: '14px 18px', textAlign: 'center', maxWidth: 300 }}>
          <p style={{ fontSize: '0.82rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
            💡 Try: <em>&quot;I have a headache and mild fever since yesterday.&quot;</em>
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 14 }}>
          {/* Speed button */}
          <button
            className="btn btn-secondary btn-icon"
            title="Playback Speed"
            onClick={toggleSpeed}
            style={{ minWidth: 52 }}
          >
            <span style={{ fontSize: '0.78rem', fontWeight: 800 }}>{speechRate.toFixed(1)}x</span>
          </button>
          <button className="btn btn-secondary btn-icon" title="Mute" onClick={() => window.speechSynthesis.pause()}>🔇</button>
          <button className="btn btn-secondary btn-icon" title="Resume" onClick={() => window.speechSynthesis.resume()}>▶️</button>
          <button className="btn btn-secondary btn-icon" title="Clear" onClick={() => setTranscripts([])}>🗑️</button>
        </div>
      </div>

      {/* Right – Transcript */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(245,248,255,0.5)', borderRadius: 24, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🤖</div>
            <div>
              <div style={{ fontWeight: 700 }}>AI Health Assistant</div>
              <div style={{ fontSize: '0.75rem', color: isActive ? '#2EC4A0' : 'var(--text-light)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: isActive ? '#2EC4A0' : 'var(--text-light)', display: 'inline-block' }} />
                {isActive ? 'Active' : 'Standby'}
              </div>
            </div>
          </div>
          <span className="badge badge-blue">{transcripts.length} messages</span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {transcripts.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', gap: 12 }}>
              <div style={{ fontSize: '3.5rem' }}>🎤</div>
              <p style={{ fontWeight: 600 }}>Press the mic to start your voice consultation</p>
              <p style={{ fontSize: '0.85rem' }}>Dr. AIHCAS will guide you through a focused Q&amp;A and then provide a solution.</p>
            </div>
          ) : (
            transcripts.map((t, i) => (
              <div
                key={i}
                className={`message-bubble ${t.speaker === 'user' ? 'message-user' : 'message-ai'}`}
                style={{ maxWidth: '78%', whiteSpace: 'pre-wrap' }}
              >
                {t.text}
                <div style={{ fontSize: '0.65rem', marginTop: 6, textAlign: 'right', opacity: 0.7 }}>
                  {t.speaker === 'user' ? '🎙 You' : '🤖 AI'} • {t.time}
                </div>
              </div>
            ))
          )}
          <div ref={transcriptEndRef} />
        </div>
      </div>
    </div>
  );
}
