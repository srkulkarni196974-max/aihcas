'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const modules = [

  {
    id: 'chat',
    title: 'Text Query',
    desc: 'Describe symptoms via natural text chat with AI triage.',
    icon: '💬',
    href: '/dashboard/chat',
    color: 'linear-gradient(135deg, #EAF6FF, #C8E8FF)',
    border: 'rgba(77,166,232,0.25)',
    tag: 'Popular',
    tagColor: 'badge-blue',
  },
  {
    id: 'voice',
    title: 'Voice Consultation',
    desc: 'Talk to AI assistant for hands-free health guidance.',
    icon: '🎤',
    href: '/dashboard/voice',
    color: 'linear-gradient(135deg, #F0EAFF, #C8B0FF)',
    border: 'rgba(124,92,252,0.25)',
    tag: 'Real-Time',
    tagColor: 'badge-purple',
  },
  {
    id: 'prescription',
    title: 'Prescription Analysis',
    desc: 'Upload and understand medication charts easily.',
    icon: '💊',
    href: '/dashboard/prescription',
    color: 'linear-gradient(135deg, #E6FFF5, #B2F0D8)',
    border: 'rgba(46,196,160,0.25)',
    tag: 'AI Powered',
    tagColor: 'badge-green',
  },
  {
    id: 'reports',
    title: 'Report Analysis',
    desc: 'Understand lab results, X-rays, and diagnostics.',
    icon: '📊',
    href: '/dashboard/reports',
    color: 'linear-gradient(135deg, #FFFBEA, #FDE68A)',
    border: 'rgba(245,158,11,0.25)',
    tag: 'Insightful',
    tagColor: 'badge-yellow',
  },
  {
    id: 'emergency',
    title: 'Emergency Contacts',
    desc: 'Instant access to Indian healthcare helplines.',
    icon: '🚨',
    href: '/dashboard/emergency',
    color: 'linear-gradient(135deg, #FFF0F0, #FEB2B2)',
    border: 'rgba(229,62,62,0.25)',
    tag: 'Critical',
    tagColor: 'badge-red',
  },
  {
    id: 'profile',
    title: 'Health Profile',
    desc: 'Manage your health info, conditions & preferences.',
    icon: '👤',
    href: '/dashboard/profile',
    color: 'linear-gradient(135deg, #F5F8FF, #E0E8FF)',
    border: 'rgba(77,120,232,0.2)',
    tag: 'Settings',
    tagColor: 'badge-blue',
  },
];

const healthTips = [
  { icon: '💧', tip: 'Drink at least 8 glasses of water today to stay hydrated.' },
  { icon: '🚶', tip: 'A 30-minute walk can reduce blood pressure significantly.' },
  { icon: '😴', tip: 'Aim for 7–9 hours of sleep for optimal immune function.' },
  { icon: '🥗', tip: 'Include leafy greens in your meals for iron and folate.' },
  { icon: '🧘', tip: 'Practice deep breathing for 5 minutes to reduce stress.' },
];

function useTimeGreeting(name: string) {

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return `${greeting}, ${name}`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const greeting = useTimeGreeting(user?.name?.split(' ')[0] || 'User');
  const [tipIndex, setTipIndex] = useState(0);
  const [date] = useState(new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadProfile() {
      if (user?.userId) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.userId)
          .maybeSingle();
        
        if (data) setProfile(data);
      }
    }
    loadProfile();

    const timer = setInterval(() => {
      setTipIndex(prev => (prev + 1) % healthTips.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [user?.userId]);

  const getBMI = () => {
    if (!profile?.height || !profile?.weight) return null;
    return (parseFloat(profile.weight) / Math.pow(parseFloat(profile.height) / 100, 2)).toFixed(1);
  };

  const personalStats = [
    { icon: '🩸', label: 'Blood Group', value: profile?.blood_group || 'Not Set', color: '#E53E3E' },
    { icon: '⚖️', label: 'Current BMI', value: getBMI() || 'Not Set', color: '#2EC4A0' },
    { icon: '🎂', label: 'Age', value: profile?.age ? `${profile.age} yrs` : 'Not Set', color: '#7C5CFC' },
    { icon: '🔒', label: 'Data Privacy', value: 'Supabase Cloud', color: '#4DA6E8' },
  ];


  return (
    <div className="page-fade">
      {/* Header */}
      <header style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginBottom: 4 }}>{date}</p>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 6 }}>
              <span className="text-gradient">{greeting}</span> 👋
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>How can I help with your health today?</p>
          </div>
          <div className="glass-card animate-float" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 14, minWidth: 260 }}>
            <div style={{ fontSize: '2rem' }}>{healthTips[tipIndex].icon}</div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: 4 }}>Daily Tip</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-dark)', lineHeight: 1.5, maxWidth: 240, transition: 'all 0.5s' }}>{healthTips[tipIndex].tip}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 40 }}>
        {personalStats.map((stat, i) => (
          <div key={i} className="glass-card animate-fadeInUp" style={{ padding: '18px 20px', animationDelay: `${i * 0.08}s` }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600, marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Module Grid */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 20 }}>🏥 Health Modules</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {modules.map((m, i) => (
            <Link key={m.id} href={m.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div
                className="feature-card animate-fadeInUp"
                style={{
                  height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  animationDelay: `${i * 0.07}s`, background: m.color, border: `1.5px solid ${m.border}`,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                    <div style={{ fontSize: '2.4rem' }}>{m.icon}</div>
                    <span className={`badge ${m.tagColor}`} style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(4px)' }}>{m.tag}</span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>{m.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{m.desc}</p>
                </div>
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--primary-deep)', fontSize: '0.85rem' }}>
                  Open Module
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Emergency Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(229,62,62,0.08), rgba(229,62,62,0.04))', border: '1.5px solid rgba(229,62,62,0.15)', borderRadius: 20, padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: '2.5rem' }}>🚨</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>Life-threatening emergency?</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Don't wait. Call 112 immediately for emergency services.</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-danger btn-sm" onClick={() => window.location.href = 'tel:112'}>
            📞 Call 112
          </button>
          <Link href="/dashboard/emergency" className="btn btn-secondary btn-sm">
            All Helplines
          </Link>
        </div>
      </div>
    </div>
  );
}
