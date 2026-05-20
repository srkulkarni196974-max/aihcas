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
  Layers,
  ChevronRight,
  ArrowLeftRight,
  Sparkle
} from 'lucide-react';

// Front view symptom regions
const FRONT_REGIONS = {
  head_front: {
    title: 'Head & Neck (Front)',
    icon: '🧠',
    items: ['Headache', 'Migraine', 'Sore Throat', 'Neck Stiffness', 'Nasal Congestion', 'Eye Strain', 'Toothache']
  },
  chest_front: {
    title: 'Chest & Torso',
    icon: '🫁',
    items: ['Chest Pain', 'Shortness of Breath', 'Palpitations', 'Persistent Cough', 'Heartburn', 'Wheezing']
  },
  abdomen_front: {
    title: 'Abdomen & Core',
    icon: '🍏',
    items: ['Stomach Ache', 'Nausea', 'Bloating', 'Acid Reflux', 'Abdominal Cramps', 'Indigestion']
  },
  arms_front: {
    title: 'Arms (Front)',
    icon: '💪',
    items: ['Arm Numbness', 'Muscle Weakness', 'Tingling Sensation', 'Wrist Ache']
  },
  joints_front: {
    title: 'Joints (Front)',
    icon: '🦴',
    items: ['Shoulder Pain', 'Elbow Pain', 'Knee Ache', 'Wrist Pain']
  },
  skin_front: {
    title: 'Skin (Front)',
    icon: '✨',
    items: ['Skin Rash', 'Dry Itchy Skin', 'Local Redness', 'Hives']
  },
  legs_front: {
    title: 'Legs (Front)',
    icon: '🚶',
    items: ['Leg Cramps', 'Swollen Ankles', 'Leg Weakness', 'Thigh Pain']
  }
};

// Back view symptom regions
const BACK_REGIONS = {
  head_back: {
    title: 'Head & Neck (Back)',
    icon: '🧠',
    items: ['Tension Headache', 'Back Neck Pain', 'Occipital Neuralgia', 'Stiff Neck']
  },
  upper_back: {
    title: 'Upper Back',
    icon: '🫁',
    items: ['Upper Back Stiffness', 'Shoulder Blade Pain', 'Muscle Knots', 'Rib Cage Discomfort']
  },
  lower_back: {
    title: 'Lower Back & Pelvis',
    icon: '🍏',
    items: ['Lower Back Pain', 'Sciatica', 'Tailbone Pain', 'Pelvic Ache', 'Hip Joint Stiffness']
  },
  arms_back: {
    title: 'Arms (Back)',
    icon: '💪',
    items: ['Arm Stiffness', 'Triceps Ache', 'Extensor Muscle Strain']
  },
  joints_back: {
    title: 'Joints (Back)',
    icon: '🦴',
    items: ['Shoulder Blade Tension', 'Elbow Stiffness', 'Hip Stiffness', 'Ankle Stiffness']
  },
  skin_back: {
    title: 'Skin (Back)',
    icon: '✨',
    items: ['Back Rash', 'Itching', 'Sunburn', 'Hives']
  },
  legs_back: {
    title: 'Legs (Back)',
    icon: '🚶',
    items: ['Hamstring Strain', 'Calf Stiffness', 'Heel Pain', 'Achilles Tendon Pain']
  }
};

// Combined for easy mapping
const ALL_REGIONS = {
  ...FRONT_REGIONS,
  ...BACK_REGIONS
};

interface AnatomicalSelectorProps {
  onInjectSymptoms: (symptomsText: string) => void;
  onDirectSubmit: (symptomsText: string) => void;
}

