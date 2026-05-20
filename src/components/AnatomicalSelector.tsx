'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Activity, 
  Sparkles, 
  ShieldAlert, 
  Check, 
  RotateCcw, 
  Info,
  Layers,
  Sparkle
} from 'lucide-react';

// Symptom list grouped by region
const SYMPTOMS_BY_REGION = {
  head: {
    title: 'Head & Neck',
    icon: '🧠',
    items: ['Headache', 'Migraine', 'Dizziness', 'Sore Throat', 'Neck Stiffness', 'Nasal Congestion', 'Eye Strain', 'Toothache']
  },
  chest: {
    title: 'Chest & Torso',
    icon: '🫁',
    items: ['Chest Pain', 'Shortness of Breath', 'Palpitations', 'Persistent Cough', 'Heartburn', 'Wheezing']
  },
  abdomen: {
    title: 'Abdomen & Core',
    icon: '🍏',
    items: ['Stomach Ache', 'Nausea', 'Bloating', 'Acid Reflux', 'Abdominal Cramps', 'Indigestion', 'Lower Back Ache']
  },
  arms: {
    title: 'Upper Extremities (Arms)',
    icon: '💪',
    items: ['Arm Numbness', 'Muscle Weakness', 'Tingling Sensation', 'Shoulder Stiffness', 'Wrist Ache']
  },
  joints: {
    title: 'Joints & Bones',
    icon: '🦴',
    items: ['Joint Pain', 'Stiffness', 'Joint Swelling', 'Knee Ache', 'Elbow Pain']
  },
  skin: {
    title: 'Skin & Integumentary',
    icon: '✨',
    items: ['Skin Rash', 'Dry Itchy Skin', 'Local Redness', 'Hives', 'Blemishes']
  },
  legs: {
    title: 'Lower Extremities (Legs)',
    icon: '🚶',
    items: ['Leg Cramps', 'Swollen Ankles', 'Leg Weakness', 'Calf Soreness', 'Numbness']
  }
};

interface AnatomicalSelectorProps {
  onInjectSymptoms: (symptomsText: string) => void;
  onDirectSubmit: (symptomsText: string) => void;
}

