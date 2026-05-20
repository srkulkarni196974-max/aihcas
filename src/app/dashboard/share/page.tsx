'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, UserPlus, CheckCircle, Stethoscope, Building, MapPin,
  Send, FileText, MessageSquare, Heart, ChevronRight, Clock, X, Share2
} from 'lucide-react';

interface Doctor { id: string; name: string; specialization: string; hospital_name: string; city?: string; avatar_url?: string; }
interface LinkedDoctor { doctor_id: string; status: string; linked_at: string; doctors: Doctor; }
interface SharedReport { id: string; title: string; report_type: string; severity?: string; shared_at: string; doctors: { name: string; specialization: string; hospital_name: string; }; }
interface Msg { id: string; sender_role: string; message: string; sent_at: string; is_read: boolean; }

export default function ShareDoctorPage() {
  const [linkedDoctors, setLinkedDoctors] = useState<LinkedDoctor[]>([]);
  const [sharedReports, setSharedReports] = useState<SharedReport[]>([]);
  const [searchResults, setSearchResults] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchName, setSearchName] = useState('');
  const [linking, setLinking] = useState(false);
  const [activeTab, setActiveTab] = useState<'doctors' | 'reports' | 'chat'>('doctors');
  const [showSearch, setShowSearch] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState('');
  const [error, setError] = useState('');

  // Chat state
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Msg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareDoctor, setShareDoctor] = useState<string | null>(null);
  const [shareTitle, setShareTitle] = useState('');
  const [shareSummary, setShareSummary] = useState('');
  const [shareType, setShareType] = useState('symptom_summary');
  const [shareNotes, setShareNotes] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState('');

  // Fetch linked doctors
  useEffect(() => {
    fetch('/api/patient/link-doctor').then(r => r.json()).then(d => setLinkedDoctors(d.links || []));
    fetch('/api/patient/share-report').then(r => r.json()).then(d => setSharedReports(d.reports || []));
  }, []);

  // Fetch chat messages
  useEffect(() => {
    if (!selectedDoctorId || activeTab !== 'chat') return;
    fetch(`/api/patient/messages?doctor_id=${selectedDoctorId}`).then(r => r.json()).then(d => setChatMessages(d.messages || []));
  }, [selectedDoctorId, activeTab]);

  const searchDoctors = async () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (searchName) params.set('name', searchName);
    const res = await fetch(`/api/doctors/search?${params}`);
    const data = await res.json();
    setSearchResults(data.doctors || []);
  };

  const linkDoctor = async (doctorId: string) => {
    setLinking(true); setError('');
    try {
      const res = await fetch('/api/patient/link-doctor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ doctorId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLinkSuccess(data.message);
      const refreshed = await fetch('/api/patient/link-doctor').then(r => r.json());
      setLinkedDoctors(refreshed.links || []);
      setTimeout(() => setLinkSuccess(''), 3000);
    } catch (err: any) { setError(err.message); }
    finally { setLinking(false); }
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || !selectedDoctorId || sendingChat) return;
    setSendingChat(true);
    try {
      const res = await fetch('/api/patient/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ doctorId: selectedDoctorId, message: chatInput }) });
      const data = await res.json();
      if (data.success) { setChatMessages(prev => [...prev, data.message]); setChatInput(''); }
    } finally { setSendingChat(false); }
  };

  const submitShare = async () => {
    if (!shareDoctor || !shareTitle) return;
    setSharing(true); setShareSuccess(''); setError('');
    try {
      const res = await fetch('/api/patient/share-report', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId: shareDoctor, reportType: shareType, title: shareTitle, summary: shareSummary, patientNotes: shareNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShareSuccess('Report shared successfully!');
      setShowShareModal(false); setShareTitle(''); setShareSummary(''); setShareNotes('');
      const refreshed = await fetch('/api/patient/share-report').then(r => r.json());
      setSharedReports(refreshed.reports || []);
    } catch (err: any) { setError(err.message); }
    finally { setSharing(false); }
  };

  const selectedDoctor = linkedDoctors.find(l => l.doctor_id === selectedDoctorId);

  return (
    <div className="page-fade" style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #1E3A8A, #B38F5D)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Share2 className="w-5 h-5 text-white" />
        </div>
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 850, color: 'var(--text-dark)' }}>Share with Doctor</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Connect, share reports, and communicate with your healthcare provider</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'doctors' as const, icon: <Stethoscope className="w-3.5 h-3.5" />, label: 'My Doctors' },
          { key: 'reports' as const, icon: <FileText className="w-3.5 h-3.5" />, label: 'Shared Reports' },
          { key: 'chat' as const, icon: <MessageSquare className="w-3.5 h-3.5" />, label: 'Messages' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '8px 16px', borderRadius: 100, fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer',
            fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
            background: activeTab === tab.key ? 'var(--primary-deep)' : 'white',
            color: activeTab === tab.key ? 'white' : 'var(--text-muted)',
            border: `1.5px solid ${activeTab === tab.key ? 'var(--primary-deep)' : 'var(--border)'}`,
          }}>{tab.icon} {tab.label}</button>
        ))}
      </div>

      {/* Notifications */}
      {linkSuccess && <div style={{ padding: '10px 14px', background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.15)', borderRadius: 10, marginBottom: 16 }}><p style={{ fontSize: '0.8rem', color: '#0D9488', fontWeight: 700 }}>✓ {linkSuccess}</p></div>}
      {shareSuccess && <div style={{ padding: '10px 14px', background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.15)', borderRadius: 10, marginBottom: 16 }}><p style={{ fontSize: '0.8rem', color: '#0D9488', fontWeight: 700 }}>✓ {shareSuccess}</p></div>}
      {error && <div style={{ padding: '10px 14px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 10, marginBottom: 16 }}><p style={{ fontSize: '0.8rem', color: '#DC2626', fontWeight: 700 }}>{error}</p></div>}

      {/* ── MY DOCTORS TAB ─────────────────────────────────── */}
      {activeTab === 'doctors' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-dark)' }}>Connected Doctors ({linkedDoctors.length})</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setShowSearch(!showSearch)} style={{ borderRadius: 100, fontWeight: 700 }}>
              {showSearch ? <X className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />} {showSearch ? 'Close' : 'Find Doctor'}
            </button>
          </div>

          {/* Doctor Search Panel */}
          {showSearch && (
            <div className="glass-card animate-fadeInUp" style={{ padding: 20, background: 'white', border: '1.5px solid var(--border)', marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                <input className="input-field" value={searchName} onChange={e => setSearchName(e.target.value)} placeholder="Doctor name..." style={{ flex: 1, minWidth: 160, borderRadius: 100 }} />
                <input className="input-field" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Specialization..." style={{ flex: 1, minWidth: 160, borderRadius: 100 }} />
                <button className="btn btn-primary btn-sm" onClick={searchDoctors} style={{ borderRadius: 100, fontWeight: 700 }}>
                  <Search className="w-3.5 h-3.5" /> Search
                </button>
              </div>
              {searchResults.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {searchResults.map(d => {
                    const isLinked = linkedDoctors.some(l => l.doctor_id === d.id);
                    return (
                      <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, border: '1px solid var(--border)', background: '#FAFBFC' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #1E3A8A, #0D9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>{d.name.charAt(0)}</div>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-dark)' }}>Dr. {d.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                            <span>{d.specialization}</span>
                            {d.hospital_name && <span>• {d.hospital_name}</span>}
                            {d.city && <span>• {d.city}</span>}
                          </div>
                        </div>
                        {isLinked ? (
                          <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 700, background: 'rgba(13,148,136,0.08)', color: '#0D9488', border: '1px solid rgba(13,148,136,0.2)' }}><CheckCircle className="w-3 h-3 inline mr-1" />Connected</span>
                        ) : (
                          <button className="btn btn-primary btn-sm" onClick={() => linkDoctor(d.id)} disabled={linking} style={{ borderRadius: 100, fontWeight: 700 }}>
                            <UserPlus className="w-3 h-3" /> Connect
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Connected doctors list */}
          {linkedDoctors.length === 0 ? (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center', background: 'white', border: '1.5px solid var(--border)' }}>
              <Stethoscope className="w-8 h-8 text-[var(--text-light)] mx-auto mb-3" />
              <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>No doctors connected yet</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: 4 }}>Use "Find Doctor" to search and connect with your healthcare provider.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }} className="stack-mobile">
              {linkedDoctors.map(link => {
                const d = link.doctors;
                return (
                  <div key={link.doctor_id} className="glass-card" style={{ padding: '18px 20px', background: 'white', border: '1.5px solid var(--border)', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #1E3A8A, #B38F5D)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>{d.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-dark)' }}>Dr. {d.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.specialization}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {d.hospital_name && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Building className="w-3 h-3" /> {d.hospital_name}</span>}
                      {d.city && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin className="w-3 h-3" /> {d.city}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setShareDoctor(link.doctor_id); setShowShareModal(true); }} style={{ borderRadius: 100, fontWeight: 700, flex: 1, justifyContent: 'center' }}>
                        <Share2 className="w-3 h-3" /> Share Report
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={() => { setSelectedDoctorId(link.doctor_id); setActiveTab('chat'); }} style={{ borderRadius: 100, fontWeight: 700, flex: 1, justifyContent: 'center' }}>
                        <MessageSquare className="w-3 h-3" /> Chat
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SHARED REPORTS TAB ─────────────────────────────── */}
      {activeTab === 'reports' && (
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: 16 }}>Report History ({sharedReports.length})</h2>
          {sharedReports.length === 0 ? (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center', background: 'white', border: '1.5px solid var(--border)' }}>
              <FileText className="w-8 h-8 text-[var(--text-light)] mx-auto mb-3" />
              <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>No reports shared yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sharedReports.map(r => (
                <div key={r.id} className="glass-card" style={{ padding: '14px 18px', background: 'white', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                  <FileText className="w-5 h-5 text-[#1E3A8A] flex-shrink-0" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-dark)' }}>{r.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 2 }}>
                      <span>To: Dr. {r.doctors?.name}</span>
                      <span>Type: {r.report_type.replace('_', ' ')}</span>
                      <span><Clock className="w-3 h-3 inline" /> {new Date(r.shared_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {r.severity && <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: '0.65rem', fontWeight: 800, background: r.severity === 'HIGH' || r.severity === 'CRITICAL' ? 'rgba(220,38,38,0.08)' : 'rgba(13,148,136,0.08)', color: r.severity === 'HIGH' || r.severity === 'CRITICAL' ? '#DC2626' : '#0D9488' }}>{r.severity}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CHAT TAB ──────────────────────────────────────── */}
      {activeTab === 'chat' && (
        <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 280px)', minHeight: 400 }} className="stack-mobile">
          {/* Doctor list */}
          <div style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Conversations</div>
            {linkedDoctors.map(l => (
              <button key={l.doctor_id} onClick={() => setSelectedDoctorId(l.doctor_id)} style={{
                padding: '10px 12px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8,
                background: selectedDoctorId === l.doctor_id ? 'rgba(30,58,138,0.06)' : 'white',
                border: `1px solid ${selectedDoctorId === l.doctor_id ? 'rgba(30,58,138,0.15)' : 'var(--border)'}`,
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', width: '100%',
              }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #1E3A8A, #0D9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.7rem', flexShrink: 0 }}>{l.doctors.name.charAt(0)}</div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Dr. {l.doctors.name}</span>
              </button>
            ))}
          </div>

          {/* Chat area */}
          <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white', border: '1.5px solid var(--border)', overflow: 'hidden' }}>
            {selectedDoctorId && selectedDoctor ? (
              <>
                <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Stethoscope className="w-4 h-4 text-[#1E3A8A]" />
                  <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-dark)' }}>Dr. {selectedDoctor.doctors.name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>• {selectedDoctor.doctors.specialization}</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {chatMessages.map(m => (
                    <div key={m.id} style={{ display: 'flex', justifyContent: m.sender_role === 'patient' ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '75%', padding: '10px 14px', borderRadius: m.sender_role === 'patient' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        background: m.sender_role === 'patient' ? 'linear-gradient(135deg, #1E3A8A, #2A437E)' : '#F8FAFC',
                        color: m.sender_role === 'patient' ? 'white' : 'var(--text-dark)',
                        border: m.sender_role === 'patient' ? 'none' : '1px solid var(--border)',
                        fontSize: '0.82rem', lineHeight: 1.5, textAlign: 'left',
                      }}>
                        {m.message}
                        <div style={{ fontSize: '0.6rem', opacity: 0.6, marginTop: 3 }}>{new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                  <input className="input-field" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type your message..." style={{ flex: 1, borderRadius: 100, fontSize: '0.85rem' }}
                    onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }} />
                  <button className="btn btn-primary" onClick={sendMessage} disabled={sendingChat || !chatInput.trim()} style={{ borderRadius: 100, paddingInline: 16 }}>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
                <div>
                  <MessageSquare className="w-8 h-8 text-[var(--text-light)] mx-auto mb-3" />
                  <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Select a doctor to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SHARE MODAL ──────────────────────────────────── */}
      {showShareModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setShowShareModal(false)}>
          <div className="glass-card animate-fadeInUp" style={{ width: '100%', maxWidth: 500, padding: 28, background: 'white', border: '1.5px solid var(--border)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 850, fontSize: '1.05rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Share2 className="w-4 h-4 text-[#1E3A8A]" /> Share Clinical Report
              </h3>
              <button onClick={() => setShowShareModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}><X className="w-5 h-5" /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 6 }}>Report Title *</label>
                <input className="input-field" value={shareTitle} onChange={e => setShareTitle(e.target.value)} placeholder="e.g. Symptom Summary — May 2026" style={{ borderRadius: 10 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 6 }}>Report Type</label>
                <select className="input-field" value={shareType} onChange={e => setShareType(e.target.value)} style={{ borderRadius: 10 }}>
                  <option value="symptom_summary">Symptom Summary</option>
                  <option value="prescription">Prescription</option>
                  <option value="lab_report">Lab Report</option>
                  <option value="skin_analysis">Skin Analysis</option>
                  <option value="full_summary">Full Summary</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 6 }}>Summary</label>
                <textarea className="input-field" rows={3} value={shareSummary} onChange={e => setShareSummary(e.target.value)} placeholder="Brief summary of key findings..." style={{ resize: 'none', borderRadius: 10 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 6 }}>Additional Notes for Doctor</label>
                <textarea className="input-field" rows={2} value={shareNotes} onChange={e => setShareNotes(e.target.value)} placeholder="Any context or concerns..." style={{ resize: 'none', borderRadius: 10 }} />
              </div>

              {/* Consent */}
              <div style={{ padding: '10px 14px', background: 'rgba(217,119,6,0.05)', border: '1px solid rgba(217,119,6,0.15)', borderRadius: 10 }}>
                <p style={{ fontSize: '0.72rem', color: '#92400E', fontWeight: 600 }}>
                  By sharing, you consent to your connected doctor accessing this clinical summary. Data is transmitted securely.
                </p>
              </div>

              <button className="btn btn-primary" onClick={submitShare} disabled={sharing || !shareTitle.trim()} style={{ width: '100%', justifyContent: 'center', borderRadius: 100, fontWeight: 800 }}>
                {sharing ? 'Sharing...' : 'Share with Doctor'} <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
