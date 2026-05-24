import sys
import json
import re

# Medical Knowledge Base
CONDITIONS = [
    {
        "id": "headache",
        "name": "Headache",
        "keywords": ["headache", "head ache", "head pain", "forehead", "throbbing", "migraine", "head hurts"],
        "excludes": ["stomach", "chest", "leg", "back"]
    },
    {
        "id": "stomach_pain",
        "name": "Stomach Pain / Gastric",
        "keywords": ["stomach", "abdomen", "belly", "cramps", "nausea", "vomiting", "gastric", "acidity", "indigestion", "bloating", "gas", "lower abdomen", "upper abdomen"],
        "excludes": ["head", "chest", "back", "leg", "legs", "arm", "arms", "wrist", "wrists", "hand", "hands"]
    },
    {
        "id": "back_pain",
        "name": "Back Pain",
        "keywords": ["back pain", "lower back", "backache", "spine", "lumbar", "disc", "sciatica", "neck pain", "shoulder pain"],
        "excludes": ["stomach", "abdomen", "chest", "leg", "legs", "arm", "arms", "wrist", "wrists"]
    },
    {
        "id": "leg_pain",
        "name": "Leg Pain / Muscle Cramp / Strain",
        "keywords": ["leg", "legs", "ankle", "ankles", "hamstring", "calf", "heel", "achilles", "leg pain", "leg cramps", "swollen ankles", "calf stiffness", "heel pain", "achilles tendon pain", "hamstring strain"],
        "excludes": ["stomach", "abdomen", "chest", "head", "arm", "arms", "wrist", "wrists"]
    },
    {
        "id": "arm_pain",
        "name": "Arm Pain / Numbness / Wrist Ache",
        "keywords": ["arm", "arms", "wrist", "wrists", "hand", "hands", "finger", "fingers", "elbow", "elbows", "shoulder", "shoulders", "arm pain", "arm numbness", "wrist pain", "wrist ache", "hand pain", "hand numbness", "muscle weakness arm", "arm weakness", "numbness arm"],
        "excludes": ["stomach", "abdomen", "chest", "head", "leg", "legs"]
    },
    {
        "id": "fever",
        "name": "Fever",
        "keywords": ["fever", "temperature", "high temp", "chills", "shivering", "sweating", "hot body"],
        "excludes": []
    },
    {
        "id": "chest_pain",
        "name": "Chest Pain / Cardiac",
        "keywords": ["chest pain", "chest tightness", "heart pain", "breathless", "shortness of breath", "chest pressure"],
        "excludes": ["stomach", "abdomen", "back"]
    },
    {
        "id": "cold",
        "name": "Common Cold / Cough",
        "keywords": ["cold", "runny nose", "sneezing", "cough", "sore throat", "blocked nose"],
        "excludes": []
    },
    {
        "id": "endometriosis",
        "name": "Endometriosis",
        "keywords": [
            "endometriosis", "pelvic pain", "painful periods",
            "pain during periods", "pain during intercourse",
            "heavy menstrual bleeding", "chronic pelvic pain"
        ],
        "excludes": []
    },
    {
        "id": "ovarian_cyst",
        "name": "Ovarian Cyst",
        "keywords": [
            "ovarian cyst", "pelvic pressure", "lower abdomen pain",
            "pain during ovulation", "bloating near pelvis"
        ],
        "excludes": []
    },
    {
        "id": "fibroids",
        "name": "Uterine Fibroids",
        "keywords": [
            "fibroids", "heavy periods", "pelvic pressure",
            "frequent urination", "uterus pain"
        ],
        "excludes": []
    },
    {
        "id": "yeast_infection",
        "name": "Yeast Infection",
        "keywords": [
            "yeast infection", "vaginal itching", "white discharge",
            "burning sensation vaginal", "fungal vaginal infection"
        ],
        "excludes": []
    },
    {
        "id": "prostate_enlargement",
        "name": "Prostate Enlargement",
        "keywords": [
            "prostate enlargement", "difficulty urinating",
            "weak urine flow", "frequent urination at night",
            "bph"
        ],
        "excludes": []
    },
    {
        "id": "erectile_dysfunction",
        "name": "Erectile Dysfunction",
        "keywords": [
            "erectile dysfunction", "ed", "cannot maintain erection",
            "sexual weakness", "difficulty erection"
        ],
        "excludes": []
    },
    {
        "id": "breast_cancer",
        "name": "Breast Cancer Symptoms",
        "keywords": [
            "breast lump", "breast pain", "nipple discharge",
            "breast swelling", "change in breast shape"
        ],
        "excludes": []
    },
    {
        "id": "lung_cancer",
        "name": "Lung Cancer Symptoms",
        "keywords": [
            "chronic cough", "blood in cough", "chest pain",
            "unexplained weight loss", "persistent cough"
        ],
        "excludes": []
    },
    {
        "id": "colon_cancer",
        "name": "Colon Cancer Symptoms",
        "keywords": [
            "blood in stool", "colon cancer", "bowel habit changes",
            "abdominal discomfort", "unexplained anemia"
        ],
        "excludes": []
    },
    {
        "id": "brain_tumor",
        "name": "Brain Tumor Symptoms",
        "keywords": [
            "brain tumor", "persistent headache",
            "vision changes", "seizures", "balance problems"
        ],
        "excludes": []
    },
    {
        "id": "multiple_sclerosis",
        "name": "Multiple Sclerosis",
        "keywords": [
            "multiple sclerosis", "ms", "numbness",
            "vision loss", "muscle weakness", "coordination problems"
        ],
        "excludes": []
    },
    {
        "id": "bells_palsy",
        "name": "Bell's Palsy",
        "keywords": [
            "bells palsy", "face drooping",
            "facial paralysis", "unable to smile"
        ],
        "excludes": []
    },
    {
        "id": "meningitis",
        "name": "Meningitis",
        "keywords": [
            "meningitis", "stiff neck", "high fever",
            "sensitivity to light", "severe headache"
        ],
        "excludes": []
    },
    {
        "id": "bipolar_disorder",
        "name": "Bipolar Disorder",
        "keywords": [
            "bipolar", "mood swings", "mania",
            "extreme happiness", "extreme sadness"
        ],
        "excludes": []
    },
    {
        "id": "ocd",
        "name": "Obsessive Compulsive Disorder",
        "keywords": [
            "ocd", "obsessive thoughts", "compulsive behavior",
            "repeating actions", "intrusive thoughts"
        ],
        "excludes": []
    },
    {
        "id": "ptsd",
        "name": "Post Traumatic Stress Disorder",
        "keywords": [
            "ptsd", "trauma flashbacks",
            "nightmares after trauma", "panic after trauma"
        ],
        "excludes": []
    },
    {
        "id": "schizophrenia",
        "name": "Schizophrenia",
        "keywords": [
            "schizophrenia", "hearing voices",
            "hallucinations", "delusions", "paranoia"
        ],
        "excludes": []
    },
    {
        "id": "lupus",
        "name": "Lupus",
        "keywords": [
            "lupus", "butterfly rash", "joint pain autoimmune",
            "fatigue autoimmune", "skin sensitivity"
        ],
        "excludes": []
    },
    {
        "id": "crohns_disease",
        "name": "Crohn's Disease",
        "keywords": [
            "crohns disease", "chronic diarrhea",
            "abdominal cramps", "weight loss digestive"
        ],
        "excludes": []
    },
    {
        "id": "celiac_disease",
        "name": "Celiac Disease",
        "keywords": [
            "celiac", "gluten intolerance",
            "bloating after wheat", "diarrhea after gluten"
        ],
        "excludes": []
    },
    {
        "id": "deep_vein_thrombosis",
        "name": "Deep Vein Thrombosis",
        "keywords": [
            "dvt", "deep vein thrombosis",
            "swollen leg", "leg redness", "calf swelling"
        ],
        "excludes": []
    },
    {
        "id": "pulmonary_embolism",
        "name": "Pulmonary Embolism",
        "keywords": [
            "pulmonary embolism", "sudden breathlessness",
            "sharp chest pain", "blood clot lung"
        ],
        "excludes": []
    },
    {
        "id": "anaphylaxis",
        "name": "Anaphylaxis",
        "keywords": [
            "anaphylaxis", "severe allergic reaction",
            "throat swelling", "cannot breathe allergy"
        ],
        "excludes": []
    },
    {
        "id": "sepsis",
        "name": "Sepsis",
        "keywords": [
            "sepsis", "infection spreading",
            "confusion with fever", "rapid heartbeat infection"
        ],
        "excludes": []
    },
    {
        "id": "poisoning",
        "name": "Poisoning",
        "keywords": [
            "poisoning", "consumed poison",
            "toxic ingestion", "chemical poisoning"
        ],
        "excludes": []
    },
    {
        "id": "drug_overdose",
        "name": "Drug Overdose",
        "keywords": [
            "drug overdose", "too many pills",
            "overdose medicine", "unconscious after drugs"
        ],
        "excludes": []
    },
    {
        "id": "hiv_aids",
        "name": "HIV/AIDS",
        "keywords": [
            "hiv", "aids", "immune deficiency",
            "frequent infections", "weight loss hiv"
        ],
        "excludes": []
    },
    {
        "id": "hepatitis",
        "name": "Hepatitis",
        "keywords": [
            "hepatitis", "liver infection",
            "yellow skin", "dark urine", "liver swelling"
        ],
        "excludes": []
    },
    {
        "id": "influenza",
        "name": "Influenza / Flu",
        "keywords": [
            "influenza", "flu", "body aches",
            "viral fever", "fatigue with fever"
        ],
        "excludes": []
    },
    {
        "id": "conjunctivitis",
        "name": "Conjunctivitis",
        "keywords": [
            "conjunctivitis", "pink eye",
            "red eye infection", "sticky eyes"
        ],
        "excludes": []
    },
    {
        "id": "dry_eye",
        "name": "Dry Eye Syndrome",
        "keywords": [
            "dry eyes", "burning eyes",
            "eye irritation", "gritty eyes"
        ],
        "excludes": []
    },
    {
        "id": "arrhythmia",
        "name": "Arrhythmia",
        "keywords": [
            "arrhythmia", "irregular heartbeat",
            "palpitations", "heart beating fast"
        ],
        "excludes": []
    },
    {
        "id": "heart_failure",
        "name": "Heart Failure",
        "keywords": [
            "heart failure", "swollen feet",
            "breathlessness lying down", "fatigue heart"
        ],
        "excludes": []
    },
    {
        "id": "vitamin_d_deficiency",
        "name": "Vitamin D Deficiency",
        "keywords": [
            "vitamin d deficiency", "bone weakness",
            "low vitamin d", "muscle pain deficiency"
        ],
        "excludes": []
    },
    {
        "id": "vitamin_b12_deficiency",
        "name": "Vitamin B12 Deficiency",
        "keywords": [
            "vitamin b12 deficiency", "tingling hands",
            "memory issues deficiency", "fatigue b12"
        ],
        "excludes": []
    },
    {
        "id": "malnutrition",
        "name": "Malnutrition",
        "keywords": [
            "malnutrition", "poor nutrition",
            "underweight", "lack of nutrients"
        ],
        "excludes": []
    },
    {
        "id": "tmj_disorder",
        "name": "TMJ Disorder",
        "keywords": [
            "tmj", "jaw pain", "clicking jaw",
            "difficulty chewing"
        ],
        "excludes": []
    },
    {
        "id": "scabies",
        "name": "Scabies",
        "keywords": [
            "scabies", "intense itching",
            "itching at night", "skin mites"
        ],
        "excludes": []
    },
    {
        "id": "shingles",
        "name": "Shingles",
        "keywords": [
            "shingles", "painful rash",
            "burning skin rash", "herpes zoster"
        ],
        "excludes": []
    },
    {
        "id": "appendicitis_acute",
        "name": "Acute Appendicitis",
        "keywords": [
            "appendicitis", "sharp lower right pain",
            "pain near navel moving right", "rebound tenderness",
            "fever with stomach pain"
        ],
        "excludes": []
    },
    {
        "id": "intestinal_obstruction",
        "name": "Intestinal Obstruction",
        "keywords": [
            "intestinal blockage", "cannot pass stool",
            "severe abdominal swelling", "vomiting fecal matter",
            "bowel obstruction"
        ],
        "excludes": []
    },
    {
        "id": "ibs",
        "name": "Irritable Bowel Syndrome",
        "keywords": [
            "ibs", "alternating diarrhea constipation",
            "stress stomach pain", "bloating after meals",
            "irritable bowel"
        ],
        "excludes": []
    },
    {
        "id": "ulcerative_colitis",
        "name": "Ulcerative Colitis",
        "keywords": [
            "ulcerative colitis", "bloody diarrhea",
            "colon inflammation", "urgent bowel movement"
        ],
        "excludes": []
    },
    {
        "id": "diverticulitis",
        "name": "Diverticulitis",
        "keywords": [
            "diverticulitis", "left lower abdomen pain",
            "fever abdominal pain", "colon pouch infection"
        ],
        "excludes": []
    },
    {
        "id": "kidney_failure",
        "name": "Kidney Failure",
        "keywords": [
            "kidney failure", "reduced urination",
            "swelling body", "kidney dysfunction",
            "high creatinine"
        ],
        "excludes": []
    },
    {
        "id": "nephrotic_syndrome",
        "name": "Nephrotic Syndrome",
        "keywords": [
            "nephrotic syndrome", "protein in urine",
            "swollen face", "foamy urine"
        ],
        "excludes": []
    },
    {
        "id": "glomerulonephritis",
        "name": "Glomerulonephritis",
        "keywords": [
            "glomerulonephritis", "blood in urine",
            "kidney inflammation", "high blood pressure kidney"
        ],
        "excludes": []
    },
    {
        "id": "migraine_with_aura",
        "name": "Migraine With Aura",
        "keywords": [
            "migraine aura", "flashing lights headache",
            "visual aura", "zigzag vision"
        ],
        "excludes": []
    },
    {
        "id": "cluster_headache",
        "name": "Cluster Headache",
        "keywords": [
            "cluster headache", "pain behind eye",
            "severe one sided headache", "watering eye headache"
        ],
        "excludes": []
    },
    {
        "id": "trigeminal_neuralgia",
        "name": "Trigeminal Neuralgia",
        "keywords": [
            "electric shock face pain",
            "trigeminal neuralgia", "facial nerve pain"
        ],
        "excludes": []
    },
    {
        "id": "neuropathy",
        "name": "Peripheral Neuropathy",
        "keywords": [
            "burning feet", "tingling legs",
            "nerve pain", "numb feet", "pins and needles"
        ],
        "excludes": []
    },
    {
        "id": "guillain_barre",
        "name": "Guillain-Barre Syndrome",
        "keywords": [
            "ascending weakness", "sudden paralysis",
            "guillain barre", "weak legs spreading upward"
        ],
        "excludes": []
    },
    {
        "id": "myasthenia_gravis",
        "name": "Myasthenia Gravis",
        "keywords": [
            "muscle fatigue", "drooping eyelids",
            "difficulty swallowing weakness", "myasthenia"
        ],
        "excludes": []
    },
    {
        "id": "encephalitis",
        "name": "Encephalitis",
        "keywords": [
            "brain inflammation", "confusion fever",
            "encephalitis", "seizures with fever"
        ],
        "excludes": []
    },
    {
        "id": "autism_spectrum_disorder",
        "name": "Autism Spectrum Disorder",
        "keywords": [
            "autism", "speech delay",
            "poor eye contact", "repetitive behavior",
            "social communication difficulty"
        ],
        "excludes": []
    },
    {
        "id": "eating_disorder",
        "name": "Eating Disorder",
        "keywords": [
            "anorexia", "bulimia",
            "fear of weight gain", "self induced vomiting"
        ],
        "excludes": []
    },
    {
        "id": "substance_abuse",
        "name": "Substance Abuse Disorder",
        "keywords": [
            "drug addiction", "substance abuse",
            "alcohol dependence", "withdrawal symptoms"
        ],
        "excludes": []
    },
    {
        "id": "suicidal_ideation",
        "name": "Suicidal Ideation",
        "keywords": [
            "want to die", "suicidal thoughts",
            "self harm thoughts", "thinking of suicide"
        ],
        "excludes": []
    },
    {
        "id": "addisons_disease",
        "name": "Addison's Disease",
        "keywords": [
            "addisons disease", "low cortisol",
            "skin darkening", "salt craving"
        ],
        "excludes": []
    },
    {
        "id": "cushings_syndrome",
        "name": "Cushing Syndrome",
        "keywords": [
            "cushings syndrome", "moon face",
            "buffalo hump", "high cortisol"
        ],
        "excludes": []
    },
    {
        "id": "hyperthyroidism",
        "name": "Hyperthyroidism",
        "keywords": [
            "hyperthyroid", "weight loss thyroid",
            "rapid heartbeat thyroid", "heat intolerance"
        ],
        "excludes": []
    },
    {
        "id": "hypothyroidism",
        "name": "Hypothyroidism",
        "keywords": [
            "hypothyroid", "cold intolerance",
            "weight gain thyroid", "fatigue thyroid"
        ],
        "excludes": []
    },
    {
        "id": "pcos",
        "name": "Polycystic Ovary Syndrome",
        "keywords": [
            "pcos", "irregular periods",
            "facial hair female", "ovarian cysts"
        ],
        "excludes": []
    },
    {
        "id": "ectopic_pregnancy",
        "name": "Ectopic Pregnancy",
        "keywords": [
            "ectopic pregnancy", "pregnancy with pelvic pain",
            "bleeding during early pregnancy"
        ],
        "excludes": []
    },
    {
        "id": "placenta_previa",
        "name": "Placenta Previa",
        "keywords": [
            "placenta previa", "painless bleeding pregnancy",
            "third trimester bleeding"
        ],
        "excludes": []
    },
    {
        "id": "preeclampsia",
        "name": "Preeclampsia",
        "keywords": [
            "high blood pressure pregnancy",
            "swelling pregnancy", "protein urine pregnancy",
            "preeclampsia"
        ],
        "excludes": []
    },
    {
        "id": "mastitis",
        "name": "Mastitis",
        "keywords": [
            "breast infection", "painful breastfeeding",
            "mastitis", "red swollen breast"
        ],
        "excludes": []
    },
    {
        "id": "orchitis",
        "name": "Orchitis",
        "keywords": [
            "testicle pain", "orchitis",
            "swollen testicles", "painful scrotum"
        ],
        "excludes": []
    },
    {
        "id": "testicular_torsion",
        "name": "Testicular Torsion",
        "keywords": [
            "sudden testicle pain",
            "twisted testicle", "severe scrotal pain"
        ],
        "excludes": []
    },
    {
        "id": "copd",
        "name": "Chronic Obstructive Pulmonary Disease",
        "keywords": [
            "copd", "chronic smoker cough",
            "difficulty breathing smoker", "lung obstruction"
        ],
        "excludes": []
    },
    {
        "id": "pleural_effusion",
        "name": "Pleural Effusion",
        "keywords": [
            "fluid around lungs",
            "pleural effusion", "shortness breath lying"
        ],
        "excludes": []
    },
    {
        "id": "pneumothorax",
        "name": "Pneumothorax",
        "keywords": [
            "collapsed lung", "sudden chest pain breathing",
            "pneumothorax"
        ],
        "excludes": []
    },
    {
        "id": "sleep_paralysis",
        "name": "Sleep Paralysis",
        "keywords": [
            "sleep paralysis", "cannot move during sleep",
            "awake but cannot move"
        ],
        "excludes": []
    },
    {
        "id": "restless_leg_syndrome",
        "name": "Restless Leg Syndrome",
        "keywords": [
            "restless legs", "urge move legs",
            "leg discomfort at night"
        ],
        "excludes": []
    },
    {
        "id": "frozen_shoulder",
        "name": "Frozen Shoulder",
        "keywords": [
            "frozen shoulder", "stiff shoulder",
            "difficulty moving shoulder"
        ],
        "excludes": []
    },
    {
        "id": "tennis_elbow",
        "name": "Tennis Elbow",
        "keywords": [
            "tennis elbow", "outer elbow pain",
            "pain gripping objects"
        ],
        "excludes": []
    },
    {
        "id": "acl_injury",
        "name": "ACL Injury",
        "keywords": [
            "acl tear", "knee instability",
            "popping sound knee", "sports knee injury"
        ],
        "excludes": []
    },
    {
        "id": "meniscus_tear",
        "name": "Meniscus Tear",
        "keywords": [
            "meniscus tear", "locking knee",
            "pain twisting knee"
        ],
        "excludes": []
    },
    {
        "id": "osteomyelitis",
        "name": "Osteomyelitis",
        "keywords": [
            "bone infection", "osteomyelitis",
            "bone pain fever"
        ],
        "excludes": []
    },
    {
        "id": "scurvy",
        "name": "Vitamin C Deficiency / Scurvy",
        "keywords": [
            "scurvy", "bleeding gums deficiency",
            "vitamin c deficiency"
        ],
        "excludes": []
    },
    {
        "id": "rickets",
        "name": "Rickets",
        "keywords": [
            "rickets", "bowed legs child",
            "soft bones child"
        ],
        "excludes": []
    },
    {
        "id": "dehydration_severe",
        "name": "Severe Dehydration",
        "keywords": [
            "sunken eyes", "very dry mouth",
            "severe dehydration", "minimal urine"
        ],
        "excludes": []
    },
    {
        "id": "heat_exhaustion",
        "name": "Heat Exhaustion",
        "keywords": [
            "heat exhaustion", "heavy sweating",
            "weakness in heat", "dizziness heat"
        ],
        "excludes": []
    },
    {
        "id": "altitude_sickness",
        "name": "Altitude Sickness",
        "keywords": [
            "altitude sickness", "mountain sickness",
            "headache at high altitude"
        ],
        "excludes": []
    },
    {
        "id": "motion_sickness",
        "name": "Motion Sickness",
        "keywords": [
            "motion sickness", "car sickness",
            "vomiting during travel"
        ],
        "excludes": []
    },
    {
        "id": "rabies",
        "name": "Rabies",
        "keywords": [
            "rabies", "dog bite infection",
            "fear of water", "animal bite fever",
            "hydrophobia"
        ],
        "excludes": []
    },
    {
        "id": "tetanus",
        "name": "Tetanus",
        "keywords": [
            "tetanus", "lockjaw",
            "muscle spasms", "stiff jaw after injury"
        ],
        "excludes": []
    },
    {
        "id": "lyme_disease",
        "name": "Lyme Disease",
        "keywords": [
            "lyme disease", "tick bite rash",
            "bullseye rash", "joint pain after tick bite"
        ],
        "excludes": []
    },
    {
        "id": "amoebiasis",
        "name": "Amoebiasis",
        "keywords": [
            "amoebiasis", "bloody diarrhea parasite",
            "intestinal parasite", "amoeba infection"
        ],
        "excludes": []
    },
    {
        "id": "giardiasis",
        "name": "Giardiasis",
        "keywords": [
            "giardiasis", "foul smelling diarrhea",
            "parasite diarrhea", "bloating parasite"
        ],
        "excludes": []
    },
    {
        "id": "tapeworm_infection",
        "name": "Tapeworm Infection",
        "keywords": [
            "tapeworm", "worms in stool",
            "parasitic worms", "intestinal worms"
        ],
        "excludes": []
    },
    {
        "id": "oral_thrush",
        "name": "Oral Thrush",
        "keywords": [
            "oral thrush", "white patches mouth",
            "fungal mouth infection", "tongue white coating"
        ],
        "excludes": []
    },
    {
        "id": "candida_infection",
        "name": "Candida Infection",
        "keywords": [
            "candida", "fungal candida infection",
            "yeast overgrowth", "candida symptoms"
        ],
        "excludes": []
    },
    {
        "id": "cellulitis",
        "name": "Cellulitis",
        "keywords": [
            "cellulitis", "red swollen skin",
            "skin infection spreading", "painful skin redness"
        ],
        "excludes": []
    },
    {
        "id": "abscess",
        "name": "Abscess",
        "keywords": [
            "abscess", "pus filled swelling",
            "painful lump with pus", "infected boil"
        ],
        "excludes": []
    },
    {
        "id": "vitiligo",
        "name": "Vitiligo",
        "keywords": [
            "vitiligo", "white skin patches",
            "loss of skin pigment"
        ],
        "excludes": []
    },
    {
        "id": "warts",
        "name": "Warts",
        "keywords": [
            "warts", "skin wart",
            "rough skin growth", "viral wart"
        ],
        "excludes": []
    },
    {
        "id": "rosacea",
        "name": "Rosacea",
        "keywords": [
            "rosacea", "red face skin",
            "facial flushing", "persistent facial redness"
        ],
        "excludes": []
    },
    {
        "id": "sunburn",
        "name": "Sunburn",
        "keywords": [
            "sunburn", "skin burning after sun",
            "red skin sunlight", "peeling skin sun"
        ],
        "excludes": []
    },
    {
        "id": "herpes_simplex",
        "name": "Herpes Simplex",
        "keywords": [
            "herpes", "cold sores",
            "painful blisters lips", "genital herpes"
        ],
        "excludes": []
    },
    {
        "id": "peripheral_artery_disease",
        "name": "Peripheral Artery Disease",
        "keywords": [
            "pad", "leg pain walking",
            "poor blood circulation legs", "cold feet"
        ],
        "excludes": []
    },
    {
        "id": "angina",
        "name": "Angina",
        "keywords": [
            "angina", "chest pain exertion",
            "tight chest exercise", "heart chest discomfort"
        ],
        "excludes": []
    },
    {
        "id": "atrial_fibrillation",
        "name": "Atrial Fibrillation",
        "keywords": [
            "atrial fibrillation", "afib",
            "irregular pulse", "fluttering heartbeat"
        ],
        "excludes": []
    },
    {
        "id": "cardiac_arrest",
        "name": "Cardiac Arrest",
        "keywords": [
            "cardiac arrest", "collapsed suddenly",
            "no pulse", "heart stopped"
        ],
        "excludes": []
    },
    {
        "id": "deep_burn",
        "name": "Severe Burn",
        "keywords": [
            "third degree burn", "deep burn",
            "charred skin", "severe skin burn"
        ],
        "excludes": []
    },
    {
        "id": "internal_bleeding",
        "name": "Internal Bleeding",
        "keywords": [
            "internal bleeding", "blood vomiting",
            "black stools", "abdominal trauma bleeding"
        ],
        "excludes": []
    },
    {
        "id": "shock",
        "name": "Medical Shock",
        "keywords": [
            "shock", "cold clammy skin",
            "low blood pressure emergency", "weak rapid pulse"
        ],
        "excludes": []
    },
    {
        "id": "respiratory_failure",
        "name": "Respiratory Failure",
        "keywords": [
            "respiratory failure", "cannot breathe properly",
            "oxygen low", "severe breathing distress"
        ],
        "excludes": []
    },
    {
        "id": "dvt_pregnancy",
        "name": "Pregnancy Related DVT",
        "keywords": [
            "leg swelling pregnancy",
            "blood clot pregnancy", "painful calf pregnancy"
        ],
        "excludes": []
    },
    {
        "id": "miscarriage",
        "name": "Miscarriage",
        "keywords": [
            "miscarriage", "pregnancy bleeding",
            "cramps during pregnancy", "loss of pregnancy"
        ],
        "excludes": []
    },
    {
        "id": "menopause",
        "name": "Menopause",
        "keywords": [
            "menopause", "hot flashes",
            "night sweats female", "stopped periods"
        ],
        "excludes": []
    },
    {
        "id": "pelvic_inflammatory_disease",
        "name": "Pelvic Inflammatory Disease",
        "keywords": [
            "pid", "pelvic inflammatory disease",
            "pelvic infection", "painful intercourse infection"
        ],
        "excludes": []
    },
    {
        "id": "bacterial_vaginosis",
        "name": "Bacterial Vaginosis",
        "keywords": [
            "bacterial vaginosis", "fishy vaginal odor",
            "gray discharge", "vaginal infection bacteria"
        ],
        "excludes": []
    },
    {
        "id": "infertility_female",
        "name": "Female Infertility",
        "keywords": [
            "cannot conceive", "female infertility",
            "difficulty getting pregnant"
        ],
        "excludes": []
    },
    {
        "id": "infertility_male",
        "name": "Male Infertility",
        "keywords": [
            "male infertility", "low sperm count",
            "difficulty fathering child"
        ],
        "excludes": []
    },
    {
        "id": "hydrocele",
        "name": "Hydrocele",
        "keywords": [
            "hydrocele", "fluid around testicle",
            "swollen scrotum"
        ],
        "excludes": []
    },
    {
        "id": "varicocele",
        "name": "Varicocele",
        "keywords": [
            "varicocele", "enlarged scrotal veins",
            "testicle heaviness"
        ],
        "excludes": []
    },
    {
        "id": "sickle_cell_disease",
        "name": "Sickle Cell Disease",
        "keywords": [
            "sickle cell", "pain crisis",
            "abnormal red blood cells", "chronic anemia"
        ],
        "excludes": []
    },
    {
        "id": "thalassemia",
        "name": "Thalassemia",
        "keywords": [
            "thalassemia", "genetic anemia",
            "low hemoglobin inherited"
        ],
        "excludes": []
    },
    {
        "id": "hemophilia",
        "name": "Hemophilia",
        "keywords": [
            "hemophilia", "bleeding disorder",
            "excessive bleeding", "blood clotting problem"
        ],
        "excludes": []
    },
    {
        "id": "leukemia",
        "name": "Leukemia",
        "keywords": [
            "leukemia", "blood cancer",
            "frequent infections", "easy bruising",
            "persistent fatigue cancer"
        ],
        "excludes": []
    },
    {
        "id": "lymphoma",
        "name": "Lymphoma",
        "keywords": [
            "lymphoma", "swollen lymph nodes",
            "night sweats cancer", "lymph cancer"
        ],
        "excludes": []
    },
    {
        "id": "oral_cancer",
        "name": "Oral Cancer",
        "keywords": [
            "oral cancer", "mouth ulcer not healing",
            "tongue lump", "mouth growth"
        ],
        "excludes": []
    },
    {
        "id": "skin_cancer",
        "name": "Skin Cancer",
        "keywords": [
            "skin cancer", "changing mole",
            "bleeding mole", "abnormal skin growth"
        ],
        "excludes": []
    },
    {
        "id": "cervical_cancer",
        "name": "Cervical Cancer",
        "keywords": [
            "cervical cancer", "bleeding after intercourse",
            "pelvic pain cancer", "abnormal vaginal bleeding"
        ],
        "excludes": []
    },
    {
        "id": "prostate_cancer",
        "name": "Prostate Cancer",
        "keywords": [
            "prostate cancer", "difficulty urinating cancer",
            "blood in semen", "pelvic discomfort male"
        ],
        "excludes": []
    },
    {
        "id": "retinal_detachment",
        "name": "Retinal Detachment",
        "keywords": [
            "retinal detachment", "sudden vision loss",
            "floaters vision", "curtain over vision"
        ],
        "excludes": []
    },
    {
        "id": "color_blindness",
        "name": "Color Blindness",
        "keywords": [
            "color blindness", "difficulty seeing colors",
            "cannot distinguish colors"
        ],
        "excludes": []
    },
    {
        "id": "laryngitis",
        "name": "Laryngitis",
        "keywords": [
            "laryngitis", "hoarse voice",
            "voice loss", "inflamed voice box"
        ],
        "excludes": []
    },
    {
        "id": "deviated_septum",
        "name": "Deviated Septum",
        "keywords": [
            "deviated septum", "blocked nostril",
            "difficulty breathing nose"
        ],
        "excludes": []
    },
    {
        "id": "nasal_polyps",
        "name": "Nasal Polyps",
        "keywords": [
            "nasal polyps", "loss of smell",
            "nasal blockage", "polyps nose"
        ],
        "excludes": []
    },
    {
        "id": "septic_shock",
        "name": "Septic Shock",
        "keywords": [
            "septic shock", "severe infection low blood pressure",
            "confusion infection", "rapid breathing infection",
            "organ failure infection"
        ],
        "excludes": []
    },
    {
        "id": "multi_organ_failure",
        "name": "Multi Organ Failure",
        "keywords": [
            "multi organ failure", "multiple organs failing",
            "critical organ dysfunction"
        ],
        "excludes": []
    },
    {
        "id": "brain_hemorrhage",
        "name": "Brain Hemorrhage",
        "keywords": [
            "brain hemorrhage", "sudden severe headache",
            "bleeding in brain", "loss consciousness stroke"
        ],
        "excludes": []
    },
    {
        "id": "subarachnoid_hemorrhage",
        "name": "Subarachnoid Hemorrhage",
        "keywords": [
            "worst headache of life",
            "subarachnoid hemorrhage", "sudden thunderclap headache"
        ],
        "excludes": []
    },
    {
        "id": "transient_ischemic_attack",
        "name": "Transient Ischemic Attack",
        "keywords": [
            "tia", "mini stroke",
            "temporary weakness", "temporary speech difficulty"
        ],
        "excludes": []
    },
    {
        "id": "cerebral_palsy",
        "name": "Cerebral Palsy",
        "keywords": [
            "cerebral palsy", "movement disorder child",
            "muscle stiffness child", "developmental motor problem"
        ],
        "excludes": []
    },
    {
        "id": "muscular_dystrophy",
        "name": "Muscular Dystrophy",
        "keywords": [
            "muscular dystrophy", "progressive muscle weakness",
            "difficulty walking child"
        ],
        "excludes": []
    },
    {
        "id": "als",
        "name": "Amyotrophic Lateral Sclerosis",
        "keywords": [
            "als", "lou gehrig disease",
            "muscle wasting", "progressive paralysis"
        ],
        "excludes": []
    },
    {
        "id": "narcolepsy",
        "name": "Narcolepsy",
        "keywords": [
            "narcolepsy", "sudden sleep attacks",
            "daytime sleep episodes"
        ],
        "excludes": []
    },
    {
        "id": "somnambulism",
        "name": "Sleepwalking",
        "keywords": [
            "sleepwalking", "walking during sleep",
            "somnambulism"
        ],
        "excludes": []
    },
    {
        "id": "bruxism",
        "name": "Bruxism",
        "keywords": [
            "bruxism", "teeth grinding",
            "jaw clenching during sleep"
        ],
        "excludes": []
    },
    {
        "id": "tmj_lockjaw",
        "name": "TMJ Lockjaw",
        "keywords": [
            "lockjaw tmj", "jaw locking",
            "cannot open mouth fully"
        ],
        "excludes": []
    },
    {
        "id": "dry_socket",
        "name": "Dry Socket",
        "keywords": [
            "dry socket", "pain after tooth extraction",
            "exposed bone tooth removal"
        ],
        "excludes": []
    },
    {
        "id": "gingivitis",
        "name": "Gingivitis",
        "keywords": [
            "gingivitis", "bleeding gums",
            "gum inflammation", "swollen gums"
        ],
        "excludes": []
    },
    {
        "id": "periodontitis",
        "name": "Periodontitis",
        "keywords": [
            "periodontitis", "gum disease",
            "loose teeth", "receding gums"
        ],
        "excludes": []
    },
    {
        "id": "wisdom_tooth_impaction",
        "name": "Wisdom Tooth Impaction",
        "keywords": [
            "wisdom tooth pain", "impacted wisdom tooth",
            "jaw swelling wisdom tooth"
        ],
        "excludes": []
    },
    {
        "id": "sjogrens_syndrome",
        "name": "Sjogren Syndrome",
        "keywords": [
            "sjogrens syndrome", "dry mouth autoimmune",
            "dry eyes autoimmune"
        ],
        "excludes": []
    },
    {
        "id": "ankylosing_spondylitis",
        "name": "Ankylosing Spondylitis",
        "keywords": [
            "ankylosing spondylitis", "stiff lower back",
            "morning back stiffness"
        ],
        "excludes": []
    },
    {
        "id": "vasculitis",
        "name": "Vasculitis",
        "keywords": [
            "vasculitis", "inflamed blood vessels",
            "autoimmune vessel inflammation"
        ],
        "excludes": []
    },
    {
        "id": "sarcoidosis",
        "name": "Sarcoidosis",
        "keywords": [
            "sarcoidosis", "lung granulomas",
            "persistent cough granuloma"
        ],
        "excludes": []
    },
    {
        "id": "celiac_sprue",
        "name": "Celiac Sprue",
        "keywords": [
            "celiac sprue", "gluten sensitivity",
            "malabsorption gluten"
        ],
        "excludes": []
    },
    {
        "id": "gastroparesis",
        "name": "Gastroparesis",
        "keywords": [
            "gastroparesis", "slow stomach emptying",
            "full quickly eating", "vomiting undigested food"
        ],
        "excludes": []
    },
    {
        "id": "achalasia",
        "name": "Achalasia",
        "keywords": [
            "achalasia", "difficulty swallowing liquids",
            "food stuck esophagus"
        ],
        "excludes": []
    },
    {
        "id": "esophageal_spasm",
        "name": "Esophageal Spasm",
        "keywords": [
            "esophageal spasm", "pain swallowing",
            "chest pain swallowing"
        ],
        "excludes": []
    },
    {
        "id": "barretts_esophagus",
        "name": "Barrett's Esophagus",
        "keywords": [
            "barretts esophagus", "chronic acid reflux damage",
            "precancerous esophagus"
        ],
        "excludes": []
    },
    {
        "id": "fatty_liver_disease",
        "name": "Fatty Liver Disease",
        "keywords": [
            "fatty liver", "liver fat accumulation",
            "non alcoholic fatty liver"
        ],
        "excludes": []
    },
    {
        "id": "cirrhosis",
        "name": "Cirrhosis",
        "keywords": [
            "cirrhosis", "liver scarring",
            "fluid abdomen liver", "chronic liver disease"
        ],
        "excludes": []
    },
    {
        "id": "portal_hypertension",
        "name": "Portal Hypertension",
        "keywords": [
            "portal hypertension", "enlarged abdominal veins",
            "liver pressure veins"
        ],
        "excludes": []
    },
    {
        "id": "metabolic_syndrome",
        "name": "Metabolic Syndrome",
        "keywords": [
            "metabolic syndrome", "high sugar obesity",
            "high blood pressure obesity"
        ],
        "excludes": []
    },
    {
        "id": "insulin_resistance",
        "name": "Insulin Resistance",
        "keywords": [
            "insulin resistance", "prediabetes",
            "dark neck skin", "high insulin"
        ],
        "excludes": []
    },
    {
        "id": "hyperparathyroidism",
        "name": "Hyperparathyroidism",
        "keywords": [
            "hyperparathyroidism", "high calcium",
            "bone pain calcium"
        ],
        "excludes": []
    },
    {
        "id": "pituitary_tumor",
        "name": "Pituitary Tumor",
        "keywords": [
            "pituitary tumor", "hormonal imbalance tumor",
            "vision problems pituitary"
        ],
        "excludes": []
    },
    {
        "id": "adrenal_crisis",
        "name": "Adrenal Crisis",
        "keywords": [
            "adrenal crisis", "severe low cortisol",
            "shock adrenal insufficiency"
        ],
        "excludes": []
    },
    {
        "id": "osteopenia",
        "name": "Osteopenia",
        "keywords": [
            "osteopenia", "low bone density",
            "bone thinning"
        ],
        "excludes": []
    },
    {
        "id": "avascular_necrosis",
        "name": "Avascular Necrosis",
        "keywords": [
            "avascular necrosis", "bone tissue death",
            "hip pain reduced blood supply"
        ],
        "excludes": []
    },
    {
        "id": "bursitis",
        "name": "Bursitis",
        "keywords": [
            "bursitis", "joint swelling inflammation",
            "painful shoulder movement"
        ],
        "excludes": []
    },
    {
        "id": "plantar_fasciitis",
        "name": "Plantar Fasciitis",
        "keywords": [
            "plantar fasciitis", "heel pain morning",
            "foot arch pain"
        ],
        "excludes": []
    },
    {
        "id": "shin_splints",
        "name": "Shin Splints",
        "keywords": [
            "shin splints", "shin pain running",
            "lower leg exercise pain"
        ],
        "excludes": []
    },
    {
        "id": "compartment_syndrome",
        "name": "Compartment Syndrome",
        "keywords": [
            "compartment syndrome", "severe limb swelling",
            "pain out of proportion injury"
        ],
        "excludes": []
    },
    {
        "id": "flat_feet",
        "name": "Flat Feet",
        "keywords": [
            "flat feet", "fallen arches",
            "foot arch collapse"
        ],
        "excludes": []
    },
    {
        "id": "clubfoot",
        "name": "Clubfoot",
        "keywords": [
            "clubfoot", "twisted foot birth",
            "congenital foot deformity"
        ],
        "excludes": []
    },
    {
        "id": "rsv_infection",
        "name": "RSV Infection",
        "keywords": [
            "rsv", "respiratory syncytial virus",
            "baby wheezing infection"
        ],
        "excludes": []
    },
    {
        "id": "croup",
        "name": "Croup",
        "keywords": [
            "croup", "barking cough",
            "child noisy breathing"
        ],
        "excludes": []
    },
    {
        "id": "hand_foot_mouth_disease",
        "name": "Hand Foot Mouth Disease",
        "keywords": [
            "hand foot mouth disease",
            "mouth sores child", "rash hands feet"
        ],
        "excludes": []
    },
    {
        "id": "febrile_seizure",
        "name": "Febrile Seizure",
        "keywords": [
            "febrile seizure", "child seizure fever",
            "convulsion with fever child"
        ],
        "excludes": []
    },
    {
        "id": "failure_to_thrive",
        "name": "Failure To Thrive",
        "keywords": [
            "failure to thrive", "poor growth child",
            "underweight infant"
        ],
        "excludes": []
    }
    {
    "id": "pemphigus",
    "name": "Pemphigus",
    "keywords": [
        "pemphigus", "skin blisters autoimmune",
        "painful skin peeling", "mouth blisters"
    ],
    "excludes": []
},
{
    "id": "bullous_pemphigoid",
    "name": "Bullous Pemphigoid",
    "keywords": [
        "bullous pemphigoid", "large skin blisters",
        "itchy blisters elderly"
    ],
    "excludes": []
},
{
    "id": "dermatomyositis",
    "name": "Dermatomyositis",
    "keywords": [
        "dermatomyositis", "muscle weakness rash",
        "purple eyelid rash"
    ],
    "excludes": []
},
{
    "id": "polymyositis",
    "name": "Polymyositis",
    "keywords": [
        "polymyositis", "muscle inflammation",
        "difficulty climbing stairs"
    ],
    "excludes": []
},
{
    "id": "fibromyalgia",
    "name": "Fibromyalgia",
    "keywords": [
        "fibromyalgia", "widespread body pain",
        "tender points body", "chronic fatigue pain"
    ],
    "excludes": []
},
{
    "id": "chronic_fatigue_syndrome",
    "name": "Chronic Fatigue Syndrome",
    "keywords": [
        "chronic fatigue syndrome", "extreme fatigue",
        "fatigue not improving rest"
    ],
    "excludes": []
},
{
    "id": "temporomandibular_disorder",
    "name": "Temporomandibular Joint Disorder",
    "keywords": [
        "temporomandibular disorder", "jaw clicking",
        "pain chewing", "tmj pain"
    ],
    "excludes": []
},
{
    "id": "costochondritis",
    "name": "Costochondritis",
    "keywords": [
        "costochondritis", "rib chest pain",
        "pain pressing chest wall"
    ],
    "excludes": []
},
{
    "id": "pericarditis",
    "name": "Pericarditis",
    "keywords": [
        "pericarditis", "sharp chest pain lying down",
        "heart lining inflammation"
    ],
    "excludes": []
},
{
    "id": "myocarditis",
    "name": "Myocarditis",
    "keywords": [
        "myocarditis", "heart muscle inflammation",
        "viral chest pain"
    ],
    "excludes": []
},
{
    "id": "endocarditis",
    "name": "Endocarditis",
    "keywords": [
        "endocarditis", "heart valve infection",
        "fever heart murmur"
    ],
    "excludes": []
},
{
    "id": "aortic_aneurysm",
    "name": "Aortic Aneurysm",
    "keywords": [
        "aortic aneurysm", "pulsating abdomen",
        "tearing chest pain"
    ],
    "excludes": []
},
{
    "id": "aortic_dissection",
    "name": "Aortic Dissection",
    "keywords": [
        "aortic dissection", "sudden tearing back pain",
        "severe chest back pain"
    ],
    "excludes": []
},
{
    "id": "pulmonary_hypertension",
    "name": "Pulmonary Hypertension",
    "keywords": [
        "pulmonary hypertension", "shortness breath exertion",
        "high lung blood pressure"
    ],
    "excludes": []
},
{
    "id": "sleep_hypoventilation",
    "name": "Sleep Hypoventilation",
    "keywords": [
        "sleep hypoventilation", "low oxygen sleep",
        "shallow breathing sleep"
    ],
    "excludes": []
},
{
    "id": "bronchiectasis",
    "name": "Bronchiectasis",
    "keywords": [
        "bronchiectasis", "chronic mucus cough",
        "repeated lung infections"
    ],
    "excludes": []
},
{
    "id": "interstitial_lung_disease",
    "name": "Interstitial Lung Disease",
    "keywords": [
        "interstitial lung disease", "dry cough fibrosis",
        "lung scarring"
    ],
    "excludes": []
},
{
    "id": "sarcoma",
    "name": "Sarcoma",
    "keywords": [
        "sarcoma", "soft tissue tumor",
        "bone tissue cancer"
    ],
    "excludes": []
},
{
    "id": "melanoma",
    "name": "Melanoma",
    "keywords": [
        "melanoma", "dark irregular mole",
        "changing mole cancer"
    ],
    "excludes": []
},
{
    "id": "pancreatic_cancer",
    "name": "Pancreatic Cancer",
    "keywords": [
        "pancreatic cancer", "jaundice weight loss",
        "upper abdomen cancer pain"
    ],
    "excludes": []
},
{
    "id": "ovarian_cancer",
    "name": "Ovarian Cancer",
    "keywords": [
        "ovarian cancer", "pelvic bloating",
        "abdominal fullness female"
    ],
    "excludes": []
},
{
    "id": "testicular_cancer",
    "name": "Testicular Cancer",
    "keywords": [
        "testicular cancer", "testicle lump",
        "painless testicle swelling"
    ],
    "excludes": []
},
{
    "id": "bladder_cancer",
    "name": "Bladder Cancer",
    "keywords": [
        "bladder cancer", "blood urine cancer",
        "painful urination blood"
    ],
    "excludes": []
},
{
    "id": "kidney_cancer",
    "name": "Kidney Cancer",
    "keywords": [
        "kidney cancer", "flank mass",
        "blood urine kidney tumor"
    ],
    "excludes": []
},
{
    "id": "thyroid_cancer",
    "name": "Thyroid Cancer",
    "keywords": [
        "thyroid cancer", "neck lump thyroid",
        "difficulty swallowing thyroid"
    ],
    "excludes": []
},
{
    "id": "parathyroid_disorder",
    "name": "Parathyroid Disorder",
    "keywords": [
        "parathyroid disorder", "calcium imbalance",
        "parathyroid hormone problem"
    ],
    "excludes": []
},
{
    "id": "pheochromocytoma",
    "name": "Pheochromocytoma",
    "keywords": [
        "pheochromocytoma", "episodes high blood pressure",
        "sweating palpitations tumor"
    ],
    "excludes": []
},
{
    "id": "diabetic_ketoacidosis",
    "name": "Diabetic Ketoacidosis",
    "keywords": [
        "dka", "diabetic ketoacidosis",
        "fruity breath diabetes", "deep rapid breathing"
    ],
    "excludes": []
},
{
    "id": "hyperosmolar_state",
    "name": "Hyperosmolar Hyperglycemic State",
    "keywords": [
        "hyperosmolar state", "very high blood sugar",
        "severe dehydration diabetes"
    ],
    "excludes": []
},
{
    "id": "hypoglycemia",
    "name": "Hypoglycemia",
    "keywords": [
        "low blood sugar", "hypoglycemia",
        "sweating shaking hunger"
    ],
    "excludes": []
},
{
    "id": "diabetic_neuropathy",
    "name": "Diabetic Neuropathy",
    "keywords": [
        "diabetic neuropathy", "burning feet diabetes",
        "numb feet diabetes"
    ],
    "excludes": []
},
{
    "id": "diabetic_retinopathy",
    "name": "Diabetic Retinopathy",
    "keywords": [
        "diabetic retinopathy", "vision loss diabetes",
        "blurred vision diabetes"
    ],
    "excludes": []
},
{
    "id": "macular_degeneration",
    "name": "Macular Degeneration",
    "keywords": [
        "macular degeneration", "central vision loss",
        "blurred center vision"
    ],
    "excludes": []
},
{
    "id": "uveitis",
    "name": "Uveitis",
    "keywords": [
        "uveitis", "eye inflammation pain",
        "light sensitivity eye"
    ],
    "excludes": []
},
{
    "id": "keratitis",
    "name": "Keratitis",
    "keywords": [
        "keratitis", "cornea infection",
        "painful red eye"
    ],
    "excludes": []
},
{
    "id": "otitis_media",
    "name": "Otitis Media",
    "keywords": [
        "middle ear infection", "otitis media",
        "ear pain fever child"
    ],
    "excludes": []
},
{
    "id": "mastoiditis",
    "name": "Mastoiditis",
    "keywords": [
        "mastoiditis", "swelling behind ear",
        "ear infection spreading"
    ],
    "excludes": []
},
{
    "id": "menieres_disease",
    "name": "Meniere Disease",
    "keywords": [
        "menieres disease", "ringing ears vertigo",
        "hearing loss vertigo"
    ],
    "excludes": []
},
{
    "id": "labyrinthitis",
    "name": "Labyrinthitis",
    "keywords": [
        "labyrinthitis", "inner ear infection dizziness",
        "vertigo ear infection"
    ],
    "excludes": []
},
{
    "id": "benign_positional_vertigo",
    "name": "Benign Positional Vertigo",
    "keywords": [
        "bppv", "positional vertigo",
        "dizziness head movement"
    ],
    "excludes": []
},
{
    "id": "epiglottitis",
    "name": "Epiglottitis",
    "keywords": [
        "epiglottitis", "drooling difficulty swallowing",
        "severe throat swelling"
    ],
    "excludes": []
},
{
    "id": "tonsil_abscess",
    "name": "Peritonsillar Abscess",
    "keywords": [
        "tonsil abscess", "one sided throat swelling",
        "difficulty opening mouth"
    ],
    "excludes": []
},
{
    "id": "diphtheria",
    "name": "Diphtheria",
    "keywords": [
        "diphtheria", "gray throat membrane",
        "severe sore throat toxin"
    ],
    "excludes": []
},
{
    "id": "whooping_cough",
    "name": "Whooping Cough",
    "keywords": [
        "whooping cough", "pertussis",
        "violent coughing fits"
    ],
    "excludes": []
},
{
    "id": "scarlet_fever",
    "name": "Scarlet Fever",
    "keywords": [
        "scarlet fever", "sandpaper rash",
        "strep throat rash"
    ],
    "excludes": []
},
{
    "id": "rheumatic_fever",
    "name": "Rheumatic Fever",
    "keywords": [
        "rheumatic fever", "joint pain after strep",
        "heart inflammation strep"
    ],
    "excludes": []
}
{
    "id": "pagets_disease_bone",
    "name": "Paget Disease of Bone",
    "keywords": [
        "paget disease bone", "abnormal bone growth",
        "bone deformity", "enlarged skull"
    ],
    "excludes": []
},
{
    "id": "ehlers_danlos_syndrome",
    "name": "Ehlers Danlos Syndrome",
    "keywords": [
        "ehlers danlos", "hypermobile joints",
        "stretchy skin", "joint dislocations"
    ],
    "excludes": []
},
{
    "id": "marfan_syndrome",
    "name": "Marfan Syndrome",
    "keywords": [
        "marfan syndrome", "tall thin body",
        "long fingers", "aortic problems"
    ],
    "excludes": []
},
{
    "id": "turner_syndrome",
    "name": "Turner Syndrome",
    "keywords": [
        "turner syndrome", "short stature female",
        "delayed puberty girl"
    ],
    "excludes": []
},
{
    "id": "down_syndrome",
    "name": "Down Syndrome",
    "keywords": [
        "down syndrome", "developmental delay",
        "chromosomal disorder"
    ],
    "excludes": []
},
{
    "id": "fragile_x_syndrome",
    "name": "Fragile X Syndrome",
    "keywords": [
        "fragile x syndrome", "intellectual disability inherited",
        "autism features genetic"
    ],
    "excludes": []
},
{
    "id": "huntingtons_disease",
    "name": "Huntington Disease",
    "keywords": [
        "huntingtons disease", "involuntary movements",
        "genetic neurological disorder"
    ],
    "excludes": []
},
{
    "id": "wilsons_disease",
    "name": "Wilson Disease",
    "keywords": [
        "wilsons disease", "copper accumulation",
        "liver neurological symptoms"
    ],
    "excludes": []
},
{
    "id": "hemochromatosis",
    "name": "Hemochromatosis",
    "keywords": [
        "hemochromatosis", "iron overload",
        "bronze skin diabetes"
    ],
    "excludes": []
},
{
    "id": "g6pd_deficiency",
    "name": "G6PD Deficiency",
    "keywords": [
        "g6pd deficiency", "hemolytic anemia",
        "jaundice after medication"
    ],
    "excludes": []
},
{
    "id": "aplastic_anemia",
    "name": "Aplastic Anemia",
    "keywords": [
        "aplastic anemia", "bone marrow failure",
        "low blood cell counts"
    ],
    "excludes": []
},
{
    "id": "polycythemia",
    "name": "Polycythemia",
    "keywords": [
        "polycythemia", "high red blood cells",
        "thick blood symptoms"
    ],
    "excludes": []
},
{
    "id": "myelofibrosis",
    "name": "Myelofibrosis",
    "keywords": [
        "myelofibrosis", "bone marrow scarring",
        "enlarged spleen fatigue"
    ],
    "excludes": []
},
{
    "id": "essential_thrombocythemia",
    "name": "Essential Thrombocythemia",
    "keywords": [
        "essential thrombocythemia", "high platelet count",
        "blood clot risk"
    ],
    "excludes": []
},
{
    "id": "disseminated_intravascular_coagulation",
    "name": "Disseminated Intravascular Coagulation",
    "keywords": [
        "dic", "uncontrolled clotting bleeding",
        "disseminated intravascular coagulation"
    ],
    "excludes": []
},
{
    "id": "thrombocytopenia",
    "name": "Thrombocytopenia",
    "keywords": [
        "low platelets", "thrombocytopenia",
        "easy bruising bleeding"
    ],
    "excludes": []
},
{
    "id": "immune_thrombocytopenic_purpura",
    "name": "Immune Thrombocytopenic Purpura",
    "keywords": [
        "itp", "immune thrombocytopenia",
        "purple skin spots low platelets"
    ],
    "excludes": []
},
{
    "id": "glomerular_disease",
    "name": "Glomerular Disease",
    "keywords": [
        "glomerular disease", "protein blood urine",
        "kidney filter damage"
    ],
    "excludes": []
},
{
    "id": "renal_tubular_acidosis",
    "name": "Renal Tubular Acidosis",
    "keywords": [
        "renal tubular acidosis", "acid base imbalance kidney",
        "kidney acid disorder"
    ],
    "excludes": []
},
{
    "id": "hydronephrosis",
    "name": "Hydronephrosis",
    "keywords": [
        "hydronephrosis", "swollen kidney",
        "urine blockage kidney"
    ],
    "excludes": []
},
{
    "id": "vesicoureteral_reflux",
    "name": "Vesicoureteral Reflux",
    "keywords": [
        "vesicoureteral reflux", "urine backflow",
        "recurrent uti child"
    ],
    "excludes": []
},
{
    "id": "urethral_stricture",
    "name": "Urethral Stricture",
    "keywords": [
        "urethral stricture", "weak urine stream",
        "narrow urethra"
    ],
    "excludes": []
},
{
    "id": "peyronies_disease",
    "name": "Peyronie Disease",
    "keywords": [
        "peyronie disease", "curved penis",
        "painful erection curve"
    ],
    "excludes": []
},
{
    "id": "lichen_planus",
    "name": "Lichen Planus",
    "keywords": [
        "lichen planus", "itchy purple rash",
        "mouth white streaks"
    ],
    "excludes": []
},
{
    "id": "hidradenitis_suppurativa",
    "name": "Hidradenitis Suppurativa",
    "keywords": [
        "hidradenitis suppurativa", "painful underarm lumps",
        "recurrent skin abscesses"
    ],
    "excludes": []
},
{
    "id": "seborrheic_dermatitis",
    "name": "Seborrheic Dermatitis",
    "keywords": [
        "seborrheic dermatitis", "dandruff rash",
        "oily flaky skin"
    ],
    "excludes": []
},
{
    "id": "alopecia_areata",
    "name": "Alopecia Areata",
    "keywords": [
        "alopecia areata", "patchy hair loss",
        "round bald patches"
    ],
    "excludes": []
},
{
    "id": "impetigo",
    "name": "Impetigo",
    "keywords": [
        "impetigo", "honey crust rash",
        "contagious skin infection"
    ],
    "excludes": []
},
{
    "id": "erysipelas",
    "name": "Erysipelas",
    "keywords": [
        "erysipelas", "raised red skin infection",
        "fever skin redness"
    ],
    "excludes": []
},
{
    "id": "necrotizing_fasciitis",
    "name": "Necrotizing Fasciitis",
    "keywords": [
        "necrotizing fasciitis", "flesh eating bacteria",
        "rapid tissue destruction"
    ],
    "excludes": []
},
{
    "id": "toxic_shock_syndrome",
    "name": "Toxic Shock Syndrome",
    "keywords": [
        "toxic shock syndrome", "high fever rash shock",
        "tampon associated infection"
    ],
    "excludes": []
},
{
    "id": "botulism",
    "name": "Botulism",
    "keywords": [
        "botulism", "descending paralysis",
        "food toxin paralysis"
    ],
    "excludes": []
},
{
    "id": "legionnaires_disease",
    "name": "Legionnaires Disease",
    "keywords": [
        "legionnaires disease", "severe pneumonia water source",
        "legionella infection"
    ],
    "excludes": []
},
{
    "id": "brucellosis",
    "name": "Brucellosis",
    "keywords": [
        "brucellosis", "fever animal exposure",
        "undulating fever"
    ],
    "excludes": []
},
{
    "id": "leptospirosis",
    "name": "Leptospirosis",
    "keywords": [
        "leptospirosis", "fever flood water",
        "rat urine infection"
    ],
    "excludes": []
},
{
    "id": "filariasis",
    "name": "Filariasis",
    "keywords": [
        "filariasis", "elephantiasis",
        "swollen limbs parasite"
    ],
    "excludes": []
},
{
    "id": "onchocerciasis",
    "name": "Onchocerciasis",
    "keywords": [
        "onchocerciasis", "river blindness",
        "parasitic eye disease"
    ],
    "excludes": []
},
{
    "id": "toxoplasmosis",
    "name": "Toxoplasmosis",
    "keywords": [
        "toxoplasmosis", "cat parasite infection",
        "brain infection parasite"
    ],
    "excludes": []
},
{
    "id": "cryptosporidiosis",
    "name": "Cryptosporidiosis",
    "keywords": [
        "cryptosporidiosis", "waterborne diarrhea parasite",
        "persistent watery diarrhea"
    ],
    "excludes": []
},
{
    "id": "rotavirus_infection",
    "name": "Rotavirus Infection",
    "keywords": [
        "rotavirus", "child severe diarrhea",
        "vomiting infant virus"
    ],
    "excludes": []
},
{
    "id": "norovirus",
    "name": "Norovirus Infection",
    "keywords": [
        "norovirus", "viral vomiting diarrhea",
        "stomach flu outbreak"
    ],
    "excludes": []
},
{
    "id": "ebola",
    "name": "Ebola Virus Disease",
    "keywords": [
        "ebola", "viral hemorrhagic fever",
        "bleeding fever virus"
    ],
    "excludes": []
},
{
    "id": "yellow_fever",
    "name": "Yellow Fever",
    "keywords": [
        "yellow fever", "mosquito jaundice fever",
        "viral liver fever"
    ],
    "excludes": []
},
{
    "id": "zika_virus",
    "name": "Zika Virus Infection",
    "keywords": [
        "zika", "mosquito rash fever",
        "pregnancy zika infection"
    ],
    "excludes": []
},
{
    "id": "monkeypox",
    "name": "Monkeypox",
    "keywords": [
        "monkeypox", "pox lesions",
        "swollen lymph nodes rash"
    ],
    "excludes": []
}
{
    "id": "acute_respiratory_distress_syndrome",
    "name": "Acute Respiratory Distress Syndrome",
    "keywords": [
        "ards", "acute respiratory distress syndrome",
        "severe lung failure", "low oxygen severe infection"
    ],
    "excludes": []
},
{
    "id": "aspiration_pneumonia",
    "name": "Aspiration Pneumonia",
    "keywords": [
        "aspiration pneumonia", "food into lungs",
        "cough after vomiting", "breathing difficulty aspiration"
    ],
    "excludes": []
},
{
    "id": "silicosis",
    "name": "Silicosis",
    "keywords": [
        "silicosis", "dust lung disease",
        "silica exposure cough"
    ],
    "excludes": []
},
{
    "id": "asbestosis",
    "name": "Asbestosis",
    "keywords": [
        "asbestosis", "asbestos lung disease",
        "occupational lung fibrosis"
    ],
    "excludes": []
},
{
    "id": "coal_workers_pneumoconiosis",
    "name": "Coal Workers Pneumoconiosis",
    "keywords": [
        "black lung disease", "coal workers pneumoconiosis",
        "coal dust lung disease"
    ],
    "excludes": []
},
{
    "id": "hypersensitivity_pneumonitis",
    "name": "Hypersensitivity Pneumonitis",
    "keywords": [
        "hypersensitivity pneumonitis",
        "allergic lung inflammation",
        "farmer lung disease"
    ],
    "excludes": []
},
{
    "id": "goodpasture_syndrome",
    "name": "Goodpasture Syndrome",
    "keywords": [
        "goodpasture syndrome", "lung kidney autoimmune",
        "coughing blood kidney disease"
    ],
    "excludes": []
},
{
    "id": "behcets_disease",
    "name": "Behcet Disease",
    "keywords": [
        "behcet disease", "mouth genital ulcers",
        "eye inflammation ulcers"
    ],
    "excludes": []
},
{
    "id": "raynauds_phenomenon",
    "name": "Raynaud Phenomenon",
    "keywords": [
        "raynaud phenomenon", "fingers turn white cold",
        "cold induced finger color change"
    ],
    "excludes": []
},
{
    "id": "scleroderma",
    "name": "Scleroderma",
    "keywords": [
        "scleroderma", "tight skin autoimmune",
        "hard skin disease"
    ],
    "excludes": []
},
{
    "id": "mixed_connective_tissue_disease",
    "name": "Mixed Connective Tissue Disease",
    "keywords": [
        "mixed connective tissue disease",
        "overlap autoimmune disease"
    ],
    "excludes": []
},
{
    "id": "reactive_arthritis",
    "name": "Reactive Arthritis",
    "keywords": [
        "reactive arthritis", "joint pain after infection",
        "arthritis after diarrhea"
    ],
    "excludes": []
},
{
    "id": "juvenile_arthritis",
    "name": "Juvenile Idiopathic Arthritis",
    "keywords": [
        "juvenile arthritis", "child joint swelling",
        "arthritis child"
    ],
    "excludes": []
},
{
    "id": "osteogenesis_imperfecta",
    "name": "Osteogenesis Imperfecta",
    "keywords": [
        "osteogenesis imperfecta", "brittle bones",
        "frequent fractures child"
    ],
    "excludes": []
},
{
    "id": "slipped_disc",
    "name": "Slipped Disc",
    "keywords": [
        "slipped disc", "herniated disc",
        "radiating back pain"
    ],
    "excludes": []
},
{
    "id": "cauda_equina_syndrome",
    "name": "Cauda Equina Syndrome",
    "keywords": [
        "cauda equina syndrome", "loss bladder control back pain",
        "numbness saddle area"
    ],
    "excludes": []
},
{
    "id": "spinal_stenosis",
    "name": "Spinal Stenosis",
    "keywords": [
        "spinal stenosis", "back pain walking",
        "narrow spinal canal"
    ],
    "excludes": []
},
{
    "id": "carpal_tunnel_syndrome",
    "name": "Carpal Tunnel Syndrome",
    "keywords": [
        "carpal tunnel syndrome", "tingling fingers",
        "wrist nerve compression"
    ],
    "excludes": []
},
{
    "id": "cubital_tunnel_syndrome",
    "name": "Cubital Tunnel Syndrome",
    "keywords": [
        "cubital tunnel syndrome", "ulnar nerve pain",
        "ring finger numbness"
    ],
    "excludes": []
},
{
    "id": "bell_palsy",
    "name": "Bell Palsy",
    "keywords": [
        "bell palsy", "face drooping one side",
        "facial paralysis sudden"
    ],
    "excludes": []
},
{
    "id": "meningococcal_meningitis",
    "name": "Meningococcal Meningitis",
    "keywords": [
        "meningococcal meningitis", "fever neck stiffness rash",
        "bacterial meningitis"
    ],
    "excludes": []
},
{
    "id": "brain_tumor",
    "name": "Brain Tumor",
    "keywords": [
        "brain tumor", "persistent headache vomiting",
        "seizures brain mass"
    ],
    "excludes": []
},
{
    "id": "pituitary_apoplexy",
    "name": "Pituitary Apoplexy",
    "keywords": [
        "pituitary apoplexy", "sudden headache vision loss",
        "pituitary bleeding"
    ],
    "excludes": []
},
{
    "id": "hydrocephalus",
    "name": "Hydrocephalus",
    "keywords": [
        "hydrocephalus", "fluid in brain",
        "large head infant"
    ],
    "excludes": []
},
{
    "id": "craniosynostosis",
    "name": "Craniosynostosis",
    "keywords": [
        "craniosynostosis", "abnormal skull shape",
        "premature skull fusion"
    ],
    "excludes": []
},
{
    "id": "retinoblastoma",
    "name": "Retinoblastoma",
    "keywords": [
        "retinoblastoma", "white pupil child",
        "eye cancer child"
    ],
    "excludes": []
},
{
    "id": "strabismus",
    "name": "Strabismus",
    "keywords": [
        "strabismus", "crossed eyes",
        "misaligned eyes"
    ],
    "excludes": []
},
{
    "id": "amblyopia",
    "name": "Amblyopia",
    "keywords": [
        "amblyopia", "lazy eye",
        "reduced vision one eye"
    ],
    "excludes": []
},
{
    "id": "retinitis_pigmentosa",
    "name": "Retinitis Pigmentosa",
    "keywords": [
        "retinitis pigmentosa", "night blindness",
        "tunnel vision"
    ],
    "excludes": []
},
{
    "id": "optic_neuritis",
    "name": "Optic Neuritis",
    "keywords": [
        "optic neuritis", "pain eye movement",
        "sudden vision loss"
    ],
    "excludes": []
},
{
    "id": "cholesteatoma",
    "name": "Cholesteatoma",
    "keywords": [
        "cholesteatoma", "foul ear discharge",
        "abnormal ear skin growth"
    ],
    "excludes": []
},
{
    "id": "otosclerosis",
    "name": "Otosclerosis",
    "keywords": [
        "otosclerosis", "hearing loss bone ear",
        "progressive hearing loss"
    ],
    "excludes": []
},
{
    "id": "sleep_terrors",
    "name": "Sleep Terrors",
    "keywords": [
        "sleep terrors", "night screaming child",
        "terror episodes sleep"
    ],
    "excludes": []
},
{
    "id": "oppositional_defiant_disorder",
    "name": "Oppositional Defiant Disorder",
    "keywords": [
        "oppositional defiant disorder",
        "defiant child behavior",
        "frequent anger child"
    ],
    "excludes": []
},
{
    "id": "conduct_disorder",
    "name": "Conduct Disorder",
    "keywords": [
        "conduct disorder", "aggressive behavior child",
        "rule breaking behavior"
    ],
    "excludes": []
},
{
    "id": "dyslexia",
    "name": "Dyslexia",
    "keywords": [
        "dyslexia", "reading difficulty",
        "learning disorder reading"
    ],
    "excludes": []
},
{
    "id": "dyscalculia",
    "name": "Dyscalculia",
    "keywords": [
        "dyscalculia", "difficulty mathematics",
        "math learning disorder"
    ],
    "excludes": []
},
{
    "id": "speech_delay",
    "name": "Speech Delay",
    "keywords": [
        "speech delay", "late talking child",
        "delayed speech development"
    ],
    "excludes": []
},
{
    "id": "aphasia",
    "name": "Aphasia",
    "keywords": [
        "aphasia", "difficulty speaking",
        "language impairment stroke"
    ],
    "excludes": []
},
{
    "id": "apraxia",
    "name": "Apraxia",
    "keywords": [
        "apraxia", "difficulty planned movements",
        "motor planning disorder"
    ],
    "excludes": []
},
{
    "id": "dissociative_disorder",
    "name": "Dissociative Disorder",
    "keywords": [
        "dissociative disorder", "memory gaps",
        "feeling detached reality"
    ],
    "excludes": []
},
{
    "id": "conversion_disorder",
    "name": "Conversion Disorder",
    "keywords": [
        "conversion disorder", "neurological symptoms stress",
        "functional neurological symptoms"
    ],
    "excludes": []
},
{
    "id": "body_dysmorphic_disorder",
    "name": "Body Dysmorphic Disorder",
    "keywords": [
        "body dysmorphic disorder",
        "obsession appearance flaws",
        "distorted body image"
    ],
    "excludes": []
},
{
    "id": "trichotillomania",
    "name": "Trichotillomania",
    "keywords": [
        "trichotillomania", "hair pulling disorder",
        "compulsive hair pulling"
    ],
    "excludes": []
},
{
    "id": "kleptomania",
    "name": "Kleptomania",
    "keywords": [
        "kleptomania", "compulsive stealing",
        "impulse control stealing"
    ],
    "excludes": []
}
]

