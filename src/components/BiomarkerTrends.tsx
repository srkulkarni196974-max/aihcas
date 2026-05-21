'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

/* ─── Types ─────────────────────────────────────────────────────────── */

interface Props {
  biomarker: string;
  userId?: string;
}

interface BiomarkerRecord {
  id: string;
  biomarker: string;
  value: number;
  unit: string;
  recorded_at: string;
  normal_low?: number;
  normal_high?: number;
}

/* ─── Normal Range Lookup ───────────────────────────────────────────── */

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

/** Case-insensitive fuzzy match: checks if biomarker includes key or vice versa */
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

/* ─── Custom Tooltip ────────────────────────────────────────────────── */

interface TooltipPayloadItem {
  value: number;
  payload: { date: string; value: number; isNormal: boolean };
}

function CustomTooltip({
  active,
  payload,
  normalRange,
  unit,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  normalRange: { low: number; high: number } | null;
  unit: string;
}) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  const val = data.value;
  const dateStr = data.payload.date;

  let status: 'Normal' | 'High' | 'Low' = 'Normal';
  let statusColor = '#10B981';
  if (normalRange) {
    if (val > normalRange.high) {
      status = 'High';
      statusColor = '#DC2626';
    } else if (val < normalRange.low) {
      status = 'Low';
      statusColor = '#D97706';
    }
  }

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1.5px solid rgba(226, 232, 240, 0.8)',
        borderRadius: 14,
        padding: '14px 18px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        minWidth: 160,
      }}
    >
      <div
        style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#94A3B8',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: 6,
        }}
      >
        {dateStr}
      </div>
      <div
        style={{
          fontSize: '1.25rem',
          fontWeight: 850,
          color: '#0F172A',
          letterSpacing: '-0.02em',
        }}
      >
        {val}
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#94A3B8',
            marginLeft: 4,
          }}
        >
          {unit}
        </span>
      </div>
      {normalRange && (
        <div
          style={{
            marginTop: 8,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 10px',
            borderRadius: 100,
            fontSize: '0.72rem',
            fontWeight: 700,
            color: statusColor,
            background:
              status === 'Normal'
                ? 'rgba(16, 185, 129, 0.10)'
                : status === 'High'
                ? 'rgba(220, 38, 38, 0.10)'
                : 'rgba(217, 119, 6, 0.10)',
          }}
        >
          {status === 'Normal' ? (
            <CheckCircle style={{ width: 12, height: 12 }} />
          ) : (
            <AlertTriangle style={{ width: 12, height: 12 }} />
          )}
          {status}
        </div>
      )}
    </div>
  );
}

/* ─── Custom Dot ────────────────────────────────────────────────────── */

interface DotProps {
  cx?: number;
  cy?: number;
  payload?: { isNormal: boolean };
}

function CustomDot({ cx, cy, payload }: DotProps) {
  if (cx == null || cy == null || !payload) return null;
  const color = payload.isNormal ? '#10B981' : '#DC2626';
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4.5}
      fill={color}
      stroke="white"
      strokeWidth={2}
      style={{ filter: `drop-shadow(0 1px 3px ${color}40)` }}
    />
  );
}

/* ─── Main Component ────────────────────────────────────────────────── */