export default function AnatomicalSelector({ onInjectSymptoms, onDirectSubmit }: AnatomicalSelectorProps) {
  const [activeRegion, setActiveRegion] = useState<keyof typeof SYMPTOMS_BY_REGION | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<string, string[]>>({});

  const toggleSymptom = (region: string, symptom: string) => {
    setSelectedSymptoms(prev => {
      const regionList = prev[region] || [];
      const updated = regionList.includes(symptom)
        ? regionList.filter(s => s !== symptom)
        : [...regionList, symptom];
      
      return {
        ...prev,
        [region]: updated
      };
    });
  };

  const getFlatSymptoms = () => {
    return Object.entries(selectedSymptoms).flatMap(([region, items]) => {
      const regionTitle = SYMPTOMS_BY_REGION[region as keyof typeof SYMPTOMS_BY_REGION]?.title || region;
      return items.map(item => ({ region: regionTitle, name: item }));
    });
  };

  const clearAll = () => {
    setSelectedSymptoms({});
    setActiveRegion(null);
  };

  const handleInject = () => {
    const flat = getFlatSymptoms();
    if (flat.length === 0) return;
    
    const formattedText = `Patient selected symptoms from interactive map: ${flat.map(f => `${f.name} (${f.region})`).join(', ')}.`;
    onInjectSymptoms(formattedText);
  };

  const handleAnalyze = () => {
    const flat = getFlatSymptoms();
    if (flat.length === 0) return;
    
    const formattedText = `I am experiencing the following symptoms selected from the interactive anatomical locator:\n\n${flat.map(f => `• ${f.name} (${f.region})`).join('\n')}\n\nPlease perform a clinical risk triage, map out potential causes, and advise on immediate next steps.`;
    onDirectSubmit(formattedText);
  };

  const flatSymptoms = getFlatSymptoms();

  return (
    <div className="glass-card animate-fadeInUp" style={{ padding: '24px', background: 'white', border: '1.5px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 850, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity className="w-4.5 h-4.5 text-[#1E3A8A]" /> Interactive Anatomical Selector
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Tap body sections to select symptoms. Integrated with active AI diagnostic models.
          </p>
        </div>
        {flatSymptoms.length > 0 && (
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={clearAll}
            style={{ borderRadius: 100, fontSize: '0.72rem', padding: '6px 12px', fontWeight: 700 }}
          >
            <RotateCcw className="w-3 h-3" /> Clear Map
          </button>
        )}
      </div>

      <div className="stack-mobile" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Left Side: Glowing SVG Human Avatar Silhouette */}
        <div style={{
          flex: '0 0 200px',
          height: '430px',
          background: 'radial-gradient(circle, rgba(179,143,93,0.02) 0%, rgba(30,58,138,0.01) 100%)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '10px',
          overflow: 'hidden'
        }}>
          {/* Subtle medical scanning grid backdrop */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'linear-gradient(to right, #B38F5D 1px, transparent 1px), linear-gradient(to bottom, #B38F5D 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

          <svg viewBox="0 0 220 460" style={{ width: '100%', height: '100%', cursor: 'pointer' }}>
            <defs>
              <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#B38F5D" stopOpacity="0.04" />
              </linearGradient>
              <linearGradient id="activeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.3" stopColor-red-glow="0 0 10px #1E3A8A" />
                <stop offset="100%" stopColor="#B38F5D" stopOpacity="0.25" />
              </linearGradient>
            </defs>

            {/* Static Base Outline representing human posture */}
            <path 
              d="M110,35 C122,35 130,42 130,52 C130,62 122,70 110,70 C98,70 90,62 90,52 C90,42 98,35 110,35 Z M102,70 L102,86 L118,86 L118,70 Z M76,86 C64,130 52,180 50,225 C49,235 60,235 62,225 C68,180 74,138 78,110 L78,225 C78,290 82,350 82,425 C82,435 94,435 94,425 C95,350 96,290 98,225 L102,225 C104,290 105,350 106,425 C106,435 118,435 118,425 C118,350 122,290 122,225 L122,110 C126,138 132,180 138,225 C140,235 151,235 150,225 C148,180 136,130 124,86 Z" 
              fill="url(#bodyGradient)" 
              stroke="rgba(148, 163, 184, 0.25)" 
              strokeWidth="1.5" 
            />

            {/* CLICKABLE / HOVERABLE REGIONS */}
            
            {/* Head & Neck */}
            <path 
              d="M110,25 C125,25 133,35 133,48 C133,62 125,72 110,72 C95,72 87,62 87,48 C87,35 95,25 110,25 Z M100,72 L100,86 L120,86 L120,72 Z"
              fill={activeRegion === 'head' ? 'url(#activeGradient)' : 'transparent'}
              stroke={activeRegion === 'head' ? 'var(--accent-deep)' : 'transparent'}
              strokeWidth="2"
              onClick={() => setActiveRegion('head')}
              className="body-part-hover"
              style={{ transition: 'all 0.3s' }}
            />

            {/* Chest */}
            <path 
              d="M80,86 L140,86 C136,115 132,142 130,155 L90,155 C88,142 84,115 80,86 Z"
              fill={activeRegion === 'chest' ? 'url(#activeGradient)' : 'transparent'}
              stroke={activeRegion === 'chest' ? 'var(--accent-deep)' : 'transparent'}
              strokeWidth="2"
              onClick={() => setActiveRegion('chest')}
              className="body-part-hover"
              style={{ transition: 'all 0.3s' }}
            />

            {/* Abdomen */}
            <path 
              d="M90,155 L130,155 C127,180 124,205 122,225 L98,225 C96,205 93,180 90,155 Z"
              fill={activeRegion === 'abdomen' ? 'url(#activeGradient)' : 'transparent'}
              stroke={activeRegion === 'abdomen' ? 'var(--accent-deep)' : 'transparent'}
              strokeWidth="2"
              onClick={() => setActiveRegion('abdomen')}
              className="body-part-hover"
              style={{ transition: 'all 0.3s' }}
            />

            {/* Arms (Combined for simple clicking) */}
            <path 
              d="M78,86 C68,125 58,165 52,210 C50,225 61,225 63,212 C69,172 73,138 76,108 Z M142,86 C152,125 162,165 168,210 C170,225 159,225 157,212 C151,172 147,138 144,108 Z"
              fill={activeRegion === 'arms' ? 'url(#activeGradient)' : 'transparent'}
              stroke={activeRegion === 'arms' ? 'var(--accent-deep)' : 'transparent'}
              strokeWidth="2"
              onClick={() => setActiveRegion('arms')}
              className="body-part-hover"
              style={{ transition: 'all 0.3s' }}
            />

            {/* Legs */}
            <path 
              d="M78,225 L98,225 C96,285 94,345 92,425 C92,434 82,434 82,425 C82,345 80,285 78,225 Z M122,225 L142,225 C140,285 138,345 138,425 C138,434 128,434 128,425 C128,345 125,285 122,225 Z"
              fill={activeRegion === 'legs' ? 'url(#activeGradient)' : 'transparent'}
              stroke={activeRegion === 'legs' ? 'var(--accent-deep)' : 'transparent'}
              strokeWidth="2"
              onClick={() => setActiveRegion('legs')}
              className="body-part-hover"
              style={{ transition: 'all 0.3s' }}
            />

            {/* Joints (represented as active pulsing indicator circles) */}
            <g onClick={() => setActiveRegion('joints')}>
              {/* Shoulders */}
              <circle cx="78" cy="94" r="6" fill={activeRegion === 'joints' ? 'var(--accent-deep)' : 'rgba(30, 58, 138, 0.2)'} stroke="white" strokeWidth="1" />
              <circle cx="142" cy="94" r="6" fill={activeRegion === 'joints' ? 'var(--accent-deep)' : 'rgba(30, 58, 138, 0.2)'} stroke="white" strokeWidth="1" />
              
              {/* Elbows */}
              <circle cx="65" cy="155" r="5" fill={activeRegion === 'joints' ? 'var(--accent-deep)' : 'rgba(30, 58, 138, 0.2)'} stroke="white" strokeWidth="1" />
              <circle cx="155" cy="155" r="5" fill={activeRegion === 'joints' ? 'var(--accent-deep)' : 'rgba(30, 58, 138, 0.2)'} stroke="white" strokeWidth="1" />

              {/* Knees */}
              <circle cx="86" cy="320" r="6" fill={activeRegion === 'joints' ? 'var(--accent-deep)' : 'rgba(30, 58, 138, 0.2)'} stroke="white" strokeWidth="1" />
              <circle cx="134" cy="320" r="6" fill={activeRegion === 'joints' ? 'var(--accent-deep)' : 'rgba(30, 58, 138, 0.2)'} stroke="white" strokeWidth="1" />
            </g>

            {/* Skin Node Selector at top right */}
            <g onClick={() => setActiveRegion('skin')}>
              <circle cx="180" cy="50" r="14" fill={activeRegion === 'skin' ? 'url(#activeGradient)' : 'rgba(255,255,255,0.7)'} stroke={activeRegion === 'skin' ? 'var(--accent-deep)' : 'var(--border)'} strokeWidth="1.5" />
              <text x="180" y="54" fontSize="12" textAnchor="middle">✨</text>
            </g>
          </svg>

          {/* Quick HUD guide overlay */}
          <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(255,255,255,0.85)', padding: '6px 10px', borderRadius: 10, border: '1px solid var(--border)', fontSize: '0.68rem', pointerEvents: 'none' }}>
            <span style={{ fontWeight: 800, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#B38F5D', display: 'inline-block', animation: 'pulse 1.2s infinite' }} />
              Anatomical Map
            </span>
            <span style={{ color: 'var(--text-muted)' }}>Tap body section to filter symptoms.</span>
          </div>
        </div>

        {/* Right Side: Dynamic Symptom Tags & Triage Checklist */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, alignSelf: 'stretch' }}>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(248, 250, 252, 0.65)', border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '20px', padding: '20px', minHeight: '260px' }}>
            
            <AnimatePresence mode="wait">
              {activeRegion ? (
                <motion.div
                  key={activeRegion}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8, borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <span style={{ fontSize: '1.4rem' }}>{SYMPTOMS_BY_REGION[activeRegion].icon}</span>
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                        {SYMPTOMS_BY_REGION[activeRegion].title}
                      </h4>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 600 }}>Select symptoms to inject into consulting thread.</p>
                    </div>
                  </div>

                  {/* Symptom chips container */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, overflowY: 'auto', flex: 1, alignContent: 'flex-start', paddingRight: 4 }}>
                    {SYMPTOMS_BY_REGION[activeRegion].items.map(symptom => {
                      const isSelected = selectedSymptoms[activeRegion]?.includes(symptom);
                      return (
                        <button
                          key={symptom}
                          onClick={() => toggleSymptom(activeRegion, symptom)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '100px',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontFamily: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            background: isSelected ? 'rgba(30, 58, 138, 0.05)' : 'white',
                            color: isSelected ? 'var(--primary-deep)' : 'var(--text-muted)',
                            border: isSelected ? '1.5px solid var(--primary-deep)' : '1px solid rgba(226, 232, 240, 0.9)',
                            boxShadow: isSelected ? '0 2px 8px rgba(30,58,138,0.03)' : 'none'
                          }}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#1E3A8A]" />}
                          {symptom}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles className="w-4 h-4 text-[#B38F5D]" />
                  </div>
                  <p style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: '0.88rem' }}>No Active Region Selected</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: 220, lineHeight: 1.5 }}>
                    Tap any highlighted body sector in the model map to view target symptom categories.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Active Checklist Overview */}
          {flatSymptoms.length > 0 && (
            <div className="animate-fadeInUp" style={{ padding: '16px', background: 'rgba(179,143,93,0.02)', border: '1px solid rgba(179,143,93,0.1)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#B38F5D', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'left' }}>
                <Layers className="w-3.5 h-3.5 text-[#B38F5D]" /> Mapped Intake Symptoms ({flatSymptoms.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: '68px', overflowY: 'auto', paddingRight: 4 }}>
                {flatSymptoms.map(f => (
                  <span 
                    key={`${f.region}-${f.name}`} 
                    style={{ 
                      padding: '4px 10px', 
                      borderRadius: 100, 
                      background: 'white', 
                      border: '1px solid rgba(226, 232, 240, 0.7)', 
                      fontSize: '0.7rem', 
                      fontWeight: 700, 
                      color: 'var(--text-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent-deep)' }} />
                    {f.name}
                  </span>
                ))}
              </div>
              
              {/* Submission Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={handleInject}
                  style={{ borderRadius: 100, fontWeight: 700, justifyContent: 'center' }}
                  title="Inject into input box"
                >
                  Fill Chat Input
                </button>
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={handleAnalyze}
                  style={{ borderRadius: 100, fontWeight: 700, justifyContent: 'center' }}
                  title="Direct submit to AI Doctor"
                >
                  Analyze Symptoms
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
