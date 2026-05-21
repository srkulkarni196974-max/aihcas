'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const role = searchParams.get('role');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');
      setMessage('Password updated successfully! Redirecting to login…');
      setTimeout(() => router.push(role === 'doctor' ? '/doctor/auth' : '/auth'), 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🔗</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger-deep)', marginBottom: '10px' }}>
          Invalid Link
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link href={role === 'doctor' ? '/doctor/auth' : '/auth'} className="btn btn-primary" style={{ display: 'inline-flex' }}>
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '400px' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>Set new password</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
        Resetting password for <strong>{email}</strong>
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
            <p style={{ color: 'var(--danger-deep)', fontSize: '0.85rem', background: '#fff1f1', padding: '10px 14px', borderRadius: '10px' }}>
              ❌ {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Updating…' : '🔐 Update Password'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '480px', padding: '48px', borderRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <div className="logo-icon">🏥</div>
          <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>AIHCAS</span>
        </div>
        <Suspense fallback={<div>Loading…</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
