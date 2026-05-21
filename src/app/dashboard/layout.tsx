'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { 
  Home, 
  MessageSquare, 
  Mic, 
  Pill, 
  FileSpreadsheet, 
  PhoneCall, 
  User, 
  Heart, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  Scan,
  Share2
} from 'lucide-react';

const navItems = [
  { icon: <Home className="w-4 h-4" />, label: 'Dashboard', href: '/dashboard' },
  { icon: <MessageSquare className="w-4 h-4" />, label: 'Text Query', href: '/dashboard/chat' },
  { icon: <Mic className="w-4 h-4" />, label: 'Voice Call', href: '/dashboard/voice' },
  { icon: <Pill className="w-4 h-4" />, label: 'Prescription', href: '/dashboard/prescription' },
  { icon: <FileSpreadsheet className="w-4 h-4" />, label: 'Report Analysis', href: '/dashboard/reports' },
  { icon: <Scan className="w-4 h-4" />, label: 'Skin Analysis', href: '/dashboard/skin' },
  { icon: <Share2 className="w-4 h-4" />, label: 'Share with Doctor', href: '/dashboard/share' },
  { icon: <PhoneCall className="w-4 h-4" />, label: 'Emergency', href: '/dashboard/emergency' },
  { icon: <User className="w-4 h-4" />, label: 'Health Profile', href: '/dashboard/profile' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading || !user) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'linear-gradient(135deg, #1E3A8A, #B38F5D)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'white', animation: 'pulse 1.8s infinite' }}>
            <Heart className="w-6 h-6 text-white" />
          </div>
          <p style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '0.02em' }}>Loading Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Mobile Hamburger Button */}
      <button 
        className="hamburger-btn" 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle Menu"
        style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: '12px', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)', top: '16px', left: '16px' }}
      >
        {sidebarOpen ? <X className="w-5 h-5 text-[#0F172A]" /> : <Menu className="w-5 h-5 text-[#0F172A]" />}
      </button>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} 
        onClick={() => setSidebarOpen(false)}
        style={{ backdropFilter: 'blur(4px)', background: 'rgba(15, 23, 42, 0.15)' }}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{ borderRight: '1.5px solid var(--border)', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(30px)', width: '260px', display: 'flex', flexDirection: 'column', minHeight: '100vh', height: 'auto' }}>
        <div className="sidebar-inner-sticky" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div className="sidebar-logo" style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.6)', padding: '24px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{ background: 'linear-gradient(135deg, #1E3A8A, #B38F5D)', width: 28, height: 28, borderRadius: '6px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart className="w-3.5 h-3.5 text-white" />
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #0F172A, #1E3A8A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                AIHCAS
              </span>
            </Link>
          </div>

          <nav className="sidebar-nav" style={{ padding: '24px 16px', flex: 1, overflowY: 'auto' }}>
            <div style={{ padding: '0 12px', marginBottom: 12 }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Medical Services
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-item ${pathname === item.href ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    transition: 'all 0.2s var(--transition)',
                    color: pathname === item.href ? 'var(--primary-deep)' : 'var(--text-muted)',
                    background: pathname === item.href ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.05), rgba(179, 143, 93, 0.03))' : 'transparent',
                    border: `1px solid ${pathname === item.href ? 'rgba(30, 58, 138, 0.08)' : 'transparent'}`
                  }}
                >
                  <span className="item-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="sidebar-footer" style={{ padding: '20px 16px', borderTop: '1px solid rgba(226, 232, 240, 0.6)' }}>
            {/* User avatar summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', borderRadius: '12px', background: 'rgba(179, 143, 93, 0.04)', marginBottom: 10, border: '1px solid rgba(179, 143, 93, 0.1)' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #1E3A8A, #B38F5D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', color: 'white', fontWeight: 800 }}>
                {user.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="sidebar-item"
              style={{ 
                color: 'var(--danger-deep)', 
                width: '100%', 
                border: 'none', 
                background: 'none', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 700
              }}
            >
              <span className="item-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LogOut className="w-4 h-4" /></span>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="main-content page-fade" style={{ flex: 1, padding: '36px', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Top Navbar for mobile or extra visibility */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
          <button
            onClick={logout}
            className="btn btn-secondary"
            style={{ 
              color: 'var(--danger-deep)', 
              border: '1px solid rgba(220, 38, 38, 0.2)', 
              background: 'rgba(220, 38, 38, 0.05)', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: '100px',
              fontSize: '0.85rem',
              fontWeight: 700
            }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}
