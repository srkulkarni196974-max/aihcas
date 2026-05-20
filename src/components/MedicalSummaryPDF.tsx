'use client';

import React from 'react';

interface MedicalSummaryPDFProps {
  data: {
    profile?: any;
    prescriptions?: any[];
    pathologyReports?: any[];
    chatMessages?: any[];
    synthesis?: string;
    triageLevel?: string;
  };
}

export default function MedicalSummaryPDF({ data }: MedicalSummaryPDFProps) {
  const {
    profile,
    prescriptions = [],
    pathologyReports = [],
    synthesis = "No clinical synthesis compiled.",
    triageLevel = "consult"
  } = data;

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const bmi = profile?.height && profile?.weight
    ? (parseFloat(profile.weight) / Math.pow(parseFloat(profile.height) / 100, 2)).toFixed(1)
    : null;

  // Extract unique medications from prescription documents
  const allMeds: any[] = [];
  prescriptions.forEach((doc: any) => {
    const meds = doc.analysis_json?.medications;
    if (Array.isArray(meds)) {
      meds.forEach((m: any) => {
        if (m.name && !allMeds.some(existing => existing.name.toLowerCase() === m.name.toLowerCase())) {
          allMeds.push(m);
        }
      });
    }
  });

  // Extract pathology parameters
  const allLabTests: any[] = [];
  pathologyReports.forEach((doc: any) => {
    const results = doc.analysis_json?.results;
    if (Array.isArray(results)) {
      results.forEach((r: any) => {
        if (r.name && !allLabTests.some(existing => existing.name.toLowerCase() === r.name.toLowerCase())) {
          allLabTests.push(r);
        }
      });
    }
  });

  // Unique report ID
  const reportId = `AIHCAS-SR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Triage Config
  const triageConfig: Record<string, { label: string; color: string; bg: string }> = {
    emergency: { label: 'CRITICAL / EMERGENCY DISPATCH', color: '#DC2626', bg: '#FEE2E2' },
    consult: { label: 'ROUTINE CLINICAL CONSULTATION', color: '#D97706', bg: '#FEF3C7' },
    self: { label: 'GENERAL WELLNESS / SELF-CARE', color: '#0D9488', bg: '#CCFBF1' }
  };

  const triage = triageConfig[triageLevel] || triageConfig.consult;

  return (
    <div 
      id="report-pdf-content"
      style={{
        padding: '32px',
        background: '#FFFFFF',
        color: '#1E293B',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: '1.5',
        width: '790px', // Standard letter width at 96 DPI
        margin: '0 auto',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Hospital-grade Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1E3A8A', paddingBottom: '16px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 800, color: '#1E3A8A', letterSpacing: '-0.5px' }}>
            AIHCAS CLINICAL COLLABORATION SUMMARY
          </h1>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#B38F5D', textTransform: 'uppercase', letterSpacing: '1px' }}>
            INTEGRATED PATIENT PORTFOLIO REPORT
          </span>
        </div>
        <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
          <div><strong>Report ID:</strong> {reportId}</div>
          <div><strong>Generated:</strong> {today}</div>
          <div><strong>Status:</strong> SECURE TRANSCRIPT</div>
        </div>
      </div>

      {/* 2. Patient Demographics & Key Parameters */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 800, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          I. Patient Parameters
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px', borderRadius: '8px' }}>
          <div>
            <span style={{ display: 'block', fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Full Name</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>{profile?.full_name || "Authorized Patient"}</span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Age / Gender</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
              {profile?.age ? `${profile.age} yrs` : "N/A"} / {profile?.gender || "N/A"}
            </span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Blood Group</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>{profile?.blood_group || "N/A"}</span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>BMI / Metabolic Tag</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
              {bmi ? `${bmi} kg/m²` : "N/A"}
            </span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Height</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>{profile?.height ? `${profile.height} cm` : "N/A"}</span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Weight</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>{profile?.weight ? `${profile.weight} kg` : "N/A"}</span>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <span style={{ display: 'block', fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Emergency Proxy</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
              {profile?.emergency_contact_name ? `${profile.emergency_contact_name} (${profile.emergency_contact_phone})` : "None Registered"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Executive Clinical Synthesis */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 800, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          II. Executive Clinical Synthesis
        </h3>
        <div style={{ borderLeft: '4px solid #1E3A8A', background: '#F0F4F8', padding: '16px', borderRadius: '0 8px 8px 0', textAlign: 'left' }}>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#1E293B', fontWeight: 600, lineHeight: 1.6 }}>
            {synthesis}
          </p>
        </div>
      </div>

      {/* 4. Active Pharmaceutical Regime */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 800, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          III. Active Pharmaceutical Routine
        </h3>
        {allMeds.length === 0 ? (
          <div style={{ border: '1.5px dashed #E2E8F0', padding: '16px', borderRadius: '8px', textAlign: 'center', color: '#64748B', fontSize: '12px', fontWeight: 600 }}>
            No parsed pharmaceutical charts or medications registered on record.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', textAlign: 'left' }}>Medication Name</th>
                <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', textAlign: 'left' }}>Drug Class</th>
                <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', textAlign: 'center' }}>Dosage &amp; Timing</th>
                <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', textAlign: 'left' }}>Special Instructions</th>
              </tr>
            </thead>
            <tbody>
              {allMeds.map((med, i) => (
                <tr key={i} style={{ borderBottom: i < allMeds.length - 1 ? '1px solid #E2E8F0' : 'none', fontSize: '11px' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0F172A' }}>{med.name}</td>
                  <td style={{ padding: '10px 12px', color: '#475569', fontWeight: 600 }}>{med.drugClass || "N/A"}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '100px', background: '#EFF6FF', color: '#1E3A8A', fontWeight: 800, fontSize: '10px' }}>
                      {med.dosage || "OD"}
                    </span>
                    <span style={{ marginLeft: '4px', padding: '3px 8px', borderRadius: '100px', background: '#F1F5F9', color: '#475569', fontWeight: 700, fontSize: '10px' }}>
                      {med.timing}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#0D9488', fontWeight: 700 }}>{med.instructions || "As prescribed by physician"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 5. Pathology Highlights */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 800, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          IV. Laboratory Pathology Parameters
        </h3>
        {allLabTests.length === 0 ? (
          <div style={{ border: '1.5px dashed #E2E8F0', padding: '16px', borderRadius: '8px', textAlign: 'center', color: '#64748B', fontSize: '12px', fontWeight: 600 }}>
            No recent laboratory pathology data on file.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', textAlign: 'left' }}>Diagnostic Test Parameter</th>
                <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', textAlign: 'center' }}>Measured Value</th>
                <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', textAlign: 'center' }}>Reference Range</th>
                <th style={{ padding: '10px 12px', fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Status Alert</th>
              </tr>
            </thead>
            <tbody>
              {allLabTests.map((test, i) => {
                const isAbnormal = test.status === 'high' || test.status === 'low';
                const color = test.status === 'high' ? '#DC2626' : test.status === 'low' ? '#D97706' : '#0D9488';
                const bg = test.status === 'high' ? '#FEE2E2' : test.status === 'low' ? '#FEF3C7' : '#CCFBF1';
                
                return (
                  <tr key={i} style={{ borderBottom: i < allLabTests.length - 1 ? '1px solid #E2E8F0' : 'none', fontSize: '11px', background: isAbnormal ? 'rgba(241, 245, 249, 0.2)' : 'transparent' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0F172A' }}>
                      {test.name}
                      <div style={{ fontSize: '9px', color: '#64748B', fontWeight: 500, marginTop: '2px' }}>{test.interpretation}</div>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: isAbnormal ? color : '#0F172A', fontSize: '12px' }}>
                      {test.value} <span style={{ fontSize: '9px', fontWeight: 600, color: '#64748B' }}>{test.unit}</span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#475569', fontWeight: 700 }}>
                      {Array.isArray(test.range) ? `${test.range[0]} - ${test.range[1]}` : test.range || "N/A"}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '100px', background: bg, color: color, fontWeight: 800, fontSize: '9px', letterSpacing: '0.5px' }}>
                        {test.status === 'high' ? '▲ HIGH' : test.status === 'low' ? '▼ LOW' : 'NORMAL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 6. AI Triage Summary and Action Matrix */}
      <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
        <div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 800, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            V. Triage Priority Assessment
          </h3>
          <div style={{ background: triage.bg, border: `1.5px solid ${triage.color}35`, padding: '16px', borderRadius: '8px' }}>
            <span style={{ display: 'block', fontSize: '10px', fontWeight: 850, color: triage.color, letterSpacing: '1px', marginBottom: '6px' }}>
              RECOMMENDED CARE ROUTE:
            </span>
            <div style={{ fontSize: '14px', fontWeight: 900, color: triage.color }}>
              {triage.label}
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#475569', fontWeight: 600, lineHeight: '1.5' }}>
              {triageLevel === 'emergency' 
                ? 'CRITICAL ALERT: Presenting symptoms or lab markers indicate critical urgency. The patient must consult the linked physician immediately or go to the nearest emergency triage room.'
                : triageLevel === 'consult'
                ? 'CLINICAL INDICATOR: Recommended standard follow-up with the primary care physician. Please present this securely generated clinical transcript to discuss medication titration or abnormal lab findings.'
                : 'WELLNESS SYNC: Symptoms are categorized as standard or low-urgency. Monitor diagnostic metrics and engage in prescribed self-care protocols. Schedule clinical follow-up if symptoms persist.'
              }
            </p>
          </div>
        </div>

        <div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 800, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            VI. Clinical Safety Checklist
          </h3>
          <div style={{ border: '1px solid #E2E8F0', padding: '14px', borderRadius: '8px', fontSize: '10.5px', color: '#475569', fontWeight: 700, display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#0D9488' }}>✓</span> Verify medication compatibility
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#0D9488' }}>✓</span> Check self-reported allergies
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#0D9488' }}>✓</span> Cross-reference lab ranges
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#0D9488' }}>✓</span> Secure doctor synchronization
            </div>
          </div>
        </div>
      </div>

      {/* 7. Professional Legal & Medical Disclaimer Banner */}
      <div style={{ border: '1.5px solid #FEF3C7', background: '#FFFDF5', padding: '12px 16px', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '12px', color: '#D97706', lineHeight: '1.3' }}>⚠️</span>
        <div style={{ textAlign: 'left' }}>
          <strong style={{ display: 'block', fontSize: '10.5px', color: '#92400E', fontWeight: 800, marginBottom: '2px', textTransform: 'uppercase' }}>
            Mandatory Clinical Disclaimer Notice
          </strong>
          <p style={{ margin: 0, fontSize: '10px', color: '#B45309', fontWeight: 600, lineHeight: '1.45' }}>
            This summary is an AI-assisted diagnostic compilation generated securely on-device based on patient-supplied parameters, text chat histories, digital prescriptions, and pathology lab metrics. It is not an alternative to formal clinical review, physical examinations, or certified medical diagnosis. Always consult with a licensed healthcare practitioner before adjusting chronic drug programs or beginning therapeutic regimens.
          </p>
        </div>
      </div>
    </div>
  );
}
