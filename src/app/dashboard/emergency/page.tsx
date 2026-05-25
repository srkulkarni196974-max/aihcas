'use client';
import { useState } from 'react';
import { 
  PhoneCall, 
  ShieldAlert, 
  Search, 
  Heart, 
  User, 
  AlertTriangle,
  MapPin,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

const emergencyData = [
  { id: 1, name: 'National Health Helpline', number: '1800-180-1104', type: 'General Support', city: 'National', icon: <PhoneCall className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 2, name: 'National Emergency Number', number: '112', type: 'All-in-One Emergency', city: 'National', icon: <ShieldAlert className="w-5 h-5 text-[#DC2626]" /> },
  { id: 3, name: 'Ambulance Service', number: '102', type: 'Medical Transit', city: 'National', icon: <Heart className="w-5 h-5 text-[#0D9488]" /> },
  { id: 4, name: 'Mental Health Helpline (KIRAN)', number: '1800-599-0019', type: 'Psychology Support', city: 'National', icon: <Sparkles className="w-5 h-5 text-[#B38F5D]" /> },
  { id: 5, name: 'Women Helpline', number: '181', type: 'Safety Line', city: 'National', icon: <User className="w-5 h-5 text-[#D97706]" /> },
  { id: 6, name: 'Senior Physician Consult', number: '1075', type: 'Clinical Consultation', city: 'National', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 7, name: 'Blood Bank Information', number: '104', type: 'Resource Coordination', city: 'State-wise', icon: <Layers className="w-5 h-5 text-[#0D9488]" /> },
  { id: 8, name: 'Poison Control Centre (AIIMS)', number: '011-26593677', type: 'Toxicology Unit', city: 'Delhi', icon: <ShieldAlert className="w-5 h-5 text-[#DC2626]" /> },
  { id: 9, name: 'AIIMS Hospital', number: '011-26588500', type: 'Apex Hospital', city: 'Delhi', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 10, name: 'Max Super Speciality', number: '011-26515050', type: 'Apex Hospital', city: 'Delhi', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 11, name: 'Tata Memorial Hospital', number: '022-24177000', type: 'Oncology Specialist', city: 'Mumbai', icon: <Heart className="w-5 h-5 text-[#B38F5D]" /> },
  { id: 12, name: 'KEM Hospital', number: '022-24107000', type: 'Apex Hospital', city: 'Mumbai', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 13, name: 'NIMHANS (Bangalore, Karnataka)', number: '080-26995000', type: 'Neuro/Psychiatry', city: 'Bangalore', icon: <Sparkles className="w-5 h-5 text-[#B38F5D]" /> },
  { id: 14, name: 'Fortis Hospital (Bangalore, Karnataka)', number: '080-66214444', type: 'Apex Hospital', city: 'Bangalore', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 15, name: 'Apollo Hospitals', number: '044-28293333', type: 'Apex Hospital', city: 'Chennai', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 16, name: 'AMRI Hospitals', number: '033-66800000', type: 'Apex Hospital', city: 'Kolkata', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 17, name: 'Apollo Hospitals (Hyderabad)', number: '040-23607777', type: 'Apex Hospital', city: 'Hyderabad', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 18, name: 'NIMS (Nizam\'s Institute of Medical Sciences)', number: '040-23378899', type: 'Government Speciality', city: 'Hyderabad', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 19, name: 'Ruby Hall Clinic', number: '020-66455100', type: 'Apex Hospital', city: 'Pune', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 20, name: 'Jehangir Hospital', number: '020-66050300', type: 'Apex Hospital', city: 'Pune', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 21, name: 'Civil Hospital Ahmedabad', number: '079-22683721', type: 'Government Apex', city: 'Ahmedabad', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 22, name: 'Shalby Hospital', number: '079-40203000', type: 'Orthopedic Speciality', city: 'Ahmedabad', icon: <Heart className="w-5 h-5 text-[#B38F5D]" /> },
  { id: 23, name: 'Medanta The Medicity', number: '0124-4141414', type: 'Multi-Speciality Apex', city: 'Gurgaon', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 24, name: 'Fortis Memorial Research Institute', number: '0124-4962200', type: 'Apex Hospital', city: 'Gurgaon', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 25, name: 'Jaypee Hospital', number: '0120-4122222', type: 'Apex Hospital', city: 'Noida', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 26, name: 'Kailash Hospital', number: '0120-2444444', type: 'Apex Hospital', city: 'Noida', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 27, name: 'SMS Hospital (Sawai Man Singh)', number: '0141-2560291', type: 'Government Apex', city: 'Jaipur', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 28, name: 'Fortis Escorts Hospital', number: '0141-2547000', type: 'Apex Hospital', city: 'Jaipur', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 29, name: 'SGPGI Hospital (Sanjay Gandhi Postgraduate Institute)', number: '0522-2668700', type: 'Government Apex', city: 'Lucknow', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 30, name: 'Sahara Hospital', number: '0522-6780001', type: 'Apex Hospital', city: 'Lucknow', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 31, name: 'PGIMER Chandigarh', number: '0172-2756565', type: 'Government Apex', city: 'Chandigarh', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 32, name: 'Fortis Hospital Mohali', number: '0172-5021222', type: 'Apex Hospital', city: 'Chandigarh', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 33, name: 'Manipal Hospital (Bangalore, Karnataka)', number: '080-25024444', type: 'Apex Hospital', city: 'Bangalore', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 34, name: 'Narayana Health City (Bangalore, Karnataka)', number: '080-71222222', type: 'Cardiology Speciality', city: 'Bangalore', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 35, name: 'St. John\'s Medical College Hospital (Bangalore, Karnataka)', number: '080-22065000', type: 'Apex Medical College', city: 'Bangalore', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 36, name: 'Victoria Hospital (Bangalore, Karnataka)', number: '080-26701150', type: 'Government Apex', city: 'Bangalore', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 37, name: 'K.R. Hospital (Mysore, Karnataka)', number: '0821-2421200', type: 'Government Apex', city: 'Mysore', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 38, name: 'JSS Hospital (Mysore, Karnataka)', number: '0821-2335555', type: 'Multi-Speciality', city: 'Mysore', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 39, name: 'Apollo BGS Hospitals (Mysore, Karnataka)', number: '0821-2568888', type: 'Cardiac & General Apex', city: 'Mysore', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 40, name: 'KIMS Hubli (Hubli-Dharwad, Karnataka)', number: '0836-2374624', type: 'Government Apex', city: 'Hubli-Dharwad', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 41, name: 'SDM College of Medical Sciences (Hubli-Dharwad, Karnataka)', number: '0836-2477777', type: 'Apex Hospital', city: 'Hubli-Dharwad', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 42, name: 'Wenlock District Hospital (Mangalore, Karnataka)', number: '0824-2423300', type: 'Government General', city: 'Mangalore', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 43, name: 'KMC Hospital (Mangalore, Karnataka)', number: '0824-2445858', type: 'Apex Hospital', city: 'Mangalore', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 44, name: 'Father Muller Hospital (Mangalore, Karnataka)', number: '0824-2238000', type: 'Apex Hospital', city: 'Mangalore', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 45, name: 'BIMS Belagavi (Belgaum, Karnataka)', number: '0831-2403126', type: 'Government General', city: 'Belgaum', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 46, name: 'KLE Charitable Hospital (Belgaum, Karnataka)', number: '0831-2473777', type: 'Apex Hospital', city: 'Belgaum', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 47, name: 'Chigateri District General Hospital (Davangere, Karnataka)', number: '08192-233433', type: 'Government General', city: 'Davangere', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 48, name: 'Bapuji Hospital (Davangere, Karnataka)', number: '08192-255555', type: 'Apex Hospital', city: 'Davangere', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 49, name: 'VIMS Bellary (Bellary, Karnataka)', number: '08392-235201', type: 'Government Apex', city: 'Bellary', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 50, name: 'GIMS Kalaburagi (Gulbarga, Karnataka)', number: '08472-278630', type: 'Government Apex', city: 'Gulbarga', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 51, name: 'Basaveshwar Hospital (Gulbarga, Karnataka)', number: '08472-222718', type: 'Multi-Speciality', city: 'Gulbarga', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 52, name: 'SIMS Shivamogga (Shimoga, Karnataka)', number: '08182-229933', type: 'Government Apex', city: 'Shimoga', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 53, name: 'Nanjappa Hospital (Shimoga, Karnataka)', number: '08182-222415', type: 'Multi-Speciality', city: 'Shimoga', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 54, name: 'Tumkur District Government Hospital (Tumkur, Karnataka)', number: '0816-2278383', type: 'Government General', city: 'Tumkur', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 55, name: 'Siddaganga Hospital (Tumkur, Karnataka)', number: '0816-2275000', type: 'Multi-Speciality', city: 'Tumkur', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 56, name: 'Kasturba Hospital Manipal (Udupi, Karnataka)', number: '0820-2922761', type: 'Apex Hospital', city: 'Udupi', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 57, name: 'Adarsha Hospital Udupi (Udupi, Karnataka)', number: '0820-2533333', type: 'Multi-Speciality', city: 'Udupi', icon: <Heart className="w-5 h-5 text-[#1E3A8A]" /> },
  { id: 58, name: 'State Emergency Ambulance Service (Karnataka)', number: '108', type: 'State Medical Transit', city: 'Karnataka', icon: <Heart className="w-5 h-5 text-[#0D9488]" /> },
];

export default function EmergencyPage() {
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');

  const filteredData = emergencyData.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || 
                          e.type.toLowerCase().includes(search.toLowerCase()) ||
                          e.city.toLowerCase().includes(search.toLowerCase());
    // Always show 'National' emergency numbers even when a specific city is selected
    const matchesCity = selectedCity === 'All' || e.city === selectedCity || e.city === 'National';
    return matchesSearch && matchesCity;
  });

  return (
    <div className="page-fade" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
         <div className="badge" style={{ marginBottom: '16px', fontSize: '0.78rem', padding: '6px 16px', border: '1.5px solid rgba(220, 38, 38, 0.15)', background: '#FFF5F5', color: '#DC2626', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 100 }}>
           <ShieldAlert className="w-3.5 h-3.5 text-[#DC2626]" /> Emergency Care Hub
         </div>
         <h1 style={{ fontSize: '2.1rem', fontWeight: 850, letterSpacing: '-0.02em', marginBottom: '12px', color: 'var(--text-dark)' }}>
            <span style={{ background: 'linear-gradient(135deg, #1E3A8A 30%, #B38F5D 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>National</span> Emergency Services
         </h1>
         <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Instant single-tap access to primary clinical helplines, suicide portals, and state coordinators across India.
         </p>
      </header>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '40px', background: 'white', border: '1.5px solid var(--border)' }}>
         <div className="stack-mobile" style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
               <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Search for service, category, or parameter..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '44px', borderRadius: '12px', background: '#F8FAFC' }}
               />
               <Search className="w-4 h-4 text-slate-400" style={{ position: 'absolute', left: '16px', top: '16px' }} />
            </div>
            <select 
               className="btn btn-secondary full-width-mobile" 
               style={{ outline: 'none', cursor: 'pointer', appearance: 'none', paddingRight: '36px', borderRadius: '12px', background: 'white', border: '1.5px solid var(--border)', fontSize: '0.85rem', fontWeight: 700, paddingLeft: '16px', color: 'var(--text-dark)', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23B38F5D%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px top 50%', backgroundSize: '10px auto' }}
               value={selectedCity}
               onChange={(e) => setSelectedCity(e.target.value)}
            >
               {['All', ...Array.from(new Set(emergencyData.map(e => e.city)))].map(city => (
                  <option key={city} value={city}>{city === 'All' ? 'Filter by City (All)' : `Filter: ${city}`}</option>
               ))}
            </select>
         </div>
      </div>

      {/* Emergency Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 310px), 1fr))', gap: '20px' }}>
         {filteredData.length > 0 ? (
           filteredData.map((contact, i) => (
             <div key={contact.id} className="emergency-card glass-card animate-fadeInUp" style={{ animationDelay: `${i * 0.05}s`, background: 'white', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16, padding: '20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(220, 38, 38, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(220, 38, 38, 0.1)' }}>
                   {contact.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span className="badge" style={{ fontSize: '0.65rem', background: 'var(--primary)', color: 'var(--primary-deep)', fontWeight: 800, padding: '2px 8px', borderRadius: 100 }}>{contact.type}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin className="w-3 h-3" />
                        {contact.city}
                      </span>
                   </div>
                   <h3 style={{ fontSize: '0.98rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contact.name}</h3>
                   <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--danger-deep)', letterSpacing: '-0.01em' }}>{contact.number}</div>
                </div>
                <button 
                  className="btn btn-danger btn-icon" 
                  style={{ borderRadius: '50%', width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0 }}
                  onClick={() => window.open(`tel:${contact.number}`, '_system')}
                  title={`Dial ${contact.name}`}
                >
                   <PhoneCall className="w-4 h-4 text-white" />
                </button>
             </div>
           ))
         ) : (
           <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F8FAFC', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <p style={{ fontWeight: 700, color: 'var(--text-dark)' }}>No parameters detected</p>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-light)', marginTop: 4 }}>Refine your keyword search or change city filter parameters.</p>
           </div>
         )}
      </div>

      {/* Action Advice Segment */}
      <div style={{ marginTop: '64px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0F172A', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'left' }}>
            <Sparkles className="w-5 h-5 text-[#B38F5D]" /> First-Response Action Tips
          </h2>
          <div className="grid-3" style={{ gap: '20px' }}>
             {[
               { title: 'Maintain Composure', desc: 'Regulate your breathing. Panic clouds clinical details when talking to responders.' },
               { title: 'Log Onset Timings', desc: 'Note the exact time symptoms triggered. This is critical diagnostic info for clinical staff.' },
               { title: 'Compile Health Cards', desc: 'Have active allergies, current pharmaceutical records, and blood group parameters ready.' }
             ].map((tip, i) => (
                <div key={i} className="glass-card" style={{ padding: '24px', background: 'white', border: '1.5px solid var(--border)', textAlign: 'left' }}>
                  <h4 style={{ fontWeight: 800, marginBottom: '10px', color: 'var(--primary-deep)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Info className="w-4 h-4 text-[#1E3A8A]" /> {tip.title}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{tip.desc}</p>
                </div>
             ))}
          </div>
      </div>

      {/* Primary Life Threat Disclaimer */}
      <footer style={{ marginTop: '80px', padding: '40px', background: 'linear-gradient(135deg, rgba(220,38,38,0.04), rgba(220,38,38,0.01))', borderRadius: '24px', textAlign: 'center', border: '1.5px solid rgba(220,38,38,0.15)' }}>
         <h4 style={{ marginBottom: '12px', fontWeight: 800, color: 'var(--text-dark)', fontSize: '1.15rem' }}>Active Life-Threatening Crisis?</h4>
         <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.88rem' }}>Do not delay diagnostic scans. Call 112 for direct dispatch of regional rescue vehicles immediately.</p>
         <button 
            className="btn btn-danger btn-lg" 
            style={{ padding: '16px 48px', borderRadius: 100, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}
            onClick={() => window.open('tel:112', '_system')}
          >
            ⚡ Trigger Emergency 112
         </button>
      </footer>
    </div>
  );
}
