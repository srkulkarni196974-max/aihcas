/**
 * Local Medical Report Parser
 * Detects common lab test parameters and benchmarks them against reference ranges.
 */

export interface LabResult {
  name: string;
  value: number;
  unit: string;
  range: [number, number];
  status: 'normal' | 'high' | 'low';
  interpretation: string;
  category: string;
}

export interface ReportAnalysis {
  summary: string;
  risks: string[];
  recommendations: string[];
  results: LabResult[];
  alerts: string[];
  urgency: 'routine' | 'soon' | 'urgent';
  detectedCategories: string[];
}

interface ParameterInfo {
  name: string;
  category: string;
  regex: RegExp[];
  unit: string;
  range: [number, number]; // [min, max]
  meanings: {
    low: string;
    high: string;
    normal: string;
  };
}

const LAB_PARAMETERS: ParameterInfo[] = [
  // --- CBC (Complete Blood Count) ---
  {
    name: 'Hemoglobin',
    category: 'CBC',
    regex: [/hemoglobin/i, /hgb/i, /hb\b/i],
    unit: 'g/dL',
    range: [12.0, 16.5],
    meanings: {
      low: 'Indicates potential anemia, iron deficiency, or blood loss.',
      high: 'Could be due to dehydration, smoking, or living at high altitudes.',
      normal: 'Healthy red blood cell oxygen-carrying capacity.'
    }
  },
  {
    name: 'WBC Count',
    category: 'CBC',
    regex: [/wbc/i, /white blood cell/i, /leukocyte/i],
    unit: 'cells/mm³',
    range: [4000, 11000],
    meanings: {
      low: 'Risk of infection, potentially due to medication or bone marrow issues.',
      high: 'Sign of infection, inflammation, or physical stress.',
      normal: 'Healthy immune system response capability.'
    }
  },
  {
    name: 'Platelet Count',
    category: 'CBC',
    regex: [/platelet/i, /plt/i, /thrombocyte/i],
    unit: 'lakhs/mm³',
    range: [1.5, 4.5],
    meanings: {
      low: 'Risk of bruising or bleeding (Thrombocytopenia). Common in Dengue.',
      high: 'Risk of blood clots (Thrombocytosis).',
      normal: 'Healthy blood clotting function.'
    }
  },

  // --- Lipid Profile ---
  {
    name: 'Total Cholesterol',
    category: 'Lipids',
    regex: [/total cholesterol/i, /cholesterol total/i],
    unit: 'mg/dL',
    range: [125, 200],
    meanings: {
      low: 'Rare, could be due to hyperthyroidism or malabsorption.',
      high: 'Increased risk of heart disease and stroke.',
      normal: 'Desirable level for heart health.'
    }
  },
  {
    name: 'LDL (Bad) Cholesterol',
    category: 'Lipids',
    regex: [/ldl/i, /low density lipoprotein/i],
    unit: 'mg/dL',
    range: [0, 100],
    meanings: {
      low: 'Ideal for heart health.',
      high: 'Major risk factor for plaque buildup in arteries.',
      normal: 'Within optimal range.'
    }
  },
  {
    name: 'HDL (Good) Cholesterol',
    category: 'Lipids',
    regex: [/hdl/i, /high density lipoprotein/i],
    unit: 'mg/dL',
    range: [40, 60],
    meanings: {
      low: 'Increased risk of heart disease.',
      high: 'Protective against heart disease.',
      normal: 'Good level for heart protection.'
    }
  },

  // --- Diabetes ---
  {
    name: 'Fasting Glucose',
    category: 'Diabetes',
    regex: [/fasting glucose/i, /glucose fasting/i, /fbs\b/i],
    unit: 'mg/dL',
    range: [70, 99],
    meanings: {
      low: 'Hypoglycemia. Can cause dizziness or fainting.',
      high: 'Hyperglycemia. Potential indicator of Prediabetes or Diabetes.',
      normal: 'Healthy blood sugar control.'
    }
  },
  {
    name: 'HbA1c',
    category: 'Diabetes',
    regex: [/hba1c/i, /glycated hemoglobin/i, /a1c/i],
    unit: '%',
    range: [4.0, 5.6],
    meanings: {
      low: 'Uncommon, may be due to recent blood loss or anemia.',
      high: 'Indicates poor blood sugar control over the last 3 months. (5.7-6.4 is Prediabetes)',
      normal: 'Excellent long-term blood sugar management.'
    }
  },

  // --- Kidney Function (KFT) ---
  {
    name: 'Creatinine',
    category: 'Kidney',
    regex: [/creatinine/i, /creat\b/i],
    unit: 'mg/dL',
    range: [0.7, 1.3],
    meanings: {
      low: 'Uncommon, may be due to low muscle mass or pregnancy.',
      high: 'Potential indicator of reduced kidney function.',
      normal: 'Healthy kidney filtration.'
    }
  },
  {
    name: 'Uric Acid',
    category: 'Kidney',
    regex: [/uric acid/i],
    unit: 'mg/dL',
    range: [3.5, 7.2],
    meanings: {
      low: 'Rare, usually not clinically significant.',
      high: 'Risk of Gout or kidney stones.',
      normal: 'Healthy purine metabolism.'
    }
  },

  // --- Liver Function (LFT) ---
  {
    name: 'SGPT / ALT',
    category: 'Liver',
    regex: [/sgpt/i, /alt\b/i, /alanine aminotransferase/i],
    unit: 'U/L',
    range: [7, 55],
    meanings: {
      low: 'Usually normal/healthy.',
      high: 'May indicate liver inflammation or damage.',
      normal: 'Healthy liver enzyme levels.'
    }
  },
  {
    name: 'SGOT / AST',
    category: 'Liver',
    regex: [/sgot/i, /ast\b/i, /aspartate aminotransferase/i],
    unit: 'U/L',
    range: [8, 48],
    meanings: {
      low: 'Usually normal/healthy.',
      high: 'Possible liver or muscle damage.',
      normal: 'Healthy liver enzyme levels.'
    }
  },

  // --- Thyroid ---
  {
    name: 'TSH',
    category: 'Thyroid',
    regex: [/tsh/i, /thyroid stimulating hormone/i],
    unit: 'uIU/mL',
    range: [0.4, 4.0],
    meanings: {
      low: 'Potential Hyperthyroidism (Overactive thyroid).',
      high: 'Potential Hypothyroidism (Underactive thyroid).',
      normal: 'Healthy thyroid function.'
    }
  },
  // --- CBC Extended ---
  {
    name: 'RBC Count',
    category: 'CBC',
    regex: [/rbc/i, /red blood cell/i, /erythrocyte/i],
    unit: 'million/µL',
    range: [4.2, 5.9],
    meanings: {
      low: 'May indicate anemia, blood loss, nutritional deficiency, or bone marrow disorders.',
      high: 'Could be due to dehydration, smoking, lung disease, or polycythemia.',
      normal: 'Healthy red blood cell production.'
    }
  },
  {
    name: 'Hematocrit',
    category: 'CBC',
    regex: [/hematocrit/i, /hct\b/i, /pcv\b/i],
    unit: '%',
    range: [36, 50],
    meanings: {
      low: 'May indicate anemia, blood loss, or overhydration.',
      high: 'Could indicate dehydration or increased red blood cell production.',
      normal: 'Normal red blood cell volume percentage.'
    }
  },
  {
    name: 'MCV',
    category: 'CBC',
    regex: [/mcv/i, /mean corpuscular volume/i],
    unit: 'fL',
    range: [80, 100],
    meanings: {
      low: 'May indicate iron deficiency anemia or thalassemia.',
      high: 'May indicate vitamin B12 or folate deficiency.',
      normal: 'Normal red blood cell size.'
    }
  },
  {
    name: 'MCH',
    category: 'CBC',
    regex: [/mch/i, /mean corpuscular hemoglobin/i],
    unit: 'pg',
    range: [27, 33],
    meanings: {
      low: 'May suggest iron deficiency anemia.',
      high: 'May indicate macrocytic anemia.',
      normal: 'Normal hemoglobin content in red blood cells.'
    }
  },

  // --- Electrolytes ---
  {
    name: 'Sodium',
    category: 'Electrolytes',
    regex: [/sodium/i, /na\b/i],
    unit: 'mEq/L',
    range: [135, 145],
    meanings: {
      low: 'May cause confusion, weakness, or seizures in severe cases.',
      high: 'Could indicate dehydration or kidney issues.',
      normal: 'Healthy fluid and nerve function balance.'
    }
  },
  {
    name: 'Potassium',
    category: 'Electrolytes',
    regex: [/potassium/i, /k\b/i],
    unit: 'mEq/L',
    range: [3.5, 5.0],
    meanings: {
      low: 'May cause muscle weakness, cramps, or heart rhythm changes.',
      high: 'Can affect heart rhythm and muscle function.',
      normal: 'Healthy nerve and muscle function.'
    }
  },
  {
    name: 'Chloride',
    category: 'Electrolytes',
    regex: [/chloride/i, /cl\b/i],
    unit: 'mEq/L',
    range: [96, 106],
    meanings: {
      low: 'May indicate fluid imbalance or vomiting.',
      high: 'Could indicate dehydration or metabolic imbalance.',
      normal: 'Healthy acid-base balance.'
    }
  },

  // --- Kidney Function Extended ---
  {
    name: 'Blood Urea Nitrogen (BUN)',
    category: 'Kidney',
    regex: [/bun/i, /blood urea nitrogen/i, /urea/i],
    unit: 'mg/dL',
    range: [7, 20],
    meanings: {
      low: 'May occur in liver disease or malnutrition.',
      high: 'May indicate dehydration or reduced kidney function.',
      normal: 'Healthy protein metabolism and kidney function.'
    }
  },
  {
    name: 'eGFR',
    category: 'Kidney',
    regex: [/egfr/i, /glomerular filtration rate/i],
    unit: 'mL/min/1.73m²',
    range: [90, 120],
    meanings: {
      low: 'May indicate reduced kidney filtration function.',
      high: 'Usually not clinically significant.',
      normal: 'Healthy kidney filtration.'
    }
  },

  // --- Liver Function Extended ---
  {
    name: 'Total Bilirubin',
    category: 'Liver',
    regex: [/bilirubin/i, /total bilirubin/i],
    unit: 'mg/dL',
    range: [0.2, 1.2],
    meanings: {
      low: 'Usually not clinically significant.',
      high: 'May indicate jaundice, liver disease, or red blood cell breakdown.',
      normal: 'Healthy liver and bile metabolism.'
    }
  },
  {
    name: 'Alkaline Phosphatase (ALP)',
    category: 'Liver',
    regex: [/alp\b/i, /alkaline phosphatase/i],
    unit: 'U/L',
    range: [44, 147],
    meanings: {
      low: 'May indicate nutritional deficiencies in rare cases.',
      high: 'May suggest liver, bile duct, or bone disorders.',
      normal: 'Healthy liver and bone metabolism.'
    }
  },

  // --- Cardiac / Lipids ---
  {
    name: 'Triglycerides',
    category: 'Lipids',
    regex: [/triglycerides/i, /tg\b/i],
    unit: 'mg/dL',
    range: [0, 150],
    meanings: {
      low: 'Usually not concerning.',
      high: 'Increases risk of heart disease and pancreatitis.',
      normal: 'Healthy fat metabolism.'
    }
  },

  // --- Minerals ---
  {
    name: 'Calcium',
    category: 'Minerals',
    regex: [/calcium/i, /ca\b/i],
    unit: 'mg/dL',
    range: [8.5, 10.5],
    meanings: {
      low: 'May cause muscle cramps, tingling, or weakness.',
      high: 'May indicate parathyroid disorders or kidney issues.',
      normal: 'Healthy bones, nerves, and muscles.'
    }
  },
  {
    name: 'Magnesium',
    category: 'Minerals',
    regex: [/magnesium/i, /mg\b/i],
    unit: 'mg/dL',
    range: [1.7, 2.2],
    meanings: {
      low: 'May cause muscle cramps, weakness, or irregular heartbeat.',
      high: 'May occur in kidney dysfunction.',
      normal: 'Healthy muscle and nerve function.'
    }
  },

  // --- Iron Studies ---
  {
    name: 'Serum Iron',
    category: 'Iron Profile',
    regex: [/serum iron/i, /iron\b/i],
    unit: 'µg/dL',
    range: [60, 170],
    meanings: {
      low: 'May indicate iron deficiency anemia.',
      high: 'May indicate iron overload or liver disease.',
      normal: 'Healthy iron availability.'
    }
  },
  {
    name: 'Ferritin',
    category: 'Iron Profile',
    regex: [/ferritin/i],
    unit: 'ng/mL',
    range: [20, 300],
    meanings: {
      low: 'Indicates low iron stores or iron deficiency.',
      high: 'May indicate inflammation, infection, or iron overload.',
      normal: 'Healthy body iron reserves.'
    }
  },

  // --- Vitamins ---
  {
    name: 'Vitamin B12',
    category: 'Vitamins',
    regex: [/vitamin b12/i, /b12\b/i, /cobalamin/i],
    unit: 'pg/mL',
    range: [200, 900],
    meanings: {
      low: 'May cause anemia, fatigue, numbness, or nerve problems.',
      high: 'May occur with supplementation or certain medical conditions.',
      normal: 'Healthy nerve and blood cell function.'
    }
  },
  {
    name: 'Vitamin D',
    category: 'Vitamins',
    regex: [/vitamin d/i, /25-oh vitamin d/i],
    unit: 'ng/mL',
    range: [30, 100],
    meanings: {
      low: 'May cause weak bones, fatigue, or muscle pain.',
      high: 'May indicate excessive supplementation.',
      normal: 'Healthy bone and immune function.'
    }
  },

  // =========================
  // THYROID PROFILE
  // =========================
  {
    name: 'T3',
    category: 'Thyroid',
    regex: [/t3\b/i, /triiodothyronine/i, /total t3/i],
    unit: 'ng/dL',
    range: [80, 200],
    meanings: {
      low: 'May indicate hypothyroidism, severe illness, or metabolic suppression.',
      high: 'May indicate hyperthyroidism or thyroid overactivity.',
      normal: 'Healthy thyroid hormone levels.'
    }
  },
  {
    name: 'T4',
    category: 'Thyroid',
    regex: [/t4\b/i, /thyroxine/i, /total t4/i],
    unit: 'µg/dL',
    range: [5.0, 12.0],
    meanings: {
      low: 'May suggest hypothyroidism.',
      high: 'May indicate hyperthyroidism.',
      normal: 'Healthy thyroid hormone production.'
    }
  },
  {
    name: 'Free T3',
    category: 'Thyroid',
    regex: [/ft3/i, /free t3/i],
    unit: 'pg/mL',
    range: [2.3, 4.2],
    meanings: {
      low: 'May indicate thyroid underactivity.',
      high: 'May indicate thyroid overactivity.',
      normal: 'Healthy active thyroid hormone level.'
    }
  },
  {
    name: 'Free T4',
    category: 'Thyroid',
    regex: [/ft4/i, /free t4/i],
    unit: 'ng/dL',
    range: [0.8, 1.8],
    meanings: {
      low: 'May indicate hypothyroidism.',
      high: 'May indicate hyperthyroidism.',
      normal: 'Healthy thyroid function.'
    }
  },

  // =========================
  // DIABETES
  // =========================
  {
    name: 'Post Prandial Glucose',
    category: 'Diabetes',
    regex: [/ppbs/i, /post prandial/i, /pp glucose/i],
    unit: 'mg/dL',
    range: [70, 140],
    meanings: {
      low: 'May indicate hypoglycemia.',
      high: 'May suggest diabetes or poor glucose control.',
      normal: 'Healthy post-meal glucose control.'
    }
  },
  {
    name: 'Random Blood Sugar',
    category: 'Diabetes',
    regex: [/rbs/i, /random blood sugar/i, /random glucose/i],
    unit: 'mg/dL',
    range: [70, 140],
    meanings: {
      low: 'May indicate low blood sugar.',
      high: 'May indicate diabetes or stress response.',
      normal: 'Healthy glucose regulation.'
    }
  },

  // =========================
  // CBC DIFFERENTIAL
  // =========================
  {
    name: 'Neutrophils',
    category: 'CBC',
    regex: [/neutrophils/i, /neut\b/i],
    unit: '%',
    range: [40, 70],
    meanings: {
      low: 'May indicate viral infection or bone marrow suppression.',
      high: 'Often seen in bacterial infections or inflammation.',
      normal: 'Healthy infection defense.'
    }
  },
  {
    name: 'Lymphocytes',
    category: 'CBC',
    regex: [/lymphocytes/i, /lymph\b/i],
    unit: '%',
    range: [20, 40],
    meanings: {
      low: 'May indicate immune suppression.',
      high: 'Often seen in viral infections.',
      normal: 'Healthy immune response.'
    }
  },
  {
    name: 'Monocytes',
    category: 'CBC',
    regex: [/monocytes/i, /mono\b/i],
    unit: '%',
    range: [2, 10],
    meanings: {
      low: 'Usually not significant.',
      high: 'May indicate chronic infection or inflammation.',
      normal: 'Healthy immune surveillance.'
    }
  },
  {
    name: 'Eosinophils',
    category: 'CBC',
    regex: [/eosinophils/i, /eos\b/i],
    unit: '%',
    range: [1, 6],
    meanings: {
      low: 'Usually not significant.',
      high: 'May indicate allergy, asthma, or parasitic infection.',
      normal: 'Healthy allergic response.'
    }
  },
  {
    name: 'Basophils',
    category: 'CBC',
    regex: [/basophils/i, /baso\b/i],
    unit: '%',
    range: [0, 2],
    meanings: {
      low: 'Usually not significant.',
      high: 'May indicate allergic or inflammatory disorders.',
      normal: 'Healthy immune response.'
    }
  },

  // =========================
  // LIVER FUNCTION
  // =========================
  {
    name: 'Total Protein',
    category: 'Liver',
    regex: [/total protein/i],
    unit: 'g/dL',
    range: [6.0, 8.3],
    meanings: {
      low: 'May indicate liver disease, malnutrition, or kidney loss.',
      high: 'May indicate dehydration or chronic inflammation.',
      normal: 'Healthy protein metabolism.'
    }
  },
  {
    name: 'Albumin',
    category: 'Liver',
    regex: [/albumin/i],
    unit: 'g/dL',
    range: [3.5, 5.0],
    meanings: {
      low: 'May indicate liver disease, kidney disease, or malnutrition.',
      high: 'Usually due to dehydration.',
      normal: 'Healthy liver protein synthesis.'
    }
  },
  {
    name: 'Globulin',
    category: 'Liver',
    regex: [/globulin/i],
    unit: 'g/dL',
    range: [2.0, 3.5],
    meanings: {
      low: 'May indicate immune deficiency.',
      high: 'May indicate infection or inflammation.',
      normal: 'Healthy immune protein levels.'
    }
  },

  // =========================
  // KIDNEY FUNCTION
  // =========================
  {
    name: 'Blood Urea',
    category: 'Kidney',
    regex: [/blood urea/i, /urea\b/i],
    unit: 'mg/dL',
    range: [15, 40],
    meanings: {
      low: 'May indicate liver disease or low protein intake.',
      high: 'May indicate kidney dysfunction or dehydration.',
      normal: 'Healthy waste filtration.'
    }
  },

  // =========================
  // LIPID PROFILE
  // =========================
  {
    name: 'VLDL',
    category: 'Lipids',
    regex: [/vldl/i],
    unit: 'mg/dL',
    range: [5, 40],
    meanings: {
      low: 'Usually not clinically significant.',
      high: 'May increase cardiovascular risk.',
      normal: 'Healthy lipid transport.'
    }
  },
  {
    name: 'Cholesterol / HDL Ratio',
    category: 'Lipids',
    regex: [/cholesterol.*hdl/i, /chol\/hdl/i],
    unit: 'ratio',
    range: [0, 5],
    meanings: {
      low: 'Lower cardiovascular risk.',
      high: 'Increased cardiovascular disease risk.',
      normal: 'Healthy cardiac risk profile.'
    }
  },

  // =========================
  // URINE ROUTINE
  // =========================
  {
    name: 'Urine pH',
    category: 'Urine',
    regex: [/urine ph/i, /ph\b/i],
    unit: 'pH',
    range: [4.5, 8.0],
    meanings: {
      low: 'May indicate acidic urine, dehydration, or metabolic conditions.',
      high: 'May indicate infection or alkaline urine.',
      normal: 'Healthy urine acidity balance.'
    }
  },
  {
    name: 'Urine Specific Gravity',
    category: 'Urine',
    regex: [/specific gravity/i, /sp gravity/i],
    unit: '',
    range: [1.005, 1.030],
    meanings: {
      low: 'May indicate overhydration or kidney concentrating issues.',
      high: 'May indicate dehydration.',
      normal: 'Healthy urine concentration.'
    }
  },
  {
    name: 'Urine Protein',
    category: 'Urine',
    regex: [/urine protein/i, /protein\b/i],
    unit: '',
    range: [0, 0],
    meanings: {
      low: 'Normal finding.',
      high: 'May indicate kidney disease or infection.',
      normal: 'No protein leakage in urine.'
    }
  },
  {
    name: 'Urine Sugar',
    category: 'Urine',
    regex: [/urine sugar/i, /glucose urine/i],
    unit: '',
    range: [0, 0],
    meanings: {
      low: 'Normal finding.',
      high: 'May indicate diabetes or kidney tubular disorders.',
      normal: 'No glucose present in urine.'
    }
  },
  {
    name: 'Urine Ketones',
    category: 'Urine',
    regex: [/ketones/i],
    unit: '',
    range: [0, 0],
    meanings: {
      low: 'Normal finding.',
      high: 'May indicate diabetes, fasting, or starvation.',
      normal: 'No ketones detected.'
    }
  },
  {
    name: 'Urine RBC',
    category: 'Urine',
    regex: [/urine rbc/i, /rbc\/hpf/i],
    unit: '/HPF',
    range: [0, 2],
    meanings: {
      low: 'Normal finding.',
      high: 'May indicate infection, stones, or urinary tract injury.',
      normal: 'No abnormal bleeding in urinary tract.'
    }
  },
  {
    name: 'Urine Pus Cells',
    category: 'Urine',
    regex: [/pus cells/i, /wbc\/hpf/i],
    unit: '/HPF',
    range: [0, 5],
    meanings: {
      low: 'Normal finding.',
      high: 'May indicate urinary tract infection.',
      normal: 'Healthy urinary tract.'
    }
  },

  // =========================
  // CBC ADVANCED
  // =========================
  {
    name: 'RDW',
    category: 'CBC',
    regex: [/rdw/i, /red cell distribution width/i],
    unit: '%',
    range: [11.5, 14.5],
    meanings: {
      low: 'Usually not clinically significant.',
      high: 'May indicate iron deficiency, B12 deficiency, or mixed anemia.',
      normal: 'Healthy red blood cell size consistency.'
    }
  },
  {
    name: 'MPV',
    category: 'CBC',
    regex: [/mpv/i, /mean platelet volume/i],
    unit: 'fL',
    range: [7.5, 11.5],
    meanings: {
      low: 'May indicate decreased platelet production.',
      high: 'May indicate increased platelet destruction or regeneration.',
      normal: 'Healthy platelet size and production.'
    }
  },
  {
    name: 'ESR',
    category: 'Inflammation',
    regex: [/esr/i, /erythrocyte sedimentation/i],
    unit: 'mm/hr',
    range: [0, 20],
    meanings: {
      low: 'Usually not clinically significant.',
      high: 'May indicate inflammation, infection, or autoimmune disease.',
      normal: 'No significant inflammatory activity.'
    }
  },

  // =========================
  // INFLAMMATION / INFECTION
  // =========================
  {
    name: 'CRP',
    category: 'Inflammation',
    regex: [/crp/i, /c reactive protein/i],
    unit: 'mg/L',
    range: [0, 10],
    meanings: {
      low: 'Normal inflammatory status.',
      high: 'May indicate infection, inflammation, or tissue injury.',
      normal: 'No active inflammation.'
    }
  },
  {
    name: 'Procalcitonin',
    category: 'Infection',
    regex: [/procalcitonin/i, /pct\b/i],
    unit: 'ng/mL',
    range: [0, 0.5],
    meanings: {
      low: 'Low likelihood of severe bacterial infection.',
      high: 'May indicate bacterial infection or sepsis.',
      normal: 'No major bacterial infection indicators.'
    }
  },

  // =========================
  // CARDIAC MARKERS
  // =========================
  {
    name: 'Troponin I',
    category: 'Cardiac',
    regex: [/troponin/i, /troponin i/i],
    unit: 'ng/mL',
    range: [0, 0.04],
    meanings: {
      low: 'No evidence of heart muscle injury.',
      high: 'May indicate heart attack or cardiac injury.',
      normal: 'Healthy heart muscle.'
    }
  },
  {
    name: 'CK-MB',
    category: 'Cardiac',
    regex: [/ckmb/i, /ck-mb/i],
    unit: 'ng/mL',
    range: [0, 5],
    meanings: {
      low: 'Normal muscle enzyme levels.',
      high: 'May indicate heart muscle damage.',
      normal: 'No evidence of cardiac injury.'
    }
  },

  // =========================
  // PANCREAS
  // =========================
  {
    name: 'Amylase',
    category: 'Pancreas',
    regex: [/amylase/i],
    unit: 'U/L',
    range: [30, 110],
    meanings: {
      low: 'Usually not clinically significant.',
      high: 'May indicate pancreatitis or salivary gland disorders.',
      normal: 'Healthy pancreatic enzyme level.'
    }
  },
  {
    name: 'Lipase',
    category: 'Pancreas',
    regex: [/lipase/i],
    unit: 'U/L',
    range: [0, 160],
    meanings: {
      low: 'Usually not clinically significant.',
      high: 'May indicate pancreatitis.',
      normal: 'Healthy pancreatic function.'
    }
  },

  // =========================
  // COAGULATION PROFILE
  // =========================
  {
    name: 'PT',
    category: 'Coagulation',
    regex: [/prothrombin time/i, /pt\b/i],
    unit: 'seconds',
    range: [11, 13.5],
    meanings: {
      low: 'Usually not clinically significant.',
      high: 'May indicate clotting disorder, liver disease, or anticoagulant effect.',
      normal: 'Healthy blood clotting function.'
    }
  },
  {
    name: 'INR',
    category: 'Coagulation',
    regex: [/inr/i],
    unit: '',
    range: [0.8, 1.2],
    meanings: {
      low: 'Usually not clinically significant.',
      high: 'May indicate increased bleeding risk.',
      normal: 'Normal clotting balance.'
    }
  },
  {
    name: 'aPTT',
    category: 'Coagulation',
    regex: [/aptt/i, /activated partial thromboplastin/i],
    unit: 'seconds',
    range: [25, 35],
    meanings: {
      low: 'Usually not clinically significant.',
      high: 'May indicate clotting factor deficiency or anticoagulant effect.',
      normal: 'Healthy coagulation pathway.'
    }
  },

  // =========================
  // ELECTROLYTES + ACID BASE
  // =========================
  {
    name: 'Bicarbonate',
    category: 'Electrolytes',
    regex: [/bicarbonate/i, /hco3/i],
    unit: 'mEq/L',
    range: [22, 28],
    meanings: {
      low: 'May indicate metabolic acidosis.',
      high: 'May indicate metabolic alkalosis.',
      normal: 'Healthy acid-base balance.'
    }
  },
  {
    name: 'Phosphorus',
    category: 'Minerals',
    regex: [/phosphorus/i, /phosphate/i],
    unit: 'mg/dL',
    range: [2.5, 4.5],
    meanings: {
      low: 'May indicate malnutrition or vitamin D deficiency.',
      high: 'May indicate kidney disease.',
      normal: 'Healthy bone and energy metabolism.'
    }
  },

  // =========================
  // IRON PROFILE
  // =========================
  {
    name: 'TIBC',
    category: 'Iron Profile',
    regex: [/tibc/i, /total iron binding capacity/i],
    unit: 'µg/dL',
    range: [250, 450],
    meanings: {
      low: 'May indicate chronic disease or liver disease.',
      high: 'May indicate iron deficiency.',
      normal: 'Healthy iron transport capacity.'
    }
  },
  {
    name: 'Transferrin Saturation',
    category: 'Iron Profile',
    regex: [/transferrin saturation/i, /tsat/i],
    unit: '%',
    range: [20, 50],
    meanings: {
      low: 'May indicate iron deficiency.',
      high: 'May indicate iron overload.',
      normal: 'Healthy iron utilization.'
    }
  },

  // =========================
  // URINE MICROSCOPY
  // =========================
  {
    name: 'Urine Epithelial Cells',
    category: 'Urine',
    regex: [/epithelial cells/i],
    unit: '/HPF',
    range: [0, 5],
    meanings: {
      low: 'Normal finding.',
      high: 'May indicate contamination, infection, or urinary tract irritation.',
      normal: 'Healthy urinary lining.'
    }
  },
  {
    name: 'Urine Casts',
    category: 'Urine',
    regex: [/casts/i, /urine casts/i],
    unit: '/LPF',
    range: [0, 2],
    meanings: {
      low: 'Normal finding.',
      high: 'May indicate kidney disease or inflammation.',
      normal: 'Healthy kidney filtration.'
    }
  },
  {
    name: 'Urine Crystals',
    category: 'Urine',
    regex: [/crystals/i, /urine crystals/i],
    unit: '',
    range: [0, 0],
    meanings: {
      low: 'Normal finding.',
      high: 'May indicate stone formation risk or metabolic abnormalities.',
      normal: 'No abnormal crystal formation.'
    }
  },

  // =========================
  // SPECIAL VITAMINS / NUTRITION
  // =========================
  {
    name: 'Folate',
    category: 'Vitamins',
    regex: [/folate/i, /folic acid/i],
    unit: 'ng/mL',
    range: [2.7, 17.0],
    meanings: {
      low: 'May cause anemia, fatigue, or neurological symptoms.',
      high: 'Often due to supplementation.',
      normal: 'Healthy red blood cell and DNA synthesis.'
    }
  },

  // =========================
  // BONE HEALTH
  // =========================
  {
    name: 'Uric Calcium',
    category: 'Minerals',
    regex: [/ionized calcium/i, /free calcium/i],
    unit: 'mg/dL',
    range: [4.5, 5.6],
    meanings: {
      low: 'May cause muscle spasms or numbness.',
      high: 'May indicate parathyroid or metabolic disorders.',
      normal: 'Healthy calcium regulation.'
    }
  },

  // =========================
  // CBC — CORE EXTENSIONS
  // =========================
  {
    name: 'MCHC',
    category: 'CBC',
    regex: [/mchc/i, /mean corpuscular hemoglobin concentration/i],
    unit: 'g/dL',
    range: [32.0, 36.0],
    meanings: {
      low: 'May indicate iron deficiency anemia.',
      high: 'May indicate hereditary spherocytosis or RBC dehydration.',
      normal: 'Healthy hemoglobin concentration in red blood cells.'
    }
  },
  {
    name: 'Absolute Neutrophil Count',
    category: 'CBC',
    regex: [/anc/i, /absolute neutrophil/i],
    unit: 'cells/µL',
    range: [1500, 8000],
    meanings: {
      low: 'May increase infection risk.',
      high: 'May indicate bacterial infection, stress, or inflammation.',
      normal: 'Healthy immune defense.'
    }
  },
  {
    name: 'Absolute Lymphocyte Count',
    category: 'CBC',
    regex: [/alc/i, /absolute lymphocyte/i],
    unit: 'cells/µL',
    range: [1000, 4800],
    meanings: {
      low: 'May indicate immune suppression.',
      high: 'May indicate viral infection or lymphoproliferative disorders.',
      normal: 'Healthy immune regulation.'
    }
  },

  // =========================
  // DIABETES
  // =========================
  {
    name: 'Estimated Average Glucose',
    category: 'Diabetes',
    regex: [/eag/i, /estimated average glucose/i],
    unit: 'mg/dL',
    range: [70, 114],
    meanings: {
      low: 'May indicate hypoglycemia.',
      high: 'May indicate poor long-term glucose control.',
      normal: 'Healthy average glucose levels.'
    }
  },

  // =========================
  // LIVER FUNCTION
  // =========================
  {
    name: 'GGT',
    category: 'Liver',
    regex: [/ggt/i, /gamma glutamyl/i],
    unit: 'U/L',
    range: [8, 61],
    meanings: {
      low: 'Usually not clinically significant.',
      high: 'May indicate liver disease, bile duct obstruction, or alcohol-related liver stress.',
      normal: 'Healthy liver enzyme activity.'
    }
  },
  {
    name: 'Direct Bilirubin',
    category: 'Liver',
    regex: [/direct bilirubin/i, /conjugated bilirubin/i],
    unit: 'mg/dL',
    range: [0.0, 0.3],
    meanings: {
      low: 'Normal finding.',
      high: 'May indicate liver disease or bile duct obstruction.',
      normal: 'Healthy bilirubin metabolism.'
    }
  },
  {
    name: 'Indirect Bilirubin',
    category: 'Liver',
    regex: [/indirect bilirubin/i, /unconjugated bilirubin/i],
    unit: 'mg/dL',
    range: [0.2, 0.8],
    meanings: {
      low: 'Usually not significant.',
      high: 'May indicate hemolysis or bilirubin metabolism disorders.',
      normal: 'Healthy red blood cell turnover.'
    }
  },
  {
    name: 'A/G Ratio',
    category: 'Liver',
    regex: [/a\/g ratio/i, /albumin globulin ratio/i],
    unit: 'ratio',
    range: [1.0, 2.5],
    meanings: {
      low: 'May indicate liver disease, kidney disease, or inflammation.',
      high: 'May indicate low globulin levels.',
      normal: 'Healthy protein balance.'
    }
  },

  // =========================
  // KIDNEY FUNCTION
  // =========================
  {
    name: 'BUN / Creatinine Ratio',
    category: 'Kidney',
    regex: [/bun.*creatinine/i, /bun\/creatinine/i],
    unit: 'ratio',
    range: [10, 20],
    meanings: {
      low: 'May indicate liver disease or malnutrition.',
      high: 'May indicate dehydration or reduced kidney blood flow.',
      normal: 'Healthy kidney filtration relationship.'
    }
  },
  {
    name: 'Urine Microalbumin',
    category: 'Kidney',
    regex: [/microalbumin/i, /urine albumin/i],
    unit: 'mg/L',
    range: [0, 30],
    meanings: {
      low: 'Normal kidney protein filtration.',
      high: 'Early sign of kidney damage, especially in diabetes.',
      normal: 'Healthy kidney filtration.'
    }
  },

  // =========================
  // THYROID
  // =========================
  {
    name: 'Anti-TPO Antibodies',
    category: 'Thyroid',
    regex: [/anti tpo/i, /thyroid peroxidase antibody/i],
    unit: 'IU/mL',
    range: [0, 35],
    meanings: {
      low: 'No significant thyroid autoimmunity.',
      high: 'May indicate autoimmune thyroid disease.',
      normal: 'No autoimmune thyroid marker elevation.'
    }
  },

  // =========================
  // LIPID PROFILE
  // =========================
  {
    name: 'Non-HDL Cholesterol',
    category: 'Lipids',
    regex: [/non hdl/i],
    unit: 'mg/dL',
    range: [0, 130],
    meanings: {
      low: 'Favorable cardiovascular profile.',
      high: 'May increase cardiovascular disease risk.',
      normal: 'Healthy cholesterol balance.'
    }
  },
  {
    name: 'LDL / HDL Ratio',
    category: 'Lipids',
    regex: [/ldl.*hdl/i, /ldl\/hdl/i],
    unit: 'ratio',
    range: [0, 3.5],
    meanings: {
      low: 'Lower cardiac risk.',
      high: 'May increase cardiovascular risk.',
      normal: 'Healthy lipid risk ratio.'
    }
  },

  // =========================
  // VITAMINS + MINERALS
  // =========================
  {
    name: 'Serum Folate',
    category: 'Vitamins',
    regex: [/folate/i, /folic acid/i],
    unit: 'ng/mL',
    range: [2.7, 17.0],
    meanings: {
      low: 'May cause anemia or fatigue.',
      high: 'Usually due to supplementation.',
      normal: 'Healthy cell division and blood formation.'
    }
  },
  {
    name: 'Phosphorus',
    category: 'Minerals',
    regex: [/phosphorus/i, /phosphate/i],
    unit: 'mg/dL',
    range: [2.5, 4.5],
    meanings: {
      low: 'May indicate malnutrition or vitamin D deficiency.',
      high: 'May indicate kidney disease.',
      normal: 'Healthy bone and energy metabolism.'
    }
  },

  // =========================
  // URINE ROUTINE
  // =========================
  {
    name: 'Urine Leukocyte Esterase',
    category: 'Urine',
    regex: [/leukocyte esterase/i],
    unit: '',
    range: [0, 0],
    meanings: {
      low: 'Normal finding.',
      high: 'May indicate urinary tract infection.',
      normal: 'Healthy urinary tract.'
    }
  },
  {
    name: 'Urine Nitrite',
    category: 'Urine',
    regex: [/nitrite/i],
    unit: '',
    range: [0, 0],
    meanings: {
      low: 'Normal finding.',
      high: 'May indicate bacterial urinary infection.',
      normal: 'No bacterial marker detected.'
    }
  },
  {
    name: 'Urine Urobilinogen',
    category: 'Urine',
    regex: [/urobilinogen/i],
    unit: 'mg/dL',
    range: [0.2, 1.0],
    meanings: {
      low: 'Usually not clinically significant.',
      high: 'May indicate liver disease or increased red cell breakdown.',
      normal: 'Healthy liver and bile metabolism.'
    }
  },

  // =========================
  // CARDIAC BIOMARKERS
  // =========================
  {
    name: 'NT-proBNP',
    category: 'Cardiac',
    regex: [/nt-probnp/i, /pro bnp/i, /ntprobnp/i],
    unit: 'pg/mL',
    range: [0, 125],
    meanings: {
      low: 'Low likelihood of heart failure.',
      high: 'May indicate heart failure, cardiac stress, or ventricular dysfunction.',
      normal: 'Healthy cardiac pressure regulation.'
    }
  },
  {
    name: 'BNP',
    category: 'Cardiac',
    regex: [/bnp\b/i, /brain natriuretic peptide/i],
    unit: 'pg/mL',
    range: [0, 100],
    meanings: {
      low: 'Normal cardiac stress marker.',
      high: 'May indicate congestive heart failure.',
      normal: 'Healthy heart function.'
    }
  },
  {
    name: 'D-Dimer',
    category: 'Coagulation',
    regex: [/d[- ]?dimer/i],
    unit: 'ng/mL FEU',
    range: [0, 500],
    meanings: {
      low: 'Low likelihood of active clot formation.',
      high: 'May indicate thrombosis, pulmonary embolism, DIC, or inflammation.',
      normal: 'No significant clot breakdown activity.'
    }
  },

  // =========================
  // ELECTROLYTES / ICU
  // =========================
  {
    name: 'Ionized Calcium',
    category: 'Critical Care',
    regex: [/ionized calcium/i, /free calcium/i],
    unit: 'mmol/L',
    range: [1.12, 1.32],
    meanings: {
      low: 'May cause muscle spasms, numbness, or cardiac changes.',
      high: 'May indicate parathyroid or malignancy-related disorders.',
      normal: 'Healthy calcium availability.'
    }
  },
  {
    name: 'Serum Osmolality',
    category: 'Critical Care',
    regex: [/osmolality/i, /serum osmolality/i],
    unit: 'mOsm/kg',
    range: [275, 295],
    meanings: {
      low: 'May indicate overhydration or hyponatremia.',
      high: 'May indicate dehydration or hyperglycemia.',
      normal: 'Healthy fluid balance.'
    }
  },
  {
    name: 'Lactate',
    category: 'Critical Care',
    regex: [/lactate/i, /lactic acid/i],
    unit: 'mmol/L',
    range: [0.5, 2.2],
    meanings: {
      low: 'Usually not clinically significant.',
      high: 'May indicate sepsis, shock, tissue hypoxia, or metabolic stress.',
      normal: 'Healthy oxygen metabolism.'
    }
  },

  // =========================
  // ARTERIAL BLOOD GAS
  // =========================
  {
    name: 'Blood pH',
    category: 'ABG',
    regex: [/ph\b/i, /blood ph/i],
    unit: '',
    range: [7.35, 7.45],
    meanings: {
      low: 'May indicate acidosis.',
      high: 'May indicate alkalosis.',
      normal: 'Healthy acid-base balance.'
    }
  },
  {
    name: 'pCO2',
    category: 'ABG',
    regex: [/pco2/i, /partial pressure of co2/i],
    unit: 'mmHg',
    range: [35, 45],
    meanings: {
      low: 'May indicate respiratory alkalosis.',
      high: 'May indicate respiratory acidosis.',
      normal: 'Healthy respiratory gas exchange.'
    }
  },
  {
    name: 'pO2',
    category: 'ABG',
    regex: [/po2/i, /partial pressure of o2/i],
    unit: 'mmHg',
    range: [80, 100],
    meanings: {
      low: 'May indicate poor oxygenation.',
      high: 'Usually due to oxygen therapy.',
      normal: 'Healthy oxygen exchange.'
    }
  },

  // =========================
  // PANCREATIC / METABOLIC
  // =========================
  {
    name: 'C-Peptide',
    category: 'Endocrine',
    regex: [/c[- ]?peptide/i],
    unit: 'ng/mL',
    range: [0.8, 3.1],
    meanings: {
      low: 'May indicate reduced insulin production.',
      high: 'May indicate insulin resistance or excess insulin production.',
      normal: 'Healthy pancreatic insulin secretion.'
    }
  },
  {
    name: 'Insulin (Fasting)',
    category: 'Endocrine',
    regex: [/fasting insulin/i, /insulin\b/i],
    unit: 'µIU/mL',
    range: [2, 25],
    meanings: {
      low: 'May indicate pancreatic insufficiency.',
      high: 'May indicate insulin resistance or metabolic syndrome.',
      normal: 'Healthy insulin regulation.'
    }
  },

  // =========================
  // BONE / ENDOCRINE
  // =========================
  {
    name: 'Parathyroid Hormone (PTH)',
    category: 'Endocrine',
    regex: [/pth/i, /parathyroid hormone/i],
    unit: 'pg/mL',
    range: [15, 65],
    meanings: {
      low: 'May indicate parathyroid suppression.',
      high: 'May indicate hyperparathyroidism or calcium imbalance.',
      normal: 'Healthy calcium regulation.'
    }
  },
  {
    name: 'Calcitonin',
    category: 'Endocrine',
    regex: [/calcitonin/i],
    unit: 'pg/mL',
    range: [0, 10],
    meanings: {
      low: 'Usually normal.',
      high: 'May indicate thyroid medullary disease or endocrine disorders.',
      normal: 'Healthy endocrine regulation.'
    }
  },

  // =========================
  // AUTOIMMUNE / RHEUMATOLOGY
  // =========================
  {
    name: 'Rheumatoid Factor (RF)',
    category: 'Autoimmune',
    regex: [/rheumatoid factor/i, /rf\b/i],
    unit: 'IU/mL',
    range: [0, 14],
    meanings: {
      low: 'No significant rheumatoid marker.',
      high: 'May indicate rheumatoid arthritis or autoimmune disease.',
      normal: 'No abnormal autoimmune marker.'
    }
  },
  {
    name: 'Anti-CCP',
    category: 'Autoimmune',
    regex: [/anti ccp/i, /cyclic citrullinated peptide/i],
    unit: 'U/mL',
    range: [0, 20],
    meanings: {
      low: 'No significant rheumatoid autoantibodies.',
      high: 'Strong marker for rheumatoid arthritis.',
      normal: 'No rheumatoid-specific antibodies detected.'
    }
  },
  {
    name: 'ANA',
    category: 'Autoimmune',
    regex: [/ana\b/i, /antinuclear antibody/i],
    unit: 'Index',
    range: [0, 1.0],
    meanings: {
      low: 'No significant autoimmune marker.',
      high: 'May indicate lupus or connective tissue disease.',
      normal: 'No autoimmune antibody elevation.'
    }
  },

  // =========================
  // INFECTIOUS DISEASE
  // =========================
  {
    name: 'ASO Titer',
    category: 'Infection',
    regex: [/aso/i, /anti streptolysin/i],
    unit: 'IU/mL',
    range: [0, 200],
    meanings: {
      low: 'No recent streptococcal exposure.',
      high: 'May indicate recent streptococcal infection.',
      normal: 'No abnormal streptococcal antibody activity.'
    }
  },
  {
    name: 'Ferritin (Inflammatory Use)',
    category: 'Inflammation',
    regex: [/ferritin/i],
    unit: 'ng/mL',
    range: [30, 400],
    meanings: {
      low: 'May indicate depleted iron stores.',
      high: 'May indicate inflammation, infection, or iron overload.',
      normal: 'Healthy iron storage.'
    }
  },

  // =========================
  // FERTILITY / REPRODUCTIVE
  // =========================
  {
    name: 'FSH',
    category: 'Reproductive',
    regex: [/fsh/i, /folicle stimulating hormone/i],
    unit: 'mIU/mL',
    range: [1.5, 12.4],
    meanings: {
      low: 'May indicate pituitary or hormonal suppression.',
      high: 'May indicate ovarian/testicular dysfunction.',
      normal: 'Healthy reproductive hormone signaling.'
    }
  },
  {
    name: 'LH',
    category: 'Reproductive',
    regex: [/lh\b/i, /luteinizing hormone/i],
    unit: 'mIU/mL',
    range: [1.7, 8.6],
    meanings: {
      low: 'May indicate pituitary suppression.',
      high: 'May indicate reproductive hormone imbalance.',
      normal: 'Healthy reproductive hormone activity.'
    }
  },
  {
    name: 'Prolactin',
    category: 'Reproductive',
    regex: [/prolactin/i],
    unit: 'ng/mL',
    range: [4, 23],
    meanings: {
      low: 'Usually not clinically significant.',
      high: 'May affect fertility, menstrual cycles, or pituitary function.',
      normal: 'Healthy hormonal balance.'
    }
  },

  // =========================
  // ONCOLOGY / TUMOR MARKERS
  // =========================
  {
    name: 'PSA',
    category: 'Tumor Marker',
    regex: [/psa/i, /prostate specific antigen/i],
    unit: 'ng/mL',
    range: [0, 4],
    meanings: {
      low: 'Normal prostate marker.',
      high: 'May indicate prostate enlargement, inflammation, or malignancy.',
      normal: 'Healthy prostate marker level.'
    }
  },
  {
    name: 'CEA',
    category: 'Tumor Marker',
    regex: [/cea/i, /carcinoembryonic antigen/i],
    unit: 'ng/mL',
    range: [0, 3],
    meanings: {
      low: 'Normal tumor marker level.',
      high: 'May indicate malignancy, smoking effect, or inflammation.',
      normal: 'No abnormal tumor marker elevation.'
    }
  },

  // =========================
  // CARDIAC / MUSCLE INJURY
  // =========================
  {
    name: 'Total CK (CPK)',
    category: 'Cardiac',
    regex: [/ck\b/i, /cpk/i, /creatine kinase/i],
    unit: 'U/L',
    range: [30, 200],
    meanings: {
      low: 'Usually not clinically significant.',
      high: 'May indicate muscle injury, cardiac injury, or strenuous exercise.',
      normal: 'Healthy muscle enzyme levels.'
    }
  },
  {
    name: 'Myoglobin',
    category: 'Cardiac',
    regex: [/myoglobin/i],
    unit: 'ng/mL',
    range: [25, 72],
    meanings: {
      low: 'Usually not clinically significant.',
      high: 'May indicate muscle or heart injury.',
      normal: 'No evidence of acute muscle injury.'
    }
  },

  // =========================
  // COAGULATION / THROMBOSIS
  // =========================
  {
    name: 'Fibrinogen',
    category: 'Coagulation',
    regex: [/fibrinogen/i],
    unit: 'mg/dL',
    range: [200, 400],
    meanings: {
      low: 'May increase bleeding risk.',
      high: 'May indicate inflammation, pregnancy, or clotting risk.',
      normal: 'Healthy clotting protein level.'
    }
  },
  {
    name: 'FDP (Fibrin Degradation Products)',
    category: 'Coagulation',
    regex: [/fdp/i, /fibrin degradation/i],
    unit: 'µg/mL',
    range: [0, 10],
    meanings: {
      low: 'Normal clot breakdown activity.',
      high: 'May indicate DIC, thrombosis, or excessive clot breakdown.',
      normal: 'Healthy coagulation balance.'
    }
  },

  // =========================
  // HORMONAL / ADRENAL
  // =========================
  {
    name: 'Cortisol (Morning)',
    category: 'Endocrine',
    regex: [/cortisol/i, /serum cortisol/i],
    unit: 'µg/dL',
    range: [6, 23],
    meanings: {
      low: 'May indicate adrenal insufficiency.',
      high: 'May indicate stress response or Cushing syndrome.',
      normal: 'Healthy adrenal hormone production.'
    }
  },
  {
    name: 'ACTH',
    category: 'Endocrine',
    regex: [/acth/i, /adrenocorticotropic hormone/i],
    unit: 'pg/mL',
    range: [10, 60],
    meanings: {
      low: 'May indicate pituitary suppression.',
      high: 'May indicate adrenal or pituitary dysfunction.',
      normal: 'Healthy pituitary-adrenal signaling.'
    }
  },
  {
    name: 'DHEA-S',
    category: 'Endocrine',
    regex: [/dhea/i, /dhea-s/i],
    unit: 'µg/dL',
    range: [35, 430],
    meanings: {
      low: 'May indicate adrenal insufficiency or aging-related decline.',
      high: 'May indicate adrenal overactivity or PCOS.',
      normal: 'Healthy adrenal androgen production.'
    }
  },

  // =========================
  // REPRODUCTIVE HORMONES
  // =========================
  {
    name: 'Estradiol (E2)',
    category: 'Reproductive',
    regex: [/estradiol/i, /e2\b/i],
    unit: 'pg/mL',
    range: [10, 400],
    meanings: {
      low: 'May indicate ovarian insufficiency or menopause.',
      high: 'May indicate hormonal stimulation or endocrine disorders.',
      normal: 'Healthy estrogen balance.'
    }
  },
  {
    name: 'AMH',
    category: 'Reproductive',
    regex: [/amh/i, /anti mullerian hormone/i],
    unit: 'ng/mL',
    range: [1.0, 4.0],
    meanings: {
      low: 'May indicate reduced ovarian reserve.',
      high: 'May indicate PCOS or increased ovarian reserve.',
      normal: 'Healthy ovarian reserve marker.'
    }
  },
  {
    name: 'Beta hCG',
    category: 'Reproductive',
    regex: [/beta hcg/i, /hcg/i],
    unit: 'mIU/mL',
    range: [0, 5],
    meanings: {
      low: 'Normal non-pregnant level.',
      high: 'May indicate pregnancy, trophoblastic disease, or tumor activity.',
      normal: 'No abnormal pregnancy hormone elevation.'
    }
  },

  // =========================
  // BONE METABOLISM
  // =========================
  {
    name: 'Osteocalcin',
    category: 'Bone Health',
    regex: [/osteocalcin/i],
    unit: 'ng/mL',
    range: [11, 46],
    meanings: {
      low: 'May indicate reduced bone formation.',
      high: 'May indicate increased bone turnover.',
      normal: 'Healthy bone metabolism.'
    }
  },
  {
    name: 'Bone ALP',
    category: 'Bone Health',
    regex: [/bone alp/i, /bone alkaline phosphatase/i],
    unit: 'U/L',
    range: [15, 41],
    meanings: {
      low: 'May indicate low bone turnover.',
      high: 'May indicate bone growth or bone disease.',
      normal: 'Healthy bone remodeling.'
    }
  },

  // =========================
  // IMMUNOLOGY
  // =========================
  {
    name: 'IgG',
    category: 'Immunology',
    regex: [/igg/i, /immunoglobulin g/i],
    unit: 'mg/dL',
    range: [700, 1600],
    meanings: {
      low: 'May indicate immune deficiency.',
      high: 'May indicate chronic infection or autoimmune activity.',
      normal: 'Healthy immune antibody level.'
    }
  },
  {
    name: 'IgA',
    category: 'Immunology',
    regex: [/iga/i, /immunoglobulin a/i],
    unit: 'mg/dL',
    range: [70, 400],
    meanings: {
      low: 'May indicate immune deficiency.',
      high: 'May indicate infection or immune activation.',
      normal: 'Healthy mucosal immune defense.'
    }
  },
  {
    name: 'IgM',
    category: 'Immunology',
    regex: [/igm/i, /immunoglobulin m/i],
    unit: 'mg/dL',
    range: [40, 230],
    meanings: {
      low: 'May indicate immune deficiency.',
      high: 'May indicate recent infection or immune activation.',
      normal: 'Healthy early immune response.'
    }
  },

  // =========================
  // ONCOLOGY MARKERS
  // =========================
  {
    name: 'CA 125',
    category: 'Tumor Marker',
    regex: [/ca[\s-]?125/i],
    unit: 'U/mL',
    range: [0, 35],
    meanings: {
      low: 'Normal ovarian marker.',
      high: 'May indicate ovarian pathology, endometriosis, or malignancy.',
      normal: 'No abnormal ovarian marker elevation.'
    }
  },
  {
    name: 'CA 19-9',
    category: 'Tumor Marker',
    regex: [/ca[\s-]?19[- ]?9/i],
    unit: 'U/mL',
    range: [0, 37],
    meanings: {
      low: 'Normal gastrointestinal marker.',
      high: 'May indicate pancreatic or GI pathology.',
      normal: 'No abnormal GI tumor marker elevation.'
    }
  },
  {
    name: 'AFP',
    category: 'Tumor Marker',
    regex: [/afp/i, /alpha fetoprotein/i],
    unit: 'ng/mL',
    range: [0, 10],
    meanings: {
      low: 'Normal finding.',
      high: 'May indicate liver disease, pregnancy, or malignancy.',
      normal: 'No abnormal AFP elevation.'
    }
  },

  // =========================
  // RESPIRATORY / CRITICAL CARE
  // =========================
  {
    name: 'Oxygen Saturation (SaO2)',
    category: 'Respiratory',
    regex: [/sao2/i, /oxygen saturation/i],
    unit: '%',
    range: [95, 100],
    meanings: {
      low: 'May indicate poor oxygenation or respiratory disease.',
      high: 'Usually due to oxygen therapy.',
      normal: 'Healthy oxygen transport.'
    }
  },
  {
    name: 'Carboxyhemoglobin',
    category: 'Respiratory',
    regex: [/carboxyhemoglobin/i, /cohb/i],
    unit: '%',
    range: [0, 2],
    meanings: {
      low: 'Normal finding.',
      high: 'May indicate carbon monoxide exposure or smoking.',
      normal: 'Healthy oxygen-carrying blood.'
    }
  },

  // =========================
  // ANEMIA / HEMATOLOGY
  // =========================
  {
    name: 'Reticulocyte Count',
    category: 'Hematology',
    regex: [/reticulocyte/i, /retic count/i],
    unit: '%',
    range: [0.5, 2.5],
    meanings: {
      low: 'May indicate reduced bone marrow response or production failure.',
      high: 'May indicate active blood loss, hemolysis, or recovery from anemia.',
      normal: 'Healthy bone marrow red cell production.'
    }
  },
  {
    name: 'Haptoglobin',
    category: 'Hematology',
    regex: [/haptoglobin/i],
    unit: 'mg/dL',
    range: [30, 200],
    meanings: {
      low: 'May indicate hemolytic anemia or liver disease.',
      high: 'May indicate inflammation.',
      normal: 'Healthy red blood cell turnover.'
    }
  },
  {
    name: 'LDH',
    category: 'Hematology',
    regex: [/ldh/i, /lactate dehydrogenase/i],
    unit: 'U/L',
    range: [140, 280],
    meanings: {
      low: 'Usually not clinically significant.',
      high: 'May indicate tissue injury, hemolysis, infection, or malignancy.',
      normal: 'Healthy tissue metabolism.'
    }
  },

  // =========================
  // TRACE ELEMENTS
  // =========================
  {
    name: 'Serum Zinc',
    category: 'Trace Elements',
    regex: [/zinc/i, /serum zinc/i],
    unit: 'µg/dL',
    range: [70, 120],
    meanings: {
      low: 'May indicate nutritional deficiency, poor wound healing, or immune weakness.',
      high: 'May occur with excess supplementation.',
      normal: 'Healthy trace mineral balance.'
    }
  },
  {
    name: 'Serum Copper',
    category: 'Trace Elements',
    regex: [/copper/i, /serum copper/i],
    unit: 'µg/dL',
    range: [70, 140],
    meanings: {
      low: 'May indicate malabsorption or metabolic disorders.',
      high: 'May indicate inflammation or copper metabolism disorders.',
      normal: 'Healthy copper metabolism.'
    }
  },

  // =========================
  // METABOLIC DISORDERS
  // =========================
  {
    name: 'Ammonia',
    category: 'Metabolic',
    regex: [/ammonia/i, /serum ammonia/i],
    unit: 'µmol/L',
    range: [15, 45],
    meanings: {
      low: 'Usually not clinically significant.',
      high: 'May indicate liver dysfunction or metabolic disorders.',
      normal: 'Healthy nitrogen metabolism.'
    }
  },
  {
    name: 'Homocysteine',
    category: 'Metabolic',
    regex: [/homocysteine/i],
    unit: 'µmol/L',
    range: [5, 15],
    meanings: {
      low: 'Usually not clinically significant.',
      high: 'May indicate B12/folate deficiency or cardiovascular risk.',
      normal: 'Healthy amino acid metabolism.'
    }
  },

  // =========================
  // GASTROENTEROLOGY
  // =========================
  {
    name: 'Helicobacter pylori IgG',
    category: 'Gastroenterology',
    regex: [/h pylori/i, /helicobacter/i],
    unit: 'Index',
    range: [0, 1.0],
    meanings: {
      low: 'No evidence of significant H. pylori antibody response.',
      high: 'May indicate current or past H. pylori exposure.',
      normal: 'No abnormal H. pylori antibody elevation.'
    }
  },
  {
    name: 'Occult Blood (Stool)',
    category: 'Gastroenterology',
    regex: [/occult blood/i, /stool occult blood/i, /fobt/i],
    unit: '',
    range: [0, 0],
    meanings: {
      low: 'Normal finding.',
      high: 'May indicate gastrointestinal bleeding or colorectal pathology.',
      normal: 'No hidden blood detected.'
    }
  },

  // =========================
  // PREGNANCY / OBSTETRICS
  // =========================
  {
    name: 'PAPP-A',
    category: 'Pregnancy',
    regex: [/papp-a/i],
    unit: 'mIU/L',
    range: [0.5, 2.5],
    meanings: {
      low: 'May require obstetric evaluation depending on gestational age.',
      high: 'May reflect pregnancy-related variation.',
      normal: 'Expected pregnancy screening marker.'
    }
  },
  {
    name: 'Progesterone (Serum)',
    category: 'Pregnancy',
    regex: [/progesterone/i, /serum progesterone/i],
    unit: 'ng/mL',
    range: [2, 25],
    meanings: {
      low: 'May indicate ovulatory or pregnancy hormone insufficiency.',
      high: 'May indicate pregnancy or hormonal therapy.',
      normal: 'Healthy reproductive hormone balance.'
    }
  },

  // =========================
  // TOXICOLOGY
  // =========================
  {
    name: 'Blood Ethanol',
    category: 'Toxicology',
    regex: [/ethanol/i, /blood alcohol/i],
    unit: 'mg/dL',
    range: [0, 10],
    meanings: {
      low: 'No significant alcohol detected.',
      high: 'May indicate recent alcohol exposure or intoxication.',
      normal: 'No toxic alcohol exposure.'
    }
  },
  {
    name: 'Carbamazepine Level',
    category: 'Drug Monitoring',
    regex: [/carbamazepine/i],
    unit: 'µg/mL',
    range: [4, 12],
    meanings: {
      low: 'May be below therapeutic range.',
      high: 'May indicate toxicity risk.',
      normal: 'Therapeutic drug level.'
    }
  },
  {
    name: 'Valproic Acid Level',
    category: 'Drug Monitoring',
    regex: [/valproic acid/i, /valproate/i],
    unit: 'µg/mL',
    range: [50, 100],
    meanings: {
      low: 'May be below therapeutic range.',
      high: 'May indicate toxicity risk.',
      normal: 'Therapeutic drug level.'
    }
  },

  // =========================
  // BLOOD BANK / TRANSFUSION
  // =========================
  {
    name: 'Direct Coombs Test',
    category: 'Immunohematology',
    regex: [/direct coombs/i, /dat\b/i],
    unit: '',
    range: [0, 0],
    meanings: {
      low: 'No abnormal red cell antibody coating detected.',
      high: 'May indicate autoimmune hemolysis or transfusion reaction.',
      normal: 'No abnormal immune-mediated red cell destruction.'
    }
  },
  {
    name: 'Indirect Coombs Test',
    category: 'Immunohematology',
    regex: [/indirect coombs/i, /iat\b/i],
    unit: '',
    range: [0, 0],
    meanings: {
      low: 'No significant circulating RBC antibodies.',
      high: 'May indicate transfusion or pregnancy-related antibody formation.',
      normal: 'No abnormal blood compatibility antibodies.'
    }
  },

  // =========================
  // INFECTIOUS SEROLOGY
  // =========================
  {
    name: 'HBsAg',
    category: 'Serology',
    regex: [/hbsag/i, /hepatitis b surface antigen/i],
    unit: 'Index',
    range: [0, 1.0],
    meanings: {
      low: 'No significant hepatitis B surface antigen detected.',
      high: 'May indicate hepatitis B infection.',
      normal: 'No hepatitis B antigen detected.'
    }
  },
  {
    name: 'Anti-HCV',
    category: 'Serology',
    regex: [/anti hcv/i, /hepatitis c antibody/i],
    unit: 'Index',
    range: [0, 1.0],
    meanings: {
      low: 'No significant hepatitis C antibody detected.',
      high: 'May indicate hepatitis C exposure or infection.',
      normal: 'No hepatitis C antibody detected.'
    }
  },
  {
    name: 'HIV 1/2 Antibody',
    category: 'Serology',
    regex: [/hiv/i, /hiv 1\/2/i],
    unit: 'Index',
    range: [0, 1.0],
    meanings: {
      low: 'Non-reactive screening result.',
      high: 'Reactive screening result; confirmatory testing required.',
      normal: 'No reactive HIV screening marker.'
    }
  }
];

