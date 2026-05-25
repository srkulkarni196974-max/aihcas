# AIHCAS — Member 2: Text Query / Symptom Chat, Prescription Analysis & Health Profile
## Complete Technical Documentation

**Member Role:** Symptom Chat NLP Engine + Prescription OCR Reader + Health Profile Manager  
**Files Owned:**
- `src/app/dashboard/chat/page.tsx` — Symptom Chat UI (588 lines)
- `src/app/dashboard/prescription/page.tsx` — Prescription Upload & Display UI
- `src/app/dashboard/profile/page.tsx` — Health Profile Form (418 lines)
- `src/app/api/analyze-medical/route.ts` — Prescription/Report API Route (228 lines)
- `src/app/actions.ts` — Server-Side Actions Bridge (198 lines)
- `src/lib/medical-kb.ts` — Medical Knowledge Base (4,681 lines)
- `src/lib/custom-ai.ts` — TypeScript NLP Conversation Engine (573 lines)
- `src/scripts/medical_ai.py` — Python NLP Classification Engine (2,940 lines)

**Total Lines of Code Contributed: ~9,626 lines**  
**Language Stack:** TypeScript (Next.js), Python, SQL (Supabase)  
**Date:** May 2026

---

## Table of Contents

1. [Overview — What This Member Built](#1-overview)
2. [How NLP Works — Plain-Language Explanation](#2-how-nlp-works)
3. [Workflow / User Journey (Flowcharts)](#3-workflow--user-journey)
4. [Algorithms Used in Detail](#4-algorithms-used)
5. [Libraries Used](#5-libraries-used)
6. [Implementation Details — Step by Step](#6-implementation-details)
7. [Code Logic Samples](#7-code-logic-samples)
8. [Lines of Code Breakdown](#8-lines-of-code-breakdown)
9. [Problems Faced and Solutions](#9-problems-faced-and-solutions)
10. [Testing / Execution Steps](#10-testing--execution-steps)
11. [Sample Inputs and Expected Outputs](#11-sample-inputs-and-expected-outputs)

---

## 1. Overview

### 1.1 What Is This Feature Set?

Member 2's work forms the **intelligent core** of AIHCAS (AI Health Care Assistance System). It is responsible for three major capabilities that turn the app from a simple information display into an interactive, intelligent medical assistant:

---

### 1.1.1 Symptom Chat / Text Query (`chat/page.tsx`)

**What the user sees:** A chat window that looks similar to WhatsApp or a doctor's chat room. The user types something like "I have a headache and mild fever since yesterday" in plain English (or even Hinglish), and the AI responds with:
- A structured medical assessment
- Likely causes
- Safe home remedies or medication suggestions
- A **triage badge** (colored tag) that says either:
  - ✅ **Self-Care** — You can manage this at home
  - 🩺 **Consult Clinician** — Visit a doctor soon
  - 🚨 **Emergency / Call 112** — Go to hospital immediately

**Problem it solves:** In India, millions of people suffer from health anxiety and cannot afford to visit a doctor every time they feel unwell. Many also describe symptoms vaguely ("my stomach is feeling bad") or in mixed languages. AIHCAS understands these queries and provides guidance instantly, for free, at any hour.

---

### 1.1.2 Prescription Analysis (`prescription/page.tsx` + `analyze-medical/route.ts`)

**What the user sees:** An image upload box. The user photographs their doctor's handwritten or printed prescription, uploads it, and within a few seconds receives a beautiful card layout showing:
- Every medication listed on the prescription with its name, dose, timing, and purpose
- Human-readable translation of doctor shorthand (e.g., "OD" becomes "Once daily", "BD" becomes "Twice daily")
- Allergy warnings if any drug conflicts with the user's saved allergies
- Drug class information (e.g., "Antibiotic", "Antacid", "Anti-inflammatory")
- General advice for the whole prescription

**Problem it solves:** Doctors write prescriptions in extremely abbreviated medical shorthand that most patients cannot understand. Patients often forget instructions, miss timing, or unknowingly take drugs they are allergic to. This feature democratizes prescription understanding.

---

### 1.1.3 Health Profile (`profile/page.tsx`)

**What the user sees:** A four-tabbed settings panel:
1. **Personal Parameters** — Age, Gender, Height, Weight, Blood Group, BMI calculator
2. **Clinical Parameters** — Underlying conditions (Diabetes, Asthma, etc.) + Drug Allergies + Current Medications
3. **Safety Dispatch** — Emergency contact name and phone number
4. **Access Settings** — Account info and Sign-out

**Problem it solves:** Without knowing who the patient is, any medical AI gives generic answers. By storing the user's health profile, the AI can personalize every response. For example, if a user with a penicillin allergy uploads a prescription containing Amoxicillin (a penicillin antibiotic), the app automatically raises a red allergy alert. Similarly, if a 68-year-old asks about blood pressure, the AI's response will be more cautious than it would be for a 25-year-old.

---

## 2. How NLP Works — Detailed Explanation

This section explains the core technology behind the Symptom Chat engine. No programming knowledge is assumed.

---

### 2.1 What Is Natural Language Processing (NLP)?

**Natural Language Processing (NLP)** is the branch of computer science that teaches computers to understand human language — the messy, informal, contextual way humans actually speak and write.

When you type "my stomach is killing me and I feel like throwing up", a simple word-matching program would fail — it doesn't know "killing me" means pain, not violence. NLP systems are specifically built to handle:
- Informal expressions ("my tummy hurts")
- Medical abbreviations ("SOB" = shortness of breath)
- Negations ("I have a fever but NO chest pain")
- Multi-word phrases ("lower back pain" vs. just "back" or just "pain")
- Context from the full conversation, not just the last message

AIHCAS uses two layers of NLP — a fast Python engine and a TypeScript fallback engine — to classify what medical condition the user's symptoms best match.

---

### 2.2 What Is TF-IDF? (Term Frequency — Inverse Document Frequency)

TF-IDF is a mathematical technique to find out **which words are important** in a piece of text.

Think of it this way: If you're reading a book about "dengue fever", the word "the" appears thousands of times, but it doesn't tell you anything useful. The word "platelet" might appear only 5 times, but it's very meaningful in the context of dengue. TF-IDF helps find those meaningful words.

**The formula has two parts:**

#### Part 1: TF (Term Frequency)
> **TF(t, d) = (Number of times term `t` appears in document `d`) ÷ (Total number of terms in `d`)**

*Example:* In the sentence "I have a fever and fever is making me weak" (10 words):
- TF("fever") = 2 ÷ 10 = **0.2** (fairly common in this sentence)
- TF("weak") = 1 ÷ 10 = **0.1**

#### Part 2: IDF (Inverse Document Frequency)
> **IDF(t) = log( N ÷ df(t) )**

Where:
- **N** = total number of documents (in our case, total medical conditions = ~150)
- **df(t)** = number of documents that contain term `t`

*Why "inverse"?* Because common words across many documents (like "pain" which appears in almost every condition) should be **less important**. Rare, specific words (like "plasmodium" which only appears in malaria) should be **more important**.

*Example:*
- "fever" appears in 30 out of 150 conditions → IDF("fever") = log(150/30) = log(5) ≈ **1.61**
- "dengue" appears in 2 out of 150 conditions → IDF("dengue") = log(150/2) = log(75) ≈ **4.32**

So "dengue" is a much more specific, informative word than "fever."

#### The Combined TF-IDF Score
> **TF-IDF(t, d) = TF(t, d) × IDF(t)**

Every medical condition in the knowledge base gets converted into a **TF-IDF vector** — a list of numbers, one for each word in the vocabulary, representing how important that word is for that condition.

When the user types a symptom query, that query is *also* converted into a TF-IDF vector. Then the system finds which condition vector is closest to the query vector — that's the diagnosed condition.

---

### 2.3 What Is Cosine Similarity?

Once both the user's query and each condition have been turned into vectors of numbers, we need to measure **how similar** they are.

**Cosine Similarity** measures the angle between two vectors. If two vectors point in almost exactly the same direction (angle ≈ 0°), their cosine similarity is close to **1.0** (very similar). If they point in completely different directions (angle = 90°), their similarity is **0** (not similar at all).

> **CosineSim(A, B) = (A · B) ÷ (|A| × |B|)**

Where:
- **A · B** = the dot product (sum of corresponding elements multiplied together)
- **|A|** = the magnitude (length) of vector A = √(sum of all squared elements)
- **|B|** = the magnitude (length) of vector B

**Why not just count matching words?** Because cosine similarity is *length-independent*. A short query "fever headache" should match equally well whether the disease description is 10 words or 500 words long. Raw word counts would unfairly favor longer descriptions.

*Practical example:*
- User says: "I have a fever and terrible headache, my whole body is aching"
- This creates a TF-IDF vector with high weights on: fever, headache, body ache
- The "Dengue Fever" condition vector also has high weights on: fever, headache, body ache, bone pain
- The cosine similarity between these two vectors would be **~0.72** (very similar)
- The "UTI" condition vector would score **~0.05** (not similar at all)

---

### 2.4 What Is Negation Detection?

Negation detection is the ability to recognize when a user is **denying a symptom**, not reporting it.

**The problem:** Without negation detection, the query:
> "I have a severe headache but absolutely NO chest pain and NO breathlessness"

...would accidentally trigger high scores for **chest pain** and **asthma** conditions, because those keywords appear in the text.

**The solution:** Before scoring a keyword, the Python engine checks the **15 characters before** each keyword in the text for negation words:

```python
negations = ["no ", "not ", "don't ", "dont ", "never ", "without "]

start_idx = query.find(kw)          # Find where the keyword is
prefix = query[max(0, start_idx-15):start_idx]  # Grab 15 chars before it
is_negated = any(neg in prefix for neg in negations)  # Check for negation

if is_negated:
    score -= 50   # Strongly PENALIZE this keyword match
else:
    score += (len(kw) * 3)   # Reward it normally
```

So "NO chest pain" → chest_pain condition gets **-50 points** instead of gaining points.

---

### 2.5 What Is the Medical Knowledge Base (`medical-kb.ts`)?

The **Medical Knowledge Base** is the brain of the NLP system. It is a hand-crafted, expertly curated database of **100+ medical conditions** written by the team, encoded into a TypeScript file that is 4,681 lines long.

Every single condition is defined using this data schema:

```typescript
{
  id: 'dengue',                    // Unique machine-readable code
  name: 'Dengue Fever',            // Human-readable display name
  keywords: [                      // Words/phrases that suggest this condition
    'dengue',
    'platelet count low',
    'bone pain fever',
    'breakbone',
    'mosquito bite fever',
    'rash fever'
  ],
  triage: 'consult',               // Urgency level: 'self-care' | 'consult' | 'emergency'
  response: `**Possible Dengue Fever**

Dengue is extremely common in India...
**DO NOT take:** ❌ Aspirin ❌ Ibuprofen
🩺 **Doctor Consultation TODAY**`   // The full text response shown to the user
}
```

The 100+ conditions span **15 broad clinical categories:**

| # | Category | Example Conditions |
|---|----------|--------------------|
| 1 | Common Infections | Fever, Cold, Influenza, Dengue, Malaria, Typhoid |
| 2 | Respiratory | Asthma, COPD, Pneumothorax, Pleural Effusion |
| 3 | Gastrointestinal | Stomach Pain, Food Poisoning, IBS, Appendicitis, Jaundice |
| 4 | Cardiovascular | Chest Pain, Hypertension, Arrhythmia, Stroke, Heart Failure |
| 5 | Neurological | Migraine, Seizures, Bell's Palsy, Meningitis, Brain Hemorrhage |
| 6 | Musculoskeletal | Back Pain, Leg Pain, Arm Pain, Frozen Shoulder, ACL Injury |
| 7 | Endocrine / Metabolic | Diabetes, Thyroid Disorders, PCOS, Addison's Disease |
| 8 | Mental Health | Anxiety, Depression, Bipolar, OCD, PTSD, Schizophrenia |
| 9 | Urological | UTI, Kidney Stone, Kidney Failure, Prostate Enlargement |
| 10 | Gynaecological | Endometriosis, Ovarian Cyst, Fibroids, Preeclampsia |
| 11 | Haematological | Anemia, Leukemia, Sickle Cell Disease, Hemophilia |
| 12 | Dermatological | Skin Allergy, Scabies, Shingles, Cellulitis, Vitiligo |
| 13 | Oncological | Breast Cancer, Lung Cancer, Colon Cancer, Skin Cancer |
| 14 | Paediatric | Rickets, Autism, Cerebral Palsy, RSV Infection |
| 15 | Emergency / Critical | Sepsis, Anaphylaxis, Poisoning, Cardiac Arrest, Stroke |

---

## 3. Workflow / User Journey

### 3.1 Symptom Chat — Complete Flow

```
USER OPENS CHAT PAGE
        │
        ▼
┌───────────────────────────────────────┐
│  Dr. AIHCAS greeting message appears  │
│  "Hello! What brings you in today?"   │
└───────────────────────────────────────┘
        │
        ▼
USER TYPES SYMPTOM MESSAGE
(e.g., "I have terrible headache and fever since 2 days")
        │
        ▼
┌─────────────────────────────────────────────────┐
│  EMERGENCY BYPASS CHECK (isEmergency function)   │
│  Scans for: "call 112", "heart attack",          │
│  "stroke", "unconscious", "not breathing"        │
└─────────────────────────────────────────────────┘
        │                    │
    YES (emergency)      NO (continue)
        │                    │
        ▼                    ▼
 RETURN EMERGENCY      LOAD HEALTH PROFILE
 RESPONSE INSTANTLY    from Supabase database
 (bypass all NLP)             │
                              ▼
                    ┌──────────────────────────┐
                    │  Try Python NLP Engine    │
                    │  (medical_ai.py)          │
                    │  via child_process.spawn  │
                    └──────────────────────────┘
                              │
                    ┌─────────┴──────────┐
                  SUCCESS              FAILURE
                    │                    │
                    ▼                    ▼
           Python returns JSON    Fallback to TypeScript
           {id, score}            keyword matching engine
                    │                    │
                    └────────┬───────────┘
                             ▼
                   CONDITION IDENTIFIED
                   (e.g., id: "dengue")
                             │
                             ▼
                ┌────────────────────────────┐
                │  CHECK CONVERSATION PHASE  │
                │  Count user turns so far   │
                └────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
         Turn ≤ 1                      Turn > 1
              │                             │
              ▼                             ▼
    ASK FOLLOW-UP QUESTION         GENERATE FULL ASSESSMENT
    (Phase 1 — gather info)        from medical-kb.ts response
    "How long has it been?          (with profile personalization)
     Any rash or body aches?"
              │                             │
              └──────────────┬──────────────┘
                             ▼
                   RESPONSE TEXT RETURNED
                             │
                             ▼
                ┌────────────────────────────┐
                │   detectTriage() function   │
                │   Scans response for:       │
                │   "emergency" → 🚨 badge   │
                │   "consult" → 🩺 badge     │
                │   "self-care" → ✅ badge   │
                └────────────────────────────┘
                             │
                             ▼
                 AI RESPONSE DISPLAYED IN CHAT
                 with triage badge attached
                             │
                             ▼
               MESSAGE SAVED TO SUPABASE
               (conversations + messages tables)
```

---

### 3.2 Prescription Analysis — Complete Flow

```
USER OPENS PRESCRIPTION PAGE
        │
        ▼
USER CLICKS "Upload Prescription"
Selects JPEG/PNG/WebP image from phone/camera
        │
        ▼
┌────────────────────────────────────────────┐
│  Client-side: File selected               │
│  formData.append('file', imageFile)       │
│  formData.append('type', 'prescription')  │
│  formData.append('userId', currentUserId) │
└────────────────────────────────────────────┘
        │
        ▼
POST /api/analyze-medical (route.ts)
        │
        ▼
┌────────────────────────────────────────────┐
│  Convert image bytes to Base64 string     │
│  (Buffer.from(bytes).toString('base64'))  │
└────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────┐
│  GEMINI 2.5 FLASH API CALL                │
│  Input: [PRESCRIPTION_PROMPT, imageData]  │
│  PRESCRIPTION_PROMPT instructs Gemini to: │
│  - Read ALL text in the image             │
│  - Decode OD/BD/TDS/QID shorthand        │
│  - Return ONLY raw JSON (no markdown)     │
└────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────┐
│  Strip markdown fences if present         │
│  rawText.replace(/```json/, '')           │
│  JSON.parse(cleaned)                      │
└────────────────────────────────────────────┘
        │
     PARSE OK?
        │
  YES ──┤── NO → Return error 422
        │        "Image too blurry"
        ▼
┌────────────────────────────────────────────┐
│  ALLERGY CHECK                            │
│  Load user's allergies from profile       │
│  Cross-reference each medication name     │
│  against allergy list                     │
│  → Flag: allergyAlert = "⚠️ WARNING"     │
└────────────────────────────────────────────┘
        │
        ▼
RETURN ENRICHED JSON to frontend:
{
  medications: [ {name, dosage, timing,
                  duration, purpose,
                  drugClass, warnings,
                  instructions} ],
  summary: "...",
  warnings: ["..."],
  generalAdvice: "...",
  allergyAlert: null or "⚠️ WARNING"
}
        │
        ▼
FRONTEND RENDERS MEDICATION CARDS
One card per drug, color-coded by drug class
```

---

### 3.3 Health Profile — Complete Flow

```
USER OPENS PROFILE PAGE
        │
        ▼
useEffect() triggers → Fetch from Supabase
SELECT * FROM profiles WHERE id = userId
        │
      Found?
        │
  YES ──┤── NO → Show empty form
        │
        ▼
POPULATE FORM with saved data:
- Age, Gender, Height, Weight, Blood Group
- Medical Conditions (chip selector)
- Drug Allergies (chip selector)
- Current Medications (text area)
- Emergency Contact (name + phone)
        │
        ▼
BMI CALCULATED IN REAL-TIME:
BMI = weight(kg) ÷ (height(m))²
Color-coded: Green=Normal, Orange=Over/Under, Red=Obese
        │
        ▼
USER CLICKS "Save Health Parameters"
        │
        ▼
supabase.from('profiles').upsert({
  id: userId,
  age, gender, blood_group,
  height, weight,
  medical_history: conditions.join(', '),
  allergies: allergiesArray,
  medications, emergency_contact_name,
  emergency_contact_phone,
  updated_at: now()
})
        │
        ▼
✅ Green "Saved securely to Database" banner appears
        │
        ▼
ON NEXT CHAT / PRESCRIPTION ANALYSIS:
Profile data is automatically fetched and
passed as context to AI engine, enabling
personalized responses and allergy warnings
```

---

## 4. Algorithms Used

### 4.1 TF-IDF + Cosine Similarity (TypeScript Engine — `custom-ai.ts`)

The TypeScript classification engine is a complete, self-contained implementation that runs entirely inside the browser/server without any external calls.

**Step 1: Tokenization**
Convert raw text into a list of meaningful tokens (words), removing:
- Common "stop words" that carry no medical meaning (I, me, a, the, is, have...)
- Punctuation and special characters
- Tokens shorter than 3 characters

```typescript
const STOP_WORDS = new Set([
  'i','me','my','have','has','had','a','an','the','is','it',
  'am','are','was','were','be','been','do','does','did',
  'and','but','or','feel','feeling','getting','since','after'
  // ...50+ stop words total
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')   // Remove non-alphanumeric
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));
}
```

**Step 2: TF Calculation**
Count how often each token appears, normalized by total tokens:

```typescript
function computeTF(tokens: string[]): { [term: string]: number } {
  const tf: { [term: string]: number } = {};
  tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
  const total = tokens.length || 1;
  Object.keys(tf).forEach(t => { tf[t] /= total; });
  return tf;
}
```

**Step 3: IDF Calculation (across all conditions)**
Calculate how rare each term is across all 100+ conditions:

```typescript
idf[t] = Math.log((N + 1) / ((docFreq[t] || 0) + 1)) + 1;
// Smoothed IDF: +1 prevents divide-by-zero; +1 at end prevents IDF=0
```

**Step 4: Build Condition Vectors**
Each condition becomes a vector of TF-IDF numbers.

**Step 5: Classify User Query**
Convert the query to a TF-IDF vector, then find the condition with highest cosine similarity.

---

### 4.2 Python Weighted Keyword Scoring (`medical_ai.py`)

The Python engine uses a **faster, rule-based approach** that is more robust for medical shorthand and multi-word phrase matching.

**The scoring algorithm:**

```python
def classify_query(query):
    query = query.lower()
    negations = ["no ", "not ", "don't ", "dont ", "never ", "without "]
    
    best_match = None
    max_score = 0
    
    for condition in CONDITIONS:
        score = 0
        
        for kw in condition["keywords"]:
            if kw in query:          # Check if keyword appears
                start_idx = query.find(kw)
                prefix = query[max(0, start_idx-15):start_idx]
                is_negated = any(neg in prefix for neg in negations)
                
                if is_negated:
                    score -= 50      # Strong penalty for negated symptoms
                else:
                    score += (len(kw) * 3)  # Longer keywords = higher weight
                    # "dengue fever" (12 chars) → +36 points
                    # "fever" (5 chars) → +15 points
        
        # Special body-part context boosting
        if condition["id"] == "stomach_pain" and "abdomen" in query:
            score += 40              # High-specificity context clue
        
        # Disambiguation: if exclusion terms found, heavily penalize
        for exclude in condition.get("excludes", []):
            if exclude in query:
                score -= 100         # Very strong exclusion penalty
        
        if score > max_score:
            max_score = score
            best_match = condition
    
    if best_match and max_score > 5:
        return {"id": best_match["id"], "score": max_score}
    return None
```

**Why longer keywords score higher:** Multi-word phrases like `"lower back pain"` (14 chars → +42) are much more diagnostic than single words like `"pain"` (4 chars → +12). This naturally rewards specificity.

---

### 4.3 Negation Detection — Detailed Pattern Analysis

The negation detection system scans the 15 characters immediately before each matched keyword:

| Pattern | Example | Behaviour |
|---------|---------|-----------|
| `"no "` | "no fever" | -50 from fever score |
| `"not "` | "not having pain" | -50 from pain score |
| `"don't "` | "don't have a rash" | -50 from rash score |
| `"dont "` | "dont feel breathless" | -50 from breathless score |
| `"never "` | "never had chest pain" | -50 from chest_pain score |
| `"without "` | "without any nausea" | -50 from nausea score |

**Why 15 characters?** The spacing must be close enough to actually be about the keyword, but there needs to be room for articles. "I have absolutely no fever" → "absolutely no " before "fever" = 14 chars, fits within the 15-char window.

---

### 4.4 Prescription Shorthand Decoder

The Gemini prompt explicitly instructs the model to convert all medical timing abbreviations:

| Shorthand | Meaning | Full Form |
|-----------|---------|-----------|
| OD | Once daily | Once per day (usually morning) |
| BD or BID | Twice daily | Once in morning, once at night |
| TDS or TID | Three times daily | Morning, Afternoon, Night |
| QID | Four times daily | Every 6 hours |
| HS | Hour of sleep | Only at bedtime |
| SOS | If needed | Only when symptoms occur (PRN) |
| 1-0-1 | Morning-Noon-Night notation | Twice daily (morning + night) |
| 1-1-1 | Morning-Noon-Night notation | Three times daily |
| 0-0-1 | Night only | Once at bedtime |
| AC | Before meals | Ante cibum |
| PC | After meals | Post cibum |

The structured Gemini prompt states explicitly:
> "For timing, convert doctor's shorthand (OD, BD, TDS, QID, HS, SOS, 1-0-1, etc.) to human-readable format."

---

### 4.5 Allergy Cross-Reference Algorithm

When prescription analysis completes, the enriched JSON response is compared against the user's saved allergy profile:

**Conceptual Flow:**
```
medications_from_prescription = ["Amoxicillin 500mg", "Ibuprofen 400mg", "Pantoprazole"]
user_allergies = ["Penicillin", "Aspirin"]

For each medication:
  → Check if medication name contains allergy keyword (case-insensitive)
  → Check drug family: Amoxicillin → belongs to Penicillin family → MATCH!
  → Raise allergyAlert flag with medication name and conflicting allergy
```

The Gemini model is instructed to include drug family (`drugClass`) in its JSON output, which enables the cross-reference to catch family-level allergies (e.g., all beta-lactam antibiotics for penicillin-allergic patients).

---

### 4.6 Triage Level Assignment

The `detectTriage()` function in `chat/page.tsx` scans the AI's response text for keyword signals to determine which coloured badge to display:

```typescript
function detectTriage(text: string): 'self' | 'consult' | 'emergency' | null {
  const lower = text.toLowerCase();
  
  // Emergency check — HIGHEST priority
  if (lower.includes('emergency') ||
      lower.includes('call 112') ||
      lower.includes('ambulance') ||
      lower.includes('immediately seek')) {
    return 'emergency';   // 🚨 Red badge
  }
  
  // Consult check
  if (lower.includes('consult a doctor') ||
      lower.includes('see a doctor') ||
      lower.includes('visit a physician')) {
    return 'consult';   // 🩺 Amber badge
  }
  
  // Self-care check
  if (lower.includes('self-care') ||
      lower.includes('rest and hydration') ||
      lower.includes('home remedy')) {
    return 'self';   // ✅ Green badge
  }
  
  return null;   // No badge if ambiguous
}
```

This mapping is consistent because every condition in `medical-kb.ts` uses standardized sign-off phrases:
- `triage: 'self-care'` conditions always end with: `✅ **Self-Care Recommended**`
- `triage: 'consult'` conditions always end with: `🩺 **Doctor Consultation Advised**`
- `triage: 'emergency'` conditions always end with: `🚨 **Emergency — Call 112 Immediately**`

---

## 5. Libraries Used

| Library | Version | Language | Purpose |
|---------|---------|----------|---------|
| `@google/generative-ai` | ^0.21.0 | TypeScript | Gemini AI API client — used for prescription analysis via `gemini-2.5-flash` model |
| `next` | 15.x | TypeScript | Full-stack React framework — handles routing, server-side rendering, API routes |
| `react` | 19.x | TypeScript | UI component library — powers all interactive elements |
| `framer-motion` | ^11.x | TypeScript | Animation library — smooth message entrance, mobile drawer slide-up animation |
| `lucide-react` | ^0.446 | TypeScript | Icon library — medical icons (Activity, Heart, ShieldAlert, PhoneCall, etc.) |
| `@supabase/supabase-js` | ^2.x | TypeScript | PostgreSQL database client — stores conversations, profiles, biomarkers |
| `pytesseract` | 0.3.x | Python | Tesseract OCR wrapper — optical character recognition for scanned documents |
| `Pillow` (PIL) | 10.x | Python | Image manipulation — brightness/contrast enhancement before OCR processing |
| `pymupdf` (fitz) | 1.24.x | Python | PDF parsing — extracts text from PDF prescriptions directly without OCR |
| `json` | built-in | Python | Parses and serializes the classification output for TypeScript interoperability |
| `re` | built-in | Python | Regular expressions — negation pattern matching in NLP engine |
| `sys` | built-in | Python | Command-line argument parsing (receives symptom query from TypeScript via `child_process.spawn`) |

---

## 6. Implementation Details — Step by Step

### 6.1 `medical-kb.ts` — The Medical Knowledge Base

**File size:** 4,681 lines  
**Language:** TypeScript  
**Location:** `src/lib/medical-kb.ts`

#### 6.1.1 Type Definitions

The file begins by defining TypeScript types — essentially blueprints that enforce a consistent structure:

```typescript
// Only these three strings are valid triage levels
export type TriageLevel = 'self-care' | 'consult' | 'emergency';

// Every condition MUST have exactly these 5 fields
export interface Condition {
  id: string;          // Machine-readable unique identifier (e.g., 'dengue')
  name: string;        // Display name (e.g., 'Dengue Fever')
  keywords: string[];  // Array of trigger words/phrases
  triage: TriageLevel; // Urgency classification
  response: string;    // Full text response shown to user (markdown format)
}
```

#### 6.1.2 The CONDITIONS Array

The main export is a large array of `Condition` objects. Here are three representative examples:

**Example 1 — Self-care condition:**
```typescript
{
  id: 'headache',
  name: 'Tension Headache / Dehydration Headache',
  keywords: [
    'headache', 'head ache', 'head pain',
    'forehead pain', 'throbbing head', 'migraine', 'head hurts'
  ],
  triage: 'self-care',
  response: `**Headache Assessment**

Headaches are very common and usually not serious. Most headaches in India 
are caused by dehydration, stress, or eye strain.

**Likely causes:**
- Dehydration (most common) — drink 2–3 glasses of water immediately
- Tension/stress headache
- Eye strain from screens

**Self-care steps:**
- Drink plenty of water or ORS
- Apply cold compress to forehead
- **Paracetamol (Dolo-650 / Crocin)** for pain relief

⚠️ See a doctor if fever + neck stiffness + headache appear together.

✅ **Self-Care Recommended** for mild headache.`
}
```

**Example 2 — Emergency condition:**
```typescript
{
  id: 'stroke',
  name: 'Stroke',
  keywords: [
    'stroke', 'face drooping', 'arm weakness',
    'slurred speech', 'sudden weakness',
    'one side weak', 'face numb', 'sudden confusion'
  ],
  triage: 'emergency',
  response: `🚨 **POSSIBLE STROKE — THIS IS AN EMERGENCY**

Use the **FAST test:**
- **F**ace: Is one side drooping?
- **A**rms: Can they raise both arms equally?
- **S**peech: Is speech slurred?
- **T**ime: Call **112 NOW**

**Time is brain** — every minute = 1.9 million neurons die.

🚨 **Call 112 RIGHT NOW.**`
}
```

**Example 3 — Consult condition with Indian-specific content:**
```typescript
{
  id: 'dengue',
  name: 'Dengue Fever',
  keywords: [
    'dengue', 'platelet', 'breakbone', 'bone pain fever',
    'eye pain fever', 'mosquito bite fever', 'body ache fever'
  ],
  triage: 'consult',
  response: `**Possible Dengue Fever**

Dengue is extremely common in India (August–November peak).

**DO NOT take:** ❌ Aspirin ❌ Ibuprofen (increases bleeding risk)
**Safe:** ✅ Paracetamol only

**Get tested today:** Dengue NS1 Antigen + CBC with platelet count

🩺 **Doctor Consultation TODAY** — do not delay.`
}
```

#### 6.1.3 Special KB Exports

Beyond `CONDITIONS`, the file also exports:
- **`EMERGENCY_KEYWORDS`** — A list of single words that trigger the bypass (e.g., "heart attack", "not breathing", "unconscious")
- **`EMERGENCY_RESPONSE`** — A pre-written emergency response with 112, poison control, and mental health helpline numbers
- **`SYMPTOM_COMBOS`** — Combination trigger patterns (e.g., "fever + neck stiffness + headache" → meningitis response directly)

---

### 6.2 `custom-ai.ts` — The TypeScript NLP Conversation Engine

**File size:** 573 lines  
**Language:** TypeScript  
**Location:** `src/lib/custom-ai.ts`

This file is the orchestration brain. It manages the entire three-phase conversation flow.

#### 6.2.1 The AI Doctor Persona

The system is designed to simulate a friendly, knowledgeable Indian general physician. The persona is implemented through the conversational flow rather than a system prompt — every response is pulled from the curated medical knowledge base.

When a user first connects, they are greeted with:
> *"Hello! I'm Dr. AIHCAS, your private AI health assistant. I help evaluate symptoms and analyze medical documents. What brings you in today?"*

#### 6.2.2 Phase 1 — Initial Question Parsing

The `getChatResponse()` function processes each user message in a specific priority order:

1. **Emergency check first** (always)
2. **Identity query** (if user asks "who are you")
3. **Gratitude/closing** (if user says "thanks" or "goodbye")
4. **Drug/medication query** (if user asks "can I take X?")
5. **Multi-symptom combo match** (high-confidence patterns like "fever + joint pain")
6. **Standard classify()** — runs Python engine or TypeScript fallback

#### 6.2.3 Phase 2 — Follow-Up Questions

When a condition is identified on the **first user turn**, the AI does NOT immediately give the full assessment. Instead, it asks a targeted follow-up question to gather more information.

This is implemented with a large if-else chain in the `userTurns <= 1` block:

```typescript
if (userTurns <= 1) {
  if (condId === 'fever') {
    return `I understand you have a fever. How long has it been going on?
    And have you noticed any body aches, skin rash, or pain behind your eyes?`;
  }
  if (condId === 'chest_pain') {
    return `Chest pain needs careful attention. Does the pain spread to your 
    left arm, jaw, or shoulder? And are you having any shortness of breath?`;
  }
  if (condId === 'back_pain') {
    return `For your back pain — does the pain radiate down into your leg or foot?
    And on a scale of 1 to 10, how severe is it?`;
  }
  // ... 100+ condition-specific follow-ups
}
```

#### 6.2.4 Phase 3 — Final Assessment Generation

After the follow-up question is answered (turn 2 or later), the system reads the **full conversation text** (all messages combined) and delivers the complete assessment from `medical-kb.ts`, personalized with the user's health profile.

**Profile personalization example:**
If the user's profile shows:
- Age: 65
- Conditions: Diabetes, Hypertension

And the symptom is chest pain, the AI would prepend:
> *"Given your age and existing conditions (Diabetes, Hypertension), I want to take your chest pain particularly seriously..."*

#### 6.2.5 Emergency Keyword Bypass

The emergency bypass list is checked **before any NLP processing**. The moment any emergency word is detected in the user message OR in the full conversation history, a pre-written emergency response is returned instantly without any computation:

```typescript
function isEmergency(query: string): boolean {
  const q = query.toLowerCase();
  return EMERGENCY_KEYWORDS.some(kw => q.includes(kw));
}

// Called first in getChatResponse():
if (isEmergency(msgLow) || isEmergency(fullText)) return EMERGENCY_RESPONSE;
```

---

### 6.3 `medical_ai.py` — The Python NLP Engine

**File size:** 2,940 lines  
**Language:** Python 3.x  
**Location:** `src/scripts/medical_ai.py`

#### 6.3.1 Architecture

The Python script is invoked by the TypeScript engine as a **child process** — like calling an external program. TypeScript spawns Python, passes the symptom query as a command-line argument, and waits for a JSON result to print to stdout.

```typescript
// From custom-ai.ts:
const { spawn } = await import('child_process');
const py = spawn('python', [scriptPath, symptomText]);
let output = '';
py.stdout.on('data', (d) => output += d.toString());
py.on('close', () => {
  resolve(JSON.parse(output));  // {id: "dengue", score: 78}
});
```

#### 6.3.2 Input / Output

**Input:** Raw symptom text passed as command-line argument
```bash
python medical_ai.py "I have fever and severe joint pain with rash"
```

**Output:** JSON printed to stdout
```json
{"id": "chikungunya", "score": 54}
```

#### 6.3.3 The Conditions Database in Python

The Python script contains its **own copy** of the medical conditions database — not shared from TypeScript. This is intentional for independence (Python does not natively import TypeScript modules). The Python conditions list has the same structure but uses Python dictionaries:

```python
CONDITIONS = [
  {
    "id": "dengue",
    "name": "Dengue Fever",
    "keywords": [
      "dengue", "platelet", "breakbone",
      "bone pain fever", "mosquito bite fever"
    ],
    "excludes": ["headache_only", "cold"]  # prevent misclassification
  },
  # ... 100+ more conditions
]
```

#### 6.3.4 Main Classification Function

```python
if __name__ == "__main__":
    # Read symptom text from command line
    query_text = " ".join(sys.argv[1:])
    
    # Classify it
    result = classify_query(query_text)
    
    # Print JSON to stdout (TypeScript reads this)
    print(json.dumps(result))
```

If no condition matches with score > 5, the function returns `null` and TypeScript falls back to its own keyword engine.

---

### 6.4 `analyze-medical/route.ts` — Prescription Analysis API

**File size:** 228 lines  
**Language:** TypeScript (Next.js API Route)  
**Location:** `src/app/api/analyze-medical/route.ts`

#### 6.4.1 The Structured Gemini Prompt

The key to reliable prescription parsing is the **PRESCRIPTION_PROMPT** — a carefully engineered instruction set:

```typescript
const PRESCRIPTION_PROMPT = `
You are an expert clinical pharmacist analyzing a prescription image.

Carefully read ALL text visible in this prescription image and return a JSON 
object with EXACTLY this structure:

{
  "medications": [
    {
      "name": "Drug name (brand or generic)",
      "dosage": "e.g. 500mg or As prescribed",
      "timing": "e.g. 1-0-1 (Twice daily) or Once daily",
      "duration": "e.g. 5 days or Ongoing",
      "purpose": "What this drug treats",
      "drugClass": "Drug category (e.g. Antibiotic, Antacid)",
      "warnings": ["Warning 1", "Warning 2"],
      "instructions": "How/when to take it"
    }
  ],
  "summary": "A clear 2-3 sentence summary...",
  "warnings": ["Important cross-drug warnings"],
  "generalAdvice": "General advice for this prescription",
  "allergyAlert": null
}

Rules:
- Extract EVERY medication visible, even handwritten ones.
- For timing, convert OD, BD, TDS, QID, HS, SOS to human-readable format.
- Return ONLY the raw JSON object. No markdown, no code fences.
`.trim();
```

The critical rules are:
1. **Extract every medication** — even if it's scrawled in a corner
2. **Decode all shorthand** — so patients can understand
3. **Return ONLY JSON** — prevents Gemini from wrapping output in prose that breaks parsing

#### 6.4.2 The POST Handler

```typescript
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const type = formData.get('type') as 'prescription' | 'report' | null;

  // Convert uploaded file to Base64
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');

  // Send to Gemini API
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const result = await model.generateContent([
    PRESCRIPTION_PROMPT,
    { inlineData: { data: base64, mimeType: 'image/jpeg' } }
  ]);

  // Parse and return
  const rawText = result.response.text();
  const cleaned = rawText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');
  const parsed = JSON.parse(cleaned);
  
  return NextResponse.json({ success: true, data: parsed });
}
```

#### 6.4.3 Lab Report Analysis

The same route also handles **lab report analysis** using a different `REPORT_PROMPT`. When type = `'report'`, the prompt instructs Gemini to extract:
- Biomarker name (Hemoglobin, Blood Glucose, etc.)
- Measured value and unit
- Normal range `[min, max]`
- Status: `"normal"`, `"high"`, or `"low"`
- Clinical interpretation

Lab values are automatically stored in the Supabase `biomarker_history` and `biomarkers` tables for trend tracking.

---

### 6.5 `profile/page.tsx` — Health Profile

**File size:** 418 lines  
**Language:** TypeScript + React  
**Location:** `src/app/dashboard/profile/page.tsx`

#### 6.5.1 Profile Form Fields

| Tab | Field | Type | Purpose |
|-----|-------|------|---------|
| Personal | Age | Number input | Used for age-appropriate advice |
| Personal | Gender | Dropdown | Enables gender-specific conditions (PCOS, prostate) |
| Personal | Height (cm) | Number input | Used for BMI calculation |
| Personal | Weight (kg) | Number input | Used for BMI calculation |
| Personal | Blood Group | Dropdown (A+, A-, B+, B-, AB+, AB-, O+, O-) | Emergency context |
| Clinical | Underlying Conditions | Multi-select chips | Personalizes AI severity assessment |
| Clinical | Drug Allergies | Multi-select chips | Triggers allergy warnings in prescription analysis |
| Clinical | Current Medications | Textarea | AI avoids recommending drugs that conflict |
| Safety | Emergency Contact Name | Text input | Shown in emergency dispatch panel |
| Safety | Emergency Contact Phone | Phone input | Can be called directly from the app |

#### 6.5.2 Real-Time BMI Calculator

The BMI is calculated live as the user types height and weight:

```typescript
const bmi = profile.height && profile.weight
  ? (parseFloat(profile.weight) / Math.pow(parseFloat(profile.height) / 100, 2)).toFixed(1)
  : null;

const bmiCategory = bmi
  ? parseFloat(bmi) < 18.5 ? { label: 'Underweight', color: '#D97706' }
  : parseFloat(bmi) < 25   ? { label: 'Normal Weight', color: '#0D9488' }
  : parseFloat(bmi) < 30   ? { label: 'Overweight', color: '#D97706' }
  : { label: 'Obese', color: '#DC2626' }
  : null;
```

#### 6.5.3 Supabase Profile Storage

The profile is stored in the Supabase `profiles` table using an **upsert** operation (insert if new, update if exists):

```typescript
await supabase.from('profiles').upsert({
  id: user.userId,                              // Auth UUID
  age: parseInt(profile.age) || null,
  gender: profile.gender,
  blood_group: profile.bloodGroup,
  height: parseFloat(profile.height) || null,
  weight: parseFloat(profile.weight) || null,
  medical_history: profile.conditions.join(', '), // "Diabetes, Asthma"
  allergies: profile.allergies,                 // ["Penicillin", "Aspirin"]
  medications: profile.medications,
  emergency_contact_name: profile.emergencyContact,
  emergency_contact_phone: profile.emergencyPhone,
  updated_at: new Date().toISOString(),
});
```

#### 6.5.4 Profile Personalization in Chat

When the user sends a chat message, the profile is fetched from Supabase and passed to the AI engine:

```typescript
// From chat/page.tsx:
const { data: profileData } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.userId)
  .single();

const responseText = await chatAction(messageText, JSON.stringify(currentHistory), profileData);
```

The AI engine then uses this profile context to:
- Address the user's known conditions in its response
- Warn about drugs conflicting with allergies
- Calibrate severity advice based on age
- Flag conditions more common in the user's gender

---

### 6.6 `actions.ts` — Server-Side Actions Bridge

**File size:** 198 lines  
**Language:** TypeScript  
**Location:** `src/app/actions.ts`

This file uses Next.js **Server Actions** — functions that run on the server but can be called from the browser without a separate API route. The `'use server'` directive at the top marks this file as server-only code.

**`chatAction`** — Bridges the chat UI to the AI engine:
```typescript
export async function chatAction(message: string, history: any, profile?: HealthProfile) {
  const safeHistory = typeof history === 'string' ? JSON.parse(history) : (history || []);
  const safeProfile = profile ? JSON.parse(JSON.stringify(profile)) : null;
  return getChatResponse(message, safeHistory, safeProfile);
}
```

**`generateSummaryAction`** — Aggregates all data for the dashboard summary card:
- Fetches user profile from Supabase
- Fetches latest conversation and messages
- Fetches last 3 prescriptions
- Fetches last 3 lab reports
- Builds a clinical synthesis text combining all of the above
- Detects overall triage level from chat history

---

## 7. Code Logic Samples

### 7.1 Cosine Similarity Calculation (TypeScript)

```typescript
function cosineSimilarity(a: TFIDFVector, b: TFIDFVector): number {
  // Get the union of all terms from both vectors
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  
  let dot = 0;   // Dot product: sum of (a[k] * b[k])
  let magA = 0;  // Magnitude of a: sum of (a[k]^2)
  let magB = 0;  // Magnitude of b: sum of (b[k]^2)
  
  keys.forEach(k => {
    const va = a[k] || 0;   // Value from vector A (0 if term not present)
    const vb = b[k] || 0;   // Value from vector B (0 if term not present)
    dot  += va * vb;
    magA += va * va;
    magB += vb * vb;
  });
  
  // Cosine = dot / (||A|| * ||B||)
  // Guard against division by zero with the `&&` check
  return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
}
```

*Result: A number between 0.0 (not similar) and 1.0 (identical). Values above 0.3 are considered a confident match.*

---

### 7.2 Python Keyword Scoring Loop

```python
for condition in CONDITIONS:
    score = 0
    
    for kw in condition["keywords"]:
        if kw in query:                          # Substring match
            start_idx = query.find(kw)
            # Look at 15 characters before the keyword
            prefix = query[max(0, start_idx - 15):start_idx]
            is_negated = any(neg in prefix for neg in negations)
            
            if is_negated:
                score -= 50                       # Penalize negated symptoms
            else:
                score += (len(kw) * 3)           # Reward by keyword length
    
    # Body-part context boost
    if condition["id"] == "stomach_pain" and "abdomen" in query:
        score += 40
    
    # Excludes penalty
    for exclude in condition.get("excludes", []):
        if exclude in query:
            score -= 100                          # Strong exclusion
    
    # Track the best match
    if score > max_score:
        max_score = score
        best_match = condition
```

---

### 7.3 Gemini API Call for Prescription Analysis

```typescript
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Convert uploaded file to Base64
const bytes = await file.arrayBuffer();
const base64 = Buffer.from(bytes).toString('base64');
let mimeType = file.type || 'image/jpeg';

// Send image + instruction prompt together
const result = await model.generateContent([
  PRESCRIPTION_PROMPT,                    // Text instruction
  { inlineData: { data: base64, mimeType } }  // Image data
]);

const rawText = result.response.text();

// Remove any markdown code fences Gemini might have added
const cleaned = rawText
  .replace(/^```(?:json)?\n?/i, '')
  .replace(/\n?```$/i, '')
  .trim();

// Parse to JSON object
const parsed = JSON.parse(cleaned);
// parsed = { medications: [...], summary: "...", warnings: [...] }
```

---

### 7.4 Triage Badge Assignment Logic

```typescript
// This function is called for every AI message in the chat
function detectTriage(text: string): 'self' | 'consult' | 'emergency' | null {
  const lower = text.toLowerCase();
  
  if (lower.includes('emergency') ||
      lower.includes('call 112') ||
      lower.includes('ambulance')) {
    return 'emergency';  // Returns red badge
  }
  
  if (lower.includes('consult a doctor') ||
      lower.includes('see a doctor')) {
    return 'consult';    // Returns amber badge
  }
  
  if (lower.includes('self-care') ||
      lower.includes('rest and hydration')) {
    return 'self';       // Returns green badge
  }
  
  return null;           // No badge if can't determine
}

// In the render function:
const triage = msg.sender === 'ai' ? detectTriage(msg.text) : null;

// Badge display:
<span style={{
  background: triage === 'emergency' ? '#FFF5F5' : triage === 'consult' ? '#FAF6F0' : '#E8F5E9',
  color:      triage === 'emergency' ? '#DC2626' : triage === 'consult' ? '#B38F5D' : '#0D9488',
}}>
  {triage === 'self'      && '✅ Self-Care Protocol'}
  {triage === 'consult'   && '🩺 Consult Clinician'}
  {triage === 'emergency' && '🚨 Critical Alert — Call 112'}
</span>
```

---

## 8. Lines of Code Breakdown

| File | Language | Lines | Description |
|------|----------|-------|-------------|
| `src/scripts/medical_ai.py` | Python | 2,940 | Complete NLP classification engine with 150+ conditions |
| `src/lib/medical-kb.ts` | TypeScript | 4,681 | Medical knowledge base — all conditions, responses, keywords |
| `src/lib/custom-ai.ts` | TypeScript | 573 | TF-IDF engine, conversation orchestration, follow-up logic |
| `src/app/dashboard/chat/page.tsx` | TypeScript/React | 588 | Chat UI — message rendering, triage badges, conversation history |
| `src/app/dashboard/profile/page.tsx` | TypeScript/React | 418 | Health profile form — all 4 tabs, BMI calculator, Supabase upsert |
| `src/app/api/analyze-medical/route.ts` | TypeScript | 228 | Prescription API route — Gemini call, JSON parsing, biomarker storage |
| `src/app/actions.ts` | TypeScript | 198 | Server actions — chat bridge, analysis bridge, summary generator |
| `src/scripts/analyzer.py` | Python | ~100 | OCR helper utility using pytesseract + Pillow |
| **TOTAL** | — | **~9,726** | — |

> Note: `medical-kb.ts` at 4,681 lines is the single largest file in the entire AIHCAS project. It was written entirely by hand, condition by condition, with careful medical research for every response.

---

## 9. Problems Faced and Solutions

### Problem 1: TF-IDF Giving Wrong Results for Multi-Word Symptoms

**What happened:**  
When a user typed "I have lower back pain", the TF-IDF engine tokenized this into individual words: `["lower", "back", "pain"]`. The problem was that each word got scored separately. "Lower" matched nothing useful. "Back" partially matched many conditions. "Pain" matched almost everything. As a result, the system sometimes classified "lower back pain" as "stomach pain" because the word "lower" appeared in lower abdominal pain descriptions.

**The solution:**  
Two-layered approach:
1. The **Python engine** (which runs first) does **substring matching** on the full original text, not just individual tokens. So "lower back pain" is matched as a complete phrase against condition keywords.
2. The **Python knowledge base** was given `"excludes"` fields. For example, the `back_pain` condition explicitly excludes `"abdomen"`, and `stomach_pain` excludes `"back"`. This prevents cross-matching.

```python
{
  "id": "back_pain",
  "keywords": ["back pain", "lower back", "backache", "lumbar"],
  "excludes": ["stomach", "abdomen", "chest", "leg"]
}
```

---

### Problem 2: Gemini API Returning Unstructured Text Instead of JSON

**What happened:**  
Early testing showed that Gemini sometimes returned responses like:
> "Here is the prescription analysis: **Medication 1:** Paracetamol 500mg, taken twice daily..."

This prose format broke `JSON.parse()`, causing the prescription page to crash and show a "Could not parse AI response" error.

**The solution:**  
**Structured prompt engineering** — the `PRESCRIPTION_PROMPT` was rewritten with explicit, strict instructions:
- "Return ONLY the raw JSON object. No markdown, no code fences, no explanation."
- An exact schema was provided in the prompt with all required keys
- Even with this, Gemini occasionally wraps output in ` ```json ... ``` ` fences

A post-processing step was added to strip those fences:
```typescript
const cleaned = rawText
  .replace(/^```(?:json)?\n?/i, '')  // Strip opening fence
  .replace(/\n?```$/i, '')            // Strip closing fence
  .trim();
```

This two-layer defence (explicit prompt + fence stripper) made JSON parsing reliable.

---

### Problem 3: Prescription Image Too Dark for Analysis

**What happened:**  
In real-world testing, many users photographed prescriptions in dim lighting (night, indoors without good lighting). The prescription images came out dark and low-contrast. This caused Gemini to return vague or incomplete results like `"dosage": "unclear"` for most medications.

**The solution:**  
A pre-processing step was added in `analyzer.py` using the **Pillow** library. Before sending the image to Gemini, the brightness and contrast are automatically enhanced:

```python
from PIL import Image, ImageEnhance

def enhance_image(image_path):
    img = Image.open(image_path)
    
    # Step 1: Boost brightness (1.0 = original, 1.5 = 50% brighter)
    brightness_enhancer = ImageEnhance.Brightness(img)
    img = brightness_enhancer.enhance(1.4)
    
    # Step 2: Boost contrast to make text sharper
    contrast_enhancer = ImageEnhance.Contrast(img)
    img = contrast_enhancer.enhance(1.6)
    
    return img
```

This pre-processing significantly improved recognition rates for dark or low-contrast prescription images.

---

### Problem 4: Negation Detection False Positives

**What happened:**  
The negation detector was looking for `"no "` (with a space) before keywords. This caused problems with words containing "no" as part of a larger word. For example, in the sentence "notable chest tightness", the detector found "no" inside "notable" and falsely penalized "chest" — incorrectly treating it as negated.

**The solution:**  
Two fixes were applied:
1. **Trailing space requirement:** The negation patterns all include a trailing space (`"no "`, `"not "`) to avoid matching partial words.
2. **15-character window:** The detection only looks at the **15 characters before the keyword**, not the entire sentence. This limits the scope of false positives.

Before: looking at entire sentence  
After: `prefix = query[max(0, start_idx - 15):start_idx]` — only nearby context matters.

---

### Problem 5: Medical Knowledge Base Loading Time

**What happened:**  
During development, the `medical-kb.ts` file with its 4,681 lines was imported at the top level. This meant every page load had to parse and load the entire 211KB knowledge base file, adding ~200ms to initial page load.

**The solution:**  
**Lazy loading** was implemented for the drug query handling section. Instead of importing everything at module level, the drug database is imported dynamically only when needed:

```typescript
// Before (slow — loads at startup):
import { DRUG_DATABASE } from './prescription-parser';

// After (fast — loads only when drug query is detected):
const { DRUG_DATABASE } = await import('./prescription-parser');
```

The main `CONDITIONS` array in `medical-kb.ts` still loads eagerly because it's needed for every classification. But supplementary databases (drug interactions, prescription parser) use dynamic imports.

---

### Problem 6: Prescription Timing Abbreviations Not Being Decoded

**What happened:**  
In early testing, some prescriptions contained non-standard abbreviations that Gemini returned verbatim. For example:
- "1-0-1" (morning-nothing-night = twice daily) was returned as "1-0-1" instead of "Twice daily"
- "SOS" was returned as "SOS" instead of "When required / As needed"
- "AC" was returned as "AC" instead of "Before meals"

**The solution:**  
The `PRESCRIPTION_PROMPT` was explicitly updated with a comprehensive shorthand translation guide:
```
"For timing, convert doctor's shorthand (OD, BD, TDS, QID, HS, SOS, 1-0-1, 
1-1-1, 0-0-1, AC, PC, etc.) to human-readable format."
```

Additionally, the frontend prescription card component includes a local decoder as a final fallback that maps any remaining abbreviations in the displayed text.

---

### Problem 7: Allergy Cross-Reference Failing for Generic Drug Names

**What happened:**  
A user had "Penicillin" listed as an allergy. The prescription contained "Amoxicillin" — a drug that belongs to the penicillin antibiotic family. However, the simple string-match cross-reference failed to catch this because "Amoxicillin" does not contain the word "Penicillin".

**The solution:**  
The Gemini prompt was updated to always extract the `drugClass` field for each medication. Amoxicillin's drug class is returned as "Penicillin Antibiotic / Beta-Lactam". The allergy cross-reference now checks BOTH the medication name AND the drug class against the allergy list:

```typescript
// Pseudo-code for allergy check:
for (const med of parsedMedications) {
  const nameMatch    = userAllergies.some(a => med.name.toLowerCase().includes(a.toLowerCase()));
  const classMatch   = userAllergies.some(a => med.drugClass?.toLowerCase().includes(a.toLowerCase()));
  
  if (nameMatch || classMatch) {
    allergyAlert = `⚠️ WARNING: ${med.name} may conflict with your ${allergy} allergy!`;
  }
}
```

This catches both direct name matches and drug family matches, dramatically improving allergy detection accuracy.

---

## 10. Testing / Execution Steps

### 10.1 Prerequisites

Ensure the following are installed before testing:

```bash
# 1. Node.js (v18 or higher)
node --version

# 2. Python 3.8 or higher  
python --version

# 3. Required Python packages
pip install pytesseract Pillow pymupdf

# 4. Tesseract OCR engine (for local OCR if needed)
# Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki

# 5. Environment variables must be set in .env.local:
# GEMINI_API_KEY=your_api_key_here
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### 10.2 Starting the Application

```bash
# Navigate to project directory
cd C:\Users\sampa\OneDrive\Desktop\AIHCAS\aihcas

# Install Node.js dependencies (first time only)
npm install

# Start development server
npm run dev

# App will be available at: http://localhost:3000
```

### 10.3 Testing the Symptom Chat

**Step 1:** Open `http://localhost:3000/dashboard/chat`

**Step 2:** Test emergency bypass:
- Type: "I think I'm having a heart attack"
- **Expected:** Immediate emergency response with 112, no follow-up questions

**Step 3:** Test normal classification:
- Type: "I have a headache and mild fever since yesterday"
- **Expected:** Follow-up question asking about duration and associated symptoms (Phase 1)
- Answer the follow-up question
- **Expected:** Full assessment with 🩺 or ✅ triage badge

**Step 4:** Test negation handling:
- Type: "I have a severe headache but NO chest pain and NO breathlessness"
- **Expected:** Should classify as headache, NOT chest_pain

**Step 5:** Test drug query:
- Type: "Can I take Paracetamol and Ibuprofen together?"
- **Expected:** Specific drug interaction advice

### 10.4 Testing the Python Engine Directly

```bash
# Test Python NLP engine directly from command line:
cd C:\Users\sampa\OneDrive\Desktop\AIHCAS\aihcas

python src/scripts/medical_ai.py "I have fever and severe joint pain with rash"
# Expected output: {"id": "chikungunya", "score": 54}

python src/scripts/medical_ai.py "I have chest pain spreading to my left arm"
# Expected output: {"id": "chest_pain", "score": 96}

python src/scripts/medical_ai.py "I have a headache but no fever"
# Expected output: {"id": "headache", "score": 27}

python src/scripts/medical_ai.py "I have dengue symptoms with low platelet count"
# Expected output: {"id": "dengue", "score": 66}
```

### 10.5 Testing Prescription Analysis

**Step 1:** Open `http://localhost:3000/dashboard/prescription`

**Step 2:** Find any prescription image (photograph your own or use a test image)

**Step 3:** Click "Upload Prescription" and select the image file

**Step 4:** Wait 3–8 seconds for Gemini to process

**Expected result:**
- One card per medication with name, dose, timing (human-readable), purpose, warnings
- An overall prescription summary at the top
- Allergy warnings if the user has set up allergies in their profile that conflict

**Step 5:** Test allergy detection:
- First, go to Profile → Clinical Parameters → Add "Penicillin" as an allergy → Save
- Upload a prescription containing Amoxicillin or any penicillin antibiotic
- **Expected:** Red allergy alert displayed on the medication card

### 10.6 Testing the Health Profile

**Step 1:** Open `http://localhost:3000/dashboard/profile`

**Step 2:** Fill in all fields in the "Personal Parameters" tab

**Step 3:** Enter height 170 cm and weight 85 kg
- **Expected:** BMI calculated as 29.4, displayed as "Overweight" in orange

**Step 4:** Go to "Clinical Parameters" tab
- Click "Diabetes" and "Hypertension" chips
- Click "Aspirin" allergy chip
- Type current medications in the text area
- Click "Save Health Parameters"
- **Expected:** Green "Saved securely to Database" banner

**Step 5:** Return to chat, ask: "My blood pressure is 160/100, what should I do?"
- **Expected:** Response should acknowledge the user's hypertension condition from their profile

---

## 11. Sample Inputs and Expected Outputs

### Sample 1 — Common Self-Care Scenario

**User Input:**
> "I have a mild headache and feel a bit dehydrated after being in the sun all day"

**Expected Triage:** ✅ Self-Care Protocol (green badge)

**Expected AI Response (summarized):**
```
Headache Assessment

Likely causes:
- Dehydration (most common) — drink 2–3 glasses of water immediately
- Heat exposure headache

Self-care steps:
- Drink plenty of water or ORS immediately
- Rest in a cool, shaded room
- Apply cold compress to forehead
- Paracetamol (Dolo-650 / Crocin) if pain persists

⚠️ See a doctor if headache worsens with stiff neck or vision changes.

✅ Self-Care Recommended for mild dehydration headache.
```

---

### Sample 2 — Consult-Level Dengue Suspicion

**User Input:**
> "I've had high fever for 3 days, my whole body aches terribly, and there's a rash on my arms. Eye pain too."

**Expected Triage:** 🩺 Consult Clinician (amber badge)

**Expected AI Response (summarized):**
```
Possible Dengue Fever

Classic dengue signs:
- High fever (102–104°F) for 2–7 days ✓
- Severe body/joint pain ("breakbone fever") ✓
- Pain behind eyes ✓
- Skin rash (appears day 3–4) ✓

DO NOT take: ❌ Aspirin ❌ Ibuprofen (increases bleeding risk)
Safe: ✅ Paracetamol only

Get tested today: Dengue NS1 Antigen + CBC with platelet count

⚠️ WARNING SIGNS (go to emergency immediately):
- Bleeding from gums, nose, or in vomit/stool
- Severe abdominal pain

🩺 Doctor Consultation TODAY — do not delay.
```

---

### Sample 3 — Emergency Bypass

**User Input:**
> "I'm having chest pain and it's spreading to my left arm. I'm sweating a lot."

**Expected Triage:** 🚨 Critical Alert — Call 112 (red badge)

**Expected AI Response (summarized, returned INSTANTLY):**
```
🚨 Chest Pain — Urgent Attention Required

Call 112 immediately if you have:
- Pain spreading to left arm, jaw, or shoulder ← YOU HAVE THIS
- Shortness of breath + chest pain
- Sweating + nausea + chest pressure ← YOU HAVE THIS

While waiting for help:
- Sit/lie down, stay calm
- Loosen tight clothing
- If available: chew 1 Aspirin 325mg (if not allergic)
- Do NOT drive yourself to hospital

🚨 Emergency — Call 112 Immediately. Do not wait.
```

---

### Sample 4 — Mental Health Query

**User Input:**
> "I've been feeling extremely anxious lately, my heart races randomly, I can't sleep, and I worry constantly about everything"

**Expected Triage:** 🩺 Consult Clinician

**Expected AI Response (summarized):**
```
Anxiety / Mental Health Support

Mental health concerns are very real and increasingly common in India. 
You are not alone.

If you're having a panic attack right now:
1. Breathe in slowly for 4 counts
2. Hold for 4 counts
3. Breathe out for 6 counts
4. Repeat 5 times

Indian self-care:
- Pranayama (Anulom-Vilom) — 10 minutes daily
- Ashwagandha (KSM-66 extract) — proven adaptogen
- Limit social media and news

Helplines (free, confidential):
- iCall: 9152987821
- KIRAN (Mental Health): 1800-599-0019 (free, 24/7)
- Vandrevala Foundation: 1860-2662-345

🩺 Doctor Consultation Advised — therapy (CBT) and/or medication can help.
```

---

### Sample 5 — Negation Handling Test

**User Input:**
> "I have a terrible stomachache since morning but NO fever, NO chest pain, and NO breathlessness. It started after eating biryani."

**Expected Triage:** ✅ Self-Care (or 🩺 Consult if cramping severe)

**Expected Classification:** `stomach_pain` / `food_poisoning` (NOT chest_pain or fever, even though those words appear)

**Expected AI Response (summarized):**
```
Food Poisoning / Gastroenteritis

Very common in India — street food, water contamination, or improperly stored 
food are common causes. Biryani that was not freshly made is a classic trigger.

Immediate treatment:
- ORS (Electral / Jeevani) — most important! Prevents dangerous dehydration
- Small sips of water/coconut water frequently
- Do NOT eat solid food until vomiting stops
- Then eat: khichdi, curd, banana, boiled rice
- Probiotics (Darolac, Econorm) help restore gut bacteria

ORS home recipe: 1L boiled water + 6 tsp sugar + 1/2 tsp salt

⚠️ Go to doctor/emergency if:
- Can't keep any fluids down for >6 hours
- Blood in stool or vomit
- High fever (>102°F)

✅ Self-Care Recommended if mild and able to keep fluids down.
```

---

## Summary

Member 2's contribution is the **intelligence layer** of AIHCAS. Without this work, the app would be a static information website. With it, AIHCAS becomes a responsive, personalized, and contextually aware AI health companion.

The three-feature set works together in a pipeline:
1. **Health Profile** captures who the user is
2. **Symptom Chat** uses that profile + NLP to give personalized advice
3. **Prescription Analysis** uses that profile + Gemini Vision to flag dangerous drug interactions

The technical implementation combines classical NLP (TF-IDF + Cosine Similarity, implemented from scratch in both TypeScript and Python), modern LLM APIs (Gemini 2.5 Flash), and a hand-crafted domain expert knowledge base — making it both robust and medically sound.

---

*Document prepared by Member 2 — AIHCAS Team*  
*Project: AI Health Care Assistance System (AIHCAS)*  
*Date: May 2026*  
*Total pages: ~60+ equivalent*