export default function AnatomicalSelector({ onInjectSymptoms, onDirectSubmit }: AnatomicalSelectorProps) {
  const [viewMode, setViewMode] = useState<'front' | 'back'>('front');
  const [activeRegion, setActiveRegion] = useState<keyof typeof ALL_REGIONS | null>(null);
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

  const clearAll = () => {
    setSelectedSymptoms({});
    setActiveRegion(null);
  };

  const getSymptomSummary = () => {
    const frontItems: { region: string; name: string }[] = [];
    const backItems: { region: string; name: string }[] = [];

    Object.entries(selectedSymptoms).forEach(([regionKey, items]) => {
      const regionInfo = ALL_REGIONS[regionKey as keyof typeof ALL_REGIONS];
      if (!regionInfo || items.length === 0) return;

      const isFront = regionKey in FRONT_REGIONS;
      items.forEach(item => {
        if (isFront) {
          frontItems.push({ region: regionInfo.title, name: item });
        } else {
          backItems.push({ region: regionInfo.title, name: item });
        }
      });
    });

    return { frontItems, backItems };
  };

  const { frontItems, backItems } = getSymptomSummary();
  const totalSelected = frontItems.length + backItems.length;

  const handleInject = () => {
    if (totalSelected === 0) return;
    
    const parts = [];
    if (frontItems.length > 0) {
      parts.push(`Front Body: ${frontItems.map(f => `${f.name} (${f.region})`).join(', ')}`);
    }
    if (backItems.length > 0) {
      parts.push(`Back Body: ${backItems.map(b => `${b.name} (${b.region})`).join(', ')}`);
    }

    const formattedText = `Patient mapped symptoms: ${parts.join(' | ')}.`;
    onInjectSymptoms(formattedText);
  };

  const handleAnalyze = () => {
    if (totalSelected === 0) return;

    const parts = [];
    if (frontItems.length > 0) {
      parts.push(`[Front View Symptoms]\n${frontItems.map(f => `• ${f.name} (${f.region})`).join('\n')}`);
    }
    if (backItems.length > 0) {
      parts.push(`[Back View Symptoms]\n${backItems.map(b => `• ${b.name} (${b.region})`).join('\n')}`);
    }

    const formattedText = `I have selected the following symptoms on the interactive anatomical locator:\n\n${parts.join('\n\n')}\n\nPlease perform a clinical risk triage, map out potential causes, and advise on immediate next steps.`;
    onDirectSubmit(formattedText);
  };

  // Check if a specific region has any active symptoms selected
  const hasSelectedInRegion = (regionKey: string) => {
    return (selectedSymptoms[regionKey]?.length || 0) > 0;
  };

  return (
    <div className="glass-card animate-fadeInUp" style={{ padding: '24px', background: 'white', border: '1.5px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* Header Widget */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 850, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity className="w-4.5 h-4.5 text-[#1E3A8A]" /> Interactive Anatomical Selector
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Tap body sections to select symptoms. Persists Front & Back views simultaneously.
          </p>
        </div>
        {totalSelected > 0 && (
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={clearAll}
            style={{ borderRadius: 100, fontSize: '0.72rem', padding: '6px 12px', fontWeight: 700 }}
          >
            <RotateCcw className="w-3 h-3" /> Clear Map
          </button>
        )}
      </div>

      {/* Segmented View Switcher (Glassmorphic Slider) */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
        <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '100px', border: '1px solid rgba(226, 232, 240, 0.8)', position: 'relative', width: '220px' }}>
          <button
            onClick={() => { setViewMode('front'); setActiveRegion(null); }}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: '100px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 800,
              fontFamily: 'inherit',
              transition: 'all 0.3s',
              background: viewMode === 'front' ? 'white' : 'transparent',
              color: viewMode === 'front' ? 'var(--primary-deep)' : 'var(--text-light)',
              boxShadow: viewMode === 'front' ? '0 2px 8px rgba(30, 58, 138, 0.08)' : 'none',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4
            }}
          >
            Front View
          </button>
          <button
            onClick={() => { setViewMode('back'); setActiveRegion(null); }}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: '100px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 800,
              fontFamily: 'inherit',
              transition: 'all 0.3s',
              background: viewMode === 'back' ? 'white' : 'transparent',
              color: viewMode === 'back' ? 'var(--primary-deep)' : 'var(--text-light)',
              boxShadow: viewMode === 'back' ? '0 2px 8px rgba(30, 58, 138, 0.08)' : 'none',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4
            }}
          >
            Back View
          </button>
        </div>
      </div>

      {/* Main Selector Grid Layout */}
      <div className="stack-mobile" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Left Side: Glowing 3D Rotating SVG Human Silhouette */}
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
          overflow: 'hidden',
          perspective: '1000px' // Enables the 3D rotating perspective
        }}>
          {/* Subtle medical scanning grid backdrop */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'linear-gradient(to right, #B38F5D 1px, transparent 1px), linear-gradient(to bottom, #B38F5D 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

          {/* 3D Flippable Container */}
          <motion.div
            style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', position: 'relative' }}
            animate={{ rotateY: viewMode === 'front' ? 0 : 180 }}
            transition={{ type: 'spring', damping: 22, stiffness: 120 }}
          >
            
            {/* FRONT ANATOMICAL SILHOUETTE */}
            <motion.div
              style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg viewBox="0 0 220 460" style={{ width: '100%', height: '100%', cursor: 'pointer' }}>
                <defs>
                  <linearGradient id="bodyGradFront" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#B38F5D" stopOpacity="0.04" />
                  </linearGradient>
                  <linearGradient id="activeGradFront" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#B38F5D" stopOpacity="0.25" />
                  </linearGradient>
                </defs>

                {/* Base Body Path */}
                <path 
                  d="M110,35 C122,35 130,42 130,52 C130,62 122,70 110,70 C98,70 90,62 90,52 C90,42 98,35 110,35 Z M102,70 L102,86 L118,86 L118,70 Z M76,86 C64,130 52,180 50,225 C49,235 60,235 62,225 C68,180 74,138 78,110 L78,225 C78,290 82,350 82,425 C82,435 94,435 94,425 C95,350 96,290 98,225 L102,225 C104,290 105,350 106,425 C106,435 118,435 118,425 C118,350 122,290 122,225 L122,110 C126,138 132,180 138,225 C140,235 151,235 150,225 C148,180 136,130 124,86 Z" 
                  fill="url(#bodyGradFront)" 
                  stroke="rgba(148, 163, 184, 0.25)" 
                  strokeWidth="1.5" 
                />

                {/* Regions */}
                {/* Head & Neck Front */}
                <path 
                  d="M110,25 C125,25 133,35 133,48 C133,62 125,72 110,72 C95,72 87,62 87,48 C87,35 95,25 110,25 Z M100,72 L100,86 L120,86 L120,72 Z"
                  fill={activeRegion === 'head_front' ? 'url(#activeGradFront)' : hasSelectedInRegion('head_front') ? 'rgba(30, 58, 138, 0.15)' : 'transparent'}
                  stroke={activeRegion === 'head_front' ? 'var(--accent-deep)' : hasSelectedInRegion('head_front') ? 'rgba(30, 58, 138, 0.4)' : 'transparent'}
                  strokeWidth="2"
                  onClick={() => setActiveRegion('head_front')}
                />

                {/* Chest Front */}
                <path 
                  d="M80,86 L140,86 C136,115 132,142 130,155 L90,155 C88,142 84,115 80,86 Z"
                  fill={activeRegion === 'chest_front' ? 'url(#activeGradFront)' : hasSelectedInRegion('chest_front') ? 'rgba(30, 58, 138, 0.15)' : 'transparent'}
                  stroke={activeRegion === 'chest_front' ? 'var(--accent-deep)' : hasSelectedInRegion('chest_front') ? 'rgba(30, 58, 138, 0.4)' : 'transparent'}
                  strokeWidth="2"
                  onClick={() => setActiveRegion('chest_front')}
                />

                {/* Abdomen Front */}
                <path 
                  d="M90,155 L130,155 C127,180 124,205 122,225 L98,225 C96,205 93,180 90,155 Z"
                  fill={activeRegion === 'abdomen_front' ? 'url(#activeGradFront)' : hasSelectedInRegion('abdomen_front') ? 'rgba(30, 58, 138, 0.15)' : 'transparent'}
                  stroke={activeRegion === 'abdomen_front' ? 'var(--accent-deep)' : hasSelectedInRegion('abdomen_front') ? 'rgba(30, 58, 138, 0.4)' : 'transparent'}
                  strokeWidth="2"
                  onClick={() => setActiveRegion('abdomen_front')}
                />

                {/* Arms Front */}
                <path 
                  d="M78,86 C68,125 58,165 52,210 C50,225 61,225 63,212 C69,172 73,138 76,108 Z M142,86 C152,125 162,165 168,210 C170,225 159,225 157,212 C151,172 147,138 144,108 Z"
                  fill={activeRegion === 'arms_front' ? 'url(#activeGradFront)' : hasSelectedInRegion('arms_front') ? 'rgba(30, 58, 138, 0.15)' : 'transparent'}
                  stroke={activeRegion === 'arms_front' ? 'var(--accent-deep)' : hasSelectedInRegion('arms_front') ? 'rgba(30, 58, 138, 0.4)' : 'transparent'}
                  strokeWidth="2"
                  onClick={() => setActiveRegion('arms_front')}
                />

                {/* Legs Front */}
                <path 
                  d="M78,225 L98,225 C96,285 94,345 92,425 C92,434 82,434 82,425 C82,345 80,285 78,225 Z M122,225 L142,225 C140,285 138,345 138,425 C138,434 128,434 128,425 C128,345 125,285 122,225 Z"
                  fill={activeRegion === 'legs_front' ? 'url(#activeGradFront)' : hasSelectedInRegion('legs_front') ? 'rgba(30, 58, 138, 0.15)' : 'transparent'}
                  stroke={activeRegion === 'legs_front' ? 'var(--accent-deep)' : hasSelectedInRegion('legs_front') ? 'rgba(30, 58, 138, 0.4)' : 'transparent'}
                  strokeWidth="2"
                  onClick={() => setActiveRegion('legs_front')}
                />

                {/* Joint Nodes Front */}
                <g onClick={() => setActiveRegion('joints_front')}>
                  <circle cx="78" cy="94" r="6" fill={activeRegion === 'joints_front' ? 'var(--accent-deep)' : hasSelectedInRegion('joints_front') ? '#B38F5D' : 'rgba(30, 58, 138, 0.2)'} stroke="white" strokeWidth="1" />
                  <circle cx="142" cy="94" r="6" fill={activeRegion === 'joints_front' ? 'var(--accent-deep)' : hasSelectedInRegion('joints_front') ? '#B38F5D' : 'rgba(30, 58, 138, 0.2)'} stroke="white" strokeWidth="1" />
                  <circle cx="65" cy="155" r="5" fill={activeRegion === 'joints_front' ? 'var(--accent-deep)' : hasSelectedInRegion('joints_front') ? '#B38F5D' : 'rgba(30, 58, 138, 0.2)'} stroke="white" strokeWidth="1" />
                  <circle cx="155" cy="155" r="5" fill={activeRegion === 'joints_front' ? 'var(--accent-deep)' : hasSelectedInRegion('joints_front') ? '#B38F5D' : 'rgba(30, 58, 138, 0.2)'} stroke="white" strokeWidth="1" />
                  <circle cx="86" cy="320" r="6" fill={activeRegion === 'joints_front' ? 'var(--accent-deep)' : hasSelectedInRegion('joints_front') ? '#B38F5D' : 'rgba(30, 58, 138, 0.2)'} stroke="white" strokeWidth="1" />
                  <circle cx="134" cy="320" r="6" fill={activeRegion === 'joints_front' ? 'var(--accent-deep)' : hasSelectedInRegion('joints_front') ? '#B38F5D' : 'rgba(30, 58, 138, 0.2)'} stroke="white" strokeWidth="1" />
                </g>

                {/* Skin Front Icon */}
                <g onClick={() => setActiveRegion('skin_front')}>
                  <circle cx="180" cy="50" r="14" fill={activeRegion === 'skin_front' ? 'url(#activeGradFront)' : hasSelectedInRegion('skin_front') ? 'rgba(179,143,93,0.15)' : 'rgba(255,255,255,0.7)'} stroke={activeRegion === 'skin_front' ? 'var(--accent-deep)' : hasSelectedInRegion('skin_front') ? '#B38F5D' : 'var(--border)'} strokeWidth="1.5" />
                  <text x="180" y="54" fontSize="12" textAnchor="middle">✨</text>
                </g>
              </svg>
            </motion.div>

            {/* BACK ANATOMICAL SILHOUETTE */}
            <motion.div
              style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotateY(180deg)' }}
            >
              <svg viewBox="0 0 220 460" style={{ width: '100%', height: '100%', cursor: 'pointer' }}>
                <defs>
                  <linearGradient id="bodyGradBack" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#B38F5D" stopOpacity="0.04" />
                  </linearGradient>
                  <linearGradient id="activeGradBack" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#B38F5D" stopOpacity="0.25" />
                  </linearGradient>
                </defs>

                {/* Base Silhouette Path (Slightly adjusted shoulders/neck for back view) */}
                <path 
                  d="M110,35 C122,35 130,42 130,52 C130,62 122,70 110,70 C98,70 90,62 90,52 C90,42 98,35 110,35 Z M102,70 L102,86 L118,86 L118,70 Z M76,86 C64,130 52,180 50,225 C49,235 60,235 62,225 C68,180 74,138 78,110 L78,225 C78,290 82,350 82,425 C82,435 94,435 94,425 C95,350 96,290 98,225 L102,225 C104,290 105,350 106,425 C106,435 118,435 118,425 C118,350 122,290 122,225 L122,110 C126,138 132,180 138,225 C140,235 151,235 150,225 C148,180 136,130 124,86 Z" 
                  fill="url(#bodyGradBack)" 
                  stroke="rgba(148, 163, 184, 0.25)" 
                  strokeWidth="1.5" 
                />

                {/* Head & Neck Back */}
                <path 
                  d="M110,25 C125,25 133,35 133,48 C133,62 125,72 110,72 C95,72 87,62 87,48 C87,35 95,25 110,25 Z M100,72 L100,86 L120,86 L120,72 Z"
                  fill={activeRegion === 'head_back' ? 'url(#activeGradBack)' : hasSelectedInRegion('head_back') ? 'rgba(30, 58, 138, 0.15)' : 'transparent'}
                  stroke={activeRegion === 'head_back' ? 'var(--accent-deep)' : hasSelectedInRegion('head_back') ? 'rgba(30, 58, 138, 0.4)' : 'transparent'}
                  strokeWidth="2"
                  onClick={() => setActiveRegion('head_back')}
                />

                {/* Upper Back */}
                <path 
                  d="M80,86 L140,86 C136,115 132,142 130,155 L90,155 C88,142 84,115 80,86 Z"
                  fill={activeRegion === 'upper_back' ? 'url(#activeGradBack)' : hasSelectedInRegion('upper_back') ? 'rgba(30, 58, 138, 0.15)' : 'transparent'}
                  stroke={activeRegion === 'upper_back' ? 'var(--accent-deep)' : hasSelectedInRegion('upper_back') ? 'rgba(30, 58, 138, 0.4)' : 'transparent'}
                  strokeWidth="2"
                  onClick={() => setActiveRegion('upper_back')}
                />

                {/* Lower Back & Pelvis */}
                <path 
                  d="M90,155 L130,155 C127,180 124,205 122,225 L98,225 C96,205 93,180 90,155 Z"
                  fill={activeRegion === 'lower_back' ? 'url(#activeGradBack)' : hasSelectedInRegion('lower_back') ? 'rgba(30, 58, 138, 0.15)' : 'transparent'}
                  stroke={activeRegion === 'lower_back' ? 'var(--accent-deep)' : hasSelectedInRegion('lower_back') ? 'rgba(30, 58, 138, 0.4)' : 'transparent'}
                  strokeWidth="2"
                  onClick={() => setActiveRegion('lower_back')}
                />

                {/* Arms Back */}
                <path 
                  d="M78,86 C68,125 58,165 52,210 C50,225 61,225 63,212 C69,172 73,138 76,108 Z M142,86 C152,125 162,165 168,210 C170,225 159,225 157,212 C151,172 147,138 144,108 Z"
                  fill={activeRegion === 'arms_back' ? 'url(#activeGradBack)' : hasSelectedInRegion('arms_back') ? 'rgba(30, 58, 138, 0.15)' : 'transparent'}
                  stroke={activeRegion === 'arms_back' ? 'var(--accent-deep)' : hasSelectedInRegion('arms_back') ? 'rgba(30, 58, 138, 0.4)' : 'transparent'}
                  strokeWidth="2"
                  onClick={() => setActiveRegion('arms_back')}
                />

                {/* Legs Back */}
                <path 
                  d="M78,225 L98,225 C96,285 94,345 92,425 C92,434 82,434 82,425 C82,345 80,285 78,225 Z M122,225 L142,225 C140,285 138,345 138,425 C138,434 128,434 128,425 C128,345 125,285 122,225 Z"
                  fill={activeRegion === 'legs_back' ? 'url(#activeGradBack)' : hasSelectedInRegion('legs_back') ? 'rgba(30, 58, 138, 0.15)' : 'transparent'}
                  stroke={activeRegion === 'legs_back' ? 'var(--accent-deep)' : hasSelectedInRegion('legs_back') ? 'rgba(30, 58, 138, 0.4)' : 'transparent'}
                  strokeWidth="2"
                  onClick={() => setActiveRegion('legs_back')}
                />

                {/* Joint Nodes Back */}
                <g onClick={() => setActiveRegion('joints_back')}>
                  <circle cx="78" cy="94" r="6" fill={activeRegion === 'joints_back' ? 'var(--accent-deep)' : hasSelectedInRegion('joints_back') ? '#B38F5D' : 'rgba(30, 58, 138, 0.2)'} stroke="white" strokeWidth="1" />
                  <circle cx="142" cy="94" r="6" fill={activeRegion === 'joints_back' ? 'var(--accent-deep)' : hasSelectedInRegion('joints_back') ? '#B38F5D' : 'rgba(30, 58, 138, 0.2)'} stroke="white" strokeWidth="1" />
                  <circle cx="65" cy="155" r="5" fill={activeRegion === 'joints_back' ? 'var(--accent-deep)' : hasSelectedInRegion('joints_back') ? '#B38F5D' : 'rgba(30, 58, 138, 0.2)'} stroke="white" strokeWidth="1" />
                  <circle cx="155" cy="155" r="5" fill={activeRegion === 'joints_back' ? 'var(--accent-deep)' : hasSelectedInRegion('joints_back') ? '#B38F5D' : 'rgba(30, 58, 138, 0.2)'} stroke="white" strokeWidth="1" />
                  <circle cx="86" cy="320" r="6" fill={activeRegion === 'joints_back' ? 'var(--accent-deep)' : hasSelectedInRegion('joints_back') ? '#B38F5D' : 'rgba(30, 58, 138, 0.2)'} stroke="white" strokeWidth="1" />
                  <circle cx="134" cy="320" r="6" fill={activeRegion === 'joints_back' ? 'var(--accent-deep)' : hasSelectedInRegion('joints_back') ? '#B38F5D' : 'rgba(30, 58, 138, 0.2)'} stroke="white" strokeWidth="1" />
                </g>

                {/* Skin Back Icon */}
                <g onClick={() => setActiveRegion('skin_back')}>
                  <circle cx="180" cy="50" r="14" fill={activeRegion === 'skin_back' ? 'url(#activeGradBack)' : hasSelectedInRegion('skin_back') ? 'rgba(179,143,93,0.15)' : 'rgba(255,255,255,0.7)'} stroke={activeRegion === 'skin_back' ? 'var(--accent-deep)' : hasSelectedInRegion('skin_back') ? '#B38F5D' : 'var(--border)'} strokeWidth="1.5" />
                  <text x="180" y="54" fontSize="12" textAnchor="middle">✨</text>
                </g>
              </svg>
            </motion.div>

          </motion.div>

          {/* Perspective Rotating HUD overlay */}
          <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(255,255,255,0.9)', padding: '6px 10px', borderRadius: 10, border: '1px solid var(--border)', fontSize: '0.68rem', pointerEvents: 'none' }}>
            <span style={{ fontWeight: 800, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#B38F5D] animate-pulse" />
              <span>{viewMode === 'front' ? 'FRONT PANEL' : 'BACK PANEL'}</span>
            </span>
            <span style={{ color: 'var(--text-muted)' }}>Persists active selections on both views.</span>
          </div>
        </div>

        {/* Right Side: Dynamic Symptom Tags & Persisted intake board */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, alignSelf: 'stretch' }}>
          
          {/* Dynamic popover card for symptom tagging */}
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
                    <span style={{ fontSize: '1.4rem' }}>{ALL_REGIONS[activeRegion].icon}</span>
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                        {ALL_REGIONS[activeRegion].title}
                      </h4>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 600 }}>Tapping tags adds them to active diagnostic records.</p>
                    </div>
                  </div>

                  {/* Symptom chips board */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, overflowY: 'auto', flex: 1, alignContent: 'flex-start', paddingRight: 4 }}>
                    {ALL_REGIONS[activeRegion].items.map(symptom => {
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
                    Tap any highlighted body sector in the model map (or rotate to Back view) to select symptoms.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Unified PERSISTED summary checklist */}
          {totalSelected > 0 && (
            <div className="animate-fadeInUp" style={{ padding: '16px', background: 'rgba(179,143,93,0.02)', border: '1px solid rgba(179,143,93,0.1)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
              
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#B38F5D', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Layers className="w-3.5 h-3.5 text-[#B38F5D]" /> Mapped Intake Symptoms Summary ({totalSelected})
              </div>

              {/* Persisted details split by Front and Back Body zones */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '110px', overflowY: 'auto', paddingRight: 4 }}>
                {frontItems.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--primary-deep)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--primary-deep)' }} />
                      Front Body Selections:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, paddingLeft: 8 }}>
                      {frontItems.map(f => (
                        <span key={`f-${f.region}-${f.name}`} style={{ padding: '3px 8px', borderRadius: 100, background: 'white', border: '1px solid rgba(226, 232, 240, 0.7)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                          {f.name} <span style={{ opacity: 0.5, fontSize: '0.6rem' }}>({f.region})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {backItems.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-deep)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-deep)' }} />
                      Back Body Selections:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, paddingLeft: 8 }}>
                      {backItems.map(b => (
                        <span key={`b-${b.region}-${b.name}`} style={{ padding: '3px 8px', borderRadius: 100, background: 'white', border: '1px solid rgba(226, 232, 240, 0.7)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                          {b.name} <span style={{ opacity: 0.5, fontSize: '0.6rem' }}>({b.region})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Grid */}
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
