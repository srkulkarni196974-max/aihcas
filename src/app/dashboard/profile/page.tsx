'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';


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
    ? parseFloat(bmi) < 18.5 ? { label: 'Underweight', color: '#F59E0B' }
    : parseFloat(bmi) < 25 ? { label: 'Normal', color: '#2EC4A0' }
    : parseFloat(bmi) < 30 ? { label: 'Overweight', color: '#F59E0B' }
    : { label: 'Obese', color: '#E53E3E' }
    : null;

  const tabs = [
    { id: 'profile', label: '👤 Personal', icon: '👤' },
    { id: 'medical', label: '🏥 Medical', icon: '🏥' },
    { id: 'emergency', label: '🚨 Emergency', icon: '🚨' },
    { id: 'account', label: '⚙️ Account', icon: '⚙️' },
  ] as const;

  return (
    <div className="page-fade" style={{ maxWidth: 900, margin: '0 auto' }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 8 }}>
          <span className="text-gradient">Health</span> Profile
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your personal health information to get more accurate AI guidance.</p>
      </header>

      {/* User Card */}
      <div className="glass-card" style={{ padding: '24px 28px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 20, background: 'linear-gradient(135deg, rgba(77,166,232,0.08), rgba(124,92,252,0.08))' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #4DA6E8, #7C5CFC)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'white', fontWeight: 700 }}>
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{user?.name || 'User'}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.email}</div>
          {bmi && (
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <span className="badge badge-blue">BMI: {bmi}</span>
              <span style={{ padding: '5px 12px', borderRadius: 100, fontSize: '0.78rem', fontWeight: 700, background: `${bmiCategory?.color}22`, color: bmiCategory?.color }}>{bmiCategory?.label}</span>
              {profile.bloodGroup && <span className="badge badge-red">🩸 {profile.bloodGroup}</span>}
            </div>
          )}
        </div>
        {saved && (
          <div style={{ padding: '10px 18px', borderRadius: 12, background: 'var(--secondary)', border: '1px solid var(--secondary-mid)', color: '#178A6A', fontSize: '0.85rem', fontWeight: 600, display: 'flex', gap: 6, alignItems: 'center' }}>
            ✅ Profile saved!
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-card)', padding: 6, borderRadius: 16, border: '1px solid var(--border)', width: 'fit-content' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600,
              fontFamily: 'inherit', transition: 'all 0.25s',
              background: activeTab === tab.id ? 'white' : 'transparent',
              color: activeTab === tab.id ? 'var(--primary-deep)' : 'var(--text-muted)',
              boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 32, position: 'relative' }}>
        {fetching && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <div className="typing-indicator" style={{ background: 'var(--primary-mid)', padding: '12px 24px', borderRadius: 100 }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-deep)' }}>Synchronizing with Supabase...</span>
            </div>
          </div>
        )}


        {/* Personal Tab */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: -8 }}>Personal Information</h3>

            <div className="grid-2">

              <div>
                <label className="input-label">Age</label>
                <input className="input-field" type="number" placeholder="e.g. 32" value={profile.age}
                  onChange={e => setProfile(p => ({ ...p, age: e.target.value }))} min="1" max="120" />
              </div>
              <div>
                <label className="input-label">Gender</label>
                <select className="input-field" value={profile.gender}
                  onChange={e => setProfile(p => ({ ...p, gender: e.target.value }))}
                  style={{ appearance: 'none', cursor: 'pointer' }}>
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Non-binary</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="input-label">Height (cm)</label>
                <input className="input-field" type="number" placeholder="e.g. 168" value={profile.height}
                  onChange={e => setProfile(p => ({ ...p, height: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Weight (kg)</label>
                <input className="input-field" type="number" placeholder="e.g. 65" value={profile.weight}
                  onChange={e => setProfile(p => ({ ...p, weight: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Blood Group</label>
                <select className="input-field" value={profile.bloodGroup}
                  onChange={e => setProfile(p => ({ ...p, bloodGroup: e.target.value }))}
                  style={{ appearance: 'none', cursor: 'pointer' }}>
                  <option value="">Select blood group</option>
                  {bloodGroups.map(bg => <option key={bg}>{bg}</option>)}
                </select>
              </div>
            </div>

            {bmi && (
              <div style={{ padding: '16px 20px', borderRadius: 14, background: `${bmiCategory?.color}15`, border: `1.5px solid ${bmiCategory?.color}40` }}>
                <div style={{ fontWeight: 700, color: bmiCategory?.color, marginBottom: 4 }}>BMI: {bmi} — {bmiCategory?.label}</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {parseFloat(bmi) < 18.5 && 'Consider consulting a nutritionist about healthy weight gain.'}
                  {parseFloat(bmi) >= 18.5 && parseFloat(bmi) < 25 && 'Great! Maintain your current diet and exercise routine.'}
                  {parseFloat(bmi) >= 25 && parseFloat(bmi) < 30 && 'Consider increasing physical activity and a balanced diet.'}
                  {parseFloat(bmi) >= 30 && 'Please consult your doctor for a personalized weight management plan.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Medical Tab */}
        {activeTab === 'medical' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div>
              <label className="input-label" style={{ marginBottom: 12, display: 'block' }}>Existing Conditions</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {commonConditions.map(c => (
                  <button key={c} onClick={() => toggleChip('conditions', c)}
                    style={{
                      padding: '8px 16px', borderRadius: 100, border: '1.5px solid', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s', fontFamily: 'inherit',
                      background: profile.conditions.includes(c) ? 'var(--primary-mid)' : 'white',
                      color: profile.conditions.includes(c) ? 'var(--primary-deep)' : 'var(--text-muted)',
                      borderColor: profile.conditions.includes(c) ? 'var(--primary-deep)' : 'var(--border)',
                    }}>{c}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="input-label" style={{ marginBottom: 12, display: 'block' }}>Known Allergies (Medications)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {commonAllergies.map(a => (
                  <button key={a} onClick={() => toggleChip('allergies', a)}
                    style={{
                      padding: '8px 16px', borderRadius: 100, border: '1.5px solid', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s', fontFamily: 'inherit',
                      background: profile.allergies.includes(a) ? '#FFD6D6' : 'white',
                      color: profile.allergies.includes(a) ? 'var(--danger-deep)' : 'var(--text-muted)',
                      borderColor: profile.allergies.includes(a) ? 'var(--danger-deep)' : 'var(--border)',
                    }}>{a}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="input-label">Current Medications (optional)</label>
              <textarea className="input-field" rows={3} placeholder="e.g. Metformin 500mg twice daily, Amlodipine 5mg once daily..."
                value={profile.medications} onChange={e => setProfile(p => ({ ...p, medications: e.target.value }))}
                style={{ resize: 'none' }} />
            </div>

            {(profile.conditions.length > 0 || profile.allergies.length > 0) && (
              <div style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(77,166,232,0.06)', border: '1px solid rgba(77,166,232,0.15)' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  💡 Your health profile will help the AI give more personalized and accurate health guidance.
                  {profile.allergies.length > 0 && <strong> Drug allergies ({profile.allergies.join(', ')}) will be flagged in prescription analysis.</strong>}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Emergency Tab */}
        {activeTab === 'emergency' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(229,62,62,0.06)', border: '1px solid rgba(229,62,62,0.15)', marginBottom: 8 }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--danger-deep)', fontWeight: 600 }}>🚨 Emergency Contact</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                This person will be contacted in case of a medical emergency.
              </p>
            </div>
            <div className="grid-2">

              <div>
                <label className="input-label">Contact Name</label>
                <input className="input-field" type="text" placeholder="e.g. Rajesh Kulkarni" value={profile.emergencyContact}
                  onChange={e => setProfile(p => ({ ...p, emergencyContact: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Contact Phone</label>
                <input className="input-field" type="tel" placeholder="e.g. +91 98765 43210" value={profile.emergencyPhone}
                  onChange={e => setProfile(p => ({ ...p, emergencyPhone: e.target.value }))} />
              </div>
            </div>
            {profile.emergencyContact && profile.emergencyPhone && (
              <div style={{ padding: 20, borderRadius: 14, background: 'var(--secondary)', border: '1px solid var(--secondary-mid)', display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ fontSize: '2rem' }}>✅</div>
                <div>
                  <div style={{ fontWeight: 700, color: '#178A6A' }}>{profile.emergencyContact}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{profile.emergencyPhone}</div>
                </div>
                <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}
                  onClick={() => window.location.href = `tel:${profile.emergencyPhone}`}>
                  📞 Call
                </button>
              </div>
            )}
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Account Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Full Name', value: user?.name || 'N/A' },
                  { label: 'Email Address', value: user?.email || 'N/A' },
                  { label: 'Account Type', value: 'Standard User' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', borderRadius: 12, background: 'var(--primary)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.label}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, color: 'var(--danger-deep)' }}>Danger Zone</h3>
              <button className="btn btn-danger btn-sm" onClick={logout}>
                🚪 Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Save Button (not for account tab) */}
        {activeTab !== 'account' && (
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={saveProfile}>
              💾 Save Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
