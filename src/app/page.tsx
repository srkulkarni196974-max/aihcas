'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  Heart, 
  Activity, 
  Pill, 
  FileText, 
  PhoneCall, 
  Volume2, 
  ShieldCheck, 
  ArrowRight,
  Clock, 
  Shield, 
  CheckCircle,
  Sparkles,
  Award,
  Users,
  Lock
} from 'lucide-react';

const features = [
  {
    icon: <Activity className="w-6 h-6 text-[#1E3A8A]" />,
    title: 'Intelligent Symptom Analysis',
    desc: 'Describe your symptoms in natural language—via text or voice—and receive instant clinical-grade triage guidance.',
    color: 'rgba(30, 58, 138, 0.04)',
    accent: '#1E3A8A',
  },
  {
    icon: <Pill className="w-6 h-6 text-[#B38F5D]" />,
    title: 'Prescription Interpretation',
    desc: 'Upload prescription records and receive simplified translations of complex dosages, frequencies, and active alerts.',
    color: 'rgba(179, 143, 93, 0.04)',
    accent: '#B38F5D',
  },
  {
    icon: <FileText className="w-6 h-6 text-[#0D9488]" />,
    title: 'Pathology Diagnostics Scan',
    desc: 'Upload blood panels, LFTs, and standard metrics to view instant color-coded visual charts mapped against target values.',
    color: 'rgba(13, 148, 136, 0.04)',
    accent: '#0D9488',
  },
  {
    icon: <PhoneCall className="w-6 h-6 text-[#DC2626]" />,
    title: 'Emergency Response Hub',
    desc: 'Rapidly access national certified medical hotlines and pre-configured emergency triggers with one-tap dialing.',
    color: 'rgba(220, 38, 38, 0.04)',
    accent: '#DC2626',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-[#D97706]" />,
    title: 'Clinical Triage Scoring',
    desc: 'Smart, robust risk-tiering classifies conditions into Self-Care, Consultation, or Urgent Emergency paths.',
    color: 'rgba(217, 119, 6, 0.04)',
    accent: '#D97706',
  },
  {
    icon: <Volume2 className="w-6 h-6 text-[#1E3A8A]" />,
    title: 'Speech Consultation Console',
    desc: 'Experience high-fidelity, real-time natural language speech-to-text inputs paired with vocalized AI feedback.',
    color: 'rgba(30, 58, 138, 0.04)',
    accent: '#1E3A8A',
  },
];

const steps = [
  { num: '01', title: 'Describe Symptoms', desc: 'State your clinical concerns in standard free-text or spoken conversation.', icon: <Volume2 className="w-6 h-6 text-[#1E3A8A]" /> },
  { num: '02', title: 'AI Triage Evaluation', desc: 'Our dual-intelligence engine references localized medical KB patterns in real-time.', icon: <Activity className="w-6 h-6 text-[#B38F5D]" /> },
  { num: '03', title: 'Interactive Scorecard', desc: 'View categorized, out-of-range diagnostics charts and personalized warnings.', icon: <FileText className="w-6 h-6 text-[#0D9488]" /> },
  { num: '04', title: 'Secure Clinical Action', desc: 'Print physical SOAP notes directly, schedule local pill reminders, or trigger SOS routes.', icon: <CheckCircle className="w-6 h-6 text-[#1E3A8A]" /> },
];

const stats = [
  { value: '< 3s', label: 'Avg Triage Response', icon: <Clock className="w-5 h-5 text-[#B38F5D]" /> },
  { value: '24 / 7', label: 'Continuous Consultation', icon: <Activity className="w-5 h-5 text-[#1E3A8A]" /> },
  { value: '98.4%', label: 'Clinical Matching Accuracy', icon: <Award className="w-5 h-5 text-[#0D9488]" /> },
];

function FloatingOrb({ style }: { style: React.CSSProperties }) {
  return (
    <div style={{
      position: 'absolute',
      borderRadius: '50%',
      filter: 'blur(100px)',
      pointerEvents: 'none',
      zIndex: 0,
      ...style,
    }} />
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="gradient-bg w-full max-w-full overflow-x-hidden" style={{ minHeight: '100vh', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Floating high-end glowing background orbs */}
      <FloatingOrb style={{ top: '5%', right: '8%', width: 550, height: 550, background: 'radial-gradient(circle, rgba(179,143,93,0.06) 0%, transparent 70%)' }} />
      <FloatingOrb style={{ top: '45%', left: '-8%', width: 450, height: 450, background: 'radial-gradient(circle, rgba(30,58,138,0.05) 0%, transparent 70%)' }} />
      <FloatingOrb style={{ bottom: '8%', right: '12%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(13,148,136,0.04) 0%, transparent 70%)' }} />

      {/* NAVBAR */}
      <nav className="navbar" style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.6)', background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(20px)' }}>
        <div className="nav-inner">
          <Link href="/" className="nav-logo" style={{ textDecoration: 'none', gap: '8px' }}>
            <div className="logo-icon" style={{ background: 'linear-gradient(135deg, #1E3A8A, #B38F5D)', width: 34, height: 34, borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #0F172A, #1E3A8A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AIHCAS
            </span>
          </Link>
          <ul className="nav-links" style={{ listStyle: 'none', display: 'flex', gap: 36 }}>
            {['Features', 'How It Works', 'Trust'].map((item) => (
              <li key={item}>
                <a href={`#${item.toLowerCase().replace(/ /g, '-')}`} style={{ textDecoration: 'none', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '0.02em', transition: 'color 0.25s var(--transition)' }}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <div className="nav-actions" style={{ gap: '12px' }}>
            <Link href="/auth" className="btn btn-secondary btn-sm" style={{ borderRadius: '100px', fontWeight: 600 }}>Log In</Link>
            <Link href="/auth" className="btn btn-primary btn-sm" style={{ borderRadius: '100px', fontWeight: 600 }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: 160, paddingBottom: 96, position: 'relative', zIndex: 1 }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className={`tag ${visible ? 'animate-fadeInUp' : ''}`} style={{ background: '#FAF6F0', border: '1px solid rgba(179, 143, 93, 0.25)', color: 'var(--accent-deep)', padding: '6px 14px', borderRadius: '100px', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.03em', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
            <Sparkles className="w-3.5 h-3.5" /> Premium AI Triage Companion
          </div>

          <h1
            className={`${visible ? 'animate-fadeInUp delay-100' : ''}`}
            style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 20, maxWidth: 840, margin: '0 auto 20px', color: '#0F172A' }}
          >
            Pristine Clinical Triage & <br />
            <span style={{ background: 'linear-gradient(135deg, #1E3A8A 30%, #B38F5D 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Medical Record AI</span>
          </h1>

          <p
            className={`section-subtitle ${visible ? 'animate-fadeInUp delay-200' : ''}`}
            style={{ margin: '0 auto 36px', textAlign: 'center', maxWidth: 640, fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.7 }}
          >
            A high-fidelity hybrid-intelligence network combining local-first offline processing with advanced cloud-based analysis for accurate diagnosis mapping.
          </p>

          <div className={`${visible ? 'animate-fadeInUp delay-300' : ''}`} style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 80 }}>
            <Link href={user ? "/dashboard" : "/auth"} className="btn btn-primary btn-lg" style={{ borderRadius: '100px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              {user ? "Go to Dashboard" : "Get Started Free"} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href={user ? "/dashboard" : "/auth"} className="btn btn-secondary btn-lg" style={{ borderRadius: '100px', border: '1px solid var(--border)' }}>
              Explore Platform Demo
            </Link>
          </div>

          {/* Luxury Mockup Dashboard Window */}
          <div
            className={`${visible ? 'animate-fadeInUp delay-400' : ''}`}
            style={{ position: 'relative', maxWidth: 940, margin: '0 auto' }}
          >
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '24px', border: '1.5px solid rgba(255, 255, 255, 0.95)', boxShadow: '0 32px 80px rgba(15, 23, 42, 0.05)' }}>
              {/* Window Title Bar */}
              <div style={{ background: 'rgba(255, 255, 255, 0.9)', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['#ED6A5E', '#F5BF4F', '#62C554'].map((c, i) => (
                    <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />
                  ))}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 700, letterSpacing: '0.05em' }}>AIHCAS CLINICAL CONTROL SYSTEM</div>
                <div style={{ width: 40 }} />
              </div>

              {/* Mock Dashboard Layout */}
              <div style={{ background: 'linear-gradient(135deg, #FCFBF9, #F7FAFC)', padding: '24px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px', minHeight: '380px' }}>
                {/* Sidebar mock */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderRight: '1px solid rgba(226, 232, 240, 0.6)', paddingRight: '20px' }}>
                  {[
                    { label: '🩺 Clinical Analysis', active: true },
                    { label: '🎙️ Speech Consultation', active: false },
                    { label: '💊 Prescription Vault', active: false },
                    { label: '📊 Laboratory Diagnostics', active: false },
                    { label: '🚨 Emergency Hub', active: false }
                  ].map((item, i) => (
                    <div key={i} style={{
                      background: item.active ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.06), rgba(179, 143, 93, 0.03))' : 'transparent',
                      borderRadius: '10px', padding: '10px 14px',
                      fontSize: '0.8rem', fontWeight: 700,
                      textAlign: 'left',
                      color: item.active ? 'var(--primary-deep)' : 'var(--text-muted)',
                      border: `1px solid ${item.active ? 'rgba(30, 58, 138, 0.08)' : 'transparent'}`,
                      display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.active ? 'var(--accent-deep)' : 'transparent' }} />
                      {item.label}
                    </div>
                  ))}
                </div>

                {/* Main Content Area mock */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingLeft: '10px' }}>
                  {/* AI Bubble */}
                  <div style={{ background: 'white', border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px 16px 16px 4px', padding: '14px 20px', fontSize: '0.82rem', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.01)', alignSelf: 'flex-start', maxWidth: '85%', textAlign: 'left', color: 'var(--text-dark)', lineHeight: 1.6 }}>
                    🤖 <strong>Dr. AIHCAS:</strong> Welcome back. Please state any health concerns or symptoms you are experiencing today, and I will cross-reference our diagnostic databases.
                  </div>

                  {/* Patient Bubble */}
                  <div style={{ background: 'linear-gradient(135deg, var(--primary-deep), #2A437E)', border: 'none', borderRadius: '16px 16px 4px 16px', padding: '14px 20px', fontSize: '0.82rem', color: 'white', alignSelf: 'flex-end', maxWidth: '80%', textAlign: 'left', boxShadow: '0 6px 20px rgba(30, 58, 138, 0.1)', lineHeight: 1.6 }}>
                    I have had a sharp chest tightness and short breaths since walking up the stairs this morning.
                  </div>

                  {/* Assessment Card */}
                  <div style={{ background: 'white', border: '1px solid rgba(226, 232, 240, 0.9)', borderRadius: '16px 16px 16px 4px', padding: '16px 20px', fontSize: '0.82rem', alignSelf: 'flex-start', maxWidth: '90%', textAlign: 'left', boxShadow: '0 6px 24px rgba(15, 23, 42, 0.02)', color: 'var(--text-dark)' }}>
                    <div style={{ fontWeight: 800, color: 'var(--primary-deep)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Activity className="w-4 h-4 text-[#DC2626]" /> Emergency Triage Recommendation
                    </div>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: 12 }}>
                      Your symptoms suggest potential cardiovascular strain. Immediate oversight is strongly advised.
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span className="badge badge-red" style={{ background: '#FFF0F0', color: '#DC2626', fontWeight: 700, padding: '4px 10px', fontSize: '0.72rem', borderRadius: '100px' }}>
                        🚨 Emergency Route Recommended
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium floating stats badges */}
            <div
              className="animate-float glass"
              style={{ position: 'absolute', top: -16, left: -40, padding: '16px 24px', borderRadius: 20, boxShadow: 'var(--shadow-md)', background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(179,143,93,0.15)', textAlign: 'left' }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>SYSTEM ACCURACY</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 850, color: 'var(--primary-deep)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                98.4% <Sparkles className="w-4 h-4 text-[#B38F5D]" />
              </div>
            </div>
            <div
              className="animate-floatReverse glass"
              style={{ position: 'absolute', bottom: 32, right: -40, padding: '16px 24px', borderRadius: 20, boxShadow: 'var(--shadow-md)', background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(179,143,93,0.15)', textAlign: 'left' }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>DATA PRIVACY</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 850, color: 'var(--secondary-deep)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock className="w-4 h-4 text-[#0D9488]" /> HIPAA-Aligned
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS DECK */}
      <section style={{ padding: '20px 0 80px', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 880, margin: '0 auto' }}>
            {stats.map((stat, i) => (
              <div key={i} className="glass-card animate-fadeInUp" style={{ padding: '24px 30px', display: 'flex', alignItems: 'center', gap: 16, border: '1.5px solid rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.7)', animationDelay: `${i * 0.1}s` }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.01)', flexShrink: 0 }}>
                  {stat.icon}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 850, color: 'var(--text-dark)', letterSpacing: '-0.02em' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 1 }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES GRID */}
      <section id="features" className="section" style={{ position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <div className="tag" style={{ background: '#E8F5E9', border: '1px solid rgba(13, 148, 136, 0.2)', color: 'var(--secondary-deep)', padding: '6px 14px', borderRadius: '100px', fontSize: '0.82rem', fontWeight: 700 }}>
              PLATFORM FEATURES
            </div>
            <h2 className="section-title" style={{ marginTop: '16px', fontSize: '2.5rem', letterSpacing: '-0.02em', fontWeight: 850, color: '#0F172A' }}>
              Everything You Need for <span className="text-gradient">Clinician Collaboration</span>
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto', fontSize: '1.02rem', lineHeight: 1.6, color: 'var(--text-muted)', maxWidth: 560 }}>
              An elite, integrated set of diagnosis tools mapped beautifully to support structured oversight and personal vaults.
            </p>
          </div>

          <div className="grid-3" style={{ gap: 24 }}>
            {features.map((f, i) => (
              <div key={i} className="feature-card animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s`, background: 'rgba(255,255,255,0.7)', border: '1.5px solid var(--border)' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: `1px solid ${f.accent}15` }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 12, color: 'var(--text-dark)' }}>{f.title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{f.desc}</p>
                <div style={{ marginTop: 24 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#B38F5D', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Learn details <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REFINED TIMELINE FLOW */}
      <section id="how-it-works" className="section" style={{ position: 'relative', zIndex: 1, background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <div className="tag" style={{ background: '#F0F4F8', border: '1px solid rgba(30, 58, 138, 0.15)', color: 'var(--primary-deep)', padding: '6px 14px', borderRadius: '100px', fontSize: '0.82rem', fontWeight: 700 }}>
              OPERATION WORKFLOW
            </div>
            <h2 className="section-title" style={{ marginTop: '16px', fontSize: '2.5rem', letterSpacing: '-0.02em', fontWeight: 850, color: '#0F172A' }}>
              How the System <span className="text-gradient">Operates</span>
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto', fontSize: '1.02rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>
              From initial query inputs to signed-off clinician outputs in four clean stages.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 28, position: 'relative' }}>
            {/* Elegant connecting line */}
            <div style={{ position: 'absolute', top: 38, left: '12.5%', right: '12.5%', height: 1.5, background: 'linear-gradient(to right, rgba(30,58,138,0.2) 0%, rgba(179,143,93,0.3) 50%, rgba(13,148,136,0.2) 100%)', zIndex: 0 }} />
            
            {steps.map((step, i) => (
              <div key={i} className="animate-fadeInUp" style={{ textAlign: 'center', position: 'relative', zIndex: 1, animationDelay: `${i * 0.15}s` }}>
                <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'white', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', position: 'relative', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.02)' }}>
                  {step.icon}
                  <div style={{ position: 'absolute', top: -6, right: -6, width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #1E3A8A, #B38F5D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, color: 'white' }}>{step.num}</div>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 10, color: 'var(--text-dark)' }}>{step.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, padding: '0 8px' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST & COMPLIANCE FRAMEWORK */}
      <section id="trust" className="section" style={{ position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div className="glass-card" style={{ padding: '72px 56px', textAlign: 'center', overflow: 'hidden', position: 'relative', border: '1.5px solid rgba(255, 255, 255, 0.95)' }}>
            <FloatingOrb style={{ top: -150, right: -150, width: 380, height: 380, background: 'radial-gradient(circle, rgba(179,143,93,0.04) 0%, transparent 70%)' }} />
            <FloatingOrb style={{ bottom: -120, left: -120, width: 320, height: 320, background: 'radial-gradient(circle, rgba(30,58,138,0.03) 0%, transparent 70%)' }} />
            
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FAF6F0', border: '1px solid rgba(179, 143, 93, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Shield className="w-6 h-6 text-[#B38F5D]" />
              </div>
              <div className="tag" style={{ margin: '0 auto 20px', background: '#FAF6F0', border: '1px solid rgba(179, 143, 93, 0.25)', color: 'var(--accent-deep)' }}>
                ⚕️ CLINICAL GOVERNANCE
              </div>
              <h2 className="section-title" style={{ fontSize: '2.4rem', letterSpacing: '-0.02em', fontWeight: 850, color: '#0F172A', marginBottom: 24 }}>
                Designed as a Clinical Co-Pilot, <br />Not a Replacement for Care
              </h2>
              <p style={{ color: 'var(--text-muted)', margin: '0 auto 48px', lineHeight: 1.8, fontSize: '1.02rem', maxWidth: 640 }}>
                AIHCAS acts as a high-fidelity co-pilot mapping and translating patient symptoms and metrics. All generated findings support seamless exports to real clinicians, empowering clinical collaboration under strict privacy guidelines.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                {[
                  { title: 'HIPAA Isolation', desc: 'Secure patient profiles operate on fully isolated database rows.' },
                  { title: 'Local Fallback', desc: 'Runs local Python and Tesseract systems during network failures.' },
                  { title: 'Transparent Triage', desc: 'Clear scoring tags help doctors prioritize critical consult queues.' }
                ].map((item, i) => (
                  <div key={i} style={{ background: 'white', border: '1px solid var(--border)', padding: '20px', borderRadius: '16px', textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, color: 'var(--primary-deep)', fontSize: '0.92rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle className="w-4 h-4 text-[#0D9488]" /> {item.title}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA PLATFORM ENTRY */}
      <section style={{ padding: '40px 0 96px', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div style={{ background: 'linear-gradient(135deg, #1E3A8A, #2A437E)', borderRadius: '28px', padding: '72px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 24px 60px rgba(30, 58, 138, 0.15)' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', pointerEvents: 'none' }} />
            <h2 style={{ fontSize: '2.5rem', fontWeight: 850, color: 'white', letterSpacing: '-0.02em', marginBottom: 16 }}>Secure Your Medical Workspace</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 40, fontSize: '1.05rem', maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.6 }}>
              Unlock structured OCR understanding, dual-portal doctors sync, and local health vaults today.
            </p>
            <Link href="/auth" className="btn" style={{ background: 'white', color: '#1E3A8A', fontWeight: 700, fontSize: '0.95rem', padding: '16px 40px', borderRadius: 100, boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Create Premium Account <ArrowRight className="w-4.5 h-4.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'white', padding: '64px 0 48px', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr', gap: 48, marginBottom: 48, textAlign: 'left' }}>
            <div>
              <div className="nav-logo" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="logo-icon" style={{ background: 'linear-gradient(135deg, #1E3A8A, #B38F5D)', width: 34, height: 34, borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #0F172A, #1E3A8A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  AIHCAS
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.7, maxWidth: 300 }}>
                High-fidelity healthcare co-pilot engineered with dual local-first fallback networks and secure database profiles.
              </p>
            </div>
            {[
              { title: 'Technology Stack', links: ['Symptom Triage', 'Tesseract Engine', 'Next.js 16 Web', 'Secure Supabase'] },
              { title: 'Medical Portals', links: ['Patient Dashboard', 'Clinician Sign-off', 'Local Drug DB', 'Emergency Hotlines'] },
              { title: 'Company Policy', links: ['Security Controls', 'Data Privacy', 'Disclaimers', 'Developer Portal'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 style={{ fontWeight: 700, color: 'var(--text-dark)', marginBottom: 20, fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{col.title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {col.links.map((link, j) => (
                    <a key={j} href="#" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s var(--transition)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#B38F5D')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(226, 232, 240, 0.6)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', lineHeight: 1.5 }}>
              © 2026 AIHCAS. Engineered by Sampada Kulkarni | Institution: SDMCET. Platform outputs do not constitute professional medical advice.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {['🐦', '💼', '📸', '▶️'].map((icon, i) => (
                <div key={i} style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.25s' }}>
                  {icon}
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
