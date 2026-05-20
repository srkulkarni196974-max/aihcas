'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, UserPlus, CheckCircle, Stethoscope, Building, MapPin,
  Send, FileText, MessageSquare, Heart, ChevronRight, Clock, X, Share2, FileDown, Sparkles
} from 'lucide-react';
import { generateSummaryAction } from '@/app/actions';
import MedicalSummaryPDF from '@/components/MedicalSummaryPDF';


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

  // PDF Generator States
  const [showPDFGenerator, setShowPDFGenerator] = useState(false);
  const [generatingPDFData, setGeneratingPDFData] = useState(false);
  const [pdfData, setPdfData] = useState<any | null>(null);
  const [sharePDFDoctorId, setSharePDFDoctorId] = useState<string>('');
  const [pdfShareSuccess, setPdfShareSuccess] = useState('');
  const [pdfShareError, setPdfShareError] = useState('');

  const handleOpenGenerator = async () => {
    setShowPDFGenerator(true);
    setGeneratingPDFData(true);
    setPdfShareSuccess('');
    setPdfShareError('');
    try {
      const res = await generateSummaryAction();
      if (res.success && res.data) {
        setPdfData(res.data);
        if (linkedDoctors.length > 0) {
          setSharePDFDoctorId(linkedDoctors[0].doctor_id);
        }
      } else {
        setPdfShareError(res.error || "Failed to compile summary report.");
      }
    } catch (err: any) {
      setPdfShareError(err.message || "An unexpected error occurred.");
    } finally {
      setGeneratingPDFData(false);
    }
  };

  const handleSharePDFWithDoctor = async () => {
    if (!sharePDFDoctorId || !pdfData) return;
    setSharing(true);
    setPdfShareSuccess('');
    setPdfShareError('');
    try {
      const res = await fetch('/api/patient/share-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: sharePDFDoctorId,
          reportType: 'full_summary',
          title: `Clinical Health Summary - ${new Date().toLocaleDateString()}`,
          summary: pdfData.synthesis || 'No clinical synthesis compiled.',
          aiAnalysis: pdfData.synthesis || 'No clinical synthesis compiled.',
          triageLevel: pdfData.triageLevel || 'consult',
          severity: pdfData.triageLevel === 'emergency' ? 'CRITICAL' : pdfData.triageLevel === 'consult' ? 'MODERATE' : 'LOW',
          patientNotes: 'Auto-compiled clinical report summary including profile demographics, prescriptions, pathology parameters and active triage checklists.'
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to share report.');
      setPdfShareSuccess('Summary report successfully synchronized and shared with doctor! A direct notification has been sent inside your consultation chat.');
      const refreshed = await fetch('/api/patient/share-report').then(r => r.json());
      setSharedReports(refreshed.reports || []);
    } catch (err: any) {
      setPdfShareError(err.message || 'Failed to share report.');
    } finally {
      setSharing(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('report-pdf-content');
    if (!element) return;
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin:       10,
        filename:     `aihcas-clinical-summary-${Date.now()}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm' as const, format: 'letter' as const, orientation: 'portrait' as const }
      };
      html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      setPdfShareError("Failed to generate PDF download.");
    }
  };

  // Trigger report generator if query param is set
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('triggerReport') === 'true') {
        handleOpenGenerator();
      }
    }
  }, [linkedDoctors.length > 0]);

  // Fetch linked doctors
  useEffect(() => {
    fetch('/api/patient/link-doctor').then(r => r.json()).then(d => setLinkedDoctors(d.links || []));
    fetch('/api/patient/share-report').then(r => r.json()).then(d => setSharedReports(d.reports || []));
  }, []);

  // Fetch chat messages with real-time polling (every 3s) and cache-busting
  useEffect(() => {
    if (!selectedDoctorId || activeTab !== 'chat') return;

    const fetchMessages = () => {
      fetch(`/api/patient/messages?doctor_id=${selectedDoctorId}&t=${Date.now()}`)
        .then(r => r.json())
        .then(d => setChatMessages(d.messages || []))
        .catch(err => console.error("Error polling messages:", err));
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
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
          {/* Premium Clinical Summary Section */}
          <div className="glass-card animate-fadeInUp" style={{ background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.04), rgba(179, 143, 93, 0.04))', border: '1.5px solid rgba(30, 58, 138, 0.12)', borderRadius: 20, padding: '24px 28px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 500px' }}>
              <div style={{ width: 46, height: 46, borderRadius: '10px', background: 'white', border: '1.5px solid rgba(30, 58, 138, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText className="w-5 h-5 text-[#1E3A8A]" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  Generate &amp; Export Medical Summary
                  <span className="badge" style={{ background: 'linear-gradient(135deg, #1E3A8A, #B38F5D)', color: 'white', fontWeight: 800, padding: '2px 6px', fontSize: '0.6rem', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.5px' }}>NEW</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>Compile profile parameters, prescriptions, pathology metrics and active triage records into a premium clinical PDF report.</div>
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleOpenGenerator} style={{ borderRadius: 100, fontWeight: 700, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)', border: 'none' }}>
              <Sparkles className="w-3.5 h-3.5 text-[#B38F5D]" /> Generate Summary PDF
            </button>
          </div>

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

      {/* ── PDF GENERATOR PREVIEW MODAL ───────────────────── */}
      {showPDFGenerator && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-card animate-fadeInUp" style={{ width: '100%', maxWidth: 860, height: '90vh', display: 'flex', flexDirection: 'column', background: 'white', border: '1.5px solid var(--border)', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText className="w-5 h-5 text-[#1E3A8A]" />
                <div>
                  <h3 style={{ fontWeight: 850, fontSize: '1.05rem', color: '#1E3A8A', margin: 0 }}>AIHCAS Clinical Report Preview</h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Verify clinical data integration prior to export or sharing</span>
                </div>
              </div>
              <button onClick={() => setShowPDFGenerator(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: 4 }}><X className="w-5 h-5" /></button>
            </div>

            {/* Modal Content Scrollable Area */}
            <div style={{ flex: 1, overflowY: 'auto', background: '#F1F5F9', padding: '24px 16px', display: 'flex', justifyContent: 'center' }}>
              {generatingPDFData ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 48 }}>
                  <div style={{ width: 40, height: 40, border: '3px solid rgba(30,58,138,0.1)', borderTopColor: '#1E3A8A', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Aggregating physical, pharmaceutical & clinical pathology metrics...</p>
                </div>
              ) : pdfShareError && !pdfData ? (
                <div style={{ textAlign: 'center', padding: 48 }}>
                  <p style={{ color: '#DC2626', fontWeight: 700, fontSize: '0.9rem' }}>⚠️ {pdfShareError}</p>
                  <button className="btn btn-secondary btn-sm" onClick={handleOpenGenerator} style={{ marginTop: 12, borderRadius: 100 }}>Retry Generation</button>
                </div>
              ) : pdfData ? (
                /* PDF Render Shell */
                <div style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <MedicalSummaryPDF data={pdfData} />
                </div>
              ) : null}
            </div>

            {/* Modal Controls Panel */}
            {pdfData && !generatingPDFData && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                {/* Sharing actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {linkedDoctors.length > 0 ? (
                    <>
                      <select className="input-field" value={sharePDFDoctorId} onChange={e => setSharePDFDoctorId(e.target.value)} style={{ borderRadius: 100, fontSize: '0.78rem', padding: '6px 12px', width: 200, background: 'white' }}>
                        {linkedDoctors.map(link => (
                          <option key={link.doctor_id} value={link.doctor_id}>Dr. {link.doctors.name} ({link.doctors.specialization})</option>
                        ))}
                      </select>
                      <button className="btn btn-primary" onClick={handleSharePDFWithDoctor} disabled={sharing || !sharePDFDoctorId} style={{ borderRadius: 100, fontWeight: 800, fontSize: '0.78rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Share2 className="w-3.5 h-3.5" /> {sharing ? 'Sharing...' : 'Share with Doctor'}
                      </button>
                    </>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 600 }}>⚠️ Connect with a doctor in the portal to share report.</span>
                  )}
                </div>

                {/* Local actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" onClick={handleDownloadPDF} style={{ borderRadius: 100, fontWeight: 700, fontSize: '0.78rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <FileDown className="w-3.5 h-3.5" /> Download Summary PDF
                  </button>
                  <button className="btn btn-secondary" onClick={() => setShowPDFGenerator(false)} style={{ borderRadius: 100, fontWeight: 700, fontSize: '0.78rem', padding: '8px 16px' }}>
                    Close Preview
                  </button>
                </div>
              </div>
            )}

            {/* Notification indicators inside modal */}
            {(pdfShareSuccess || pdfShareError) && (
              <div style={{ padding: '8px 24px', background: pdfShareSuccess ? '#ECFDF5' : '#FEF2F2', borderTop: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.73rem', color: pdfShareSuccess ? '#059669' : '#DC2626', fontWeight: 700, margin: 0 }}>
                  {pdfShareSuccess ? `✓ ${pdfShareSuccess}` : `⚠️ ${pdfShareError}`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
