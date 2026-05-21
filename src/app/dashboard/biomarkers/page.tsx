'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import BiomarkerTrends from '@/components/BiomarkerTrends';
import {
  Activity,
  TrendingUp,
  Heart,
  Droplet,
  Beaker,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import Link from 'next/link';

/* ─── Fallback normal ranges (mirrors BiomarkerTrends) ──────────────── */

const NORMAL_RANGES: Record<string, { low: number; high: number; unit: string }> = {
  'Hemoglobin': { low: 12.0, high: 17.5, unit: 'g/dL' },
  'HbA1c': { low: 4.0, high: 5.7, unit: '%' },
  'Blood Glucose': { low: 70, high: 100, unit: 'mg/dL' },
  'Fasting Blood Sugar': { low: 70, high: 100, unit: 'mg/dL' },
  'Random Blood Sugar': { low: 70, high: 140, unit: 'mg/dL' },
  'Total Cholesterol': { low: 125, high: 200, unit: 'mg/dL' },
  'HDL Cholesterol': { low: 40, high: 60, unit: 'mg/dL' },
  'LDL Cholesterol': { low: 0, high: 100, unit: 'mg/dL' },
  'Triglycerides': { low: 0, high: 150, unit: 'mg/dL' },
  'Creatinine': { low: 0.6, high: 1.2, unit: 'mg/dL' },
  'Urea': { low: 7, high: 20, unit: 'mg/dL' },
  'Bilirubin': { low: 0.1, high: 1.2, unit: 'mg/dL' },
  'SGOT': { low: 5, high: 40, unit: 'U/L' },
  'SGPT': { low: 7, high: 56, unit: 'U/L' },
  'Alkaline Phosphatase': { low: 44, high: 147, unit: 'U/L' },
  'TSH': { low: 0.4, high: 4.0, unit: 'mIU/L' },
  'T3': { low: 80, high: 200, unit: 'ng/dL' },
  'T4': { low: 5.1, high: 14.1, unit: 'ug/dL' },
  'Vitamin D': { low: 30, high: 100, unit: 'ng/mL' },
  'Vitamin B12': { low: 200, high: 900, unit: 'pg/mL' },
  'Iron': { low: 60, high: 170, unit: 'ug/dL' },
  'Calcium': { low: 8.5, high: 10.5, unit: 'mg/dL' },
  'White Blood Cell Count': { low: 4000, high: 11000, unit: '/uL' },
  'WBC': { low: 4000, high: 11000, unit: '/uL' },
  'Platelets': { low: 150000, high: 400000, unit: '/uL' },
  'RBC': { low: 4.5, high: 5.5, unit: 'million/uL' },
  'Uric Acid': { low: 3.5, high: 7.2, unit: 'mg/dL' },
  'ESR': { low: 0, high: 20, unit: 'mm/hr' },
};

function findNormalRange(biomarker: string): { low: number; high: number; unit: string } | null {
  const lower = biomarker.toLowerCase();
  for (const [key, range] of Object.entries(NORMAL_RANGES)) {
    const keyLower = key.toLowerCase();
    if (lower.includes(keyLower) || keyLower.includes(lower)) {
      return range;
    }
  }
  return null;
}

/* ─── Types ─────────────────────────────────────────────────────────── */

interface BiomarkerRow {
  id: string;
  biomarker: string;
  value: number;
  unit: string;
  recorded_at: string;
  user_id: string;
  normal_low?: number;
  normal_high?: number;
}

/* ─── Priority biomarkers for ordering ──────────────────────────────── */

const PRIORITY_BIOMARKERS = [
  'Hemoglobin',
  'Blood Glucose',
  'HbA1c',
  'Fasting Blood Sugar',
  'Total Cholesterol',
  'Creatinine',
  'TSH',
  'Vitamin D',
  'Vitamin B12',
];

/* ─── Summary Card ──────────────────────────────────────────────────── */

function SummaryCard({
  icon,
  value,
  label,
  accent,
  delay,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  accent: string;
  delay: number;
}) {
  return (
    <div
      className="glass-card animate-fadeInUp"
      style={{
        padding: '22px 24px',
        border: '1.5px solid rgba(255, 255, 255, 0.95)',
        background: 'rgba(255, 255, 255, 0.65)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        animationDelay: `${delay}s`,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 11,
          background: 'white',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 12px ${accent}08`,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: '1.5rem',
            fontWeight: 850,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: '0.73rem',
            color: '#94A3B8',
            fontWeight: 700,
            letterSpacing: '0.02em',
            marginTop: 4,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

/* ─── Page Component ────────────────────────────────────────────────── */

export default function BiomarkerDashboard() {
  const { user } = useAuth();
  const [allData, setAllData] = useState<BiomarkerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('');

  /* Fetch all biomarker data for user */
  useEffect(() => {
    async function fetchAll() {
      if (!user?.userId) return;
      setLoading(true);

      // 1. Try to fetch from biomarker_history first
      const { data: bData, error: bError } = await supabase
        .from('biomarker_history')
        .select('*')
        .eq('user_id', user.userId)
        .order('recorded_at', { ascending: false });

      if (!bError && bData && bData.length > 0) {
        setAllData((bData as BiomarkerRow[]) || []);
        setLoading(false);
        return;
      }

      // 2. Fall back to parsing medical_documents
      console.log('[BiomarkersDashboard] Falling back to medical_documents parsing...');
      const { data: docs, error: docError } = await supabase
        .from('medical_documents')
        .select('*')
        .eq('user_id', user.userId)
        .eq('type', 'report')
        .order('created_at', { ascending: false });

      if (docError) {
        console.error('Error fetching reports for biomarkers:', docError);
        setAllData([]);
      } else {
        const rows: BiomarkerRow[] = [];
        docs?.forEach((doc: any) => {
          const analysis = doc.analysis_json;
          if (analysis && Array.isArray(analysis.results)) {
            analysis.results.forEach((r: any) => {
              if (r.name && r.value != null && !isNaN(Number(r.value))) {
                const low = r.range && Array.isArray(r.range) && r.range[0] != null ? Number(r.range[0]) : undefined;
                const high = r.range && Array.isArray(r.range) && r.range[1] != null ? Number(r.range[1]) : undefined;
                
                rows.push({
                  id: `${doc.id}-${r.name}`,
                  biomarker: r.name,
                  value: Number(r.value),
                  unit: r.unit || '',
                  recorded_at: doc.created_at,
                  user_id: doc.user_id,
                  normal_low: low,
                  normal_high: high,
                });
              }
            });
          }
        });
        setAllData(rows);
      }
      setLoading(false);
    }
    fetchAll();
  }, [user?.userId]);

  /* Unique biomarkers, ordered by priority */
  const biomarkerNames = (() => {
    const unique = Array.from(new Set(allData.map((r) => r.biomarker)));
    const priority: string[] = [];
    const rest: string[] = [];
    unique.forEach((name) => {
      const isPriority = PRIORITY_BIOMARKERS.some(
        (p) =>
          p.toLowerCase() === name.toLowerCase() ||
          name.toLowerCase().includes(p.toLowerCase())
      );
      if (isPriority) priority.push(name);
      else rest.push(name);
    });
    return [...priority, ...rest.sort()];
  })();

  /* Auto-select first biomarker */
  useEffect(() => {
    if (!selected && biomarkerNames.length > 0) {
      setSelected(biomarkerNames[0]);
    }
  }, [biomarkerNames, selected]);

  /* Summary Stats */
  const totalBiomarkers = biomarkerNames.length;

  const latestReportDate = (() => {
    if (allData.length === 0) return '—';
    const d = new Date(allData[0].recorded_at);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  })();

  /* Per-biomarker latest values for normal/attention counts */
  const latestPerBiomarker: Record<string, BiomarkerRow> = {};
  allData.forEach((row) => {
    if (!latestPerBiomarker[row.biomarker]) {
      latestPerBiomarker[row.biomarker] = row; // Already sorted desc
    }
  });

  const normalCount = Object.values(latestPerBiomarker).filter((row) => {
    const range =
      row.normal_low != null && row.normal_high != null
        ? { low: row.normal_low, high: row.normal_high }
        : findNormalRange(row.biomarker);
    if (!range) return true; // Unknown range treated as OK
    return row.value >= range.low && row.value <= range.high;
  }).length;

  const attentionCount = totalBiomarkers - normalCount;

  /* Quick Stats for selected biomarker */
  const selectedData = allData
    .filter((r) => r.biomarker === selected)
    .sort(
      (a, b) =>
        new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );

  const quickStats = (() => {
    if (selectedData.length === 0) return null;
    const values = selectedData.map((d) => d.value);
    const latest = selectedData[selectedData.length - 1];
    const range = findNormalRange(selected);
    const latestInRange = range
      ? latest.value >= range.low && latest.value <= range.high
      : true;

    const firstDate = new Date(selectedData[0].recorded_at);
    const lastDate = new Date(latest.recorded_at);
    const fmt = (d: Date) =>
      d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

    return {
      latestValue: latest.value,
      latestUnit: latest.unit || range?.unit || '',
      latestInRange,
      highest: Math.max(...values),
      lowest: Math.min(...values),
      readings: selectedData.length,
      dateRange: `${fmt(firstDate)} — ${fmt(lastDate)}`,
    };
  })();

  /* ── Render ──────────────────────────────────────────────────────── */

  /* Empty State */
  if (!loading && allData.length === 0) {
    return (
      <div className="page-fade">
        <div
          className="glass-card animate-fadeInUp"
          style={{
            padding: '64px 32px',
            textAlign: 'center',
            borderRadius: 20,
            background: 'white',
            border: '1.5px solid rgba(226, 232, 240, 0.7)',
            maxWidth: 520,
            margin: '60px auto',
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background:
                'linear-gradient(135deg, rgba(30, 58, 138, 0.08), rgba(179, 143, 93, 0.08))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <Activity style={{ width: 32, height: 32, color: '#1E3A8A' }} />
          </div>
          <h2
            style={{
              fontSize: '1.4rem',
              fontWeight: 850,
              color: '#0F172A',
              marginBottom: 10,
              letterSpacing: '-0.02em',
            }}
          >
            No Biomarker Data Yet
          </h2>
          <p
            style={{
              fontSize: '0.92rem',
              color: '#94A3B8',
              lineHeight: 1.6,
              marginBottom: 28,
              maxWidth: 400,
              margin: '0 auto 28px',
            }}
          >
            Upload a lab report to start tracking your health trends.
            We&apos;ll automatically extract biomarkers and chart them over
            time.
          </p>
          <Link
            href="/dashboard/reports"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 28px',
              borderRadius: 100,
              background: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.88rem',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(30, 58, 138, 0.25)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
          >
            <Beaker style={{ width: 16, height: 16, color: '#B38F5D' }} />
            Upload Lab Report
            <ChevronRight style={{ width: 15, height: 15 }} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-fade">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <header style={{ marginBottom: 36 }}>
        <h1
          style={{
            fontSize: '2.1rem',
            fontWeight: 850,
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}
        >
          <span
            style={{
              background: 'linear-gradient(135deg, #1E3A8A 30%, #B38F5D 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Biomarker Trends
          </span>
        </h1>
        <p
          style={{
            color: '#94A3B8',
            fontSize: '0.92rem',
            fontWeight: 500,
          }}
        >
          Track your longitudinal health markers over time
        </p>
      </header>

      {/* ── Loading ─────────────────────────────────────────────────── */}
      {loading && (
        <div
          style={{
            height: 320,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '3px solid rgba(30, 58, 138, 0.12)',
              borderTopColor: '#1E3A8A',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        </div>
      )}

      {!loading && allData.length > 0 && (
        <>
          {/* ── Summary Cards ───────────────────────────────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 18,
              marginBottom: 32,
            }}
          >
            <SummaryCard
              icon={
                <Activity style={{ width: 20, height: 20, color: '#1E3A8A' }} />
              }
              value={totalBiomarkers}
              label="Biomarkers Tracked"
              accent="#1E3A8A"
              delay={0}
            />
            <SummaryCard
              icon={
                <Droplet style={{ width: 20, height: 20, color: '#B38F5D' }} />
              }
              value={latestReportDate}
              label="Latest Report Date"
              accent="#B38F5D"
              delay={0.08}
            />
            <SummaryCard
              icon={
                <CheckCircle
                  style={{ width: 20, height: 20, color: '#10B981' }}
                />
              }
              value={normalCount}
              label="Normal Values"
              accent="#10B981"
              delay={0.16}
            />
            <SummaryCard
              icon={
                <AlertTriangle
                  style={{ width: 20, height: 20, color: '#DC2626' }}
                />
              }
              value={attentionCount}
              label="Attention Needed"
              accent="#DC2626"
              delay={0.24}
            />
          </div>

          {/* ── Biomarker Selector ──────────────────────────────────── */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#94A3B8',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 10,
              }}
            >
              Select Biomarker
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              {biomarkerNames.map((name) => {
                const isActive = name === selected;
                const latest = latestPerBiomarker[name];
                const range = findNormalRange(name);
                const inRange =
                  latest && range
                    ? latest.value >= range.low && latest.value <= range.high
                    : true;
                return (
                  <button
                    key={name}
                    onClick={() => setSelected(name)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 100,
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: isActive
                        ? '1.5px solid #1E3A8A'
                        : '1.5px solid rgba(226, 232, 240, 0.8)',
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.08), rgba(179, 143, 93, 0.04))'
                        : 'white',
                      color: isActive ? '#1E3A8A' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: isActive
                        ? '0 2px 8px rgba(30, 58, 138, 0.10)'
                        : 'none',
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: inRange ? '#10B981' : '#DC2626',
                        display: 'inline-block',
                        flexShrink: 0,
                      }}
                    />
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Chart ───────────────────────────────────────────────── */}
          {selected && (
            <div className="animate-fadeInUp" style={{ marginBottom: 28 }}>
              <BiomarkerTrends
                biomarker={selected}
                userId={user?.userId}
              />
            </div>
          )}

          {/* ── Quick Stats Panel ───────────────────────────────────── */}
          {quickStats && (
            <div
              className="glass-card animate-fadeInUp"
              style={{
                padding: '24px 28px',
                borderRadius: 20,
                background: 'white',
                border: '1.5px solid rgba(226, 232, 240, 0.7)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                <TrendingUp
                  style={{ width: 18, height: 18, color: '#1E3A8A' }}
                />
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: '#0F172A',
                    margin: 0,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Quick Statistics — {selected}
                </h3>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fill, minmax(170px, 1fr))',
                  gap: 16,
                }}
              >
                {/* Latest Value */}
                <div
                  style={{
                    padding: '16px 18px',
                    borderRadius: 14,
                    background: quickStats.latestInRange
                      ? 'rgba(16, 185, 129, 0.05)'
                      : 'rgba(220, 38, 38, 0.05)',
                    border: `1px solid ${
                      quickStats.latestInRange
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'rgba(220, 38, 38, 0.15)'
                    }`,
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: '#94A3B8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: 6,
                    }}
                  >
                    Latest Value
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '1.3rem',
                        fontWeight: 850,
                        color: quickStats.latestInRange
                          ? '#0F172A'
                          : '#DC2626',
                      }}
                    >
                      {quickStats.latestValue}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#94A3B8',
                      }}
                    >
                      {quickStats.latestUnit}
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        padding: '2px 8px',
                        borderRadius: 100,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: quickStats.latestInRange
                          ? '#10B981'
                          : '#DC2626',
                        background: quickStats.latestInRange
                          ? 'rgba(16, 185, 129, 0.10)'
                          : 'rgba(220, 38, 38, 0.10)',
                      }}
                    >
                      {quickStats.latestInRange ? (
                        <CheckCircle style={{ width: 11, height: 11 }} />
                      ) : (
                        <AlertTriangle style={{ width: 11, height: 11 }} />
                      )}
                      {quickStats.latestInRange ? 'Normal' : 'Abnormal'}
                    </span>
                  </div>
                </div>

                {/* Highest */}
                <div
                  style={{
                    padding: '16px 18px',
                    borderRadius: 14,
                    background: 'rgba(217, 119, 6, 0.04)',
                    border: '1px solid rgba(217, 119, 6, 0.12)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: '#94A3B8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: 6,
                    }}
                  >
                    Highest Recorded
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <ArrowUpRight
                      style={{ width: 16, height: 16, color: '#D97706' }}
                    />
                    <span
                      style={{
                        fontSize: '1.3rem',
                        fontWeight: 850,
                        color: '#0F172A',
                      }}
                    >
                      {quickStats.highest}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#94A3B8',
                      }}
                    >
                      {quickStats.latestUnit}
                    </span>
                  </div>
                </div>

                {/* Lowest */}
                <div
                  style={{
                    padding: '16px 18px',
                    borderRadius: 14,
                    background: 'rgba(13, 148, 136, 0.04)',
                    border: '1px solid rgba(13, 148, 136, 0.12)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: '#94A3B8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: 6,
                    }}
                  >
                    Lowest Recorded
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <ArrowDownRight
                      style={{ width: 16, height: 16, color: '#0D9488' }}
                    />
                    <span
                      style={{
                        fontSize: '1.3rem',
                        fontWeight: 850,
                        color: '#0F172A',
                      }}
                    >
                      {quickStats.lowest}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#94A3B8',
                      }}
                    >
                      {quickStats.latestUnit}
                    </span>
                  </div>
                </div>

                {/* Number of Readings */}
                <div
                  style={{
                    padding: '16px 18px',
                    borderRadius: 14,
                    background: 'rgba(30, 58, 138, 0.04)',
                    border: '1px solid rgba(30, 58, 138, 0.10)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: '#94A3B8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: 6,
                    }}
                  >
                    Total Readings
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Heart
                      style={{ width: 16, height: 16, color: '#1E3A8A' }}
                    />
                    <span
                      style={{
                        fontSize: '1.3rem',
                        fontWeight: 850,
                        color: '#0F172A',
                      }}
                    >
                      {quickStats.readings}
                    </span>
                  </div>
                </div>

                {/* Date Range */}
                <div
                  style={{
                    padding: '16px 18px',
                    borderRadius: 14,
                    background: 'rgba(179, 143, 93, 0.04)',
                    border: '1px solid rgba(179, 143, 93, 0.12)',
                    gridColumn: 'span 2',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: '#94A3B8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: 6,
                    }}
                  >
                    Date Range
                  </div>
                  <div
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: '#0F172A',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {quickStats.dateRange}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
