'use client';
import { useEffect, useState } from 'react';
import BiomarkerTrends from '@/components/BiomarkerTrends';
import { supabase } from '@/lib/supabase';

export default function BiomarkerDashboard() {
  const [records, setRecords] = useState<{ biomarker: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const { data, error } = await supabase
        .from('biomarker_history')
        .select('biomarker')
        .order('recorded_at', { ascending: false });
      if (error) console.error('Error fetching biomarkers', error);
      else setRecords(data || []);
      setLoading(false);
    }
    fetchAll();
  }, []);

  const biomarkerOptions = Array.from(new Set(records.map((r: any) => r.biomarker)));

  return (
    <div className="glass-card" style={{ padding: '24px', background: 'white' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '16px' }}>Biomarker Trends</h2>
      {loading ? (
        <p>Loading biomarkers…</p>
      ) : (
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          className="glass-input"
          style={{ padding: '8px', marginBottom: '24px', borderRadius: '8px' }}
        >
          <option value="" disabled>Select a biomarker</option>
          {biomarkerOptions.map(b => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      )}
      {selected && <BiomarkerTrends biomarker={selected} />}
    </div>
  );
}
