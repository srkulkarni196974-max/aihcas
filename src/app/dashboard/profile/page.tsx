'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  User, 
  Heart, 
  ShieldAlert, 
  Settings, 
  CheckCircle, 
  Upload, 
  PhoneCall, 
  Sparkles, 
  ChevronRight,
  TrendingUp,
  Activity,
  LogOut
} from 'lucide-react';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const commonConditions = ['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Thyroid', 'Arthritis', 'Migraine', 'Anemia'];
const commonAllergies = ['Penicillin', 'Aspirin', 'Sulfa drugs', 'Ibuprofen', 'Latex', 'Pollen', 'Dust', 'Shellfish'];

interface HealthProfile {
  age: string;
  gender: string;
  bloodGroup: string;
  height: string;
  weight: string;
  conditions: string[];
  allergies: string[];
  medications: string;
  emergencyContact: string;
  emergencyPhone: string;
}

const defaultProfile: HealthProfile = {
  age: '',
  gender: '',
  bloodGroup: '',
  height: '',
  weight: '',
  conditions: [],
  allergies: [],
  medications: '',
  emergencyContact: '',
  emergencyPhone: '',
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<HealthProfile>(defaultProfile);
  const [saved, setSaved] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'medical' | 'emergency' | 'account'>('profile');

  // Load profile when user is available
  useEffect(() => {
    async function loadProfile() {
      if (user?.userId) {
        setFetching(true);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.userId)
            .maybeSingle(); // Use maybeSingle to avoid 406 error if not found

          if (data) {
            setProfile({
              age: data.age?.toString() || '',
              gender: data.gender || '',
              bloodGroup: data.blood_group || '',
              height: data.height?.toString() || '',
              weight: data.weight?.toString() || '',
              conditions: data.medical_history ? data.medical_history.split(', ') : [],
              allergies: data.allergies || [],
              medications: data.medications || '',
              emergencyContact: data.emergency_contact_name || '',
              emergencyPhone: data.emergency_contact_phone || '',
            });
          }
        } catch (err) {
          console.error('Error loading profile:', err);
        } finally {
          setFetching(false);
        }
      }
    }
    loadProfile();
  }, [user?.userId]);

  const saveProfile = async () => {
    if (user?.userId) {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.userId,
          age: parseInt(profile.age) || null,
          gender: profile.gender,
          blood_group: profile.bloodGroup,
          height: parseFloat(profile.height) || null,
          weight: parseFloat(profile.weight) || null,
          medical_history: profile.conditions.join(', '),
          allergies: profile.allergies,
          medications: profile.medications,
          emergency_contact_name: profile.emergencyContact,
          emergency_contact_phone: profile.emergencyPhone,
          updated_at: new Date().toISOString(),
        });

      if (!error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        console.error('Supabase Error:', error.message, error.details, error.hint);
        alert('Failed to save profile: ' + error.message);
      }
    }
  };

  const toggleChip = (key: 'conditions' | 'allergies', value: string) => {
    setProfile(prev => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value],
    }));
  };

  const bmi = profile.height && profile.weight
    ? (parseFloat(profile.weight) / Math.pow(parseFloat(profile.height) / 100, 2)).toFixed(1)
    : null;

  const bmiCategory = bmi
    ? parseFloat(bmi) < 18.5 ? { label: 'Underweight', color: '#D97706' }
    : parseFloat(bmi) < 25 ? { label: 'Normal Weight', color: '#0D9488' }
    : parseFloat(bmi) < 30 ? { label: 'Overweight', color: '#D97706' }
    : { label: 'Obese', color: '#DC2626' }
    : null;

  const tabs = [
    { id: 'profile', label: 'Personal Parameters', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'medical', label: 'Clinical Parameters', icon: <Heart className="w-3.5 h-3.5" /> },
    { id: 'emergency', label: 'Safety Dispatch', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
    { id: 'account', label: 'Access Settings', icon: <Settings className="w-3.5 h-3.5" /> },
  ] as const;

  return (
    <div className="page-fade" style={{ maxWidth: 900, margin: '0 auto' }}>
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 850, letterSpacing: '-0.02em', marginBottom: 8, color: '#0F172A' }}>
          <span style={{ background: 'linear-gradient(135deg, #1E3A8A 30%, #B38F5D 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Health</span> Profile
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Synchronize clinical metrics and allergies to enhance local AI diagnostics accuracy.</p>
      </header>

      {/* User Dashboard Profile Header Card */}
      <div className="glass-card" style={{ padding: '24px 28px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 20, background: 'linear-gradient(135deg, rgba(30,58,138,0.02), rgba(179,143,93,0.03))', border: '1.5px solid var(--border)', flexWrap: 'wrap' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-deep), #2A437E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: 'white', fontWeight: 800 }}>
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div style={{ flex: 1, minWidth: 200, textAlign: 'left' }}>
          <div style={{ fontSize: '1.15rem', fontWeight: 850, color: 'var(--text-dark)' }}>{user?.name || 'Authorized Patient'}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 2 }}>{user?.email}</div>
          {bmi && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <span className="badge badge-blue" style={{ fontWeight: 800 }}>BMI: {bmi}</span>
              <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 800, background: `${bmiCategory?.color}12`, color: bmiCategory?.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Activity className="w-3 h-3" />
                {bmiCategory?.label}
              </span>
              {profile.bloodGroup && (
                <span className="badge badge-red" style={{ fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Heart className="w-3 h-3 text-[#DC2626] fill-[#DC2626]" /> Blood Type: {profile.bloodGroup}
                </span>
              )}
            </div>
          )}
        </div>
        {saved && (
          <div style={{ padding: '8px 16px', borderRadius: 12, background: 'rgba(13, 148, 136, 0.05)', border: '1.5px solid rgba(13, 148, 136, 0.15)', color: '#0D9488', fontSize: '0.78rem', fontWeight: 800, display: 'flex', gap: 6, alignItems: 'center' }}>
            <CheckCircle className="w-4 h-4 text-[#0D9488]" /> Saved securely to Database
          </div>
        )}
      </div>

      {/* Modern Tabs Bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(248,250,252,0.8)', padding: 6, borderRadius: 14, border: '1.5px solid var(--border)', width: 'fit-content', overflowX: 'auto', maxWidth: '100%' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 18px', borderRadius: 10, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 800,
              fontFamily: 'inherit', transition: 'all 0.25s',
              background: activeTab === tab.id ? 'white' : 'transparent',
              color: activeTab === tab.id ? 'var(--primary-deep)' : 'var(--text-light)',
              boxShadow: activeTab === tab.id ? '0 4px 12px rgba(30, 58, 138, 0.04)' : 'none',
              border: activeTab === tab.id ? '1px solid rgba(226, 232, 240, 0.8)' : '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {tab.icon}
            <span style={{ whiteSpace: 'nowrap' }}>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 32, background: 'white', border: '1.5px solid var(--border)', position: 'relative' }}>
        {fetching && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <div style={{ background: 'rgba(30,58,138,0.05)', padding: '12px 24px', borderRadius: 100, border: '1px solid rgba(30,58,138,0.1)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-deep)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <Activity className="w-4 h-4 animate-spin text-[#1E3A8A]" /> Synchronizing parameters...
              </span>
            </div>
          </div>
        )}

        {/* Personal Tab */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 850, color: 'var(--text-dark)', marginBottom: -8, textAlign: 'left' }}>Personal Demographics</h3>
            <div className="grid-2" style={{ gap: '20px' }}>
              <div>
                <label className="input-label" style={{ textAlign: 'left' }}>Age</label>
                <input className="input-field" type="number" placeholder="Years" value={profile.age}
                  onChange={e => setProfile(p => ({ ...p, age: e.target.value }))} min="1" max="120" style={{ borderRadius: 10, background: '#F8FAFC' }} />
              </div>
              <div>
                <label className="input-label" style={{ textAlign: 'left' }}>Gender</label>
                <select className="input-field" value={profile.gender}
                  onChange={e => setProfile(p => ({ ...p, gender: e.target.value }))}
                  style={{ appearance: 'none', cursor: 'pointer', borderRadius: 10, background: '#F8FAFC', paddingRight: '36px', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23B38F5D%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px top 50%', backgroundSize: '10px auto' }}>
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Non-binary</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="input-label" style={{ textAlign: 'left' }}>Height (cm)</label>
                <input className="input-field" type="number" placeholder="Height in cm" value={profile.height}
                  onChange={e => setProfile(p => ({ ...p, height: e.target.value }))} style={{ borderRadius: 10, background: '#F8FAFC' }} />
              </div>
              <div>
                <label className="input-label" style={{ textAlign: 'left' }}>Weight (kg)</label>
                <input className="input-field" type="number" placeholder="Weight in kg" value={profile.weight}
                  onChange={e => setProfile(p => ({ ...p, weight: e.target.value }))} style={{ borderRadius: 10, background: '#F8FAFC' }} />
              </div>
              <div>
                <label className="input-label" style={{ textAlign: 'left' }}>Blood Group</label>
                <select className="input-field" value={profile.bloodGroup}
                  onChange={e => setProfile(p => ({ ...p, bloodGroup: e.target.value }))}
                  style={{ appearance: 'none', cursor: 'pointer', borderRadius: 10, background: '#F8FAFC', paddingRight: '36px', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23B38F5D%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px top 50%', backgroundSize: '10px auto' }}>
                  <option value="">Select blood group</option>
                  {bloodGroups.map(bg => <option key={bg}>{bg}</option>)}
                </select>
              </div>
            </div>

            {bmi && (
              <div style={{ padding: '16px 20px', borderRadius: 14, background: `${bmiCategory?.color}12`, border: `1px solid ${bmiCategory?.color}20`, textAlign: 'left' }}>
                <div style={{ fontWeight: 800, color: bmiCategory?.color, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' }}>
                  <Activity className="w-4 h-4" />
                  BMI Parameter: {bmi} — {bmiCategory?.label}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {parseFloat(bmi) < 18.5 && 'Consider discussing dietary enrichment strategies with a registered health counselor.'}
                  {parseFloat(bmi) >= 18.5 && parseFloat(bmi) < 25 && 'Normal range mapped. Keep up your active metabolic conditioning.'}
                  {parseFloat(bmi) >= 25 && parseFloat(bmi) < 30 && 'Slightly above normal bounds. Aerobic workouts are recommended.'}
                  {parseFloat(bmi) >= 30 && 'Consult a certified clinical consultant to construct a comprehensive wellness chart.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Medical Tab */}
        {activeTab === 'medical' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div>
              <label className="input-label" style={{ marginBottom: 12, display: 'block', textAlign: 'left' }}>Underlying Clinical Conditions</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {commonConditions.map(c => (
                  <button key={c} onClick={() => toggleChip('conditions', c)}
                    style={{
                      padding: '6px 16px', borderRadius: 100, border: '1.5px solid', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 800, transition: 'all 0.2s', fontFamily: 'inherit',
                      background: profile.conditions.includes(c) ? 'rgba(30, 58, 138, 0.05)' : 'white',
                      color: profile.conditions.includes(c) ? 'var(--primary-deep)' : 'var(--text-light)',
                      borderColor: profile.conditions.includes(c) ? 'var(--primary-deep)' : 'var(--border)',
                    }}>{c}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="input-label" style={{ marginBottom: 12, display: 'block', textAlign: 'left' }}>Identified Drug/Chemical Allergies</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {commonAllergies.map(a => (
                  <button key={a} onClick={() => toggleChip('allergies', a)}
                    style={{
                      padding: '6px 16px', borderRadius: 100, border: '1.5px solid', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 800, transition: 'all 0.2s', fontFamily: 'inherit',
                      background: profile.allergies.includes(a) ? '#FFF0F0' : 'white',
                      color: profile.allergies.includes(a) ? 'var(--danger-deep)' : 'var(--text-light)',
                      borderColor: profile.allergies.includes(a) ? 'var(--danger-deep)' : 'var(--border)',
                    }}>{a}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="input-label" style={{ textAlign: 'left' }}>Current Pharmaceutical Routine (optional)</label>
              <textarea className="input-field" rows={3} placeholder="e.g. Metformin 500mg twice daily, Amlodipine 5mg once daily..."
                value={profile.medications} onChange={e => setProfile(p => ({ ...p, medications: e.target.value }))}
                style={{ resize: 'none', borderRadius: 12, background: '#F8FAFC', fontSize: '0.85rem' }} />
            </div>

            {(profile.conditions.length > 0 || profile.allergies.length > 0) && (
              <div style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(179,143,93,0.03)', border: '1px solid rgba(179,143,93,0.12)', textAlign: 'left' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                  <Sparkles className="w-4 h-4 text-[#B38F5D] flex-shrink-0" style={{ marginTop: 2 }} />
                  <span>
                    Your active files are successfully synchronized.
                    {profile.allergies.length > 0 && <strong> Medication exclusions ({profile.allergies.join(', ')}) will trigger safety flags during future prescription scans.</strong>}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Emergency Tab */}
        {activeTab === 'emergency' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ padding: '16px 20px', borderRadius: 14, background: '#FFF5F5', border: '1px solid rgba(220, 38, 38, 0.1)', display: 'flex', gap: 12, alignItems: 'flex-start', textAlign: 'left' }}>
              <ShieldAlert className="w-5 h-5 text-[#DC2626] flex-shrink-0" style={{ marginTop: 2 }} />
              <div>
                <p style={{ fontSize: '0.88rem', color: 'var(--danger-deep)', fontWeight: 800 }}>Assigned Medical Proxy</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.45 }}>
                  This proxy responder will be notified automatically during crisis dispatches or emergency health consultations.
                </p>
              </div>
            </div>
            <div className="grid-2" style={{ gap: '20px' }}>
              <div>
                <label className="input-label" style={{ textAlign: 'left' }}>Contact Name</label>
                <input className="input-field" type="text" placeholder="e.g. Rajesh Kulkarni" value={profile.emergencyContact}
                  onChange={e => setProfile(p => ({ ...p, emergencyContact: e.target.value }))} style={{ borderRadius: 10, background: '#F8FAFC' }} />
              </div>
              <div>
                <label className="input-label" style={{ textAlign: 'left' }}>Contact Phone</label>
                <input className="input-field" type="tel" placeholder="e.g. +91 98765 43210" value={profile.emergencyPhone}
                  onChange={e => setProfile(p => ({ ...p, emergencyPhone: e.target.value }))} style={{ borderRadius: 10, background: '#F8FAFC' }} />
              </div>
            </div>
            {profile.emergencyContact && profile.emergencyPhone && (
              <div style={{ padding: 20, borderRadius: 16, background: '#F8FAFC', border: '1.5px solid var(--border)', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', textAlign: 'left' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(13, 148, 136, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle className="w-5 h-5 text-[#0D9488]" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: '0.92rem' }}>{profile.emergencyContact}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>{profile.emergencyPhone}</div>
                </div>
                <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto', borderRadius: 100, fontWeight: 700 }}
                  onClick={() => window.location.href = `tel:${profile.emergencyPhone}`}>
                  <PhoneCall className="w-3.5 h-3.5" /> Direct Call
                </button>
              </div>
            )}
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h3 style={{ fontWeight: 850, color: 'var(--text-dark)', marginBottom: 16, fontSize: '1rem', textAlign: 'left' }}>Identity Records</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Registered Patient Name', value: user?.name || 'Anonymous User' },
                  { label: 'Clinical Security Email', value: user?.email || 'N/A' },
                  { label: 'Role Authority Type', value: 'Verified Health Account' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', borderRadius: 12, background: '#F8FAFC', border: '1.5px solid var(--border)', flexWrap: 'wrap', gap: 8, alignItems: 'center', textAlign: 'left' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{item.label}</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-dark)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, textAlign: 'left' }}>
              <h3 style={{ fontWeight: 800, marginBottom: 8, color: 'var(--danger-deep)', fontSize: '0.98rem' }}>Exclusion Zone</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>Sign out of this local console. All credentials will be unlinked from current session.</p>
              <button className="btn btn-danger btn-sm" onClick={logout} style={{ borderRadius: 100, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <LogOut className="w-4 h-4 text-white" /> Sign Out Session
              </button>
            </div>
          </div>
        )}

        {/* Save Button */}
        {activeTab !== 'account' && (
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={saveProfile} style={{ borderRadius: 100, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Upload className="w-4 h-4" /> Save Health Parameters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
