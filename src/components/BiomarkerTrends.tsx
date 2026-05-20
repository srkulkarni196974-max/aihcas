import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { supabase } from '@/lib/supabase';
import { TrendingUp } from 'lucide-react';

interface BiomarkerRecord {
  id: string;
  biomarker: string;
  value: number;
  unit: string;
  recorded_at: string; // ISO timestamp
}

interface Props {
  biomarker: string;
}

export default function BiomarkerTrends({ biomarker }: Props) {
  const [data, setData] = useState<BiomarkerRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: records, error } = await supabase
        .from('biomarker_history')
        .select('*')
        .eq('biomarker', biomarker)
        .order('recorded_at', { ascending: true });
      if (error) {
        console.error('Biomarker fetch error:', error);
      } else {
        setData(records as BiomarkerRecord[]);
      }
      setLoading(false);
    }
    if (biomarker) fetchData();
  }, [biomarker]);

  // Compute dynamic range based on user's data
  const values = data.map(d => d.value);
  const minVal = values.length ? Math.min(...values) : 0;
  const maxVal = values.length ? Math.max(...values) : 0;
  // Expand range a bit for visual padding
  const rangePadding = (maxVal - minVal) * 0.1 || 1;
  const normalRange = {
    low: minVal - rangePadding,
    high: maxVal + rangePadding,
    unit: '',
  };

  const chartData = data.map(d => ({
    date: new Date(d.recorded_at).toLocaleDateString(),
    value: d.value,
  }));

  return (
    <div className="glass-card" style={{ padding: '24px', background: 'white' }}>
      <h3 style={{ marginBottom: 12, fontSize: '1rem', fontWeight: 800, color: 'var(--text-dark)' }}>
        {biomarker} Trend
        <TrendingUp className="w-5 h-5 inline-block ml-2 text-[#1E3A8A]" />
      </h3>
      {loading ? (
        <p>Loading chart...</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            {/* Green normal range */}
            <ReferenceArea
              y1={normalRange.low}
              y2={normalRange.high}
              fill="rgba(16,185,129,0.12)"
              stroke="none"
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#1E3A8A"
              strokeWidth={2}
              dot={{ r: 4, fill: '#DC2626', stroke: 'white', strokeWidth: 1 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
