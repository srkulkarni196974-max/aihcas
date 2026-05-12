'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

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
      }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(77,166,232,0.22) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-5%', right: '-5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,92,252,0.2) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

        <div className="animate-float" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '6rem', marginBottom: 32 }}>🏥</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 16, maxWidth: 420, lineHeight: 1.3 }}>
            Your Health Journey <span className="text-gradient">Starts Here</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: 380, lineHeight: 1.75, fontSize: '0.95rem' }}>
            Join millions of users who trust AIHCAS for intelligent symptom analysis, prescription understanding, and real-time health guidance.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 40, maxWidth: 400 }}>
            {[
              { icon: '🔒', text: 'Secure Auth' },
              { icon: '⚡', text: 'Real-Time AI' },
              { icon: '🇮🇳', text: 'India-Specific Data' },
              { icon: '🏆', text: '98% Satisfaction' },
            ].map((item, i) => (
              <div key={i} className="glass" style={{ padding: '14px 18px', borderRadius: 14, textAlign: 'left', animationDelay: `${i * 0.15}s` }}>
                <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{item.icon}</div>
                <div style={{ fontSize: '0.83rem', fontWeight: 600 }}>{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div style={{
        width: '480px',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(30px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        borderLeft: '1px solid var(--border)',
        minHeight: '100vh',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }} className="animate-scaleIn">
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
            <div className="logo-icon">🏥</div>
            <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>AIHCAS</span>
          </div>

          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 6 }}>
            {mode === 'login' ? 'Welcome back 👋' : mode === 'signup' ? 'Create account 🚀' : 'Reset password 🔑'}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: '0.9rem' }}>
            {mode === 'login' ? 'Log in to your healthcare assistant' : mode === 'signup' ? 'Start your health journey today' : "Enter your email and we'll send you a link"}
          </p>

          {/* Google button (only for login/signup) */}
          {mode !== 'forgot-password' && (
            <>
              <button
                id="btn-google-auth"
                onClick={handleGoogle}
                disabled={loading}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', marginBottom: 20, gap: 12, fontSize: '0.95rem' }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"/></svg>
                Continue with Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 500 }}>or continue with email</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>
            </>
          )}

          {/* Success message */}
          {successMessage && (
            <div style={{ 
              padding: '12px', 
              background: 'var(--secondary)', 
              border: '1px solid var(--secondary-mid)', 
              borderRadius: '12px', 
              color: '#178A6A', 
              fontSize: '0.85rem', 
              marginBottom: '20px', 
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              {successMessage}
            </div>
          )}

          {/* Error message */}
          {errors.server && (
            <div style={{ 
              padding: '12px', 
              background: 'var(--danger)', 
              border: '1px solid var(--danger-deep)', 
              borderRadius: '12px', 
              color: 'var(--danger-deep)', 
              fontSize: '0.85rem', 
              marginBottom: '20px', 
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
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
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary-deep)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-light)')}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
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
                  style={{ background: 'none', border: 'none', fontSize: '0.83rem', color: 'var(--primary-deep)', fontWeight: 600, cursor: 'pointer' }}
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
              style={{ width: '100%', justifyContent: 'center', marginTop: 4, fontSize: '0.97rem', opacity: loading ? 0.8 : 1 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg style={{ animation: 'spin 1s linear infinite' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                  Processing...
                </span>
              ) : (
                mode === 'login' ? '🔐 Log In' : mode === 'signup' ? '🚀 Create Account' : '✉️ Send Reset Link'
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.87rem', color: 'var(--text-muted)' }}>
            {mode === 'login' && (
              <>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => switchMode('signup')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary-deep)', fontWeight: 700, cursor: 'pointer', fontSize: '0.87rem' }}
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
                  style={{ background: 'none', border: 'none', color: 'var(--primary-deep)', fontWeight: 700, cursor: 'pointer', fontSize: '0.87rem' }}
                >
                  Log in
                </button>
              </>
            )}
            {mode === 'forgot-password' && (
              <button
                onClick={() => switchMode('login')}
                style={{ background: 'none', border: 'none', color: 'var(--primary-deep)', fontWeight: 700, cursor: 'pointer', fontSize: '0.87rem' }}
              >
                Back to log in
              </button>
            )}
          </p>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.75rem', color: 'var(--text-light)' }}>
            By continuing, you agree to our{' '}
            <a href="#" style={{ color: 'var(--primary-deep)', textDecoration: 'none' }}>Terms</a> &amp;{' '}
            <a href="#" style={{ color: 'var(--primary-deep)', textDecoration: 'none' }}>Privacy Policy</a>
          </p>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Link href="/" style={{ color: 'var(--text-light)', fontSize: '0.82rem', textDecoration: 'none' }}>
              ← Back to homepage
            </Link>
          </div>
        </div>
      </div>

      {/* Google Account Selector Modal */}
      {showGoogleSelector && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20
        }} onClick={() => setShowGoogleSelector(false)}>
          <div style={{
            background: 'white', borderRadius: 12, width: '100%', maxWidth: 400,
            padding: '24px 0', boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
            animation: 'scaleIn 0.25s ease-out', position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 24, padding: '0 32px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginBottom: 12 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 500, margin: 0 }}>Choose an account</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 8 }}>to continue to AIHCAS</p>
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
                    background: i === 0 ? '#4DA6E8' : i === 1 ? '#7C5CFC' : '#2EC4A0',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 600, fontSize: '0.9rem'
                  }}>{acc.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#3c4043' }}>{acc.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#70757a' }}>{acc.email}</div>
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
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#3c4043', fontSize: '1rem'
              }}>+</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#3c4043' }}>Use another account</div>
            </button>

            <div style={{ padding: '24px 32px 8px', fontSize: '0.75rem', color: '#70757a', lineHeight: 1.5 }}>
              To continue, Google will share your name, email address, language preference, and profile picture with AIHCAS.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
