'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Heart, 
  Lock, 
  Activity, 
  Globe, 
  Award, 
  ShieldAlert, 
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Sparkles,
  LockKeyhole
} from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { login, signup, loginWithGoogle, forgotPassword, user } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showGoogleSelector, setShowGoogleSelector] = useState(false);

  const mockGoogleAccounts = [
    { name: 'Sampada Kulkarni', email: 'srkulkarni1969.74@gmail.com', avatar: 'S' },
    { name: 'Priya Sharma', email: 'priya@example.com', avatar: 'P' },
    { name: 'Guest User', email: 'guest@aihcas.ai', avatar: 'G' },
  ];

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === 'signup' && !form.name.trim()) e.name = 'Full name is required';
    if (!form.email.includes('@')) e.email = 'Enter a valid email address';
    if (mode !== 'forgot-password' && form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (mode !== 'forgot-password' && form.password.length > 45) e.password = 'Password must not exceed 45 characters';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setSuccessMessage('');
    if (Object.keys(errs).length > 0) return;
    
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 500);
      } else if (mode === 'signup') {
        await signup(form.name, form.email, form.password);
        setSuccessMessage('Account created! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 500);
      } else {
        const msg = await forgotPassword(form.email);
        setSuccessMessage(msg);
      }
    } catch (err: any) {
      setErrors({ server: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    setErrors({});
    setSuccessMessage('');
    // Trigger real Google OAuth redirect via NextAuth
    loginWithGoogle();
  };

  const selectGoogleAccount = async (account: { name: string, email: string }) => {
    setShowGoogleSelector(false);
    setLoading(true);
    try {
      await loginWithGoogle(account.email, account.name);
      setSuccessMessage(`Signed in as ${account.name}! Redirecting...`);
      setTimeout(() => router.push('/dashboard'), 500);
    } catch (err) {
      setErrors({ server: 'Google authentication failed' });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: 'login' | 'signup' | 'forgot-password') => {
    setMode(newMode);
    setErrors({});
    setSuccessMessage('');
    // Keep email if they were trying to log in but forgot password
    setForm(prev => ({ ...prev, name: '', password: '' }));
  };

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Illustration Panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
      }} className="hide-mobile">
        {/* Decorative clinical orbs */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(179,143,93,0.04) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-5%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,58,138,0.03) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div className="animate-float" style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: '460px' }}>
          <div style={{ width: 68, height: 68, borderRadius: '20px', background: 'linear-gradient(135deg, #1E3A8A, #B38F5D)', display: 'flex', alignItems: 'center', margin: '0 auto 32px', color: 'white', justifyContent: 'center' }}>
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 850, marginBottom: 18, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
            Pristine Clinical Intelligence <br />
            <span style={{ background: 'linear-gradient(135deg, #1E3A8A 30%, #B38F5D 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Starts Here</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: 40 }}>
            Join millions of users who rely on AIHCAS for structured prescription decoding, out-of-range diagnostics analysis, and secure clinical vaults.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { icon: <Lock className="w-5 h-5 text-[#B38F5D]" />, text: 'Data Isolation' },
              { icon: <Activity className="w-5 h-5 text-[#1E3A8A]" />, text: 'Real-Time Triage' },
              { icon: <Globe className="w-5 h-5 text-[#0D9488]" />, text: 'Localized Medical KB' },
              { icon: <Award className="w-5 h-5 text-[#D97706]" />, text: 'Clinician Oversight' },
            ].map((item, i) => (
              <div key={i} className="glass-card" style={{ padding: '16px 20px', borderRadius: 16, textAlign: 'left', border: '1.5px solid rgba(255,255,255,0.95)', background: 'rgba(255,255,255,0.65)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>{item.icon}</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dark)' }}>{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div style={{
        width: '480px',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(32px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        borderLeft: '1.5px solid var(--border)',
        minHeight: '100vh',
      }} className="full-width-mobile">
        <div style={{ width: '100%', maxWidth: 360 }} className="animate-scaleIn">
          {/* Header Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }}>
            <div style={{ background: 'linear-gradient(135deg, #1E3A8A, #B38F5D)', width: 30, height: 30, borderRadius: '6px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart className="w-3.5 h-3.5 text-white" />
            </div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #0F172A, #1E3A8A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AIHCAS
            </span>
          </Link>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 850, letterSpacing: '-0.02em', marginBottom: 8, color: 'var(--text-dark)' }}>
            {mode === 'login' ? 'Welcome back 👋' : mode === 'signup' ? 'Create workspace 🚀' : 'Reset password 🔑'}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: '0.88rem', lineHeight: 1.5 }}>
            {mode === 'login' ? 'Log in to access your dashboard' : mode === 'signup' ? 'Start your clinical co-pilot profile' : "Enter your email for password recovery"}
          </p>

          {/* Google Button */}
          {mode !== 'forgot-password' && (
            <>
              <button
                id="btn-google-auth"
                onClick={handleGoogle}
                disabled={loading}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', marginBottom: 12, gap: 10, fontSize: '0.88rem', borderRadius: 100, border: '1.5px solid var(--border)' }}
              >
                <svg width="16" height="16" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"/></svg>
                Continue with Google
              </button>

              <Link href="/doctor/auth" style={{ textDecoration: 'none', width: '100%' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', marginBottom: 20, gap: 10, fontSize: '0.88rem', borderRadius: 100, border: '1.5px solid var(--primary-deep)', color: 'var(--primary-deep)', background: 'rgba(30, 58, 138, 0.04)' }}
                >
                  <LockKeyhole className="w-4 h-4" />
                  Clinician / Doctor Login
                </button>
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>or use credentials</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>
            </>
          )}

          {/* Success Dialog */}
          {successMessage && (
            <div style={{ 
              padding: '12px 16px', 
              background: '#E6FFF5', 
              border: '1.5px solid #2EC4A030', 
              borderRadius: '14px', 
              color: 'var(--secondary-deep)', 
              fontSize: '0.83rem', 
              marginBottom: '20px', 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700
            }}>
              <CheckCircle className="w-4 h-4 text-[#0D9488]" />
              {successMessage}
            </div>
          )}

          {/* Error Dialog */}
          {errors.server && (
            <div style={{ 
              padding: '12px 16px', 
              background: '#FFF0F0', 
              border: '1.5px solid #DC262630', 
              borderRadius: '14px', 
              color: 'var(--danger-deep)', 
              fontSize: '0.83rem', 
              marginBottom: '20px', 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700
            }}>
              <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
              {errors.server}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'signup' && (
              <div>
                <label className="input-label" htmlFor="input-name">Full Name</label>
                <input
                  id="input-name"
                  className="input-field"
                  type="text"
                  placeholder="Dr. Priya Sharma"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  autoComplete="name"
                />
                {errors.name && <p style={{ color: 'var(--danger-deep)', fontSize: '0.78rem', marginTop: 4 }}>{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="input-label" htmlFor="input-email">Email Address</label>
              <input
                id="input-email"
                className="input-field"
                type="email"
                placeholder="priya@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
              {errors.email && <p style={{ color: 'var(--danger-deep)', fontSize: '0.78rem', marginTop: 4 }}>{errors.email}</p>}
            </div>

            {mode !== 'forgot-password' && (
              <div>
                <label className="input-label" htmlFor="input-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="input-password"
                    className="input-field"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    maxLength={45}
                    style={{ paddingRight: '48px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-light)',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p style={{ color: 'var(--danger-deep)', fontSize: '0.78rem', marginTop: 4 }}>{errors.password}</p>}
              </div>
            )}

            {mode === 'login' && (
              <div style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={() => switchMode('forgot-password')}
                  style={{ background: 'none', border: 'none', fontSize: '0.8rem', color: '#B38F5D', fontWeight: 700, cursor: 'pointer' }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              id="btn-submit-auth"
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 4, fontSize: '0.9rem', borderRadius: 100 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg style={{ animation: 'spin 1s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                  Processing Workspace...
                </span>
              ) : (
                mode === 'login' ? '🔐 Authorized Log In' : mode === 'signup' ? '🚀 Register Account' : '✉️ Request Recovery Link'
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {mode === 'login' && (
              <>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => switchMode('signup')}
                  style={{ background: 'none', border: 'none', color: '#B38F5D', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Sign up free
                </button>
              </>
            )}
            {mode === 'signup' && (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => switchMode('login')}
                  style={{ background: 'none', border: 'none', color: '#B38F5D', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Log in
                </button>
              </>
            )}
            {mode === 'forgot-password' && (
              <button
                onClick={() => switchMode('login')}
                style={{ background: 'none', border: 'none', color: '#B38F5D', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Back to log in
              </button>
            )}
          </p>

          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <Link href="/" style={{ color: 'var(--text-light)', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ArrowLeft className="w-3.5 h-3.5" /> Return to homepage
            </Link>
          </div>
        </div>
      </div>

      {/* Google Account Selector Modal */}
      {showGoogleSelector && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20, backdropFilter: 'blur(8px)'
        }} onClick={() => setShowGoogleSelector(false)}>
          <div style={{
            background: 'white', borderRadius: 20, width: '100%', maxWidth: 380,
            padding: '24px 0', boxShadow: 'var(--shadow-lg)',
            animation: 'scaleIn 0.25s ease-out', position: 'relative', border: '1.5px solid var(--border)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 24, padding: '0 32px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginBottom: 12 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>Verify Identity</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 6 }}>Choose a verified Google record</p>
            </div>

            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {mockGoogleAccounts.map((acc, i) => (
                <button
                  key={i}
                  onClick={() => selectGoogleAccount(acc)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 32px', border: 'none', background: 'transparent',
                    cursor: 'pointer', transition: 'background 0.2s', borderTop: i === 0 ? '1px solid var(--border)' : 'none',
                    borderBottom: '1px solid var(--border)', textAlign: 'left', fontFamily: 'inherit'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8f9fa')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: i === 0 ? '#1E3A8A' : i === 1 ? '#B38F5D' : '#0D9488',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.82rem'
                  }}>{acc.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3c4043' }}>{acc.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#70757a' }}>{acc.email}</div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                const email = prompt('Enter Google email:');
                if (email) selectGoogleAccount({ name: email.split('@')[0], email });
              }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '16px 32px', border: 'none', background: 'transparent',
                cursor: 'pointer', transition: 'background 0.2s', textAlign: 'left', fontFamily: 'inherit'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f8f9fa')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                border: '1.5px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#3c4043', fontSize: '1rem'
              }}>+</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3c4043' }}>Use another email</div>
            </button>

            <div style={{ padding: '20px 32px 4px', fontSize: '0.72rem', color: '#70757a', lineHeight: 1.5 }}>
              By selecting an account, you authorize Google to sync your basic profile elements securely with AIHCAS.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
