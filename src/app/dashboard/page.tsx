'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import BiomarkerModule from '@/app/dashboard/biomarkerModule';
import { 
  MessageSquare, 
  Mic, 
  Pill, 
  FileSpreadsheet, 
  PhoneCall, 
  User, 
  Sparkles, 
  Droplet, 
  Activity, 
  Clock, 
  Heart, 
  Award,
  Scale,
  Calendar,
  Lock,
  ArrowRight,
  ShieldAlert,
  FileDown
} from 'lucide-react';


const modules = [
  {
    id: 'chat',
    title: 'Text Query',
    desc: 'Describe symptoms via natural text chat with secure clinical triage scoring.',
    icon: <MessageSquare className="w-6 h-6 text-[#1E3A8A]" />,
    href: '/dashboard/chat',
    color: 'rgba(30, 58, 138, 0.03)',
    border: 'rgba(30, 58, 138, 0.08)',
    tag: 'Popular',
    tagColor: 'badge-blue',
  },
  {
    id: 'voice',
    title: 'Voice Consultation',
    desc: 'Talk to our diagnostic AI health assistant for hands-free clinical guidance.',
    icon: <Mic className="w-6 h-6 text-[#B38F5D]" />,
    href: '/dashboard/voice',
    color: 'rgba(179, 143, 93, 0.03)',
    border: 'rgba(179, 143, 93, 0.08)',
    tag: 'Real-Time',
    tagColor: 'badge-purple',
  },
  {
    id: 'prescription',
    title: 'Prescription Understanding',
    desc: 'Upload medication charts to translate dosages and active allergy alerts.',
    icon: <Pill className="w-6 h-6 text-[#0D9488]" />,
    href: '/dashboard/prescription',
    color: 'rgba(13, 148, 136, 0.03)',
    border: 'rgba(13, 148, 136, 0.08)',
    tag: 'AI Parser',
    tagColor: 'badge-green',
  },
  {
    id: 'reports',
    title: 'Report Analysis',
    desc: 'Interpret blood test panels, LFTs, and clinical pathology parameters.',
    icon: <FileSpreadsheet className="w-6 h-6 text-[#D97706]" />,
    href: '/dashboard/reports',
    color: 'rgba(217, 119, 6, 0.03)',
    border: 'rgba(217, 119, 6, 0.08)',
    tag: 'Diagnostics',
    tagColor: 'badge-yellow',
  },
  {
    id: 'emergency',
    title: 'Emergency Contacts',
    desc: 'Instant, single-tap access to localized emergency health resources.',
    icon: <PhoneCall className="w-6 h-6 text-[#DC2626]" />,
    href: '/dashboard/emergency',
    color: 'rgba(220, 38, 38, 0.03)',
    border: 'rgba(220, 38, 38, 0.08)',
    tag: 'Critical',
    tagColor: 'badge-red',
  },
  {
    id: 'profile',
    title: 'Health Profile',
    desc: 'Manage your history, physical metrics, allergies, and parameters.',
    icon: <User className="w-6 h-6 text-[#1E3A8A]" />,
    href: '/dashboard/profile',
    color: 'rgba(30, 58, 138, 0.03)',
    border: 'rgba(30, 58, 138, 0.08)',
    tag: 'Vault Settings',
    tagColor: 'badge-blue',
  },
BiomarkerModule,
];