def classify_query(query):
    query = query.lower()
    
    # Negation detection
    negations = ["no ", "not ", "don't ", "dont ", "never ", "without "]
    
    best_match = None
    max_score = 0
    
    for condition in CONDITIONS:
        score = 0
        
        # 1. Direct Keyword Matching with Negation Check
        for kw in condition["keywords"]:
            if kw in query:
                # Check if this keyword is negated
                start_idx = query.find(kw)
                prefix = query[max(0, start_idx-15):start_idx]
                is_negated = any(neg in prefix for neg in negations)
                
                if is_negated:
                    score -= 50 # Strongly penalize negated symptoms
                else:
                    # Give higher weight to longer matches
                    score += (len(kw) * 3)
        
        # 2. Body Part Context (High specificity)
        # If 'abdomen' is mentioned, it's almost certainly stomach_pain
        if condition["id"] == "stomach_pain" and "abdomen" in query:
            score += 40
            
        # 3. Disambiguation (Excludes)
        for exclude in condition.get("excludes", []):
            if exclude in query:
                score -= 100 
                
        if score > max_score:
            max_score = score
            best_match = condition
            
    if best_match and max_score > 5:
        return {"id": best_match["id"], "score": max_score}
    return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No query provided"}))
        sys.exit(1)
        
    query_text = " ".join(sys.argv[1:])
    result = classify_query(query_text)
    print(json.dumps(result))
