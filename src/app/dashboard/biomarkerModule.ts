import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TrendingUp, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'lucide-react';

// Dashboard module for Biomarker Trends
const BiomarkerModule = {
  id: 'biomarkers',
  title: 'Biomarker Trends',
  desc: 'Visualize longitudinal changes in your lab biomarkers over time.',
  icon: <TrendingUp className="w-6 h-6 text-[#1E3A8A]" />, // using existing icon
  href: '/dashboard/biomarkers',
  color: 'rgba(30, 58, 138, 0.03)',
  border: 'rgba(30, 58, 138, 0.08)',
  tag: 'Insights',
  tagColor: 'badge-blue',
};

export default BiomarkerModule;
