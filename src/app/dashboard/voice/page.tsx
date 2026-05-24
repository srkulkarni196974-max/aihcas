'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserStorage, StorageKeys } from '@/lib/storage';
import { 
  Mic, 
  Square, 
  VolumeX, 
  Play, 
  Trash2, 
  Sparkles, 
  Bot, 
  Volume2, 
  Heart,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

type Speaker = 'user' | 'ai';
type Transcript = { speaker: Speaker; text: string; time: string };
type CallPhase = 'idle' | 'greeting' | 'listening' | 'processing' | 'speaking' | 'ended';

// Speech helpers
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
  const isSpeakingRef = useRef(false); // true while TTS is playing — blocks mic

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

  // TTS speak
  const speak = useCallback((text: string, onDone?: () => void) => {
    // ── Stop mic BEFORE we start speaking to prevent echo feedback ──
    isSpeakingRef.current = true;
    recognitionActiveRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
      recognitionRef.current = null;
    }

    window.speechSynthesis.cancel();
    setPhase('speaking');
    phaseRef.current = 'speaking';

    const cleaned = stripForSpeech(text);
    if (!cleaned) {
      isSpeakingRef.current = false;
      onDone?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = 'en-IN';
    utterance.rate = speechRateRef.current;

    const finish = () => {
      if (phaseRef.current === 'speaking') {
        // Wait 400 ms for the speaker audio to fully fade before opening mic
        setTimeout(() => {
          isSpeakingRef.current = false;
          onDone?.();
        }, 400);
      }
    };

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

  // Speech Recognition
  const startListening = useCallback(() => {
    // Refuse to start mic while AI is speaking — prevents echo
    if (isSpeakingRef.current) return;
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

  // AI Processing
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

  // Call Controls
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

  // Derived state for UI
  const isActive = phase !== 'idle' && phase !== 'ended';
  const statusLabel = phase === 'idle' ? 'Standby'
    : phase === 'greeting' ? 'Initializing...'
    : phase === 'listening' ? '🎙 Listening...'
    : phase === 'processing' ? '⚡ Processing...'
    : phase === 'speaking' ? '🔊 Speaking...'
    : 'Session Ended';

  const statusBg = !isActive ? 'rgba(30, 58, 138, 0.05)'
    : phase === 'speaking' ? 'rgba(13, 148, 136, 0.05)'
    : phase === 'processing' ? 'rgba(217, 119, 6, 0.05)'
    : 'rgba(220, 38, 38, 0.05)';

  const statusColor = !isActive ? 'var(--primary-deep)'
    : phase === 'speaking' ? 'var(--secondary-deep)'
    : phase === 'processing' ? 'var(--warning-deep)'
    : 'var(--danger-deep)';

  return (
    <div className="page-fade voice-container stack-mobile" style={{ gap: '32px' }}>
      {/* Left – Controls Panel */}
      <div className="full-width-mobile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: '0 0 360px', gap: '28px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 850, letterSpacing: '-0.02em', marginBottom: '10px', color: 'var(--text-dark)' }}>
            AI <span style={{ background: 'linear-gradient(135deg, #1E3A8A 30%, #B38F5D 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Voice Consultation</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: 300, lineHeight: 1.5 }}>
            Hands-free spoken consultation. Dr. AIHCAS is configured to guide you through a clinical symptoms mapping.
          </p>
        </div>

        {/* Dynamic Mic Wave Button */}
        <div style={{ position: 'relative', width: 190, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isActive && (
            <>
              <div className="mic-ripple" style={{ animationDelay: '0s', background: 'rgba(30, 58, 138, 0.08)' }} />
              <div className="mic-ripple" style={{ animationDelay: '0.7s', background: 'rgba(179, 143, 93, 0.06)' }} />
              <div className="mic-ripple" style={{ animationDelay: '1.4s', background: 'rgba(13, 148, 136, 0.05)' }} />
            </>
          )}
          <button
            id="btn-voice-toggle"
            onClick={toggleCall}
            className={`mic-button ${isActive ? 'active' : ''}`}
            style={{ 
              width: 120, 
              height: 120, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: isActive ? 'linear-gradient(135deg, var(--danger-deep), #B91C1C)' : 'linear-gradient(135deg, var(--primary-deep), #2A437E)',
              boxShadow: isActive ? '0 12px 36px rgba(220, 38, 38, 0.2)' : '0 12px 36px rgba(30, 58, 138, 0.15)',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'all 0.3s var(--transition)'
            }}
          >
            {isActive ? <Square className="w-8 h-8 text-white fill-white" /> : <Mic className="w-8 h-8 text-white" />}
          </button>
        </div>

        {/* Dynamic Status Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <span style={{
            padding: '8px 24px', borderRadius: 100,
            fontWeight: 800, fontSize: '0.8rem',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            background: statusBg, color: statusColor,
            transition: 'all 0.3s ease',
            border: `1px solid ${statusColor}15`
          }}>
            {statusLabel}
          </span>

          {/* Sound Bars Waveform */}
          <div className="waveform" style={{ height: 42, display: 'flex', gap: 4, alignItems: 'center' }}>
            {waveHeights.map((h, i) => (
              <div key={i} className="wave-bar" style={{
                height: `${h}px`, width: 4.5,
                background: isActive ? 'linear-gradient(to top, var(--primary-deep), var(--accent-deep))' : 'var(--text-light)',
                borderRadius: '99px',
                animationName: isActive ? 'waveBar' : 'none',
                animationDuration: `${0.6 + i * 0.05}s`,
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationDelay: `${i * 0.07}s`,
                opacity: isActive ? 1 : 0.2,
                transition: 'all 0.2s'
              }} />
            ))}
          </div>
        </div>

        {/* Tip Instruction Card */}
        <div className="glass-card" style={{ padding: '14px 20px', textAlign: 'center', maxWidth: 300, border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)', lineHeight: 1.5, display: 'flex', gap: 6, justifyContent: 'center' }}>
            <Sparkles className="w-4 h-4 text-[#B38F5D] flex-shrink-0" />
            <span>Try saying: <em>"I have joint aches and fatigue since walking."</em></span>
          </p>
        </div>

        {/* Session Playback Controls */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-secondary btn-icon"
            title="Adjust Spoken Speech Rate"
            onClick={toggleSpeed}
            style={{ width: 50, height: 50, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'white' }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 850, color: 'var(--primary-deep)' }}>{speechRate.toFixed(1)}x</span>
          </button>
          <button className="btn btn-secondary btn-icon" title="Pause Spoken Output" onClick={() => window.speechSynthesis.pause()} style={{ width: 50, height: 50, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <VolumeX className="w-4 h-4 text-slate-700" />
          </button>
          <button className="btn btn-secondary btn-icon" title="Resume Spoken Output" onClick={() => window.speechSynthesis.resume()} style={{ width: 50, height: 50, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Play className="w-4 h-4 text-slate-700" />
          </button>
          <button className="btn btn-secondary btn-icon" title="Clear Vocal Logs" onClick={() => setTranscripts([])} style={{ width: 50, height: 50, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      </div>

      {/* Right – Transcript Dashboard */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white', borderRadius: 24, border: '1.5px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        {/* Module Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #1E3A8A, #B38F5D)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-dark)' }}>AI Voice Consultation</div>
              <div style={{ fontSize: '0.72rem', color: isActive ? 'var(--secondary-deep)' : 'var(--text-light)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? 'var(--secondary-deep)' : 'var(--text-light)', display: 'inline-block' }} />
                {isActive ? 'Voice session active' : 'Consultation standby'}
              </div>
            </div>
          </div>
          <span className="badge" style={{ background: 'var(--primary)', color: 'var(--primary-deep)', fontWeight: 800, padding: '4px 10px', fontSize: '0.72rem', borderRadius: 100 }}>
            {transcripts.length} vocal logs
          </span>
        </div>

        {/* Vocal Log Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {transcripts.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', gap: 14, padding: '40px 20px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(179, 143, 93, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(179, 143, 93, 0.1)' }}>
                <Mic className="w-7 h-7 text-[#B38F5D]" />
              </div>
              <p style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: '0.98rem' }}>Awaiting Spoken Input</p>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', maxWidth: 300, lineHeight: 1.6 }}>
                Click the primary microphone button to authorize clinical voice recording and start your session.
              </p>
            </div>
          ) : (
            transcripts.map((t, i) => (
              <div
                key={i}
                className={`message-bubble ${t.speaker === 'user' ? 'message-user' : 'message-ai'}`}
                style={{ 
                  maxWidth: '78%', 
                  whiteSpace: 'pre-wrap',
                  background: t.speaker === 'user' ? 'linear-gradient(135deg, var(--primary-deep), #2A437E)' : '#F8FAFC',
                  color: t.speaker === 'user' ? 'white' : 'var(--text-dark)',
                  border: t.speaker === 'user' ? 'none' : '1px solid rgba(226, 232, 240, 0.8)',
                  borderRadius: t.speaker === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.01)',
                  padding: '12px 18px',
                  fontSize: '0.85rem',
                  lineHeight: 1.55,
                  alignSelf: t.speaker === 'user' ? 'flex-end' : 'flex-start',
                  textAlign: 'left'
                }}
              >
                {t.text}
                <div style={{ fontSize: '0.62rem', marginTop: 8, textAlign: 'right', opacity: 0.65, display: 'flex', gap: 4, justifyContent: 'flex-end', borderTop: `1px solid ${t.speaker === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 0.6)'}`, paddingTop: 6 }}>
                  <strong>{t.speaker === 'user' ? '🎙️ Patient Voice' : '🤖 Dr. AIHCAS'}</strong> • {t.time}
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
