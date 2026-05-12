'use client';
import { useState } from 'react';

const emergencyData = [
  { id: 1, name: 'National Health Helpline', number: '1800-180-1104', type: 'General', city: 'National', icon: '📞' },
  { id: 2, name: 'National Emergency Number', number: '112', type: 'All-in-One', city: 'National', icon: '🚨' },
  { id: 3, name: 'Ambulance Service', number: '102', type: 'Emergency', city: 'National', icon: '🚑' },
  { id: 4, name: 'Mental Health Helpline (KIRAN)', number: '1800-599-0019', type: 'Psychology', city: 'National', icon: '🧠' },
  { id: 5, name: 'Women Helpline', number: '181', type: 'Safety', city: 'National', icon: '👩' },
  { id: 6, name: 'Senior Physician Consult', number: '1075', type: 'Consultation', city: 'National', icon: '👨‍⚕️' },
  { id: 7, name: 'Blood Bank Information', number: '104', type: 'Resource', city: 'State-wise', icon: '🩸' },
  { id: 8, name: 'Poison Control Centre (AIIMS)', number: '011-26593677', type: 'Toxicology', city: 'Delhi', icon: '🧪' },
  { id: 9, name: 'AIIMS Hospital', number: '011-26588500', type: 'Hospital', city: 'Delhi', icon: '🏥' },
  { id: 10, name: 'Max Super Speciality', number: '011-26515050', type: 'Hospital', city: 'Delhi', icon: '🏥' },
  { id: 11, name: 'Tata Memorial Hospital', number: '022-24177000', type: 'Oncology', city: 'Mumbai', icon: '🏥' },
  { id: 12, name: 'KEM Hospital', number: '022-24107000', type: 'Hospital', city: 'Mumbai', icon: '🏥' },
  { id: 13, name: 'NIMHANS', number: '080-26995000', type: 'Mental Health', city: 'Bangalore', icon: '🏥' },
  { id: 14, name: 'Fortis Hospital', number: '080-66214444', type: 'Hospital', city: 'Bangalore', icon: '🏥' },
  { id: 15, name: 'Apollo Hospitals', number: '044-28293333', type: 'Hospital', city: 'Chennai', icon: '🏥' },
  { id: 16, name: 'AMRI Hospitals', number: '033-66800000', type: 'Hospital', city: 'Kolkata', icon: '🏥' },
];

export default function EmergencyPage() {
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');

  const filteredData = emergencyData.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || 
                          e.type.toLowerCase().includes(search.toLowerCase());
    // Always show 'National' emergency numbers even when a specific city is selected
    const matchesCity = selectedCity === 'All' || e.city === selectedCity || e.city === 'National';
    return matchesSearch && matchesCity;
  });

  return (
    <div className="page-fade" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
         <div className="badge badge-red" style={{ marginBottom: '16px', fontSize: '0.9rem', padding: '8px 16px' }}>🚨 Emergency Care Hub</div>
         <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px' }}>
            <span className="text-gradient">Indian</span> Emergency Services
         </h1>
         <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Quick access to essential healthcare helplines and emergency resources across India.
         </p>
      </header>

      <div className="glass-card" style={{ padding: '24px', marginBottom: '40px', background: 'white' }}>
         <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
               <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Search for service (e.g. Ambulance, Mental Health)..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '48px' }}
               />
               <span style={{ position: 'absolute', left: '16px', top: '16px', fontSize: '1.2rem' }}>🔍</span>
            </div>
            <select 
               className="btn btn-secondary" 
               style={{ outline: 'none', cursor: 'pointer', appearance: 'none', paddingRight: '32px', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%237C5CFC%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px top 50%', backgroundSize: '12px auto' }}
               value={selectedCity}
               onChange={(e) => setSelectedCity(e.target.value)}
            >
               {['All', ...Array.from(new Set(emergencyData.map(e => e.city)))].map(city => (
                  <option key={city} value={city}>{city === 'All' ? 'Filter by City (All)' : city}</option>
               ))}
            </select>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '20px' }}>
         {filteredData.length > 0 ? (
           filteredData.map((contact, i) => (
             <div key={contact.id} className="emergency-card glass-card animate-fadeInUp" style={{ animationDelay: `${i * 0.05}s`, background: 'white' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                   {contact.icon}
                </div>
                <div style={{ flex: 1 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{contact.type}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)' }}>{contact.city}</span>
                   </div>
                   <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '4px' }}>{contact.name}</h3>
                   <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--danger-deep)', letterSpacing: '0.05em' }}>{contact.number}</div>
                </div>
                <button 
                  className="btn btn-danger btn-icon" 
                  style={{ borderRadius: '12px', padding: '16px' }}
                  onClick={() => window.location.href = `tel:${contact.number}`}
                >
                   📞
                </button>
             </div>
           ))
         ) : (
           <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏜️</div>
              <p>No results found for your search.</p>
           </div>
         )}
      </div>

      <div style={{ marginTop: '64px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>🛡️ Immediate Action Tips</h2>
          <div className="grid-3">
             {[
               { title: 'Stay Calm', desc: 'Regulate your breathing. Panic can cloud judgment in emergencies.' },
               { title: 'Track Time', desc: 'Note the exact time symptoms started or the incident occurred.' },
               { title: 'Gather Info', desc: 'Keep allergies, blood group, and current medications ready for responders.' }
             ].map((tip, i) => (
               <div key={i} className="glass-card" style={{ padding: '24px' }}>
                  <h4 style={{ fontWeight: 700, marginBottom: '10px', color: 'var(--primary-deep)' }}>{tip.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{tip.desc}</p>
               </div>
             ))}
          </div>
      </div>

      <footer style={{ marginTop: '80px', padding: '40px', background: 'rgba(229,62,62,0.05)', borderRadius: '24px', textAlign: 'center', border: '1px solid rgba(229,62,62,0.1)' }}>
         <h4 style={{ marginBottom: '12px', fontWeight: 700 }}>Is this a life-threatening situation?</h4>
         <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Do not wait. Dial 112 or your local ambulance service immediately.</p>
         <button 
            className="btn btn-danger btn-lg" 
            style={{ padding: '18px 64px' }}
            onClick={() => window.location.href = `tel:112`}
         >
            ⚡ Call Emergency (112)
         </button>
      </footer>
    </div>
  );
}
