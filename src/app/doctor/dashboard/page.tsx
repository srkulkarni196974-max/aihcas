'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart, Users, FileText, MessageSquare, AlertTriangle, LogOut,
  ChevronRight, Clock, Send, Activity, Eye, Inbox, Bell, Stethoscope
} from 'lucide-react';

interface Doctor { id: string; name: string; email: string; specialization: string; hospital_name: string; is_approved: boolean; avatar_url?: string; }
interface Patient { id: string; name: string; email: string; age?: number; gender?: string; blood_group?: string; chronic_conditions?: string; allergies?: string; }
interface Report { id: string; patient_id: string; report_type: string; title: string; summary?: string; ai_analysis?: any; anatomical_regions?: any; triage_level?: string; severity?: string; is_read_by_doctor: boolean; shared_at: string; }
interface Msg { id: string; patient_id: string; doctor_id: string; sender_role: string; message: string; is_read: boolean; sent_at: string; }

export default function DoctorDashboard() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [activeTab, setActiveTab] = useState<'patients' | 'reports' | 'chat'>('patients');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Msg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch doctor session
  useEffect(() => {
    fetch('/api/doctor/auth/me').then(r => r.json()).then(d => {
      if (!d.doctor) { router.push('/doctor/auth'); return; }
      setDoctor(d.doctor);
    }).catch(() => router.push('/doctor/auth')).finally(() => setLoading(false));
  }, [router]);

  // Fetch dashboard data
  useEffect(() => {
    if (!doctor) return;
    fetch('/api/doctor/dashboard').then(r => r.json()).then(d => {
      setPatients(d.patients || []);
      setReports(d.reports || []);
      setUnreadCount(d.unreadCount || 0);
      setUnreadMessages(d.unreadMessages || 0);
    });
  }, [doctor]);

  // Fetch chat when patient selected
  useEffect(() => {
    if (!selectedPatientId || activeTab !== 'chat') return;
    fetch(`/api/doctor/messages?patient_id=${selectedPatientId}`).then(r => r.json()).then(d => setChatMessages(d.messages || []));
  }, [selectedPatientId, activeTab]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const sendMessage = async () => {
    if (!chatInput.trim() || !selectedPatientId || sendingChat) return;
    setSendingChat(true);
    try {
      const res = await fetch('/api/doctor/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientId: selectedPatientId, message: chatInput }) });
      const data = await res.json();
      if (data.success) { setChatMessages(prev => [...prev, data.message]); setChatInput(''); }
    } finally { setSendingChat(false); }
  };

  const handleLogout = async () => {
    await fetch('/api/doctor/auth/logout', { method: 'POST' });
    router.push('/doctor/auth');
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const patientReports = reports.filter(r => r.patient_id === selectedPatientId);

  if (loading) return (
    <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #1E3A8A, #0D9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'white', animation: 'pulse 1.8s infinite' }}><Stethoscope className="w-6 h-6" /></div>
        <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Loading Doctor Portal...</p>
      </div>
    </div>
  );

  if (!doctor) return null;

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{ width: 260, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(30px)', borderRight: '1.5px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: 24, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #1E3A8A, #0D9488)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Stethoscope className="w-3.5 h-3.5 text-white" />
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 800, background: 'linear-gradient(135deg, #0F172A, #1E3A8A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Doctor Portal</span>
          </div>
        </div>

        {/* Doctor info */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #1E3A8A, #B38F5D)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>
              {doctor.name.charAt(0)}
            </div>
            <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Dr. {doctor.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 600 }}>{doctor.specialization}</div>
            </div>
          </div>
          {!doctor.is_approved && (
            <div style={{ marginTop: 10, padding: '6px 10px', background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 8, fontSize: '0.68rem', fontWeight: 700, color: '#92400E' }}>
              ⏳ Account pending approval
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {[
            { key: 'patients' as const, icon: <Users className="w-4 h-4" />, label: 'My Patients', badge: patients.length },
            { key: 'reports' as const, icon: <FileText className="w-4 h-4" />, label: 'Shared Reports', badge: unreadCount },
            { key: 'chat' as const, icon: <MessageSquare className="w-4 h-4" />, label: 'Messages', badge: unreadMessages },
          ].map(item => (
            <button key={item.key} onClick={() => setActiveTab(item.key)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, marginBottom: 4,
              background: activeTab === item.key ? 'linear-gradient(135deg, rgba(30,58,138,0.05), rgba(179,143,93,0.03))' : 'transparent',
              border: `1px solid ${activeTab === item.key ? 'rgba(30,58,138,0.08)' : 'transparent'}`,
              color: activeTab === item.key ? 'var(--primary-deep)' : 'var(--text-muted)',
              fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
            }}>
              {item.icon}
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: '0.65rem', fontWeight: 800, background: 'var(--primary-deep)', color: 'white' }}>{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, color: '#DC2626', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', background: 'none', border: 'none', textAlign: 'left' }}>
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="page-fade" style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }} className="stack-mobile">
            {[
              { label: 'Active Patients', value: patients.length, icon: <Users className="w-4 h-4 text-[#1E3A8A]" />, color: '#1E3A8A' },
              { label: 'Pending Reports', value: unreadCount, icon: <Bell className="w-4 h-4 text-[#D97706]" />, color: '#D97706' },
              { label: 'Unread Messages', value: unreadMessages, icon: <Inbox className="w-4 h-4 text-[#0D9488]" />, color: '#0D9488' },
              { label: 'Total Reports', value: reports.length, icon: <FileText className="w-4 h-4 text-[#B38F5D]" />, color: '#B38F5D' },
            ].map(stat => (
              <div key={stat.label} className="glass-card" style={{ padding: 20, background: 'white', border: '1.5px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${stat.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stat.icon}</div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</span>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* ── PATIENTS TAB ──────────────────────────────────── */}
          {activeTab === 'patients' && (
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 850, color: 'var(--text-dark)', marginBottom: 16 }}>Connected Patients</h2>
              {patients.length === 0 ? (
                <div className="glass-card" style={{ padding: 40, textAlign: 'center', background: 'white', border: '1.5px solid var(--border)' }}>
                  <Users className="w-8 h-8 text-[var(--text-light)] mx-auto mb-3" />
                  <p style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.9rem' }}>No patients connected yet</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: 4 }}>Patients will appear here once they connect with you from their portal.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {patients.map(p => (
                    <div key={p.id} className="glass-card" style={{ padding: '16px 20px', background: 'white', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => { setSelectedPatientId(p.id); setActiveTab('reports'); }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = '', e.currentTarget.style.boxShadow = '')}
                    >
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #1E3A8A, #B38F5D)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>{p.name?.charAt(0) || '?'}</div>
                      <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-dark)' }}>{p.name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 2 }}>
                          {p.age && <span>Age: {p.age}</span>}
                          {p.gender && <span>Gender: {p.gender}</span>}
                          {p.blood_group && <span>Blood: {p.blood_group}</span>}
                        </div>
                        {p.chronic_conditions && <div style={{ fontSize: '0.7rem', color: '#D97706', fontWeight: 700, marginTop: 3 }}>Chronic: {p.chronic_conditions}</div>}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-secondary" onClick={e => { e.stopPropagation(); setSelectedPatientId(p.id); setActiveTab('reports'); }} style={{ borderRadius: 100, fontWeight: 700 }}>
                          <Eye className="w-3 h-3" /> Reports
                        </button>
                        <button className="btn btn-sm btn-primary" onClick={e => { e.stopPropagation(); setSelectedPatientId(p.id); setActiveTab('chat'); }} style={{ borderRadius: 100, fontWeight: 700 }}>
                          <MessageSquare className="w-3 h-3" /> Chat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── REPORTS TAB ───────────────────────────────────── */}
          {activeTab === 'reports' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 850, color: 'var(--text-dark)' }}>Shared Reports</h2>
                {selectedPatient && (
                  <span style={{ padding: '4px 12px', borderRadius: 100, background: 'rgba(30,58,138,0.06)', color: 'var(--primary-deep)', fontSize: '0.78rem', fontWeight: 700, border: '1px solid rgba(30,58,138,0.1)' }}>
                    Patient: {selectedPatient.name}
                  </span>
                )}
                {selectedPatientId && (
                  <button onClick={() => setSelectedPatientId(null)} style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-light)', cursor: 'pointer', background: 'none', border: 'none', textDecoration: 'underline' }}>Show all</button>
                )}
              </div>
              {(selectedPatientId ? patientReports : reports).length === 0 ? (
                <div className="glass-card" style={{ padding: 40, textAlign: 'center', background: 'white', border: '1.5px solid var(--border)' }}>
                  <FileText className="w-8 h-8 text-[var(--text-light)] mx-auto mb-3" />
                  <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>No reports shared yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(selectedPatientId ? patientReports : reports).map(r => {
                    const patientName = patients.find(p => p.id === r.patient_id)?.name || 'Unknown';
                    const sevColor = r.severity === 'CRITICAL' ? '#7C2D12' : r.severity === 'HIGH' ? '#DC2626' : r.severity === 'MODERATE' ? '#D97706' : '#0D9488';
                    return (
                      <div key={r.id} className="glass-card" style={{ padding: '16px 20px', background: r.is_read_by_doctor ? 'white' : 'rgba(30,58,138,0.02)', border: `1.5px solid ${r.is_read_by_doctor ? 'var(--border)' : 'rgba(30,58,138,0.15)'}`, textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                            {!r.is_read_by_doctor && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-deep)', flexShrink: 0 }} />}
                            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-dark)' }}>{r.title}</span>
                          </div>
                          <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: '0.65rem', fontWeight: 800, background: `${sevColor}12`, color: sevColor, border: `1px solid ${sevColor}25` }}>
                            {r.severity || 'N/A'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 6, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          <span>Patient: <strong>{patientName}</strong></span>
                          <span>Type: {r.report_type.replace('_', ' ')}</span>
                          {r.triage_level && <span>Triage: <strong style={{ color: r.triage_level === 'emergency' ? '#DC2626' : r.triage_level === 'consult' ? '#D97706' : '#0D9488' }}>{r.triage_level}</strong></span>}
                          <span><Clock className="w-3 h-3 inline" /> {new Date(r.shared_at).toLocaleDateString()}</span>
                        </div>
                        {r.summary && <p style={{ fontSize: '0.78rem', color: 'var(--text-dark)', lineHeight: 1.6, fontWeight: 600 }}>{r.summary}</p>}
                        {r.anatomical_regions && (
                          <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(179,143,93,0.04)', borderRadius: 10, border: '1px solid rgba(179,143,93,0.1)' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#B38F5D', textTransform: 'uppercase' }}>Anatomical Regions</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                              {(Array.isArray(r.anatomical_regions) ? r.anatomical_regions : Object.values(r.anatomical_regions)).flat().map((region: string, i: number) => (
                                <span key={i} style={{ padding: '2px 8px', borderRadius: 100, fontSize: '0.68rem', fontWeight: 700, background: 'white', border: '1px solid var(--border)', color: 'var(--text-dark)' }}>{region}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── CHAT TAB ──────────────────────────────────────── */}
          {activeTab === 'chat' && (
            <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 200px)' }} className="stack-mobile">
              {/* Patient list sidebar */}
              <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Conversations</div>
                {patients.map(p => (
                  <button key={p.id} onClick={() => setSelectedPatientId(p.id)} style={{
                    padding: '10px 12px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8,
                    background: selectedPatientId === p.id ? 'linear-gradient(135deg, rgba(30,58,138,0.06), rgba(179,143,93,0.03))' : 'white',
                    border: `1px solid ${selectedPatientId === p.id ? 'rgba(30,58,138,0.1)' : 'var(--border)'}`,
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', width: '100%',
                  }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #1E3A8A, #B38F5D)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>{p.name?.charAt(0)}</div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                  </button>
                ))}
              </div>

              {/* Chat area */}
              <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white', border: '1.5px solid var(--border)', overflow: 'hidden' }}>
                {selectedPatientId ? (
                  <>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #1E3A8A, #B38F5D)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.85rem' }}>{selectedPatient?.name?.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-dark)' }}>{selectedPatient?.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>Clinical conversation thread</div>
                      </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {chatMessages.map(m => (
                        <div key={m.id} style={{ display: 'flex', justifyContent: m.sender_role === 'doctor' ? 'flex-end' : 'flex-start' }}>
                          <div style={{
                            maxWidth: '75%', padding: '10px 16px', borderRadius: m.sender_role === 'doctor' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            background: m.sender_role === 'doctor' ? 'linear-gradient(135deg, #1E3A8A, #2A437E)' : '#F8FAFC',
                            color: m.sender_role === 'doctor' ? 'white' : 'var(--text-dark)',
                            border: m.sender_role === 'doctor' ? 'none' : '1px solid var(--border)',
                            fontSize: '0.82rem', lineHeight: 1.5, textAlign: 'left',
                          }}>
                            {m.message}
                            <div style={{ fontSize: '0.6rem', opacity: 0.6, marginTop: 4 }}>{new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                      <input className="input-field" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type your clinical response..." style={{ flex: 1, borderRadius: 100, fontSize: '0.85rem' }}
                        onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }} />
                      <button className="btn btn-primary" onClick={sendMessage} disabled={sendingChat || !chatInput.trim()} style={{ borderRadius: 100, paddingInline: 20 }}>
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 32 }}>
                    <div>
                      <MessageSquare className="w-8 h-8 text-[var(--text-light)] mx-auto mb-3" />
                      <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Select a patient to start a conversation</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