const healthTips = [
  { icon: <Droplet className="w-5 h-5 text-[#1E3A8A]" />, tip: 'Drink at least 8 glasses of water today to stay hydrated.' },
  { icon: <Activity className="w-5 h-5 text-[#0D9488]" />, tip: 'A 30-minute walk can reduce blood pressure significantly.' },
  { icon: <Clock className="w-5 h-5 text-[#B38F5D]" />, tip: 'Aim for 7–9 hours of sleep for optimal immune function.' },
  { icon: <Heart className="w-5 h-5 text-[#DC2626]" />, tip: 'Include leafy greens in your meals for iron and folate.' },
  { icon: <Sparkles className="w-5 h-5 text-[#D97706]" />, tip: 'Practice deep breathing for 5 minutes to reduce stress.' },
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
    { icon: <Heart className="w-5 h-5 text-[#DC2626]" />, label: 'Blood Group', value: profile?.blood_group || 'Not Set', color: '#DC2626' },
    { icon: <Scale className="w-5 h-5 text-[#0D9488]" />, label: 'Current BMI', value: getBMI() || 'Not Set', color: '#0D9488' },
    { icon: <Calendar className="w-5 h-5 text-[#B38F5D]" />, label: 'Age Parameters', value: profile?.age ? `${profile.age} yrs` : 'Not Set', color: '#B38F5D' },
    { icon: <Lock className="w-5 h-5 text-[#1E3A8A]" />, label: 'Data Isolation', value: 'Active SSL', color: '#1E3A8A' },
  ];

  return (
    <div className="page-fade">
      {/* Header section */}
      <header style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ color: 'var(--text-light)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>{date}</p>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 850, letterSpacing: '-0.02em', marginBottom: 8, color: '#0F172A' }}>
              <span style={{ background: 'linear-gradient(135deg, #1E3A8A 30%, #B38F5D 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{greeting}</span> 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>How can I help decypher your diagnostic health records today?</p>
          </div>
          <div className="glass-card animate-float" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 14, minWidth: 280, border: '1.5px solid rgba(255,255,255,0.95)', background: 'rgba(255,255,255,0.85)' }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.01)', border: '1px solid var(--border)' }}>
              {healthTips[tipIndex].icon}
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Daily Health Tip</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: 220, transition: 'all 0.5s' }}>{healthTips[tipIndex].tip}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Personal Parameters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 18, marginBottom: 40 }}>
        {personalStats.map((stat, i) => (
          <div key={i} className="glass-card animate-fadeInUp" style={{ padding: '20px 24px', border: '1.5px solid rgba(255,255,255,0.95)', background: 'rgba(255,255,255,0.65)', display: 'flex', flexDirection: 'column', gap: 12, animationDelay: `${i * 0.08}s` }}>
            <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 850, color: 'var(--text-dark)', letterSpacing: '-0.02em' }}>{stat.value}</div>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-light)', fontWeight: 700, letterSpacing: '0.02em', marginTop: 1 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Services Grid */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0F172A', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles className="w-5 h-5 text-[#B38F5D]" /> Workspace Modules
        </h2>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '10px', background: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {m.icon}
                    </div>
                    <span className="badge" style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 700, padding: '4px 10px', fontSize: '0.7rem', borderRadius: 100 }}>{m.tag}</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-dark)' }}>{m.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{m.desc}</p>
                </div>
                <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#B38F5D', fontSize: '0.8rem' }}>
                  Launch Service Workspace
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Premium Clinical Summary Panel */}
      <div className="glass-card animate-fadeInUp" style={{ background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.04), rgba(179, 143, 93, 0.04))', border: '1.5px solid rgba(30, 58, 138, 0.12)', borderRadius: 20, padding: '28px 32px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: '1 1 500px' }}>
          <div style={{ width: 52, height: 52, borderRadius: '12px', background: 'white', border: '1.5px solid rgba(30, 58, 138, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.05)' }}>
            <FileDown className="w-6 h-6 text-[#1E3A8A]" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 850, fontSize: '1.15rem', color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: 8 }}>
              Generate Clinical Summary Report
              <span className="badge" style={{ background: 'linear-gradient(135deg, #1E3A8A, #B38F5D)', color: 'white', fontWeight: 800, padding: '3px 8px', fontSize: '0.65rem', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.5px' }}>New Feature</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: 4, lineHeight: 1.5 }}>
              Combine your profile demographics, recent chat triage history, prescriptions, and pathology lab findings into a secure clinical-grade summary PDF. Save it to your vault, print it, or share it directly with connected doctors.
            </p>
          </div>
        </div>
        <div>
          <Link href="/dashboard/share?triggerReport=true" className="btn btn-primary animate-hover" style={{ borderRadius: 100, fontWeight: 700, background: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)', border: 'none', padding: '12px 24px', boxShadow: '0 4px 14px rgba(30, 58, 138, 0.25)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Sparkles className="w-4 h-4 text-[#B38F5D]" /> Launch PDF Generator
          </Link>
        </div>
      </div>

      {/* Emergency Assistance Segment */}
      <div style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.04), rgba(220,38,38,0.01))', border: '1.5px solid rgba(220,38,38,0.15)', borderRadius: 20, padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'white', border: '1px solid rgba(220,38,38,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert className="w-6 h-6 text-[#DC2626]" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 800, fontSize: '1.02rem', color: 'var(--text-dark)' }}>Life-threatening medical emergency?</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 2 }}>Do not delay. Trigger emergency support lines immediately.</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-danger btn-sm" onClick={() => window.open('tel:112', '_system')} style={{ borderRadius: 100, fontWeight: 700 }}>
            📞 Trigger Emergency 112
          </button>
          <Link href="/dashboard/emergency" className="btn btn-secondary btn-sm" style={{ borderRadius: 100, border: '1px solid var(--border)', fontWeight: 700 }}>
            All National Hotlines
          </Link>
        </div>
      </div>
    </div>
  );
}
