import { TrendingUp } from 'lucide-react';

const BiomarkerModule = {
  id: 'biomarkers',
  title: 'Biomarker Trends',
  desc: 'Visualize longitudinal changes in your lab biomarkers over time.',
  icon: <TrendingUp className="w-6 h-6 text-[#0D9488]" />,
  href: '/dashboard/biomarkers',
  color: 'rgba(13, 148, 136, 0.03)',
  border: 'rgba(13, 148, 136, 0.08)',
  tag: 'Insights',
  tagColor: 'badge-green',
};

export default BiomarkerModule;
