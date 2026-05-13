'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const features = [
  {
    icon: '🔬',
    title: 'Symptom Analysis',
    desc: 'Describe your symptoms via text or voice and receive instant AI-powered triage guidance.',
    color: '#EAF6FF',
    accent: '#4DA6E8',
  },
  {
    icon: '💊',
    title: 'Prescription Understanding',
    desc: 'Upload your prescription and get simplified explanations of medicines, dosages, and interactions.',
    color: '#F0EAFF',
    accent: '#7C5CFC',
  },
  {
    icon: '📊',
    title: 'Report Interpretation',
    desc: 'Upload blood tests, X-ray reports, and other diagnostics for clear, structured insights.',
    color: '#E6FFF5',
    accent: '#2EC4A0',
  },
  {
    icon: '🚨',
    title: 'Emergency Guidance',
    desc: 'Instant access to emergency numbers, first-aid guidance, and nearby hospital information.',
    color: '#FFF0F0',
    accent: '#E53E3E',
  },
  {
    icon: '🤖',
    title: 'AI Triage Engine',
    desc: 'Smart triage classification: self-care, doctor consultation, or emergency — in seconds.',
    color: '#FFFBEA',
    accent: '#F59E0B',
  },
  {
    icon: '🎤',
    title: 'Voice Interaction',
    desc: 'Talk to your AI health assistant naturally using voice — ideal for all age groups.',
    color: '#EAF6FF',
    accent: '#4DA6E8',
  },
];

const steps = [
  { num: '01', title: 'Describe Symptoms', desc: 'Type or speak your symptoms freely in natural language.', icon: '💬' },
  { num: '02', title: 'AI Analysis', desc: 'Our engine analyzes patterns, severity, and relevant history.', icon: '⚡' },
  { num: '03', title: 'Get Recommendation', desc: 'Receive a clear triage classification and detailed guidance.', icon: '📋' },
  { num: '04', title: 'Take Action', desc: 'Self-care tips, doctor booking links, or emergency alerts.', icon: '✅' },
];

const stats = [
  { value: '<3s', label: 'Avg Response Time' },
  { value: '24/7', label: 'Always Available' },
];

