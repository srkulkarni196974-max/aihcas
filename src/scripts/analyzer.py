import sys
import json
import os
import re
import difflib

# ─── Tesseract Path Detection ──────────────────────────────────────────────────
tesseract_paths = [
    '/usr/bin/tesseract',
    '/usr/local/bin/tesseract',
    r'C:\Program Files\Tesseract-OCR\tesseract.exe',
    r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
]

def find_tesseract():
    for p in tesseract_paths:
        if os.path.exists(p):
            return p
    return None

# ─── Data Loading ─────────────────────────────────────────────────────────────
def load_medications():
    try:
        # Try different possible paths for medications.json
        cwd = os.getcwd()
        script_dir = os.path.dirname(os.path.abspath(__file__))
        paths = [
            os.path.join(cwd, 'src', 'data', 'medications.json'),
            os.path.join(script_dir, '..', 'data', 'medications.json'),
            os.path.join(cwd, 'aihcas', 'src', 'data', 'medications.json'),
            '/opt/render/project/src/src/data/medications.json' # Render specific path
        ]
        for p in paths:
            if os.path.exists(p):
                with open(p, 'r', encoding='utf-8') as f:
                    return json.load(f)
    except Exception as e:
        pass
    return []

# ─── Parsing Logic (Prescription) ──────────────────────────────────────────────

def extract_dosage(line):
    mg = re.search(r'\d+\.?\d*\s*(?:mg|mcg|ml|g|iu|units?)', line, re.IGNORECASE)
    if mg: return mg.group(0).strip()
    tab = re.search(r'\d+\s*(?:tab(?:let)?s?|cap(?:sule)?s?|pill?s?)', line, re.IGNORECASE)
    return tab.group(0).strip() if tab else 'As prescribed'

def extract_timing(line):
    line = line.lower()
    schedule = re.search(r'\b([01]-[01]-[01])\b', line)
    if schedule:
        parts = []
        try:
            m, a, n = map(int, schedule.group(1).split('-'))
            if m: parts.append('Morning')
            if a: parts.append('Afternoon')
            if n: parts.append('Night')
            return f"{schedule.group(1)} ({' + '.join(parts)})"
        except: pass
    
    if re.search(r'once\s*daily|od\b', line): return '1-0-0 (Once daily)'
    if re.search(r'twice\s*daily|bd\b|bid\b', line): return '1-0-1 (Twice daily)'
    if re.search(r'thrice\s*daily|tds\b|tid\b', line): return '1-1-1 (Thrice daily)'
    if re.search(r'four\s*times|qid\b', line): return '1-1-1-1 (Four times daily)'
    if re.search(r'at\s*night|hs\b|bedtime', line): return '0-0-1 (Night)'
    if re.search(r'morning', line): return '1-0-0 (Morning)'
    if re.search(r'sos\b|as\s*needed|prn\b|when\s*required', line): return 'SOS (As needed)'
    return 'As directed'

def extract_duration(text):
    match = re.search(r'(\d+)\s*(day|days|week|weeks|month|months)', text, re.IGNORECASE)
    if match: return f"{match.group(1)} {match.group(2)}"
    if re.search(r'continue|ongoing|long[\s-]term', text, re.IGNORECASE): return 'Ongoing'
    if re.search(r'sos|as\s*needed|prn', text, re.IGNORECASE): return 'As needed'
    return 'As prescribed'

def is_fuzzy_match(word, target):
    if len(word) < 3: return word.lower() == target.lower()
    ratio = difflib.SequenceMatcher(None, word.lower(), target.lower()).ratio()
    return ratio > 0.8 # Tightened slightly for better accuracy

def analyze_prescription(text):
    meds_db = load_medications()
    text_lower = text.lower()
    words = re.findall(r'\w+', text_lower)
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    
    found = []
    global_warnings = []
    
    for drug in meds_db:
        matched = False
        for name in drug['names']:
            lower_name = name.lower()
            if lower_name in text_lower:
                matched = True
            else:
                for word in words:
                    if is_fuzzy_match(word, lower_name):
                        matched = True
                        break
            
            if matched:
                matched_line = next((l for l in lines if lower_name in l.lower() or any(is_fuzzy_match(w, lower_name) for w in re.findall(r'\w+', l))), name)
                
                found.append({
                    "name": drug['names'][0].title(),
                    "dosage": extract_dosage(matched_line),
                    "timing": extract_timing(matched_line),
                    "duration": extract_duration(text),
                    "purpose": drug['purpose'],
                    "drugClass": drug['drugClass'],
                    "warnings": drug['warnings'],
                    "instructions": drug['instructions']
                })
                for w in drug['warnings']:
                    if w not in global_warnings: global_warnings.append(w)
                break
    
    summary = ""
    if found:
        classes = list(set([f['drugClass'].split('–')[0].strip() for f in found]))
        summary = f"Found {len(found)} medication{'s' if len(found) > 1 else ''}. Treating: {', '.join(classes[:3])}. Follow doctor's advice."
    else:
        summary = "Could not automatically identify medications. Please type manually or use a clearer image."
        
    return {
        "medications": found,
        "summary": summary,
        "warnings": global_warnings[:6],
        "generalAdvice": "Complete all antibiotic courses fully. Keep out of reach of children.",
        "allergyAlert": None
    }

