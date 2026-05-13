'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sessionReady, setSessionReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  // Supabase sends the recovery token as a URL hash fragment (#access_token=...&type=recovery)
  // We listen to the auth state change which fires when Supabase processes the hash
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    // Also handle direct page load: check if already has a recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    // If no recovery event fires within 3 seconds, the link is invalid/expired
    const timeout = setTimeout(() => {
      setSessionReady(prev => {
        if (!prev) setInvalidLink(true);
        return prev;
      });
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError(updateError.message || 'Failed to update password. The link may have expired.');
    } else {
      setMessage('Password updated successfully! Redirecting to login…');
      await supabase.auth.signOut();
      setTimeout(() => router.push('/auth'), 2500);
    }
  };

  // ── Rendering ──────────────────────────────────────────────────────────────
  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '480px', padding: '48px', borderRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <div className="logo-icon">🏥</div>
          <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>AIHCAS</span>
        </div>

        {/* Invalid / Expired link */}
        {invalidLink && !sessionReady && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🔗</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger-deep)', marginBottom: '10px' }}>Link Expired</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link href="/auth" className="btn btn-primary" style={{ display: 'inline-flex' }}>
              Back to Login
            </Link>
          </div>
        )}

        {/* Waiting for session */}
        {!invalidLink && !sessionReady && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
            <p>Verifying your reset link…</p>
          </div>
        )}

        {/* Ready to set new password */}
        {sessionReady && (
          <>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>Set new password</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
              Choose a strong password for your AIHCAS account.
            </p>

            {message ? (
              <div style={{ padding: '16px', background: 'var(--secondary)', borderRadius: '12px', color: '#178A6A' }}>
                ✅ {message}
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label className="input-label">New Password</label>
                  <input
                    className="input-field"
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="input-label">Confirm New Password</label>
                  <input
                    className="input-field"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>

                {error && (
                  <p style={{ color: 'var(--danger-deep)', fontSize: '0.85rem', background: 'var(--danger)', padding: '10px 14px', borderRadius: '10px' }}>
                    ❌ {error}
                  </p>
                )}

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? 'Updating…' : '🔐 Update Password'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
