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
        paths = [
            os.path.join(os.getcwd(), 'src', 'data', 'medications.json'),
            os.path.join(os.path.dirname(__file__), '..', 'data', 'medications.json'),
            os.path.join(os.getcwd(), 'aihcas', 'src', 'data', 'medications.json')
        ]
        for p in paths:
            if os.path.exists(p):
                with open(p, 'r', encoding='utf-8') as f:
                    return json.load(f)
    except Exception as e:
        print(f"DEBUG: Error loading medications: {str(e)}", file=sys.stderr)
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
        m, a, n = map(int, schedule.group(1).split('-'))
        if m: parts.append('Morning')
        if a: parts.append('Afternoon')
        if n: parts.append('Night')
        return f"{schedule.group(1)} ({' + '.join(parts)})"
    
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
    if len(word) < 3: return word == target
    ratio = difflib.SequenceMatcher(None, word, target).ratio()
    return ratio > 0.75 # 75% similarity

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
                # Check each word for fuzzy match
                for word in words:
                    if is_fuzzy_match(word, lower_name):
                        matched = True
                        break
            
            if matched:
                # Find line with drug
                matched_line = next((l for l in lines if lower_name in l.lower() or any(is_fuzzy_match(w.lower(), lower_name) for w in re.findall(r'\w+', l))), name)
                
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

# Minimal set of core parameters to ensure Python logic matches TS
LAB_PARAMS = [
    {"name": "Hemoglobin", "regex": r'hemoglobin|hgb|hb\b', "unit": "g/dL", "range": [12.0, 16.5], "cat": "CBC"},
    {"name": "WBC Count", "regex": r'wbc|white blood cell|leukocyte', "unit": "cells/mm³", "range": [4000, 11000], "cat": "CBC"},
    {"name": "Platelets", "regex": r'platelet|plt|thrombocyte', "unit": "lakhs/mm³", "range": [1.5, 4.5], "cat": "CBC"},
    {"name": "Cholesterol", "regex": r'total cholesterol|cholesterol total', "unit": "mg/dL", "range": [125, 200], "cat": "Lipids"},
    {"name": "Fasting Glucose", "regex": r'fasting glucose|glucose fasting|fbs\b', "unit": "mg/dL", "range": [70, 99], "cat": "Diabetes"},
    {"name": "HbA1c", "regex": r'hba1c|glycated hemoglobin|a1c\b', "unit": "%", "range": [4.0, 5.6], "cat": "Diabetes"},
    {"name": "Creatinine", "regex": r'creatinine|creat\b', "unit": "mg/dL", "range": [0.7, 1.3], "cat": "Kidney"},
    {"name": "SGPT / ALT", "regex": r'sgpt|alt\b|alanine aminotransferase', "unit": "U/L", "range": [7, 55], "cat": "Liver"},
    {"name": "TSH", "regex": r'tsh|thyroid stimulating hormone', "unit": "uIU/mL", "range": [0.4, 4.0], "cat": "Thyroid"},
]

def analyze_report(text):
    text_lower = text.lower()
    results = []
    alerts = []
    
    for param in LAB_PARAMS:
        if re.search(param["regex"], text_lower):
            # Find a number near the match
            match_idx = text_lower.find(re.findall(param["regex"], text_lower)[0])
            context = text_lower[match_idx:match_idx+50]
            val_match = re.search(r'(\d+\.?\d*)', context)
            
            if val_match:
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
                    "interpretation": f"Your {param['name']} is {status}.",
                    "category": param["cat"]
                })
                if status != "normal":
                    alerts.append(f"{param['name']} is {status} ({val} {param['unit']})")
                    
    urgency = "routine"
    if any(r['status'] != 'normal' for r in results): urgency = "soon"
    if len(alerts) > 3: urgency = "urgent"
    
    return {
        "results": results,
        "summary": f"Analyzed {len(results)} parameters. Findings suggest {urgency} follow-up.",
        "risks": ["Check with doctor for abnormal values"],
        "recommendations": ["Maintain a healthy diet", "Stay hydrated"],
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
                # Try OCR on pages
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
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing arguments"}))
        sys.exit(1)
        
    file_path, doc_type = sys.argv[1], sys.argv[2]
    text = extract_text(file_path)
    
    if text.startswith("["): # Error
        print(json.dumps({"error": text}))
    else:
        if doc_type == 'prescription':
            print(json.dumps(analyze_prescription(text)))
        else:
            print(json.dumps(analyze_report(text)))
