'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserStorage, StorageKeys } from '@/lib/storage';

type Transcript = { speaker: 'user' | 'ai'; text: string; time: string };

export default function VoicePage() {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'Standby' | 'Listening...' | 'Processing...' | 'Speaking...' | 'Call Ended' | 'Error'>('Standby');
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [waveHeights, setWaveHeights] = useState([5, 8, 12, 16, 12, 8, 5]);
  const recognitionRef = useRef<any>(null);
  const isActiveRef = useRef(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Animate wave
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive) {
      interval = setInterval(() => {
        setWaveHeights(() => Array.from({ length: 14 }, () => Math.floor(Math.random() * 40) + 8));
      }, 120);
    } else {
      setWaveHeights([5, 8, 12, 16, 20, 16, 12, 8, 5, 8, 12, 16, 12, 8]);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // Remove emojis, markdown symbols, and non-verbal characters for clean TTS
  const stripForSpeech = (text: string): string => text
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')   // emoji ranges
    .replace(/[\u{2600}-\u{26FF}]/gu, '')       // misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')       // dingbats
    .replace(/[*_`#~>]/g, '')                   // markdown symbols
    .replace(/\[.*?\]\(.*?\)/g, '')             // markdown links
    .replace(/⚕️|🩺|✅|🚨|💬|⚠️|❌/g, '')     // common medical emojis
    .replace(/\s{2,}/g, ' ')                    // collapse extra spaces
    .trim();

  const speak = useCallback((text: string, onEnd?: () => void) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(stripForSpeech(text));
    utterance.lang = 'en-IN';
    utterance.rate = 0.92;
    utterance.onend = () => {
      if (isActiveRef.current) setStatus('Listening...');
      onEnd?.();
    };
    setStatus('Speaking...');
    window.speechSynthesis.speak(utterance);
  }, []);

  const processTranscript = useCallback(async (transcript: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTranscripts(prev => [...prev, { speaker: 'user', text: transcript, time }]);
    setStatus('Processing...');
    try {
      const { chatAction } = await import('@/app/actions');

      // Load health profile for personalization
      let profile = null;
      try {
        const saved = UserStorage.getItem(StorageKeys.PROFILE, user?.userId);
        if (saved) profile = JSON.parse(saved);
      } catch (e) {}

      // Build history including the current message to ensure AI has full context
      const currentHistory = [
        ...transcripts.map(t => ({ sender: t.speaker, text: t.text })),
        { sender: 'user', text: transcript }
      ].map(m => ({
        role: m.sender === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.text }],
      }));

      // stringify to bypass Client Reference proxy issues
      const response = await chatAction(transcript, JSON.stringify(currentHistory), profile);
      const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setTranscripts(prev => [...prev, { speaker: 'ai', text: response, time: aiTime }]);
      speak(response);
    } catch {
      setStatus('Error');
      speak('Sorry, I had trouble processing that. Could you please repeat?');
    }
  }, [speak, transcripts]);

  const startRecognition = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = false;
    recog.lang = 'en-IN';

    recog.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      processTranscript(transcript);
    };

    recog.onerror = (event: any) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setStatus('Error');
      }
    };

    recog.onend = () => {
      if (isActiveRef.current) {
        // Restart after a short delay to allow speaking to finish
        setTimeout(() => {
          if (isActiveRef.current) {
            try {
              recog.start();
              setStatus('Listening...');
            } catch (e) {}
          }
        }, 300);
      }
    };

    recognitionRef.current = recog;
    try {
      recog.start();
    } catch (e) {}
  }, [processTranscript]);

  const toggleCall = () => {
    if (isActive) {
      // End call
      isActiveRef.current = false;
      setIsActive(false);
      setStatus('Call Ended');
      try { recognitionRef.current?.stop(); } catch (e) {}
      window.speechSynthesis.cancel();
      recognitionRef.current = null;
      setTimeout(() => setStatus('Standby'), 2500);
    } else {
      // Start call
      setIsActive(true);
      isActiveRef.current = true;
      setStatus('Listening...');
      // Doctor-like greeting
      const greeting = "Hello! I'm Dr. AIHCAS, your AI health assistant. I'm here to help you today. Please go ahead and tell me what's been bothering you, or how you're feeling.";
      const greetTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setTranscripts(prev => [...prev, { speaker: 'ai', text: greeting, time: greetTime }]);
      speak(greeting, () => {
        if (isActiveRef.current) startRecognition();
      });
    }
  };

  const clearTranscripts = () => setTranscripts([]);

  return (
    <div className="page-fade" style={{ display: 'flex', gap: '32px', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Left – Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: '0 0 380px', gap: '32px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '10px' }}>
            AI <span className="text-gradient">Voice Consultation</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: 320 }}>
            Talk naturally. Describe how you feel and get real-time health advice hands-free.
          </p>
        </div>

        {/* Mic Button */}
        <div style={{ position: 'relative', width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isActive && (
            <>
              <div className="mic-ripple" style={{ animationDelay: '0s' }} />
              <div className="mic-ripple" style={{ animationDelay: '0.7s' }} />
              <div className="mic-ripple" style={{ animationDelay: '1.4s' }} />
            </>
          )}
          <button id="btn-voice-toggle" onClick={toggleCall} className={`mic-button ${isActive ? 'active' : ''}`} style={{ width: 140, height: 140, fontSize: '3.5rem' }}>
            {isActive ? '⏹' : '🎤'}
          </button>
        </div>

        {/* Status Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <span style={{
            padding: '8px 24px', borderRadius: 100, fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em',
            background: isActive ? (status === 'Speaking...' ? '#E6FFF5' : status === 'Processing...' ? '#FFFBEA' : '#FFD6D6') : '#EAF6FF',
            color: isActive ? (status === 'Speaking...' ? '#178A6A' : status === 'Processing...' ? '#92400E' : '#E53E3E') : '#4DA6E8',
          }}>
            {status === 'Listening...' && '🎙 '}{status === 'Speaking...' && '🔊 '}{status === 'Processing...' && '⚡ '}{status}
          </span>

          {/* Waveform */}
          <div className="waveform" style={{ height: 48 }}>
            {waveHeights.map((h, i) => (
              <div key={i} className="wave-bar" style={{
                height: `${h}px`,
                width: 5,
                animationName: isActive ? 'waveBar' : 'none',
                animationDuration: '0.8s',
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationDelay: `${i * 0.07}s`,
                opacity: isActive ? 1 : 0.25,
              }} />
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="glass-card" style={{ padding: '16px 20px', textAlign: 'center', maxWidth: 320 }}>
          <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
            💡 Try saying: <em>&quot;I have been feeling dizzy and nauseous since this morning...&quot;</em>
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 16 }}>
          <button className="btn btn-secondary btn-icon" title="Mute" onClick={() => window.speechSynthesis.pause()}>🔇</button>
          <button className="btn btn-secondary btn-icon" title="Clear Transcript" onClick={clearTranscripts}>🗑️</button>
          <button className="btn btn-secondary btn-icon" title="Settings">⚙️</button>
        </div>
      </div>

      {/* Right – Transcript */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(245,248,255,0.5)', borderRadius: 24, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🤖</div>
            <div>
              <div style={{ fontWeight: 700 }}>AI Health Assistant</div>
              <div style={{ fontSize: '0.78rem', color: isActive ? '#2EC4A0' : 'var(--text-light)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: isActive ? '#2EC4A0' : 'var(--text-light)', display: 'inline-block' }} />
                {isActive ? 'Active' : 'Standby'}
              </div>
            </div>
          </div>
          <span className="badge badge-blue">{transcripts.length} exchanges</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {transcripts.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🎤</div>
              <p style={{ fontWeight: 600 }}>Press the mic to start your voice consultation</p>
              <p style={{ fontSize: '0.85rem', marginTop: 6 }}>Your conversation will appear here in real time.</p>
            </div>
          ) : (
            transcripts.map((t, i) => (
              <div key={i} className={`message-bubble ${t.speaker === 'user' ? 'message-user' : 'message-ai'}`} style={{ maxWidth: '75%' }}>
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