function FloatingOrb({ style }: { style: React.CSSProperties }) {
  return (
    <div style={{
      position: 'absolute',
      borderRadius: '50%',
      filter: 'blur(60px)',
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
      {/* floating orbs */}
      <FloatingOrb style={{ top: '10%', right: '5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(77,166,232,0.18) 0%, transparent 70%)' }} />
      <FloatingOrb style={{ top: '50%', left: '-5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(124,92,252,0.15) 0%, transparent 70%)' }} />
      <FloatingOrb style={{ bottom: '10%', right: '10%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(46,196,160,0.15) 0%, transparent 70%)' }} />

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-inner">
          <Link href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
            <div className="logo-icon">🏥</div>
            <span>AIHCAS</span>
          </Link>
          <ul className="nav-links" style={{ listStyle: 'none', display: 'flex', gap: 32 }}>
            {['Features', 'How It Works', 'Trust'].map((item) => (
              <li key={item}>
                <a href={`#${item.toLowerCase().replace(/ /g, '-')}`} style={{ textDecoration: 'none', fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <div className="nav-actions">
            <Link href="/auth" className="btn btn-secondary btn-sm">Log In</Link>
            <Link href="/auth" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: 140, paddingBottom: 80, position: 'relative', zIndex: 1 }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className={`tag ${visible ? 'animate-fadeInUp' : ''}`}>
            <span>✨</span> AI-Powered Healthcare Assistant
          </div>

          <h1
            className={`${visible ? 'animate-fadeInUp delay-100' : ''}`}
            style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.18, marginBottom: 24, maxWidth: 820, margin: '0 auto 24px' }}
          >
            Your Intelligent <span className="text-gradient">AI Healthcare</span><br />Assistant
          </h1>

          <p
            className={`section-subtitle ${visible ? 'animate-fadeInUp delay-200' : ''}`}
            style={{ margin: '0 auto 40px', textAlign: 'center', maxWidth: 580 }}
          >
            Instant symptom guidance, voice interaction, and medical report analysis — your first step to smarter healthcare.
          </p>

          <div className={`${visible ? 'animate-fadeInUp delay-300' : ''}`} style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
            <Link href={user ? "/dashboard" : "/auth"} className="btn btn-primary btn-lg">
              {user ? "🚀 Go to Dashboard" : "🚀 Get Started — It's Free"}
            </Link>
            <Link href={user ? "/dashboard" : "/dashboard"} className="btn btn-secondary btn-lg">
              {user ? "👁️ View Recent Activity" : "👁️ Try Demo"}
            </Link>
          </div>

          {/* Hero Illustration */}
          <div
            className={`${visible ? 'animate-fadeInUp delay-400' : ''}`}
            style={{ position: 'relative', maxWidth: 900, margin: '0 auto' }}
          >
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: 28, boxShadow: '0 24px 80px rgba(77,166,232,0.2)' }}>
              {/* Mock Dashboard Preview */}
              <div style={{ background: 'linear-gradient(135deg, rgba(234,246,255,0.9), rgba(240,234,255,0.9))', padding: '24px 24px 0' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                  {['#FF6B6B', '#FFD93D', '#6BCB77'].map((c, i) => (
                    <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 16 }}>
                  {/* Sidebar preview */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {['💬 Text Query', '🎤 Voice Call', '💊 Prescription', '📊 Reports', '🚨 Emergency'].map((item, i) => (
                      <div key={i} className="animate-floatReverse" style={{
                        background: i === 0 ? 'linear-gradient(135deg, rgba(77,166,232,0.2), rgba(124,92,252,0.15))' : 'rgba(255,255,255,0.65)',
                        borderRadius: 12, padding: '10px 14px',
                        fontSize: '0.8rem', fontWeight: 600,
                        color: i === 0 ? 'var(--primary-deep)' : 'var(--text-muted)',
                        border: `1.5px solid ${i === 0 ? 'rgba(77,166,232,0.3)' : 'transparent'}`,
                        animationDelay: `${i * 0.3}s`,
                      }}>{item}</div>
                    ))}
                  </div>
                  {/* Chat preview */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 0 }}>
                    <div className="animate-float" style={{ background: 'rgba(255,255,255,0.85)', borderRadius: '16px 16px 16px 4px', padding: '12px 16px', fontSize: '0.82rem', boxShadow: '0 4px 16px rgba(77,166,232,0.12)', border: '1px solid var(--border)', maxWidth: '85%' }}>
                      🤖 Hello! I&apos;m your AI health assistant. How are you feeling today?
                    </div>
                    <div className="animate-float" style={{ background: 'linear-gradient(135deg, #4DA6E8, #7C5CFC)', borderRadius: '16px 16px 4px 16px', padding: '12px 16px', fontSize: '0.82rem', color: 'white', alignSelf: 'flex-end', maxWidth: '80%', animationDelay: '1s' }}>
                      I have a headache and mild fever since yesterday...
                    </div>
                    <div className="animate-float" style={{ background: 'rgba(255,255,255,0.85)', borderRadius: '16px 16px 16px 4px', padding: '12px 16px', fontSize: '0.82rem', boxShadow: '0 4px 16px rgba(77,166,232,0.12)', border: '1px solid var(--border)', maxWidth: '90%', animationDelay: '0.5s' }}>
                      <div style={{ marginBottom: 8 }}>Based on your symptoms, this appears to be a mild viral infection.</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span className="triage-badge triage-self">✅ Self-Care Recommended</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div
              className="animate-float glass"
              style={{ position: 'absolute', top: -20, left: -30, padding: '12px 20px', borderRadius: 16, boxShadow: 'var(--shadow-md)', background: 'rgba(255,255,255,0.9)' }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Sessions Today</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-deep)' }}>24,891</div>
            </div>
            <div
              className="animate-floatReverse glass"
              style={{ position: 'absolute', bottom: 30, right: -20, padding: '12px 20px', borderRadius: 16, boxShadow: 'var(--shadow-md)', background: 'rgba(255,255,255,0.9)' }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Accuracy Score</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2EC4A0' }}>98.4%</div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section style={{ padding: '40px 0 80px', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
            {stats.map((stat, i) => (
              <div key={i} className="glass-card animate-fadeInUp" style={{ padding: '28px 24px', textAlign: 'center', minWidth: 240, animationDelay: `${i * 0.1}s` }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #4DA6E8, #7C5CFC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{stat.value}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="section" style={{ position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="tag">🌟 Core Features</div>
            <h2 className="section-title">Everything You Need for <span className="text-gradient">Smart Healthcare</span></h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>Six powerful AI modules designed to guide, simplify, and empower your healthcare journey.</p>
          </div>
          <div className="grid-3">
            {features.map((f, i) => (
              <div key={i} className="feature-card animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', marginBottom: 20, border: `1.5px solid ${f.accent}30` }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{f.desc}</p>
                <div style={{ marginTop: 20 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: f.accent, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Learn more →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="section" style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.35)', backdropFilter: 'blur(10px)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="tag">⚙️ Process</div>
            <h2 className="section-title">How It <span className="text-gradient">Works</span></h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>From symptom input to actionable guidance in four simple steps.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, position: 'relative' }}>
            {/* Connector line */}
            <div style={{ position: 'absolute', top: 40, left: '12.5%', right: '12.5%', height: 2, background: 'linear-gradient(to right, #4DA6E8, #7C5CFC, #2EC4A0)', borderRadius: 2, zIndex: 0 }} />
            {steps.map((step, i) => (
              <div key={i} className="animate-fadeInUp" style={{ textAlign: 'center', position: 'relative', zIndex: 1, animationDelay: `${i * 0.15}s` }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'white', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 20px', position: 'relative', boxShadow: 'var(--shadow-md)' }}>
                  {step.icon}
                  <div style={{ position: 'absolute', top: -8, right: -8, width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #4DA6E8, #7C5CFC)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'white' }}>{step.num}</div>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section id="trust" className="section" style={{ position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div className="glass-card" style={{ padding: '64px', textAlign: 'center', overflow: 'hidden', position: 'relative' }}>
            <FloatingOrb style={{ top: -100, right: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(77,166,232,0.12) 0%, transparent 70%)' }} />
            <FloatingOrb style={{ bottom: -80, left: -80, width: 300, height: 300, background: 'radial-gradient(circle, rgba(46,196,160,0.12) 0%, transparent 70%)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 24 }}>🏥</div>
              <div className="tag" style={{ margin: '0 auto 20px' }}>⚕️ Medical Transparency</div>
              <h2 className="section-title" style={{ maxWidth: 700, margin: '0 auto 20px' }}>
                Not a Replacement for Doctors, But Your <span className="text-gradient">First Step to Care</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: 620, margin: '0 auto 40px', lineHeight: 1.75, fontSize: '1.02rem' }}>
                AIHCAS is designed to complement professional medical care, not replace it. We provide AI-powered guidance that helps you understand symptoms, prepare for doctor visits, and take informed action — with full transparency and respect for your privacy.
              </p>

            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ padding: '80px 0', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div style={{ background: 'linear-gradient(135deg, #4DA6E8, #7C5CFC)', borderRadius: 28, padding: '64px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'white', marginBottom: 16 }}>Start Your Health Journey Today</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 36, fontSize: '1.05rem' }}>Join over 10 million users who trust AIHCAS for smart healthcare guidance.</p>
            <Link href="/auth" className="btn" style={{ background: 'white', color: 'var(--primary-deep)', fontWeight: 700, fontSize: '1rem', padding: '16px 40px', borderRadius: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', display: 'inline-flex' }}>
              🚀 Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '48px 0', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 40 }}>
            <div>
              <div className="nav-logo" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="logo-icon" style={{ width: 36, height: 36, fontSize: '1rem' }}>🏥</div>
                <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>AIHCAS</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.7, maxWidth: 280 }}>
                Your intelligent AI healthcare assistant. Trusted by millions for instant, safe, and accurate health guidance.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'How It Works', 'Pricing', 'Security'] },
              { title: 'Healthcare', links: ['Emergency Contacts', 'Find Doctors', 'Hospitals', 'Mental Health'] },
              { title: 'Company', links: ['About Us', 'Blog', 'Privacy Policy', 'Terms of Service'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 style={{ fontWeight: 700, marginBottom: 16, fontSize: '0.9rem' }}>{col.title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map((link, j) => (
                    <a key={j} href="#" style={{ color: 'var(--text-muted)', fontSize: '0.87rem', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary-deep)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-light)' }}>© 2026 AIHCAS. All rights reserved. Not a replacement for professional medical advice.</p>
            <div style={{ display: 'flex', gap: 16 }}>
              {['🐦', '💼', '📸', '▶️'].map((icon, i) => (
                <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}>
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