# ─── Parsing Logic (Report) ───────────────────────────────────────────────────

LAB_PARAMS = [
    # CBC
    {"name": "Hemoglobin", "regex": r'hemoglobin|hgb|hb\b', "unit": "g/dL", "range": [12.0, 16.5], "cat": "CBC"},
    {"name": "WBC Count", "regex": r'wbc|white blood cell|leukocyte', "unit": "cells/mm³", "range": [4000, 11000], "cat": "CBC"},
    {"name": "Platelets", "regex": r'platelet|plt|thrombocyte', "unit": "lakhs/mm³", "range": [1.5, 4.5], "cat": "CBC"},
    {"name": "RBC Count", "regex": r'rbc|red blood cell', "unit": "million/µL", "range": [4.2, 5.9], "cat": "CBC"},
    {"name": "Hematocrit", "regex": r'hematocrit|hct\b|pcv\b', "unit": "%", "range": [36, 50], "cat": "CBC"},
    {"name": "MCV", "regex": r'mcv|mean corpuscular volume', "unit": "fL", "range": [80, 100], "cat": "CBC"},
    
    # Diabetes
    {"name": "Fasting Glucose", "regex": r'fasting glucose|glucose fasting|fbs\b', "unit": "mg/dL", "range": [70, 99], "cat": "Diabetes"},
    {"name": "HbA1c", "regex": r'hba1c|glycated hemoglobin|a1c\b', "unit": "%", "range": [4.0, 5.6], "cat": "Diabetes"},
    {"name": "Random Glucose", "regex": r'random glucose|rbs\b', "unit": "mg/dL", "range": [70, 140], "cat": "Diabetes"},
    
    # Lipids
    {"name": "Total Cholesterol", "regex": r'total cholesterol|cholesterol total', "unit": "mg/dL", "range": [125, 200], "cat": "Lipids"},
    {"name": "LDL Cholesterol", "regex": r'ldl\b|low density lipoprotein', "unit": "mg/dL", "range": [0, 100], "cat": "Lipids"},
    {"name": "HDL Cholesterol", "regex": r'hdl\b|high density lipoprotein', "unit": "mg/dL", "range": [40, 60], "cat": "Lipids"},
    {"name": "Triglycerides", "regex": r'triglycerides|tg\b', "unit": "mg/dL", "range": [0, 150], "cat": "Lipids"},
    
    # Kidney
    {"name": "Creatinine", "regex": r'creatinine|creat\b', "unit": "mg/dL", "range": [0.7, 1.3], "cat": "Kidney"},
    {"name": "Urea", "regex": r'urea|blood urea', "unit": "mg/dL", "range": [15, 40], "cat": "Kidney"},
    {"name": "Uric Acid", "regex": r'uric acid', "unit": "mg/dL", "range": [3.5, 7.2], "cat": "Kidney"},
    
    # Liver
    {"name": "SGPT / ALT", "regex": r'sgpt|alt\b|alanine aminotransferase', "unit": "U/L", "range": [7, 55], "cat": "Liver"},
    {"name": "SGOT / AST", "regex": r'sgot|ast\b|aspartate aminotransferase', "unit": "U/L", "range": [8, 48], "cat": "Liver"},
    {"name": "Total Bilirubin", "regex": r'bilirubin total|total bilirubin', "unit": "mg/dL", "range": [0.2, 1.2], "cat": "Liver"},
    {"name": "Alkaline Phosphatase", "regex": r'alp\b|alkaline phosphatase', "unit": "U/L", "range": [44, 147], "cat": "Liver"},
    
    # Thyroid
    {"name": "TSH", "regex": r'tsh|thyroid stimulating hormone', "unit": "uIU/mL", "range": [0.4, 4.0], "cat": "Thyroid"},
    {"name": "Total T3", "regex": r't3\b|triiodothyronine', "unit": "ng/dL", "range": [80, 200], "cat": "Thyroid"},
    {"name": "Total T4", "regex": r't4\b|thyroxine', "unit": "µg/dL", "range": [5.0, 12.0], "cat": "Thyroid"},
    
    # Vitamins / Minerals
    {"name": "Vitamin B12", "regex": r'vitamin b12|b12\b', "unit": "pg/mL", "range": [200, 900], "cat": "Vitamins"},
    {"name": "Vitamin D", "regex": r'vitamin d|25-oh vitamin d', "unit": "ng/mL", "range": [30, 100], "cat": "Vitamins"},
    {"name": "Calcium", "regex": r'calcium\b|ca\b', "unit": "mg/dL", "range": [8.5, 10.5], "cat": "Minerals"},
    
    # Electrolytes
    {"name": "Sodium", "regex": r'sodium\b|na\b', "unit": "mEq/L", "range": [135, 145], "cat": "Electrolytes"},
    {"name": "Potassium", "regex": r'potassium\b|k\b', "unit": "mEq/L", "range": [3.5, 5.0], "cat": "Electrolytes"},
]