export default function BiomarkerTrends({ biomarker, userId }: Props) {
  const [data, setData] = useState<BiomarkerRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      let query = supabase
        .from('biomarker_history')
        .select('*')
        .eq('biomarker', biomarker)
        .order('recorded_at', { ascending: true });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: records, error } = await query;
      if (error) {
        console.error('Biomarker fetch error:', error);
      } else {
        setData((records as BiomarkerRecord[]) || []);
      }
      setLoading(false);
    }
    if (biomarker) fetchData();
  }, [biomarker, userId]);

  /* Derive normal range from data or fallback map */
  const normalRange = useMemo(() => {
    // Check if data rows carry embedded range
    const withRange = data.find(
      (d) => d.normal_low != null && d.normal_high != null
    );
    if (withRange) {
      return { low: withRange.normal_low!, high: withRange.normal_high! };
    }
    const fallback = findNormalRange(biomarker);
    return fallback ? { low: fallback.low, high: fallback.high } : null;
  }, [data, biomarker]);

  const unit = useMemo(() => {
    if (data.length > 0) return data[0].unit;
    const fallback = findNormalRange(biomarker);
    return fallback?.unit ?? '';
  }, [data, biomarker]);

  /* Chart data */
  const chartData = useMemo(() => {
    return data.map((d) => {
      const dateObj = new Date(d.recorded_at);
      const day = String(dateObj.getDate()).padStart(2, '0');
      const mon = dateObj.toLocaleString('en-US', { month: 'short' });
      const isNormal = normalRange
        ? d.value >= normalRange.low && d.value <= normalRange.high
        : true;
      return {
        date: `${day} ${mon}`,
        value: d.value,
        isNormal,
      };
    });
  }, [data, normalRange]);

  /* Trend logic */
  const trend = useMemo<{
    direction: 'up' | 'down' | 'stable';
    improving: boolean;
  } | null>(() => {
    if (data.length < 2 || !normalRange) return null;
    const prev = data[data.length - 2].value;
    const curr = data[data.length - 1].value;
    if (curr === prev) return { direction: 'stable', improving: true };

    const midNormal = (normalRange.low + normalRange.high) / 2;
    const prevDist = Math.abs(prev - midNormal);
    const currDist = Math.abs(curr - midNormal);
    const improving = currDist < prevDist;
    return {
      direction: curr > prev ? 'up' : 'down',
      improving,
    };
  }, [data, normalRange]);

  const latestValue = data.length > 0 ? data[data.length - 1].value : null;
  const latestIsNormal =
    latestValue != null && normalRange
      ? latestValue >= normalRange.low && latestValue <= normalRange.high
      : true;

  /* Y-axis domain with padding */
  const yDomain = useMemo(() => {
    const allVals = data.map((d) => d.value);
    if (normalRange) {
      allVals.push(normalRange.low, normalRange.high);
    }
    if (allVals.length === 0) return [0, 100];
    const min = Math.min(...allVals);
    const max = Math.max(...allVals);
    const pad = (max - min) * 0.15 || max * 0.1 || 10;
    return [Math.max(0, min - pad), max + pad];
  }, [data, normalRange]);

  /* ── Render ──────────────────────────────────────────────────────── */

  return (
    <div
      className="glass-card"
      style={{
        padding: 28,
        borderRadius: 20,
        background: 'white',
        border: '1.5px solid rgba(226, 232, 240, 0.7)',
      }}
    >
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        {/* Left: name + unit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h3
            style={{
              fontSize: '1.15rem',
              fontWeight: 850,
              color: '#0F172A',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            {biomarker}
          </h3>
          {unit && (
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#64748B',
                background: 'rgba(30, 58, 138, 0.06)',
                padding: '3px 10px',
                borderRadius: 100,
                letterSpacing: '0.02em',
              }}
            >
              {unit}
            </span>
          )}
          {/* Trend indicator */}
          {trend && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.72rem',
                fontWeight: 700,
                color: trend.improving ? '#10B981' : '#DC2626',
                background: trend.improving
                  ? 'rgba(16, 185, 129, 0.10)'
                  : 'rgba(220, 38, 38, 0.10)',
                padding: '3px 10px',
                borderRadius: 100,
              }}
            >
              {trend.direction === 'up' ? (
                <ArrowUp style={{ width: 13, height: 13 }} />
              ) : trend.direction === 'down' ? (
                <ArrowDown style={{ width: 13, height: 13 }} />
              ) : null}
              {trend.improving ? (
                <TrendingUp style={{ width: 14, height: 14 }} />
              ) : (
                <TrendingDown style={{ width: 14, height: 14 }} />
              )}
            </span>
          )}
        </div>

        {/* Right: latest value */}
        {latestValue != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: '1.45rem',
                fontWeight: 850,
                color: latestIsNormal ? '#0F172A' : '#DC2626',
                letterSpacing: '-0.03em',
              }}
            >
              {latestValue}
            </span>
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: latestIsNormal
                  ? 'rgba(16, 185, 129, 0.12)'
                  : 'rgba(220, 38, 38, 0.12)',
              }}
            >
              {latestIsNormal ? (
                <CheckCircle
                  style={{ width: 14, height: 14, color: '#10B981' }}
                />
              ) : (
                <AlertTriangle
                  style={{ width: 14, height: 14, color: '#DC2626' }}
                />
              )}
            </span>
          </div>
        )}
      </div>

      {/* Chart Area */}
      {loading ? (
        <div
          style={{
            height: 280,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '3px solid rgba(30, 58, 138, 0.12)',
              borderTopColor: '#1E3A8A',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        </div>
      ) : chartData.length === 0 ? (
        <div
          style={{
            height: 280,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgba(30, 58, 138, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp style={{ width: 22, height: 22, color: '#94A3B8' }} />
          </div>
          <p
            style={{
              fontSize: '0.88rem',
              color: '#94A3B8',
              fontWeight: 600,
              margin: 0,
            }}
          >
            No trend data available for {biomarker}
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 12, left: -8, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E2E8F0"
              opacity={0.08}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0', strokeWidth: 1 }}
            />
            <YAxis
              domain={yDomain}
              tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={
                <CustomTooltip normalRange={normalRange} unit={unit} />
              }
              cursor={{
                stroke: 'rgba(30, 58, 138, 0.12)',
                strokeWidth: 1,
                strokeDasharray: '4 4',
              }}
            />
            {/* Normal range band */}
            {normalRange && (
              <ReferenceArea
                y1={normalRange.low}
                y2={normalRange.high}
                fill="rgba(16, 185, 129, 0.10)"
                stroke="none"
                label={{
                  value: 'Normal Range',
                  position: 'insideTopRight',
                  style: {
                    fontSize: 10,
                    fill: '#10B981',
                    fontWeight: 700,
                    opacity: 0.7,
                  },
                }}
              />
            )}
            {/* Midline reference */}
            {normalRange && (
              <ReferenceLine
                y={(normalRange.low + normalRange.high) / 2}
                stroke="rgba(16, 185, 129, 0.25)"
                strokeDasharray="6 4"
                strokeWidth={1}
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#1E3A8A"
              strokeWidth={2.5}
              dot={<CustomDot />}
              activeDot={{
                r: 7,
                stroke: '#1E3A8A',
                strokeWidth: 2,
                fill: 'white',
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Legend Row */}
      {chartData.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginTop: 16,
            paddingTop: 14,
            borderTop: '1px solid rgba(226, 232, 240, 0.5)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.73rem',
              color: '#94A3B8',
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: 'rgba(16, 185, 129, 0.25)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'inline-block',
              }}
            />
            Normal Range
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.73rem',
              color: '#94A3B8',
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#10B981',
                display: 'inline-block',
              }}
            />
            Within Range
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.73rem',
              color: '#94A3B8',
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#DC2626',
                display: 'inline-block',
              }}
            />
            Abnormal
          </div>
        </div>
      )}
    </div>
  );
}
