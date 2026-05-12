'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { icon: '🏠', label: 'Dashboard', href: '/dashboard' },
  { icon: '💬', label: 'Text Query', href: '/dashboard/chat' },
  { icon: '🎤', label: 'Voice Call', href: '/dashboard/voice' },
  { icon: '💊', label: 'Prescription', href: '/dashboard/prescription' },
  { icon: '📊', label: 'Report Analysis', href: '/dashboard/reports' },
  { icon: '🚨', label: 'Emergency', href: '/dashboard/emergency' },
  { icon: '👤', label: 'Health Profile', href: '/dashboard/profile' },
];

import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px', animation: 'pulse 1.5s infinite' }}>🏥</div>
          <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--text-dark)' }}>
            <div className="logo-icon">🏥</div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>AIHCAS</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <div style={{ padding: '0 4px', marginBottom: 8 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 12px' }}>
              Main Menu
            </span>
          </div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item ${pathname === item.href ? 'active' : ''}`}
            >
              <span className="item-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          {/* User avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--primary)', marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #4DA6E8, #7C5CFC)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: 'white', fontWeight: 700 }}>
              {user.name.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="sidebar-item"
            style={{ color: 'var(--danger-deep)', width: '100%', border: 'none', background: 'none' }}
          >
            <span className="item-icon">🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content page-fade" style={{ flex: 1, marginLeft: 260 }}>
        {children}
      </main>
    </div>
  );
}