export function parseReportText(text: string): ReportAnalysis {
  const lowerText = text.toLowerCase();
  const results: LabResult[] = [];
  const lines = text.split('\n');
  const consumedLines = new Set<number>();

  // Clean text for the original fallback method (remove some noise but keep numbers)
  const cleanText = lowerText.replace(/[^\w\s\.\:]/g, ' ');

  // Priority parameters list to avoid prefix conflicts (e.g. Free T3 matching T3 first)
  const PRIORITY_PARAMS = [
    'Free T3',
    'Free T4',
    'HbA1c',
    'Blood Urea Nitrogen (BUN)',
    'LDL (Bad) Cholesterol',
    'HDL (Good) Cholesterol',
    'Total Cholesterol',
    'Serum Iron',
    'Urine pH',
    'Urine Specific Gravity',
    'Urine Protein',
    'Urine Sugar',
    'Urine Ketones',
    'Urine RBC',
    'Urine Pus Cells'
  ];

  // Sort LAB_PARAMETERS so priority ones are checked first
  const sortedParams = [...LAB_PARAMETERS].sort((a, b) => {
    const idxA = PRIORITY_PARAMS.indexOf(a.name);
    const idxB = PRIORITY_PARAMS.indexOf(b.name);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return 0;
  });

  // Preprocess text to normalize decimal separators (common OCR issues)
  // 1. Replace commas between digits (e.g. "14,5" -> "14.5")
  // 2. Replace spaces around decimal points (e.g. "14 . 5" -> "14.5")
  const normalizedLines = lines.map(line => {
    let l = line.toLowerCase();
    l = l.replace(/(\d+)\s*,\s*(\d+)/g, '$1.$2');
    l = l.replace(/(\d+)\s*\.\s*(\d+)/g, '$1.$2');
    return l;
  });

  for (const param of sortedParams) {
    let found = false;

    // 1. Smart line-by-line parsing
    for (let i = 0; i < normalizedLines.length; i++) {
      if (consumedLines.has(i)) continue;

      const line = normalizedLines[i];
      let matchedRegex: RegExp | null = null;
      let matchIndex = -1;

      for (const reg of param.regex) {
        // Compile the regex without the value part to find the parameter name in the line
        const nameRegex = new RegExp(reg.source, 'i');
        const nameMatch = line.match(nameRegex);
        if (nameMatch && nameMatch.index !== undefined) {
          matchedRegex = reg;
          matchIndex = nameMatch.index + nameMatch[0].length;
          break;
        }
      }

      if (matchedRegex && matchIndex !== -1) {
        // We found the parameter name on line i!
        // Let's look at the line text after the match index, and optionally combine with the next line
        let afterText = line.substring(matchIndex);
        let nextLineIndex = -1;
        
        // If there's almost nothing after the name on this line, check the next line
        if (afterText.trim().replace(/[^\w]/g, '').length === 0 && i + 1 < normalizedLines.length && !consumedLines.has(i + 1)) {
          afterText += ' ' + normalizedLines[i + 1];
          nextLineIndex = i + 1;
        }

        // Clean text slightly (keep hyphens and forward slashes for units/ranges)
        const cleanAfterText = afterText.replace(/[^\w\s\.\-\/\%–]/g, ' ');

        // Find all numbers in the cleanAfterText
        const allNumbers = cleanAfterText.match(/\d+(?:\.\d+)?/g);

        if (allNumbers && allNumbers.length > 0) {
          let extractedVal: number | null = null;

          // Heuristic 1: Look for a range pattern like X - Y or X to Y or X – Y
          const rangeRegex = /(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)/i;
          const rangeMatch = cleanAfterText.match(rangeRegex);

          let hasRange = false;
          if (rangeMatch) {
            hasRange = true;
            const r1 = parseFloat(rangeMatch[1]);
            const r2 = parseFloat(rangeMatch[2]);

            // Find a number that is not r1 and not r2 (numerically)
            const resultStr = allNumbers.find(numStr => {
              const val = parseFloat(numStr);
              return Math.abs(val - r1) > 0.001 && Math.abs(val - r2) > 0.001;
            });

            if (resultStr) {
              extractedVal = parseFloat(resultStr);
            }
          }

          // Heuristic 2: If there's only 1 number and it's not a range pattern, use it
          if (extractedVal === null && allNumbers.length === 1 && !hasRange) {
            extractedVal = parseFloat(allNumbers[0]);
          }

          // Heuristic 3: Fallback to the first number found ONLY if no range pattern was matched
          // (If a range pattern was matched but resultStr is undefined, the line only has the range boundaries, so no actual result is present!)
          if (extractedVal === null && !hasRange) {
            extractedVal = parseFloat(allNumbers[0]);
          }

          if (extractedVal !== null && !isNaN(extractedVal)) {
            let status: 'normal' | 'high' | 'low' = 'normal';
            if (extractedVal < param.range[0]) status = 'low';
            else if (extractedVal > param.range[1]) status = 'high';

            results.push({
              name: param.name,
              value: extractedVal,
              unit: param.unit,
              range: param.range,
              status,
              interpretation: param.meanings[status],
              category: param.category
            });
            
            consumedLines.add(i);
            if (nextLineIndex !== -1) consumedLines.add(nextLineIndex);
            
            found = true;
            break; // Stop searching for this parameter
          }
        }
      }
    }

    // 2. Original Fallback Matcher (if line-by-line parser didn't find it)
    if (!found) {
      for (const reg of param.regex) {
        const match = cleanText.match(new RegExp(`${reg.source}\\s*[:\\-]?\\s*(\\d+\\.?\\d*)`, 'i'));
        if (match) {
          const val = parseFloat(match[1]);
          let status: 'normal' | 'high' | 'low' = 'normal';
          if (val < param.range[0]) status = 'low';
          else if (val > param.range[1]) status = 'high';

          results.push({
            name: param.name,
            value: val,
            unit: param.unit,
            range: param.range,
            status,
            interpretation: param.meanings[status],
            category: param.category
          });
          found = true;
          break;
        }
      }
    }
  }

  if (results.length === 0) {
    return {
      summary: 'No common lab parameters were detected. Please ensure the report is clear and includes standard tests like CBC, Lipid Profile, or LFT.',
      risks: [],
      recommendations: ['Upload a higher resolution image', 'Check if the test type is supported'],
      results: [],
      alerts: [],
      urgency: 'routine',
      detectedCategories: []
    };
  }

  const categories = [...new Set(results.map(r => r.category))];
  const highResults = results.filter(r => r.status === 'high');
  const lowResults = results.filter(r => r.status === 'low');
  const abnormalCount = highResults.length + lowResults.length;

  let summary = `Detected ${results.length} parameters from ${categories.join(', ')}. `;
  if (abnormalCount === 0) {
    summary += 'All identified values are within standard reference ranges.';
  } else {
    summary += `${abnormalCount} parameter(s) are outside the normal range. Please review the detailed findings below.`;
  }

  const risks: string[] = [];
  if (highResults.some(r => r.category === 'Diabetes')) risks.push('Potential risk of hyperglycemia or diabetes.');
  if (highResults.some(r => r.category === 'Lipids')) risks.push('Elevated cardiovascular risk due to high cholesterol.');
  if (lowResults.some(r => r.name === 'Platelet Count')) risks.push('Low platelets may indicate risk of bleeding or viral infection (e.g. Dengue).');
  if (highResults.some(r => r.category === 'Liver')) risks.push('Elevated liver enzymes may indicate liver stress.');

  const recommendations = abnormalCount > 0
    ? ['Consult a healthcare professional for clinical correlation.', 'Maintain a healthy diet and stay hydrated.']
    : ['Continue your current healthy lifestyle.', 'Regular checkups are recommended annually.'];

  return {
    summary,
    risks,
    recommendations,
    results,
    alerts: abnormalCount > 0 ? ['Abnormal Lab Results Detected'] : [],
    urgency: abnormalCount > 3 ? 'urgent' : abnormalCount > 0 ? 'soon' : 'routine',
    detectedCategories: categories
  };
}
