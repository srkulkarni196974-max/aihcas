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
  Sparkle,
  Eye
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

// Combined for mapping
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
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
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

  const hasSelectedInRegion = (regionKey: string) => {
    return (selectedSymptoms[regionKey]?.length || 0) > 0;
  };

  const getRegionDisplayName = () => {
    if (hoveredRegion) {
      return ALL_REGIONS[hoveredRegion as keyof typeof ALL_REGIONS]?.title || hoveredRegion;
    }
    if (activeRegion) {
      return ALL_REGIONS[activeRegion as keyof typeof ALL_REGIONS]?.title || activeRegion;
    }
    return null;
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
        
        {/* Left Side: High-fidelity clinical anatomical figure with 3D Rotation */}
        <div style={{
          flex: '0 0 210px',
          height: '450px',
          background: 'radial-gradient(circle at center, rgba(30,58,138,0.02) 0%, rgba(179,143,93,0.01) 100%)',
          border: '1.5px solid rgba(226, 232, 240, 0.85)',
          borderRadius: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '12px',
          overflow: 'hidden',
          perspective: '1000px'
        }}>
          {/* Holographic Circular HUD Backdrop Scanning Rings */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ width: '220px', height: '220px', borderRadius: '50%', border: '1px dashed rgba(179, 143, 93, 0.05)', position: 'absolute', animation: 'spin 40s linear infinite' }} />
            <div style={{ width: '170px', height: '170px', borderRadius: '50%', border: '1px solid rgba(30, 58, 138, 0.03)', position: 'absolute', animation: 'spin 20s linear infinite reverse' }} />
          </div>

          {/* 3D Flippable Container */}
          <motion.div
            style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', position: 'relative' }}
            animate={{ rotateY: viewMode === 'front' ? 0 : 180 }}
            transition={{ type: 'spring', damping: 24, stiffness: 130 }}
          >
            
            {/* HIGH-FIDELITY FRONT ANATOMICAL SILHOUETTE */}
            <motion.div
              style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg viewBox="0 0 220 460" style={{ width: '100%', height: '100%', cursor: 'pointer' }}>
                <defs>
                  <linearGradient id="glowBodyFront" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.09" />
                    <stop offset="50%" stopColor="#2A437E" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="#B38F5D" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="activeRegionGradFront" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#B38F5D" stopOpacity="0.3" />
                  </linearGradient>
                </defs>

                {/* Highly Proportioned Organic Human Body Outline Grid */}
                <g fill="url(#glowBodyFront)" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="1.2">
                  {/* Proportioned organic muscle paths */}
                  {/* Head & Neck */}
                  <ellipse cx="110" cy="50" rx="17" ry="21" />
                  <path d="M103,71 L103,84 A7,7 0 0 0 110,87 A7,7 0 0 0 117,84 L117,71 Z" />
                  {/* Clavicle & Torso */}
                  <path d="M76,92 L144,92 C140,118 135,145 132,158 L88,158 C85,145 80,118 76,92 Z" />
                  {/* Abdomen & Core */}
                  <path d="M88,158 L132,158 C128,185 125,210 122,230 L98,230 C95,210 92,185 88,158 Z" />
                  {/* Left Arm */}
                  <path d="M76,92 L62,158 L52,225 A6,6 0 0 0 62,227 L72,158 L84,102 Z" />
                  {/* Right Arm */}
                  <path d="M144,92 L158,158 L168,225 A6,6 0 0 1 158,227 L148,158 L136,102 Z" />
                  {/* Left Leg */}
                  <path d="M98,230 L94,325 L92,425 A6,6 0 0 0 102,425 L104,325 L110,230 Z" />
                  {/* Right Leg */}
                  <path d="M122,230 L126,325 L128,425 A6,6 0 0 1 118,425 L116,325 L110,230 Z" />
                </g>

                {/* Embedded soft dashed Cardio/Lungs Diagnostic grids (premium clinical detail) */}
                <g stroke="rgba(179,143,93,0.12)" strokeWidth="1" fill="none" strokeDasharray="2 3">
                  <path d="M98,110 Q110,125 122,110" />
                  <path d="M96,120 Q110,135 124,120" />
                  <path d="M100,130 Q110,142 120,130" />
                  <circle cx="110" cy="115" r="8" />
                </g>

                {/* HIGH-FIDELITY CLICKABLE REGIONS OVERLAYS WITH DELICATE INNER BORDERS */}
                
                {/* Head & Neck Front */}
                <path 
                  d="M93,50 C93,31 100,29 110,29 C120,29 127,31 127,50 C127,65 120,71 110,71 C100,71 93,65 93,50 Z M102,71 L102,86 L118,86 L118,71 Z"
                  fill={activeRegion === 'head_front' ? 'url(#activeRegionGradFront)' : hoveredRegion === 'head_front' ? 'rgba(30, 58, 138, 0.08)' : hasSelectedInRegion('head_front') ? 'rgba(30, 58, 138, 0.15)' : 'transparent'}
                  stroke={activeRegion === 'head_front' ? 'var(--accent-deep)' : hoveredRegion === 'head_front' ? 'rgba(30, 58, 138, 0.25)' : hasSelectedInRegion('head_front') ? 'rgba(30, 58, 138, 0.4)' : 'transparent'}
                  strokeWidth="1.5"
                  onMouseEnter={() => setHoveredRegion('head_front')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => setActiveRegion('head_front')}
                />

                {/* Chest Front */}
                <path 
                  d="M78,92 L142,92 C138,118 134,145 132,158 L88,158 C86,145 82,118 78,92 Z"
                  fill={activeRegion === 'chest_front' ? 'url(#activeRegionGradFront)' : hoveredRegion === 'chest_front' ? 'rgba(30, 58, 138, 0.08)' : hasSelectedInRegion('chest_front') ? 'rgba(30, 58, 138, 0.15)' : 'transparent'}
                  stroke={activeRegion === 'chest_front' ? 'var(--accent-deep)' : hoveredRegion === 'chest_front' ? 'rgba(30, 58, 138, 0.25)' : hasSelectedInRegion('chest_front') ? 'rgba(30, 58, 138, 0.4)' : 'transparent'}
                  strokeWidth="1.5"
                  onMouseEnter={() => setHoveredRegion('chest_front')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => setActiveRegion('chest_front')}
                />

                {/* Abdomen Front */}
                <path 
                  d="M88,158 L132,158 C128,185 125,210 122,230 L98,230 C96,210 92,185 88,158 Z"
                  fill={activeRegion === 'abdomen_front' ? 'url(#activeRegionGradFront)' : hoveredRegion === 'abdomen_front' ? 'rgba(30, 58, 138, 0.08)' : hasSelectedInRegion('abdomen_front') ? 'rgba(30, 58, 138, 0.15)' : 'transparent'}
                  stroke={activeRegion === 'abdomen_front' ? 'var(--accent-deep)' : hoveredRegion === 'abdomen_front' ? 'rgba(30, 58, 138, 0.25)' : hasSelectedInRegion('abdomen_front') ? 'rgba(30, 58, 138, 0.4)' : 'transparent'}
                  strokeWidth="1.5"
                  onMouseEnter={() => setHoveredRegion('abdomen_front')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => setActiveRegion('abdomen_front')}
                />

                {/* Arms Front */}
                <path 
                  d="M76,92 L62,158 L52,225 A6,6 0 0 0 62,227 L72,158 L84,102 Z M144,92 L158,158 L168,225 A6,6 0 1 0 158,227 L148,158 L136,102 Z"
                  fill={activeRegion === 'arms_front' ? 'url(#activeRegionGradFront)' : hoveredRegion === 'arms_front' ? 'rgba(30, 58, 138, 0.08)' : hasSelectedInRegion('arms_front') ? 'rgba(30, 58, 138, 0.15)' : 'transparent'}
                  stroke={activeRegion === 'arms_front' ? 'var(--accent-deep)' : hoveredRegion === 'arms_front' ? 'rgba(30, 58, 138, 0.25)' : hasSelectedInRegion('arms_front') ? 'rgba(30, 58, 138, 0.4)' : 'transparent'}
                  strokeWidth="1.5"
                  onMouseEnter={() => setHoveredRegion('arms_front')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => setActiveRegion('arms_front')}
                />

                {/* Legs Front */}
                <path 
                  d="M98,230 L94,325 L92,425 A6,6 0 0 0 102,425 L104,325 L110,230 Z M122,230 L126,325 L128,425 A6,6 0 1 0 118,425 L116,325 L110,230 Z"
                  fill={activeRegion === 'legs_front' ? 'url(#activeRegionGradFront)' : hoveredRegion === 'legs_front' ? 'rgba(30, 58, 138, 0.08)' : hasSelectedInRegion('legs_front') ? 'rgba(30, 58, 138, 0.15)' : 'transparent'}
                  stroke={activeRegion === 'legs_front' ? 'var(--accent-deep)' : hoveredRegion === 'legs_front' ? 'rgba(30, 58, 138, 0.25)' : hasSelectedInRegion('legs_front') ? 'rgba(30, 58, 138, 0.4)' : 'transparent'}
                  strokeWidth="1.5"
                  onMouseEnter={() => setHoveredRegion('legs_front')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => setActiveRegion('legs_front')}
                />

                {/* Elegant Concentric Joint Nodes (Conveying scanner targets) */}
                <g onClick={() => setActiveRegion('joints_front')} onMouseEnter={() => setHoveredRegion('joints_front')} onMouseLeave={() => setHoveredRegion(null)}>
                  {/* Shoulders */}
                  <circle cx="78" cy="94" r="7" fill={activeRegion === 'joints_front' ? 'var(--accent-deep)' : hasSelectedInRegion('joints_front') ? '#B38F5D' : 'rgba(30, 58, 138, 0.15)'} stroke="white" strokeWidth="1" />
                  <circle cx="142" cy="94" r="7" fill={activeRegion === 'joints_front' ? 'var(--accent-deep)' : hasSelectedInRegion('joints_front') ? '#B38F5D' : 'rgba(30, 58, 138, 0.15)'} stroke="white" strokeWidth="1" />
                  {/* Elbows */}
                  <circle cx="63" cy="155" r="6" fill={activeRegion === 'joints_front' ? 'var(--accent-deep)' : hasSelectedInRegion('joints_front') ? '#B38F5D' : 'rgba(30, 58, 138, 0.15)'} stroke="white" strokeWidth="1" />
                  <circle cx="157" cy="155" r="6" fill={activeRegion === 'joints_front' ? 'var(--accent-deep)' : hasSelectedInRegion('joints_front') ? '#B38F5D' : 'rgba(30, 58, 138, 0.15)'} stroke="white" strokeWidth="1" />
                  {/* Knees */}
                  <circle cx="86" cy="320" r="7" fill={activeRegion === 'joints_front' ? 'var(--accent-deep)' : hasSelectedInRegion('joints_front') ? '#B38F5D' : 'rgba(30, 58, 138, 0.15)'} stroke="white" strokeWidth="1" />
                  <circle cx="134" cy="320" r="7" fill={activeRegion === 'joints_front' ? 'var(--accent-deep)' : hasSelectedInRegion('joints_front') ? '#B38F5D' : 'rgba(30, 58, 138, 0.15)'} stroke="white" strokeWidth="1" />
                </g>

                {/* Skin Front Node Icon */}
                <g onClick={() => setActiveRegion('skin_front')} onMouseEnter={() => setHoveredRegion('skin_front')} onMouseLeave={() => setHoveredRegion(null)}>
                  <circle cx="180" cy="50" r="14" fill={activeRegion === 'skin_front' ? 'url(#activeRegionGradFront)' : hasSelectedInRegion('skin_front') ? 'rgba(179,143,93,0.15)' : 'rgba(255,255,255,0.75)'} stroke={activeRegion === 'skin_front' ? 'var(--accent-deep)' : hasSelectedInRegion('skin_front') ? '#B38F5D' : 'var(--border)'} strokeWidth="1.5" />
                  <text x="180" y="54" fontSize="12" textAnchor="middle">✨</text>
                </g>
              </svg>
            </motion.div>

            {/* HIGH-FIDELITY BACK ANATOMICAL SILHOUETTE */}
            <motion.div
              style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotateY(180deg)' }}
            >
              <svg viewBox="0 0 220 460" style={{ width: '100%', height: '100%', cursor: 'pointer' }}>
                <defs>
                  <linearGradient id="glowBodyBack" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.09" />
                    <stop offset="50%" stopColor="#2A437E" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="#B38F5D" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="activeRegionGradBack" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#B38F5D" stopOpacity="0.3" />
                  </linearGradient>
                </defs>

                {/* Proportioned Organic Human Body Outline (Back view neck/spine modifications) */}
                <g fill="url(#glowBodyBack)" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="1.2">
                  <ellipse cx="110" cy="50" rx="17" ry="21" />
                  <path d="M103,71 L103,84 A7,7 0 0 0 110,87 A7,7 0 0 0 117,84 L117,71 Z" />
                  <path d="M76,92 L144,92 C140,118 135,145 132,158 L88,158 C85,145 80,118 76,92 Z" />
                  <path d="M88,158 L132,158 C128,185 125,210 122,230 L98,230 C95,210 92,185 88,158 Z" />
                  <path d="M76,92 L62,158 L52,225 A6,6 0 0 0 62,227 L72,158 L84,102 Z" />
                  <path d="M144,92 L158,158 L168,225 A6,6 0 1 0 158,227 L148,158 L136,102 Z" />
                  <path d="M98,230 L94,325 L92,425 A6,6 0 0 0 102,425 L104,325 L110,230 Z" />
                  <path d="M122,230 L126,325 L128,425 A6,6 0 1 0 118,425 L116,325 L110,230 Z" />
                </g>

                {/* Embedded Spine guideline indicators (conveys back alignment scanning) */}
                <g stroke="rgba(30,58,138,0.08)" strokeWidth="1.5" fill="none">
                  <path d="M110,87 L110,230" strokeDasharray="3 4" />
                  <circle cx="110" cy="120" r="3" fill="rgba(30,58,138,0.15)" stroke="none" />
                  <circle cx="110" cy="150" r="3" fill="rgba(30,58,138,0.15)" stroke="none" />
                  <circle cx="110" cy="180" r="3" fill="rgba(30,58,138,0.15)" stroke="none" />
                </g>

                {/* Back clickable region overlays */}
                
                {/* Head & Neck Back */}
                <path 
                  d="M93,50 C93,31 100,29 110,29 C120,29 127,31 127,50 C127,65 120,71 110,71 C100,71 93,65 93,50 Z M102,71 L102,86 L118,86 L118,71 Z"
                  fill={activeRegion === 'head_back' ? 'url(#activeRegionGradBack)' : hoveredRegion === 'head_back' ? 'rgba(30, 58, 138, 0.08)' : hasSelectedInRegion('head_back') ? 'rgba(30, 58, 138, 0.15)' : 'transparent'}
                  stroke={activeRegion === 'head_back' ? 'var(--accent-deep)' : hoveredRegion === 'head_back' ? 'rgba(30, 58, 138, 0.25)' : hasSelectedInRegion('head_back') ? 'rgba(30, 58, 138, 0.4)' : 'transparent'}
                  strokeWidth="1.5"
                  onMouseEnter={() => setHoveredRegion('head_back')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => setActiveRegion('head_back')}
                />

                {/* Upper Back */}
                <path 
                  d="M78,92 L142,92 C138,118 134,145 132,158 L88,158 C86,145 82,118 78,92 Z"
                  fill={activeRegion === 'upper_back' ? 'url(#activeRegionGradBack)' : hoveredRegion === 'upper_back' ? 'rgba(30, 58, 138, 0.08)' : hasSelectedInRegion('upper_back') ? 'rgba(30, 58, 138, 0.15)' : 'transparent'}
                  stroke={activeRegion === 'upper_back' ? 'var(--accent-deep)' : hoveredRegion === 'upper_back' ? 'rgba(30, 58, 138, 0.25)' : hasSelectedInRegion('upper_back') ? 'rgba(30, 58, 138, 0.4)' : 'transparent'}
                  strokeWidth="1.5"
                  onMouseEnter={() => setHoveredRegion('upper_back')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => setActiveRegion('upper_back')}
                />

                {/* Lower Back & Pelvis */}
                <path 
                  d="M88,158 L132,158 C128,185 125,210 122,230 L98,230 C96,210 92,185 88,158 Z"
                  fill={activeRegion === 'lower_back' ? 'url(#activeRegionGradBack)' : hoveredRegion === 'lower_back' ? 'rgba(30, 58, 138, 0.08)' : hasSelectedInRegion('lower_back') ? 'rgba(30, 58, 138, 0.15)' : 'transparent'}
                  stroke={activeRegion === 'lower_back' ? 'var(--accent-deep)' : hoveredRegion === 'lower_back' ? 'rgba(30, 58, 138, 0.25)' : hasSelectedInRegion('lower_back') ? 'rgba(30, 58, 138, 0.4)' : 'transparent'}
                  strokeWidth="1.5"
                  onMouseEnter={() => setHoveredRegion('lower_back')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => setActiveRegion('lower_back')}
                />

                {/* Arms Back */}
                <path 
                  d="M76,92 L62,158 L52,225 A6,6 0 0 0 62,227 L72,158 L84,102 Z M144,92 L158,158 L168,225 A6,6 0 1 0 158,227 L148,158 L136,102 Z"
                  fill={activeRegion === 'arms_back' ? 'url(#activeRegionGradBack)' : hoveredRegion === 'arms_back' ? 'rgba(30, 58, 138, 0.08)' : hasSelectedInRegion('arms_back') ? 'rgba(30, 58, 138, 0.15)' : 'transparent'}
                  stroke={activeRegion === 'arms_back' ? 'var(--accent-deep)' : hoveredRegion === 'arms_back' ? 'rgba(30, 58, 138, 0.25)' : hasSelectedInRegion('arms_back') ? 'rgba(30, 58, 138, 0.4)' : 'transparent'}
                  strokeWidth="1.5"
                  onMouseEnter={() => setHoveredRegion('arms_back')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => setActiveRegion('arms_back')}
                />

                {/* Legs Back */}
                <path 
                  d="M98,230 L94,325 L92,425 A6,6 0 0 0 102,425 L104,325 L110,230 Z M122,230 L126,325 L128,425 A6,6 0 1 0 118,425 L116,325 L110,230 Z"
                  fill={activeRegion === 'legs_back' ? 'url(#activeRegionGradBack)' : hoveredRegion === 'legs_back' ? 'rgba(30, 58, 138, 0.08)' : hasSelectedInRegion('legs_back') ? 'rgba(30, 58, 138, 0.15)' : 'transparent'}
                  stroke={activeRegion === 'legs_back' ? 'var(--accent-deep)' : hoveredRegion === 'legs_back' ? 'rgba(30, 58, 138, 0.25)' : hasSelectedInRegion('legs_back') ? 'rgba(30, 58, 138, 0.4)' : 'transparent'}
                  strokeWidth="1.5"
                  onMouseEnter={() => setHoveredRegion('legs_back')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => setActiveRegion('legs_back')}
                />

                {/* Joint Nodes Back */}
                <g onClick={() => setActiveRegion('joints_back')} onMouseEnter={() => setHoveredRegion('joints_back')} onMouseLeave={() => setHoveredRegion(null)}>
                  <circle cx="78" cy="94" r="7" fill={activeRegion === 'joints_back' ? 'var(--accent-deep)' : hasSelectedInRegion('joints_back') ? '#B38F5D' : 'rgba(30, 58, 138, 0.15)'} stroke="white" strokeWidth="1" />
                  <circle cx="142" cy="94" r="7" fill={activeRegion === 'joints_back' ? 'var(--accent-deep)' : hasSelectedInRegion('joints_back') ? '#B38F5D' : 'rgba(30, 58, 138, 0.15)'} stroke="white" strokeWidth="1" />
                  <circle cx="63" cy="155" r="6" fill={activeRegion === 'joints_back' ? 'var(--accent-deep)' : hasSelectedInRegion('joints_back') ? '#B38F5D' : 'rgba(30, 58, 138, 0.15)'} stroke="white" strokeWidth="1" />
                  <circle cx="157" cy="155" r="6" fill={activeRegion === 'joints_back' ? 'var(--accent-deep)' : hasSelectedInRegion('joints_back') ? '#B38F5D' : 'rgba(30, 58, 138, 0.15)'} stroke="white" strokeWidth="1" />
                  <circle cx="86" cy="320" r="7" fill={activeRegion === 'joints_back' ? 'var(--accent-deep)' : hasSelectedInRegion('joints_back') ? '#B38F5D' : 'rgba(30, 58, 138, 0.15)'} stroke="white" strokeWidth="1" />
                  <circle cx="134" cy="320" r="7" fill={activeRegion === 'joints_back' ? 'var(--accent-deep)' : hasSelectedInRegion('joints_back') ? '#B38F5D' : 'rgba(30, 58, 138, 0.15)'} stroke="white" strokeWidth="1" />
                </g>

                {/* Skin Back Icon */}
                <g onClick={() => setActiveRegion('skin_back')} onMouseEnter={() => setHoveredRegion('skin_back')} onMouseLeave={() => setHoveredRegion(null)}>
                  <circle cx="180" cy="50" r="14" fill={activeRegion === 'skin_back' ? 'url(#activeRegionGradBack)' : hasSelectedInRegion('skin_back') ? 'rgba(179,143,93,0.15)' : 'rgba(255,255,255,0.75)'} stroke={activeRegion === 'skin_back' ? 'var(--accent-deep)' : hasSelectedInRegion('skin_back') ? '#B38F5D' : 'var(--border)'} strokeWidth="1.5" />
                  <text x="180" y="54" fontSize="12" textAnchor="middle">✨</text>
                </g>
              </svg>
            </motion.div>

          </motion.div>

          {/* Glowing HUD active region display tag (Floating label) */}
          <AnimatePresence>
            {getRegionDisplayName() && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                style={{ 
                  position: 'absolute', 
                  top: '16px', 
                  left: '12px', 
                  right: '12px', 
                  background: 'rgba(30, 58, 138, 0.9)', 
                  color: 'white', 
                  padding: '6px 12px', 
                  borderRadius: 100, 
                  fontSize: '0.68rem', 
                  fontWeight: 800, 
                  textAlign: 'center', 
                  boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  pointerEvents: 'none'
                }}
              >
                <Eye className="w-3 h-3 text-[#B38F5D]" />
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>{getRegionDisplayName()}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Perspective Rotating HUD overlay */}
          <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(255,255,255,0.92)', padding: '6px 10px', borderRadius: 10, border: '1px solid var(--border)', fontSize: '0.68rem', pointerEvents: 'none' }}>
            <span style={{ fontWeight: 800, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#B38F5D] animate-pulse" />
              <span>{viewMode === 'front' ? 'FRONT PANEL' : 'BACK PANEL'}</span>
            </span>
            <span style={{ color: 'var(--text-muted)' }}>Hover sections to highlight; tap to select.</span>
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
