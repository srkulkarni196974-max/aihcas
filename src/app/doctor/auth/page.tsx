'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Mail, Lock, User, Building, Award, Phone, MapPin, FileText, ArrowRight, ChevronRight } from 'lucide-react';

export default function DoctorAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [hospital, setHospital] = useState('');
  const [licenseId, setLicenseId] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/doctor/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push('/doctor/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/doctor/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword, specialization, hospitalName: hospital, licenseId, phone, city }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(data.message);
      setTimeout(() => { setMode('login'); setSuccess(''); }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: mode === 'register' ? 560 : 440 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #1E3A8A, #0D9488)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-dark)' }}>AIHCAS Doctor Portal</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>
            {mode === 'login' ? 'Sign in to your clinical dashboard' : 'Register as a healthcare provider'}
          </p>
        </div>

        {/* Segmented toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', background: '#F1F5F9', padding: 4, borderRadius: 100, border: '1px solid var(--border)', width: 260 }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }} style={{
                flex: 1, padding: '8px 0', borderRadius: 100, border: 'none', cursor: 'pointer',
                fontSize: '0.82rem', fontWeight: 800, fontFamily: 'inherit', transition: 'all 0.3s',
                background: mode === m ? 'white' : 'transparent',
                color: mode === m ? 'var(--primary-deep)' : 'var(--text-light)',
                boxShadow: mode === m ? '0 2px 8px rgba(30,58,138,0.08)' : 'none',
              }}>{m === 'login' ? 'Sign In' : 'Register'}</button>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="glass-card animate-fadeInUp" style={{ padding: 32, background: 'white', border: '1.5px solid var(--border)' }}>
          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 10, marginBottom: 16 }}>
              <p style={{ fontSize: '0.8rem', color: '#DC2626', fontWeight: 600 }}>{error}</p>
            </div>
          )}
          {success && (
            <div style={{ padding: '10px 14px', background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.15)', borderRadius: 10, marginBottom: 16 }}>
              <p style={{ fontSize: '0.8rem', color: '#0D9488', fontWeight: 600 }}>{success}</p>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="input-label"><Mail className="w-3 h-3 inline mr-1" />Email</label>
                <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="doctor@hospital.com" required />
              </div>
              <div>
                <label className="input-label"><Lock className="w-3 h-3 inline mr-1" />Password</label>
                <input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', borderRadius: 100, fontWeight: 800, marginTop: 8 }}>
                {loading ? 'Signing in...' : 'Sign In to Dashboard'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="input-label"><User className="w-3 h-3 inline mr-1" />Full Name *</label>
                  <input className="input-field" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Dr. Sharma" required />
                </div>
                <div>
                  <label className="input-label"><Mail className="w-3 h-3 inline mr-1" />Email *</label>
                  <input className="input-field" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="doctor@clinic.com" required />
                </div>
              </div>
              <div>
                <label className="input-label"><Lock className="w-3 h-3 inline mr-1" />Password * (min 8 characters)</label>
                <input className="input-field" type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="••••••••" required minLength={8} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="input-label"><Award className="w-3 h-3 inline mr-1" />Specialization *</label>
                  <input className="input-field" value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder="Cardiologist" required />
                </div>
                <div>
                  <label className="input-label"><Building className="w-3 h-3 inline mr-1" />Hospital / Clinic *</label>
                  <input className="input-field" value={hospital} onChange={e => setHospital(e.target.value)} placeholder="Apollo Hospital" required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="input-label"><FileText className="w-3 h-3 inline mr-1" />License ID *</label>
                  <input className="input-field" value={licenseId} onChange={e => setLicenseId(e.target.value)} placeholder="MCI-12345" required />
                </div>
                <div>
                  <label className="input-label"><Phone className="w-3 h-3 inline mr-1" />Phone</label>
                  <input className="input-field" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                </div>
              </div>
              <div>
                <label className="input-label"><MapPin className="w-3 h-3 inline mr-1" />City</label>
                <input className="input-field" value={city} onChange={e => setCity(e.target.value)} placeholder="Mumbai" />
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', borderRadius: 100, fontWeight: 800, marginTop: 8 }}>
                {loading ? 'Registering...' : 'Submit Registration'} <ArrowRight className="w-4 h-4" />
              </button>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-light)', textAlign: 'center', fontWeight: 600 }}>
                Your account will be reviewed and approved before access is granted.
              </p>
            </form>
          )}
        </div>

        {/* Back to patient portal link */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="/auth" style={{ fontSize: '0.8rem', color: 'var(--primary-deep)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ChevronRight className="w-3 h-3" style={{ transform: 'rotate(180deg)' }} /> Patient Portal Login
          </a>
        </div>
      </div>
    </div>
  );
}
