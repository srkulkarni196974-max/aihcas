'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart, Users, FileText, MessageSquare, AlertTriangle, LogOut,
  ChevronRight, Clock, Send, Activity, Eye, Inbox, Bell, Stethoscope,
  User, Upload, CheckCircle, ShieldAlert, Paperclip, Camera, X
} from 'lucide-react';

interface Doctor { 
  id: string; 
  name: string; 
  email: string; 
  specialization: string; 
  hospital_name: string; 
  is_approved: boolean; 
  avatar_url?: string; 
  phone?: string;
  city?: string;
  bio?: string;
  license_id?: string;
  organization_id?: string;
}
interface Patient { id: string; name: string; email: string; age?: number; gender?: string; blood_group?: string; chronic_conditions?: string; allergies?: string; }
interface Report { id: string; patient_id: string; report_type: string; title: string; summary?: string; ai_analysis?: any; anatomical_regions?: any; triage_level?: string; severity?: string; is_read_by_doctor: boolean; shared_at: string; }
interface Msg { id: string; patient_id: string; doctor_id: string; sender_role: string; message: string; is_read: boolean; sent_at: string; attachment_url?: string | null; attachment_type?: string | null; }

export default function DoctorDashboard() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [activeTab, setActiveTab] = useState<'patients' | 'reports' | 'chat' | 'profile'>('patients');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Msg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // WebRTC Camera state
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Profile Edit fields
  const [profileName, setProfileName] = useState('');
  const [profileSpecialization, setProfileSpecialization] = useState('');
  const [profileHospital, setProfileHospital] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileCity, setProfileCity] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileLicenseId, setProfileLicenseId] = useState('');
  const [profileOrganizationId, setProfileOrganizationId] = useState('');
  const [saveProfileSuccess, setSaveProfileSuccess] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Fetch doctor session
  useEffect(() => {
    fetch('/api/doctor/auth/me').then(r => r.json()).then(d => {
      if (!d.doctor) { router.push('/doctor/auth'); return; }
      setDoctor(d.doctor);
    }).catch(() => router.push('/doctor/auth')).finally(() => setLoading(false));
  }, [router]);

  // Load profile values when doctor is loaded
  useEffect(() => {
    if (doctor) {
      setProfileName(doctor.name || '');
      setProfileSpecialization(doctor.specialization || '');
      setProfileHospital(doctor.hospital_name || '');
      setProfilePhone(doctor.phone || '');
      setProfileCity(doctor.city || '');
      setProfileBio(doctor.bio || '');
      setProfileLicenseId(doctor.license_id || '');
      setProfileOrganizationId(doctor.organization_id || '');
    }
  }, [doctor]);

  // Fetch dashboard data
  useEffect(() => {
    if (!doctor) return;
    fetch('/api/doctor/dashboard?t=' + Date.now()).then(r => r.json()).then(d => {
      setPatients(d.patients || []);
      setReports(d.reports || []);
      setUnreadCount(d.unreadCount || 0);
      setUnreadMessages(d.unreadMessages || 0);
    });
  }, [doctor]);

  // Fetch chat when patient selected with real-time polling (every 3s) and cache-busting
  useEffect(() => {
    if (!selectedPatientId || activeTab !== 'chat') return;
    
    const fetchMessages = () => {
      fetch(`/api/doctor/messages?patient_id=${selectedPatientId}&t=${Date.now()}`)
        .then(r => r.json())
        .then(d => {
          setChatMessages(d.messages || []);
          // Also fetch dashboard stats to update unread badge counts dynamically
          fetch('/api/doctor/dashboard?t=' + Date.now())
            .then(r => r.json())
            .then(d => {
              setUnreadMessages(d.unreadMessages || 0);
              setUnreadCount(d.unreadCount || 0);
            });
        }).catch(err => console.error("Error polling messages:", err));
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
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

  const handleFileSelect = async (file: File) => {
    if (!file || !selectedPatientId || sendingChat) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      return;
    }
    setSendingChat(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64data = reader.result as string;
        const res = await fetch('/api/doctor/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: selectedPatientId,
            message: '',
            attachmentUrl: base64data,
            attachmentType: file.type,
          })
        });
        const data = await res.json();
        if (data.success) {
          setChatMessages(prev => [...prev, data.message]);
        }
      };
    } catch (err: any) {
      console.error("Error sending media:", err);
      alert("Failed to send media.");
    } finally {
      setSendingChat(false);
    }
  };

  const openAttachment = (url: string | null | undefined, type: string | null | undefined) => {
    if (!url) return;
    try {
      if (url.startsWith('data:')) {
        const parts = url.split(',');
        const base64 = parts[1];
        const mime = parts[0].split(';')[0].split(':')[1];
        const binary = atob(base64);
        const array = [];
        for (let i = 0; i < binary.length; i++) {
          array.push(binary.charCodeAt(i));
        }
        const blob = new Blob([new Uint8Array(array)], { type: type || mime });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } else {
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error("Error opening attachment:", err);
      window.open(url, '_blank');
    }
  };

  const handleOpenCamera = async () => {
    setShowCameraModal(true);
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      setCameraStream(stream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setCameraError("Could not access camera. Falling back to file upload.");
      setTimeout(() => {
        document.getElementById('doctor-camera-capture')?.click();
        setShowCameraModal(false);
      }, 1500);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera-capture-${Date.now()}.png`, { type: 'image/png' });
          handleFileSelect(file);
        }
        stopCamera();
      }, 'image/png');
    }
  };

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    await fetch('/api/doctor/auth/logout', { method: 'POST' });
    router.push('/doctor/auth');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true); setSaveProfileSuccess(''); setProfileError('');
    try {
      const res = await fetch('/api/doctor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          specialization: profileSpecialization,
          hospitalName: profileHospital,
          phone: profilePhone,
          city: profileCity,
          bio: profileBio,
          licenseId: profileLicenseId,
          organizationId: profileOrganizationId,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaveProfileSuccess(data.message);
      setDoctor(prev => prev ? { ...prev, ...data.doctor } : null);
      setTimeout(() => setSaveProfileSuccess(''), 3000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
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
            { key: 'profile' as const, icon: <User className="w-4 h-4" />, label: 'My Profile', badge: 0 },
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
                            {m.attachment_url && (
                              <div style={{ marginBottom: m.message && m.message !== '[Image Attachment]' && m.message !== '[Document Attachment]' ? 8 : 0 }}>
                                {m.attachment_type?.startsWith('image/') ? (
                                  <img src={m.attachment_url} alt="Attachment" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, cursor: 'pointer' }} onClick={() => { if (m.attachment_url) openAttachment(m.attachment_url, m.attachment_type); }} />
                                ) : (
                                  <button onClick={() => { if (m.attachment_url) openAttachment(m.attachment_url, m.attachment_type); }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'underline', color: m.sender_role === 'doctor' ? '#A5F3FC' : '#1E3A8A', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit' }}>
                                    <FileText className="w-4 h-4" /> View Document
                                  </button>
                                )}
                              </div>
                            )}
                            {m.message && m.message !== '[Image Attachment]' && m.message !== '[Document Attachment]' && (
                              <div>{m.message}</div>
                            )}
                            <div style={{ fontSize: '0.6rem', opacity: 0.6, marginTop: 4 }}>{new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="file" id="doctor-media-upload" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={(e) => { const file = e.target.files?.[0]; if (file) { handleFileSelect(file); e.target.value = ''; } }} />
                      <input type="file" id="doctor-camera-capture" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => { const file = e.target.files?.[0]; if (file) { handleFileSelect(file); e.target.value = ''; } }} />

                      <button className="btn btn-secondary" onClick={() => document.getElementById('doctor-media-upload')?.click()} style={{ borderRadius: '50%', width: 38, height: 38, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border)' }} title="Send Media">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <button className="btn btn-secondary" onClick={handleOpenCamera} style={{ borderRadius: '50%', width: 38, height: 38, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border)' }} title="Open Camera">
                        <Camera className="w-4 h-4" />
                      </button>

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

          {/* ── DOCTOR PROFILE TAB ──────────────────────────────── */}
          {activeTab === 'profile' && (
            <div className="glass-card animate-fadeInUp" style={{ padding: 32, background: 'white', border: '1.5px solid var(--border)', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #1E3A8A, #B38F5D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', color: 'white', fontWeight: 800 }}>
                  {doctor.name.charAt(0)}
                </div>
                <div style={{ flex: 1, textAlign: 'left', minWidth: 200 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 850, color: 'var(--text-dark)' }}>Dr. {doctor.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>{doctor.email}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    <span style={{ padding: '2px 10px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 800, background: 'rgba(30,58,138,0.06)', color: 'var(--primary-deep)', border: '1px solid rgba(30,58,138,0.1)' }}>
                      {doctor.specialization}
                    </span>
                    <span style={{ padding: '2px 10px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 800, background: doctor.is_approved ? 'rgba(13,148,136,0.06)' : 'rgba(217,119,6,0.06)', color: doctor.is_approved ? '#0D9488' : '#D97706', border: `1px solid ${doctor.is_approved ? 'rgba(13,148,136,0.15)' : 'rgba(217,119,6,0.15)'}` }}>
                      {doctor.is_approved ? '✓ Verified Account' : '⏳ Pending Admin Review'}
                    </span>
                  </div>
                </div>
              </div>

              {saveProfileSuccess && (
                <div style={{ padding: '10px 14px', background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.15)', borderRadius: 10, marginBottom: 20 }}>
                  <p style={{ fontSize: '0.8rem', color: '#0D9488', fontWeight: 700, display: 'flex', gap: 6, alignItems: 'center' }}>
                    <CheckCircle className="w-4 h-4" /> {saveProfileSuccess}
                  </p>
                </div>
              )}

              {profileError && (
                <div style={{ padding: '10px 14px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 10, marginBottom: 20 }}>
                  <p style={{ fontSize: '0.8rem', color: '#DC2626', fontWeight: 700 }}>
                    {profileError}
                  </p>
                </div>
              )}

              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="stack-mobile">
                  <div>
                    <label className="input-label" style={{ textAlign: 'left' }}><User className="w-3 h-3 inline mr-1" />Doctor Name *</label>
                    <input className="input-field" value={profileName} onChange={e => setProfileName(e.target.value)} required style={{ borderRadius: 10, background: '#F8FAFC' }} />
                  </div>
                  <div>
                    <label className="input-label" style={{ textAlign: 'left' }}><Activity className="w-3 h-3 inline mr-1" />Specialization *</label>
                    <input className="input-field" value={profileSpecialization} onChange={e => setProfileSpecialization(e.target.value)} required style={{ borderRadius: 10, background: '#F8FAFC' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="stack-mobile">
                  <div>
                    <label className="input-label" style={{ textAlign: 'left' }}><Stethoscope className="w-3 h-3 inline mr-1" />Hospital / Clinic Name *</label>
                    <input className="input-field" value={profileHospital} onChange={e => setProfileHospital(e.target.value)} required style={{ borderRadius: 10, background: '#F8FAFC' }} />
                  </div>
                  <div>
                    <label className="input-label" style={{ textAlign: 'left' }}><Clock className="w-3 h-3 inline mr-1" />License ID *</label>
                    <input className="input-field" value={profileLicenseId} onChange={e => setProfileLicenseId(e.target.value)} required style={{ borderRadius: 10, background: '#F8FAFC' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="stack-mobile">
                  <div>
                    <label className="input-label" style={{ textAlign: 'left' }}>Organization ID / Affiliate ID</label>
                    <input className="input-field" value={profileOrganizationId} onChange={e => setProfileOrganizationId(e.target.value)} style={{ borderRadius: 10, background: '#F8FAFC' }} />
                  </div>
                  <div>
                    <label className="input-label" style={{ textAlign: 'left' }}>Contact Phone</label>
                    <input className="input-field" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} style={{ borderRadius: 10, background: '#F8FAFC' }} />
                  </div>
                </div>

                <div>
                  <label className="input-label" style={{ textAlign: 'left' }}>City</label>
                  <input className="input-field" value={profileCity} onChange={e => setProfileCity(e.target.value)} style={{ borderRadius: 10, background: '#F8FAFC' }} />
                </div>

                <div>
                  <label className="input-label" style={{ textAlign: 'left' }}>Professional Bio / Clinical Focus</label>
                  <textarea className="input-field" rows={3} value={profileBio} onChange={e => setProfileBio(e.target.value)} placeholder="Tell patients about your clinical focus, background, and research..." style={{ resize: 'none', borderRadius: 12, background: '#F8FAFC', fontSize: '0.85rem' }} />
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, flexWrap: 'wrap', gap: 12 }}>
                  <button className="btn btn-danger btn-sm" type="button" onClick={handleLogout} style={{ borderRadius: 100, fontWeight: 700 }}>
                    <LogOut className="w-4 h-4 text-white inline mr-1" /> Sign Out Session
                  </button>
                  <button className="btn btn-primary" type="submit" disabled={savingProfile} style={{ borderRadius: 100, fontWeight: 700 }}>
                    <Upload className="w-4 h-4" /> {savingProfile ? 'Saving Changes...' : 'Save Professional Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* ── CAMERA CAPTURE MODAL ─────────────────────────── */}
      {showCameraModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={stopCamera}>
          <div className="glass-card animate-fadeInUp" style={{ width: '100%', maxWidth: 500, padding: 20, background: 'white', border: '1.5px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 16 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontWeight: 850, fontSize: '1.05rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Camera className="w-4 h-4 text-[#1E3A8A]" /> Capture Photo
              </h3>
              <button onClick={stopCamera} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}><X className="w-5 h-5" /></button>
            </div>
            
            {cameraError ? (
              <div style={{ padding: 12, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 10, textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', color: '#DC2626', fontWeight: 700 }}>{cameraError}</p>
              </div>
            ) : (
              <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#000', borderRadius: 12, overflow: 'hidden' }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={stopCamera} style={{ borderRadius: 100, paddingInline: 16, fontSize: '0.8rem' }}>
                Cancel
              </button>
              {!cameraError && (
                <button className="btn btn-primary" onClick={capturePhoto} style={{ borderRadius: 100, paddingInline: 20, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Camera className="w-4 h-4" /> Capture &amp; Send
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