def analyze_report(text):
    text_lower = text.lower()
    results = []
    alerts = []
    
    for param in LAB_PARAMS:
        match_iter = re.finditer(param["regex"], text_lower)
        for match in match_iter:
            # Look at context around match
            start, end = match.start(), match.end()
            context = text_lower[end:end+40] # Look 40 chars after name
            
            # Find value using regex
            val_match = re.search(r'[:\s]*(\d+\.?\d*)', context)
            if val_match:
                try:
                    val = float(val_match.group(1))
                    status = "normal"
                    if val < param["range"][0]: status = "low"
                    elif val > param["range"][1]: status = "high"
                    
                    results.append({
                        "name": param["name"],
                        "value": val,
                        "unit": param["unit"],
                        "range": param["range"],
                        "status": status,
                        "interpretation": f"{param['name']} is {status}.",
                        "category": param["cat"]
                    })
                    if status != "normal":
                        alerts.append(f"{param['name']} is {status} ({val} {param['unit']})")
                    break # Found one match for this param, skip other occurrences
                except: pass
                    
    urgency = "routine"
    if any(r['status'] != 'normal' for r in results): urgency = "soon"
    if len(alerts) > 3 or any(r['name'] == 'HbA1c' and r['value'] > 10 for r in results): urgency = "urgent"
    
    return {
        "results": results,
        "summary": f"Analyzed {len(results)} parameters. Findings suggest {urgency} follow-up." if results else "No specific parameters identified. Please check image clarity.",
        "risks": ["Consult a doctor for detailed interpretation"],
        "recommendations": ["Follow a balanced diet", "Regular check-ups"],
        "alerts": alerts,
        "urgency": urgency
    }

# ─── OCR Extraction ───────────────────────────────────────────────────────────

def extract_text(file_path):
    ext = file_path.lower().split('.')[-1]
    tesseract_cmd = find_tesseract()
    
    if ext == 'pdf':
        try:
            import fitz
            doc = fitz.open(file_path)
            text = "\n".join([page.get_text() for page in doc])
            if len(text.strip()) < 20:
                from PIL import Image
                import pytesseract
                if tesseract_cmd: pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
                text = ""
                for page in doc:
                    pix = page.get_pixmap(dpi=300)
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    text += pytesseract.image_to_string(img) + "\n"
            return text
        except Exception as e: return f"[PDF Error: {str(e)}]"
    
    elif ext in ['jpg', 'jpeg', 'png', 'webp']:
        try:
            from PIL import Image, ImageEnhance
            import pytesseract
            if tesseract_cmd: pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
            img = Image.open(file_path).convert('L')
            img = ImageEnhance.Contrast(img).enhance(1.5)
            return pytesseract.image_to_string(img)
        except Exception as e: return f"[Image OCR Error: {str(e)}]"
    
    return ""

if __name__ == "__main__":
    try:
        if len(sys.argv) < 3:
            print(json.dumps({"error": "Missing arguments"}))
            sys.exit(1)
            
        file_path, doc_type = sys.argv[1], sys.argv[2]
        text = extract_text(file_path)
        
        if text.startswith("["): # Error string returned
            print(json.dumps({"error": text}))
        else:
            if doc_type == 'prescription':
                print(json.dumps(analyze_prescription(text)))
            else:
                print(json.dumps(analyze_report(text)))
    except Exception as e:
        print(json.dumps({"error": f"Internal Script Error: {str(e)}"}))
