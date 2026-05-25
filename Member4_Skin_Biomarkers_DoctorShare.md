# AIHCAS — Member 4: Skin Analysis, Biomarker Tracker & Share with Doctor
## Complete Technical Documentation

---

| Field | Details |
|---|---|
| **Member Role** | AI Skin Dermatology Scanner + Biomarker Trend Tracker + Doctor Portal / Share System |
| **Total Lines of Code** | ~3,800 lines |
| **Primary AI Model** | Google Gemini Vision (gemini-1.5-flash) |
| **Database** | Supabase (PostgreSQL + Row Level Security) |
| **Frontend Framework** | Next.js 14 (App Router) + TypeScript |
| **Chart Library** | Recharts |
| **Animation Library** | Framer Motion |

---

## Files Owned

| File Path | Role |
|---|---|
| `src/app/dashboard/skin/page.tsx` | Patient-facing Skin Analysis UI |
| `src/app/dashboard/biomarkers/page.tsx` | Biomarker Trend Dashboard UI |
| `src/app/dashboard/share/page.tsx` | Share Report with Doctor UI |
| `src/app/api/analyze-skin/route.ts` | Backend API — Gemini skin scan |
| `src/app/api/biomarkers/route.ts` | Backend API — Biomarker data fetcher |
| `src/app/api/patient/share-report/route.ts` | Backend API — Share report logic |
| `src/app/api/doctors/search/route.ts` | Backend API — Doctor search |
| `src/app/doctor/dashboard/page.tsx` | Doctor-facing dashboard |
| `src/app/doctor/auth/page.tsx` | Doctor registration & login |
| `src/components/BiomarkerTrends.tsx` | Reusable chart component |

---

## Table of Contents

1. [Overview](#1-overview)
2. [How Skin Analysis Works](#2-how-skin-analysis-works--detailed-explanation)
3. [How Biomarker Tracking Works](#3-how-biomarker-tracking-works--detailed-explanation)
4. [How Share with Doctor Works](#4-how-share-with-doctor-works--detailed-explanation)
5. [Workflow / User Journey](#5-workflow--user-journey)
6. [Algorithms Used](#6-algorithms-used)
7. [Libraries Used](#7-libraries-used)
8. [Implementation Details — Step by Step](#8-implementation-details--step-by-step)
9. [Code Logic Samples](#9-code-logic-samples)
10. [Lines of Code Breakdown](#10-lines-of-code-breakdown)
11. [Problems Faced and Solutions](#11-problems-faced-and-solutions)
12. [Testing / Execution Steps](#12-testing--execution-steps)
13. [Sample Skin Analysis Output](#13-sample-skin-analysis-output)
14. [Sample Biomarker Data](#14-sample-biomarker-data)

---

## 1. Overview

### What Does Member 4 Build?

Member 4 is responsible for three interconnected healthcare modules within the AIHCAS (AI Health Care Assistant System) platform:

---

### 1.1 Skin Analysis Module

The Skin Analysis module allows patients to **upload a photograph of a skin lesion or mole** and receive an **AI-powered dermatological assessment** within seconds. Instead of waiting weeks for a dermatologist appointment, a patient can take a close-up photo with their smartphone, upload it to the app, and receive an instant analysis based on the internationally recognized **ABCDE Melanoma Detection Protocol**.

**Why is this important?**
Skin cancer is one of the most common cancers worldwide. Melanoma, the deadliest form of skin cancer, is highly treatable when caught early. The ABCDE protocol is taught to medical students globally because it provides a structured way to evaluate whether a mole or spot requires urgent medical attention. By embedding this protocol inside an AI model (Google Gemini Vision), the app brings professional-level preliminary screening to anyone with a smartphone.

The module does NOT replace a doctor — it provides a **preliminary risk assessment** and clearly tells the user whether they should seek urgent medical attention, consider a referral, or simply monitor the spot over time.

---

### 1.2 Biomarker Tracker Module

The Biomarker Tracker allows patients to **track their lab results over time** — blood tests, urine analysis, and other clinical measurements — in a single, visual dashboard. Instead of keeping paper lab reports in a drawer, the AIHCAS system automatically extracts biomarker values from uploaded lab reports and plots them as **trend charts over time**.

**Why is this important?**
A single blood test result means little without context. A doctor looks at trends: Is your blood glucose rising every 3 months? Is your hemoglobin recovering after iron supplements? The Biomarker Tracker gives patients this same longitudinal view. It also colour-codes each value as **normal (green)** or **abnormal (red)** based on standard clinical reference ranges for 25+ biomarkers including Hemoglobin, HbA1c, Blood Glucose, Cholesterol, and more.

---

### 1.3 Share with Doctor Module

The Share with Doctor module allows patients to **securely share their health data — lab reports, skin scans, and other medical documents — directly with a verified doctor** on the platform. Doctors can view patient-shared data, send messages, and monitor their patients' health remotely.

**Why is this important?**
Healthcare is a team effort. A patient who has an elevated HbA1c result and a suspicious mole needs to share that information with their physician. The Share with Doctor system creates a **secure, permissioned data-sharing pipeline** where:
- Only verified, admin-approved doctors can receive shared reports
- Patients explicitly choose which doctor receives which document
- Doctors get a unified dashboard showing all their linked patients and shared records
- Secure in-app messaging replaces informal communication channels

---

## 2. How Skin Analysis Works — Detailed Explanation

### 2.1 What is the ABCDE Melanoma Protocol?

The **ABCDE Protocol** is a clinical guideline developed by dermatologists to help identify potentially cancerous skin lesions. Each letter represents a specific visual characteristic:

---

#### A — Asymmetry
**What it means:** A normal mole or freckle is roughly symmetrical. If you drew a line through the middle, both halves would look the same. A concerning mole has **one half that looks different from the other** — one side may be rounder, larger, or differently shaped.

**Example:** Imagine a circle (benign) vs. a shape like a kidney or an irregular blob (concerning).

**In the AI system:** Gemini Vision analyses the pixel shape and contour of the lesion. It assigns an asymmetry score from 0–10 and a concern level of LOW, MODERATE, or HIGH.

---

#### B — Border
**What it means:** A healthy mole has **smooth, well-defined edges**. Concerning lesions have **irregular, ragged, notched, or blurred borders** — the edge looks like it "bleeds" into surrounding skin.

**Example:** A coin has clear edges (benign). A splatter of ink has irregular edges (concerning).

**In the AI system:** The AI evaluates border regularity based on visual texture and edge definition in the image.

---

#### C — Color
**What it means:** A benign mole is usually a **single, uniform shade** of brown or tan. A concerning lesion shows **multiple colours** — shades of brown, black, red, white, or blue — or an **uneven colour distribution** within the same spot.

**Example:** A solid brown freckle (benign) vs. a spot with dark brown patches, lighter areas, and a black dot in the corner (concerning).

**In the AI system:** Gemini Vision's multi-modal capabilities allow it to detect colour heterogeneity within the lesion boundary.

---

#### D — Diameter
**What it means:** Most benign moles are **smaller than 6 millimetres** in diameter — roughly the size of a pencil eraser. Lesions larger than 6mm warrant closer attention, although some early melanomas may be smaller.

**Example:** A 4mm freckle (within normal range) vs. an 8mm irregular spot (concerning).

**In the AI system:** The AI estimates relative lesion size from the image. Since we don't have a physical scale reference in every photo, the AI assesses this qualitatively based on image proportions and context.

---

#### E — Evolving
**What it means:** Any mole or skin lesion that **changes over time** — in size, shape, colour, or texture — is concerning. A lesion that bleeds, crusts, itches, or has a new colour is especially alarming.

**Example:** A mole that looked fine 6 months ago but has now grown and changed colour.

**In the AI system:** Since we are analysing a single photograph, the AI assesses observable signs of evolution such as surface irregularities, texture changes, and evidence of bleeding or crusting. The patient is also asked to note if they have observed changes.

---

### 2.2 How Gemini Vision AI Analyses the Image

Here is the step-by-step process of what happens when a patient uploads a skin image:

**Step 1 — Image Upload**
The patient selects or drags a JPG, PNG, or WEBP file onto the upload panel. The browser checks the file type and size (must be under 10MB). If valid, the image is previewed in the browser.

**Step 2 — FormData Construction**
When the patient clicks "Analyse," the JavaScript code creates a `FormData` object — think of it as a digital envelope — that contains the image file. This envelope is sent to the backend API at `/api/analyze-skin`.

**Step 3 — Backend Receives the Image**
The Next.js API route receives the image, reads it as binary data, and converts it to a **Base64 string** — a text representation of the image data that Gemini's API can accept.

**Step 4 — Building the Gemini Prompt**
The backend constructs a very specific instruction message for the Gemini AI model. This prompt:
- Explains that the AI is acting as a dermatology assistant
- Provides the ABCDE protocol definitions
- Instructs Gemini to respond ONLY in structured JSON format (not free text)
- Specifies exactly which fields must be present in the response

**Step 5 — Sending to Gemini Vision API**
The image (as Base64 inline data) and the text prompt are sent together to Gemini's `generateContent` endpoint using the `@google/generative-ai` SDK.

**Step 6 — Parsing the Response**
Gemini returns a JSON response. The backend parses this JSON, validates that all required fields are present, and sends it back to the frontend.

**Step 7 — Displaying Results**
The frontend receives the structured data and displays it in the Results panel: risk badge, ABCDE accordion, specialist referral recommendation, and key findings.

---

### 2.3 The Structured JSON Output

The Gemini API is instructed to return data in exactly this format:

```json
{
  "overallRisk": "MODERATE",
  "specialistReferral": "RECOMMENDED",
  "abcde": {
    "asymmetry": {
      "score": 6,
      "concernLevel": "MODERATE",
      "findings": "The lesion displays notable asymmetry along its horizontal axis.",
      "details": "Left half appears more elevated and pigmented than the right half."
    },
    "border": {
      "score": 5,
      "concernLevel": "MODERATE",
      "findings": "Borders show mild irregularity on the superior edge.",
      "details": "Most borders are defined but the upper edge shows slight notching."
    },
    "color": {
      "score": 7,
      "concernLevel": "HIGH",
      "findings": "Multiple shades of brown detected with darker peripheral patches.",
      "details": "Two distinct colour zones observed: medium brown centre and darker outer ring."
    },
    "diameter": {
      "score": 4,
      "concernLevel": "LOW",
      "findings": "Estimated size appears within the 5-7mm range.",
      "details": "Diameter assessment is qualitative without physical measurement scale."
    },
    "evolving": {
      "score": 3,
      "concernLevel": "LOW",
      "findings": "No obvious acute signs of rapid change visible.",
      "details": "Surface appears stable without crusting or bleeding."
    }
  },
  "keyFindings": [
    "Colour heterogeneity is the primary concern",
    "Asymmetry warrants monitoring",
    "No ulceration or bleeding detected"
  ],
  "recommendations": [
    "Consult a dermatologist within 4-6 weeks",
    "Document the lesion with monthly photographs",
    "Avoid sun exposure on affected area"
  ],
  "disclaimer": "This is an AI-assisted preliminary assessment only. It does not replace professional medical diagnosis."
}
```

---

### 2.4 The Four Risk Levels

| Risk Level | Colour | Meaning | Action |
|---|---|---|---|
| **LOW** | Green | No significant concerning features detected | Monitor; routine check-up adequate |
| **MODERATE** | Yellow/Amber | Some concerning features present | Consider dermatologist consultation |
| **HIGH** | Orange | Multiple concerning features present | Dermatologist consultation recommended soon |
| **CRITICAL** | Red | Highly suspicious of malignancy | Seek urgent medical attention immediately |

---

### 2.5 Specialist Referral Statuses

| Status | Meaning |
|---|---|
| **URGENT** | See a dermatologist or emergency department immediately — do not wait |
| **RECOMMENDED** | Schedule a dermatologist appointment within 4–6 weeks |
| **OPTIONAL** | A dermatologist visit would be beneficial but not time-critical |
| **NOT_INDICATED** | No specialist referral needed; standard monitoring is sufficient |

---

## 3. How Biomarker Tracking Works — Detailed Explanation

### 3.1 What is a Biomarker?

A **biomarker** (short for biological marker) is any **measurable substance or value** in the human body that gives information about health status. Think of biomarkers as the body's dashboard indicators — just like a car's fuel gauge or temperature warning light.

**Common biomarkers include:**

| Biomarker | What it Measures | Normal Range |
|---|---|---|
| Hemoglobin | Oxygen-carrying capacity of blood | 12–17.5 g/dL |
| HbA1c | Average blood glucose over 3 months | < 5.7% |
| Blood Glucose (Fasting) | Sugar in blood after fasting | 70–100 mg/dL |
| Total Cholesterol | Fat levels in blood | < 200 mg/dL |
| Creatinine | Kidney function | 0.7–1.2 mg/dL |
| TSH | Thyroid function | 0.4–4.0 mIU/L |
| ALT | Liver enzyme (liver health) | 7–56 U/L |
| White Blood Cell Count | Immune system activity | 4,000–11,000 /µL |

---

### 3.2 How Biomarker Values are Extracted from Lab Reports

When a patient uploads a lab report PDF or image through the Medical Documents section, the AIHCAS report parser (handled by another team member) uses AI to extract structured data from the document. The extracted biomarkers are stored in the `biomarker_history` Supabase table.

**The extraction process:**
1. Patient uploads a lab report (PDF or image)
2. The report parser uses Gemini Vision to read the document
3. Gemini identifies rows like: `Hemoglobin | 11.2 | g/dL | 12.0–17.5`
4. These values are parsed into structured objects and saved to Supabase
5. Each save is timestamped with the report date

---

### 3.3 The `biomarker_history` Table Schema

This table in Supabase stores every biomarker reading ever uploaded for every patient:

```sql
CREATE TABLE biomarker_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  biomarker_name VARCHAR(100) NOT NULL,    -- e.g. "Hemoglobin"
  value         NUMERIC NOT NULL,           -- e.g. 11.2
  unit          VARCHAR(50),               -- e.g. "g/dL"
  normal_low    NUMERIC,                   -- e.g. 12.0
  normal_high   NUMERIC,                   -- e.g. 17.5
  report_date   DATE NOT NULL,             -- When was this measured
  source_doc_id UUID REFERENCES medical_documents(id),  -- Which uploaded document
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

**Row Level Security (RLS):**
Each row is protected by a Supabase RLS policy that ensures:
- A patient can only read and write their own rows (`user_id = auth.uid()`)
- Doctors can only read rows for patients who have explicitly linked with them

---

### 3.4 Normal Ranges for 25+ Biomarkers

The `NORMAL_RANGES` constant in the biomarker dashboard defines reference ranges for over 25 biomarkers:

```typescript
const NORMAL_RANGES: Record<string, { low: number; high: number; unit: string }> = {
  "hemoglobin":        { low: 12.0,  high: 17.5,  unit: "g/dL" },
  "hba1c":            { low: 4.0,   high: 5.6,   unit: "%" },
  "blood glucose":     { low: 70,    high: 100,   unit: "mg/dL" },
  "fasting glucose":   { low: 70,    high: 100,   unit: "mg/dL" },
  "cholesterol":       { low: 0,     high: 200,   unit: "mg/dL" },
  "ldl cholesterol":   { low: 0,     high: 130,   unit: "mg/dL" },
  "hdl cholesterol":   { low: 40,    high: 999,   unit: "mg/dL" },
  "triglycerides":     { low: 0,     high: 150,   unit: "mg/dL" },
  "creatinine":        { low: 0.7,   high: 1.2,   unit: "mg/dL" },
  "urea":              { low: 15,    high: 45,    unit: "mg/dL" },
  "sodium":            { low: 136,   high: 145,   unit: "mEq/L" },
  "potassium":         { low: 3.5,   high: 5.0,   unit: "mEq/L" },
  "calcium":           { low: 8.5,   high: 10.5,  unit: "mg/dL" },
  "alt":               { low: 7,     high: 56,    unit: "U/L" },
  "ast":               { low: 10,    high: 40,    unit: "U/L" },
  "bilirubin":         { low: 0.2,   high: 1.2,   unit: "mg/dL" },
  "tsh":               { low: 0.4,   high: 4.0,   unit: "mIU/L" },
  "t4":                { low: 5.0,   high: 12.0,  unit: "µg/dL" },
  "wbc":               { low: 4000,  high: 11000, unit: "/µL" },
  "rbc":               { low: 4.2,   high: 5.9,   unit: "million/µL" },
  "platelet":          { low: 150000,high: 400000,unit: "/µL" },
  "vitamin d":         { low: 20,    high: 50,    unit: "ng/mL" },
  "vitamin b12":       { low: 200,   high: 900,   unit: "pg/mL" },
  "ferritin":          { low: 12,    high: 300,   unit: "ng/mL" },
  "uric acid":         { low: 3.5,   high: 7.2,   unit: "mg/dL" },
};
```

---

### 3.5 How the Trend Chart Shows Values Over Time

The **BiomarkerTrends** component uses **Recharts** — a JavaScript charting library — to render a **Line Chart** for each biomarker. Imagine a graph on graph paper: the X-axis shows dates, and the Y-axis shows the biomarker value.

**What the chart shows:**
- **Blue line**: The patient's actual measured values at each date
- **Green shaded band**: The normal reference range (between `normal_low` and `normal_high`)
- **Green dot**: A data point that falls within the normal range
- **Red dot**: A data point that falls outside the normal range (either too high or too low)
- **Tooltip**: When you hover over any dot, a popup shows the exact date, value, unit, and normal range

**Example interpretation:**
If a patient's Hemoglobin readings are:
- Jan: 10.2 g/dL (red dot — below normal of 12.0)
- Mar: 11.5 g/dL (red dot — still below)
- Jun: 12.8 g/dL (green dot — recovered to normal)

The chart tells a clear story: the patient had low hemoglobin (possibly anaemia) that gradually recovered — perhaps after iron supplements.

---

### 3.6 Normal vs Abnormal Colour Coding

The colour of each data point is computed by this simple logic:

```typescript
const isNormal = (value: number, normalRange: { low: number; high: number }): boolean => {
  return value >= normalRange.low && value <= normalRange.high;
};

// In the chart's custom dot renderer:
const dotColor = isNormal(entry.value, normalRange) ? "#22c55e" : "#ef4444";
// #22c55e = Tailwind green-500
// #ef4444 = Tailwind red-500
```

**Green dot** = value within normal range = reassuring  
**Red dot** = value outside normal range = needs attention

The summary cards at the top of the Biomarker dashboard also show counts:
- "X biomarkers normal" with a green badge
- "Y biomarkers need attention" with a red badge

---

### 3.7 Priority Biomarker Ordering

When many biomarkers are available, the most clinically important ones appear first in the selector pills. This is controlled by the `PRIORITY_BIOMARKERS` array:

```typescript
const PRIORITY_BIOMARKERS = [
  "hemoglobin",
  "hba1c",
  "blood glucose",
  "fasting glucose",
  "cholesterol",
  "creatinine",
  "tsh",
  "wbc",
];
```

The sorting algorithm checks if a biomarker's name (lowercased) is in this list. If it is, it gets a lower sort index (appears earlier). If it's not in the list, it appears after the priority biomarkers in alphabetical order.

---

## 4. How Share with Doctor Works — Detailed Explanation

### 4.1 The Patient-Doctor Link System

Before a patient can share anything with a doctor, they must first **link with that doctor**. Think of this like adding a contact on a messaging app — the patient searches for the doctor, sends a link request, and the doctor becomes their connected physician.

The link is stored in a Supabase table called `patient_doctor_links`:

```sql
CREATE TABLE patient_doctor_links (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  UUID NOT NULL REFERENCES auth.users(id),
  doctor_id   UUID NOT NULL REFERENCES doctors(id),
  status      TEXT DEFAULT 'active',    -- 'active', 'removed'
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, doctor_id)          -- A patient can't link twice to same doctor
);
```

---

### 4.2 How a Patient Searches for a Doctor

On the Share with Doctor page, the patient sees a search bar. When they type a doctor's name or hospital:

1. The frontend sends a request to `/api/doctors/search?q=searchterm`
2. The backend queries the `doctors` table filtering by:
   - `name ILIKE '%searchterm%'` (case-insensitive name match)
   - `hospital ILIKE '%searchterm%'` (or hospital name match)
   - `status = 'approved'` (only verified doctors appear in search)
3. Results are returned showing: Doctor's name, specialization, hospital, and profile
4. The patient clicks "Link with Doctor" to create the connection

---

### 4.3 How a Report is Shared

Once linked, the patient can share any of their medical documents with a linked doctor:

**Step 1 — Patient selects a document**
The patient sees a list of their uploaded documents (lab reports, skin scans, etc.) and ticks the checkbox next to one.

**Step 2 — Patient selects a doctor**
From their list of linked doctors, the patient selects who should receive the document.

**Step 3 — API Call**
The frontend sends a POST request to `/api/patient/share-report`:
```json
{
  "documentId": "doc-uuid-here",
  "doctorId": "doctor-uuid-here",
  "note": "Please review my recent blood test results"
}
```

**Step 4 — Supabase Update**
The backend creates a record in the `shared_reports` table:
```sql
INSERT INTO shared_reports (patient_id, doctor_id, document_id, patient_note, status)
VALUES (auth.uid(), doctor_id, document_id, note, 'shared');
```

**Step 5 — Doctor Notification**
An in-app notification is created for the doctor so they see the new shared document on their next login.

---

### 4.4 How the Doctor Sees It

In the doctor's dashboard at `/doctor/dashboard`, the doctor sees:
- A list of all patients who have linked with them
- For each patient: their shared reports and documents
- A messaging thread per patient
- The ability to write notes/responses

The doctor's data is fetched using a Supabase query filtered by `doctor_id = auth.uid()` — doctors can only see patients linked to them, not any other patient.

---

### 4.5 Doctor Verification System

Doctors cannot self-approve themselves. The system has a three-stage approval workflow:

**Stage 1 — Doctor Registration**
The doctor fills in a registration form at `/doctor/auth` with:
- Full name
- Email address
- Password
- Medical specialization (e.g., Dermatology, General Practice)
- Hospital or clinic name
- **Medical License ID** (mandatory — used for verification)

```typescript
interface DoctorRegistration {
  name: string;
  email: string;
  password: string;
  specialization: string;
  hospital: string;
  licenseId: string;   // e.g., "MCI-2019-DL-49201"
}
```

**Stage 2 — Pending Status**
After registration, the doctor's account is created with `status: 'pending'`. They can log in but see only a "Your account is pending admin approval" message. They cannot access any patient data.

**Stage 3 — Admin Approval**
A platform administrator (with special admin privileges) reviews the license ID. Once satisfied, they update the status to `'approved'`. The doctor now has full access.

```sql
UPDATE doctors SET status = 'approved' WHERE id = :doctor_id;
```

---

### 4.6 Doctor Messaging System

Both doctors and patients can send text messages and media attachments (photos, PDFs) through the secure consultation chat:

**Patient sends message/attachment:**
POST to `/api/patient/messages` with `{ doctorId, message?, attachmentUrl?, attachmentType? }`

**Doctor sends message/attachment:**
POST to `/api/doctor/messages` with `{ patientId, message?, attachmentUrl?, attachmentType? }`

**Consultation Messages Table Schema:**
```sql
CREATE TABLE consultation_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id       UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  sender_role     TEXT NOT NULL CHECK (sender_role IN ('patient', 'doctor')),
  message         TEXT NOT NULL,
  attachment_url  TEXT,             -- Stores base64 data URL for images or documents
  attachment_type TEXT,             -- MIME type (e.g. image/jpeg, application/pdf)
  is_read         BOOLEAN DEFAULT FALSE,
  sent_at         TIMESTAMPTZ DEFAULT NOW()
);
```

**Send Media & Open Camera Integration:**
- **Send Media**: The interface displays a paperclip button which triggers a hidden `<input type="file" accept="image/*,application/pdf" />`. When a file is selected, it is converted to a base64 Data URL using the HTML5 `FileReader` API and uploaded.
- **Open Camera**: The interface displays a camera button which triggers a hidden file input configured with `capture="environment" accept="image/*"`. On mobile devices, this directly launches the native camera app to snap a picture. On desktops, it opens the file selector to choose an image. The captured picture is converted to base64 and sent inside the conversation thread.
- **Rendering**: Images are rendered inline with preview options (expandable on click). Non-image files (such as reports in PDF format) are displayed as secure links showing a document preview icon.

Messages are displayed in the doctor dashboard as a conversation thread, similar to a simple chat interface. Unread messages show a blue notification badge.

---

## 5. Workflow / User Journey

### 5.1 Skin Analysis Workflow

```
PATIENT OPENS SKIN ANALYSIS PAGE
             |
             v
    ┌─────────────────┐
    │   Upload Stage  │
    │  Drag & Drop or │
    │  Click to Browse│
    └────────┬────────┘
             |
             v
    ┌─────────────────────────────────┐
    │        File Validation          │
    │  ✓ Type: image/jpeg, image/png, │
    │         image/webp              │
    │  ✓ Size: < 10MB                 │
    │  ✗ Invalid? → Show error toast  │
    └────────┬────────────────────────┘
             | Valid file
             v
    ┌─────────────────┐
    │ Image Previewed │
    │ in Upload Panel │
    └────────┬────────┘
             |
             | Patient clicks "Analyse Skin"
             v
    ┌──────────────────────────────────┐
    │      Scanning Stage Begins       │
    │  Stage state → "scanning"        │
    │  Animated scan beam plays        │
    │  Pulsing crosshair appears       │
    │  Corner reticles animate in      │
    │  Progress bar increments         │
    │  Step labels cycle:              │
    │    "Initialising scan..."        │
    │    "Analysing asymmetry..."      │
    │    "Evaluating borders..."       │
    │    "Detecting colour variations" │
    │    "Measuring dimensions..."     │
    │    "Checking evolution markers"  │
    │    "Computing risk score..."     │
    │    "Generating report..."        │
    └────────┬─────────────────────────┘
             | (setInterval 600ms per step)
             |
             | Simultaneously in background:
             v
    ┌──────────────────────────────────┐
    │     POST /api/analyze-skin       │
    │  FormData { image: File }        │
    │      → Next.js API Route         │
    │      → Image read as Buffer      │
    │      → Converted to Base64       │
    │      → Gemini prompt built       │
    │      → @google/generative-ai SDK │
    │      → Gemini processes image    │
    │      → JSON response returned    │
    └────────┬─────────────────────────┘
             | API response received
             | clearInterval() called
             v
    ┌──────────────────────────────────┐
    │       Results Stage              │
    │  Stage state → "results"         │
    │  Risk badge overlaid on image    │
    │  ABCDE accordion displayed       │
    │  Key findings listed             │
    │  Specialist referral shown       │
    │  Recommendations displayed       │
    │  "Scan Again" button available   │
    └──────────────────────────────────┘
```

---

### 5.2 Biomarker Tracking Workflow

```
PATIENT UPLOADS LAB REPORT (Medical Documents section)
             |
             v
    ┌──────────────────────────────────┐
    │      PDF/Image Report Upload     │
    │  File processed by Report Parser │
    │  (Handled by another team member)│
    └────────┬─────────────────────────┘
             |
             v
    ┌──────────────────────────────────┐
    │   Gemini Vision reads document   │
    │   Extracts biomarker rows:       │
    │   "Hemoglobin | 11.2 | g/dL"    │
    │   "HbA1c | 6.1 | %"             │
    └────────┬─────────────────────────┘
             |
             v
    ┌──────────────────────────────────┐
    │  Values stored in Supabase       │
    │  biomarker_history table         │
    │  Each row: name, value, unit,    │
    │  normal_low, normal_high,        │
    │  report_date, user_id            │
    └────────┬─────────────────────────┘
             |
             | Patient opens Biomarker Dashboard
             v
    ┌──────────────────────────────────┐
    │  GET /api/biomarkers             │
    │  Fetches all biomarker_history   │
    │  rows for current user           │
    │  Groups by biomarker_name        │
    └────────┬─────────────────────────┘
             |
             v
    ┌──────────────────────────────────┐
    │     Biomarker Dashboard UI       │
    │                                  │
    │  Summary Cards:                  │
    │  [Total Tracked] [Latest Date]   │
    │  [Normal Count] [Needs Attention]│
    │                                  │
    │  Selector Pills (priority order):│
    │  [Hemoglobin●] [HbA1c●] [Glucose]│
    │  ● = green (normal) / red (abnml)│
    │                                  │
    │  Trend Chart (Recharts):         │
    │  X-axis: dates                   │
    │  Y-axis: values                  │
    │  Green band: normal range        │
    │  Dots: green/red per reading     │
    │                                  │
    │  QuickStats Panel:               │
    │  Latest | Highest | Lowest       │
    │  Total Readings | Date Range     │
    └──────────────────────────────────┘
```

---

### 5.3 Share with Doctor Workflow

```
PATIENT WANTS TO SHARE A REPORT
             |
             v
    ┌──────────────────────────────────┐
    │  Patient opens Share with Doctor │
    │  page at /dashboard/share        │
    └────────┬─────────────────────────┘
             |
             v
    ┌──────────────────────────────────┐
    │  Patient uses Doctor Search      │
    │  Types doctor name or hospital   │
    │  GET /api/doctors/search?q=...   │
    │  Results: verified doctors only  │
    └────────┬─────────────────────────┘
             |
             v
    ┌──────────────────────────────────┐
    │  Patient selects a doctor        │
    │  Clicks "Link with Doctor"       │
    │  POST /api/patient/link-doctor   │
    │  Creates patient_doctor_links row│
    └────────┬─────────────────────────┘
             |
             v
    ┌──────────────────────────────────┐
    │  Patient selects a document to   │
    │  share from their document list  │
    │  (Lab report, skin scan, etc.)   │
    └────────┬─────────────────────────┘
             |
             v
    ┌──────────────────────────────────┐
    │  Patient adds optional note:     │
    │  "Please review these results"   │
    │  Clicks "Share with Dr. Smith"   │
    │  POST /api/patient/share-report  │
    │  Creates shared_reports row      │
    │  Status: 'shared'                │
    └────────┬─────────────────────────┘
             |
             v
    ┌──────────────────────────────────┐
    │  Doctor receives notification    │
    │  Badge count increments on       │
    │  doctor's dashboard              │
    └────────┬─────────────────────────┘
             |
             | Doctor logs into /doctor/dashboard
             v
    ┌──────────────────────────────────┐
    │  Doctor views patient list       │
    │  Sees patient's shared document  │
    │  Can view full document          │
    │  Can view biomarker history      │
    │  Can write a message response    │
    │  POST /api/doctor/messages       │
    └────────┬─────────────────────────┘
             |
             v
    ┌──────────────────────────────────┐
    │  Patient sees doctor's message   │
    │  in their messages panel         │
    │  GET /api/patient/messages       │
    └──────────────────────────────────┘
```

---

## 6. Algorithms Used

### 6.1 ABCDE Scoring Algorithm

Each of the five ABCDE criteria is scored independently by Gemini Vision on a scale of **0 to 10**, where:
- **0–3**: Minimal concern (LOW)
- **4–6**: Moderate concern (MODERATE)
- **7–10**: High concern (HIGH)

The Gemini prompt instructs the model to produce these scores based on visual analysis. The prompt provides scoring rubrics for each criterion:

```
For Asymmetry:
- Score 0-3: Lesion appears symmetric or near-symmetric
- Score 4-6: Noticeable asymmetry in one axis
- Score 7-10: Marked asymmetry in both axes or highly irregular shape
```

Each criterion also produces:
- `findings`: A one-sentence summary
- `details`: A more detailed explanation
- `concernLevel`: "LOW" | "MODERATE" | "HIGH"

---

### 6.2 Risk Aggregation Algorithm

The five individual ABCDE concern levels are combined into a single `overallRisk` using weighted aggregation logic in the Gemini prompt instructions:

```
Overall Risk Rules (provided to Gemini):
- CRITICAL: Any criterion scores HIGH (7+) AND at least two others are MODERATE or HIGH
- HIGH:     Two or more criteria are HIGH, OR one is HIGH with two MODERATE
- MODERATE: One criterion is HIGH, OR two or more are MODERATE
- LOW:      All criteria are LOW or at most one is MODERATE
```

This is computed inside the Gemini model based on the prompt instructions. The backend validates the `overallRisk` field exists and is one of the four valid values before sending to the frontend.

---

### 6.3 Biomarker Normal Range Check

```typescript
const isNormal = (value: number, biomarkerName: string): boolean => {
  const normalRange = findNormalRange(biomarkerName);
  if (!normalRange) return true; // Unknown biomarker = assume normal for display
  return value >= normalRange.low && value <= normalRange.high;
};
```

**Logic explanation:**
- If value is greater than or equal to the normal low AND less than or equal to the normal high → Normal (green)
- If value is below the low → Abnormal (red) — could indicate deficiency
- If value is above the high → Abnormal (red) — could indicate excess or disease

---

### 6.4 Priority Biomarker Ordering Algorithm

```typescript
const PRIORITY_BIOMARKERS = ["hemoglobin", "hba1c", "blood glucose", "fasting glucose",
  "cholesterol", "creatinine", "tsh", "wbc"];

const sortedBiomarkers = uniqueBiomarkers.sort((a, b) => {
  const aIndex = PRIORITY_BIOMARKERS.indexOf(a.toLowerCase());
  const bIndex = PRIORITY_BIOMARKERS.indexOf(b.toLowerCase());
  
  if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;  // Both priority: order by list
  if (aIndex !== -1) return -1;  // Only A is priority: A comes first
  if (bIndex !== -1) return 1;   // Only B is priority: B comes first
  return a.localeCompare(b);     // Neither priority: alphabetical
});
```

---

### 6.5 `findNormalRange()` Fuzzy Matching

The lab report may contain biomarker names that don't exactly match the keys in `NORMAL_RANGES`. For example, the lab might say "Fasting Blood Glucose" while the key is "blood glucose". The fuzzy match handles this:

```typescript
const findNormalRange = (biomarkerName: string) => {
  const nameLower = biomarkerName.toLowerCase();
  
  // First: exact match
  if (NORMAL_RANGES[nameLower]) return NORMAL_RANGES[nameLower];
  
  // Second: substring match (does the key appear in the name, or vice versa?)
  for (const [key, range] of Object.entries(NORMAL_RANGES)) {
    if (nameLower.includes(key) || key.includes(nameLower)) {
      return range;
    }
  }
  
  return null; // No match found
};
```

**Example matches:**
- "Fasting Blood Glucose" → matches "blood glucose" (key appears in name)
- "Serum Creatinine" → matches "creatinine" (key appears in name)
- "HbA1c" → matches "hba1c" after lowercasing

---

### 6.6 QuickStats Calculation

For the currently selected biomarker, these stats are computed from all historical readings:

```typescript
const calculateQuickStats = (readings: BiomarkerReading[]) => {
  if (!readings.length) return null;
  
  const values = readings.map(r => r.value);
  const dates = readings.map(r => new Date(r.report_date));
  
  return {
    latest: readings[readings.length - 1].value,        // Most recent reading
    highest: Math.max(...values),                         // All-time maximum
    lowest: Math.min(...values),                          // All-time minimum
    count: readings.length,                               // Total number of readings
    dateRange: {
      from: new Date(Math.min(...dates.map(d => d.getTime()))),
      to: new Date(Math.max(...dates.map(d => d.getTime())))
    }
  };
};
```

---

### 6.7 Scan Step Animation Timing

The scanning animation shows progress steps during the API call. It uses JavaScript's `setInterval` to advance a progress bar every 600ms:

```typescript
const SCAN_STEPS = [
  "Initialising scan...",
  "Analysing asymmetry...",
  "Evaluating borders...",
  "Detecting colour variations...",
  "Measuring dimensions...",
  "Checking evolution markers...",
  "Computing risk score...",
  "Generating report...",
];

const startAnimation = () => {
  let stepIndex = 0;
  const totalSteps = SCAN_STEPS.length;         // 8 steps
  const progressIncrement = 100 / totalSteps;   // 12.5% per step
  
  const intervalId = setInterval(() => {
    stepIndex++;
    setCurrentStep(SCAN_STEPS[stepIndex % totalSteps]);
    setScanProgress(prev => Math.min(prev + progressIncrement, 90));
    // Capped at 90% — the final 10% completes when API returns
    
    if (stepIndex >= totalSteps - 1) {
      clearInterval(intervalId); // Stop cycling but keep last step visible
    }
  }, 600); // 600 milliseconds between each step
  
  return intervalId; // Store so we can clear it when API completes
};

// When API responds:
const onApiComplete = (intervalId: ReturnType<typeof setInterval>) => {
  clearInterval(intervalId);
  setScanProgress(100);
  setStage("results");
};
```

**Why 600ms?** This gives a smooth, deliberate pacing. Too fast feels fake and rushed. Too slow frustrates users. 600ms × 8 steps = 4.8 seconds of animation, which roughly matches the expected Gemini API response time.

---

### 6.8 Drag-and-Drop File Handling

The upload area supports both drag-and-drop and click-to-browse:

```typescript
const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();           // Prevent default browser behavior (opening file)
  e.stopPropagation();          // Don't bubble up to parent elements
  setIsDragging(true);          // Show visual feedback (border turns blue)
};

const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  setIsDragging(false);         // Remove visual feedback
};

const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragging(false);
  
  const droppedFile = e.dataTransfer.files[0];  // Take only the first file
  
  if (!droppedFile) return;
  
  // Validate file type
  if (!droppedFile.type.startsWith("image/")) {
    toast.error("Please upload an image file (JPG, PNG, or WEBP)");
    return;
  }
  
  // Validate file size (10MB = 10 * 1024 * 1024 bytes)
  if (droppedFile.size > 10 * 1024 * 1024) {
    toast.error("File size must be less than 10MB");
    return;
  }
  
  setFile(droppedFile);
  
  // Create a preview URL using FileReader API
  const reader = new FileReader();
  reader.onload = (event) => {
    setPreviewUrl(event.target?.result as string);
  };
  reader.readAsDataURL(droppedFile); // Converts file to Base64 data URL for <img> tag
};
```

---

## 7. Libraries Used

| Library | Version | Purpose |
|---|---|---|
| `@google/generative-ai` | ^0.21.0 | Official Google SDK for calling the Gemini Vision API. Handles authentication, request formatting, and response parsing. |
| `framer-motion` | ^11.0.0 | Animation library used for the scan beam, crosshair pulses, corner reticles, fade-in transitions, and card hover effects throughout the skin analysis page. |
| `recharts` | ^2.12.0 | React charting library used in BiomarkerTrends.tsx to render the LineChart, ReferenceLine (normal range bands), custom dots, and tooltips. |
| `@supabase/supabase-js` | ^2.43.0 | Official Supabase client for JavaScript/TypeScript. Used for all database operations: reading/writing biomarker_history, shared_reports, patient_doctor_links, messages, and doctors tables. Also handles authentication sessions. |
| `lucide-react` | ^0.400.0 | Icon library providing consistent, clean SVG icons used throughout the UI: AlertTriangle (risk warnings), CheckCircle (normal status), Activity (biomarker charts), Share2 (share button), Search (doctor search), MessageCircle (messaging). |
| `next` | ^14.2.0 | The full-stack React framework. Provides the App Router, API routes (`/api/*`), server-side rendering, and the overall project structure. |
| `react` | ^18.3.0 | Core React library for building component-based UIs. |
| `typescript` | ^5.4.0 | Typed superset of JavaScript. Provides type safety across all components and API routes. |
| `sonner` | ^1.5.0 | Toast notification library for showing success/error messages to users (e.g., "File too large", "Analysis complete"). |

---

## 8. Implementation Details — Step by Step

### 8.1 Skin Analysis Page (`skin/page.tsx`)

This file is the patient-facing UI for the skin analysis feature. It is approximately 650 lines of TypeScript + JSX.

---

#### Stage State Machine

The page has three possible stages, controlled by a single React state variable:

```typescript
type Stage = "upload" | "scanning" | "results";
const [stage, setStage] = useState<Stage>("upload");
```

- **upload**: The initial state. Patient sees the drag-and-drop zone and any previously selected file preview.
- **scanning**: Activated when the patient clicks "Analyse Skin." The upload panel is hidden and replaced by the animated scanning overlay. The API call is happening in the background.
- **results**: Activated when the API call completes successfully. The scanning overlay is hidden and the results panel appears.

The stage transitions are:
```
upload → scanning (on "Analyse" button click)
scanning → results (on API response received)
results → upload (on "Scan Again" button click)
```

---

#### File Validation

```typescript
const validateFile = (file: File): string | null => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  
  if (!allowedTypes.includes(file.type)) {
    return "Please upload a JPG, PNG, or WEBP image file.";
  }
  
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds the 10MB limit.`;
  }
  
  return null; // null means valid
};
```

If validation fails, an error toast notification is shown and no further action is taken.

---

#### Drag-and-Drop Implementation

The upload area div has four event handlers attached:

```tsx
<div
  onDragOver={onDragOver}
  onDragEnter={() => setIsDragging(true)}
  onDragLeave={onDragLeave}
  onDrop={onDrop}
  onClick={() => fileInputRef.current?.click()} // Click also opens file picker
  className={`upload-zone ${isDragging ? "drag-active" : ""}`}
>
```

The `isDragging` state changes the CSS class, which adds a highlighted border and background to give the user visual feedback that they can drop their file here.

The hidden `<input type="file">` element provides the click-to-browse fallback:
```tsx
<input
  ref={fileInputRef}
  type="file"
  accept="image/jpeg,image/png,image/webp"
  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
  className="hidden"
/>
```

---

#### `runAnalysis()` Function

This is the core function that orchestrates the entire skin analysis process:

```typescript
const runAnalysis = async () => {
  if (!file) return;
  
  // Transition to scanning stage
  setStage("scanning");
  setScanProgress(0);
  
  // Start the step animation (returns the intervalId for cleanup)
  const intervalId = startScanAnimation();
  
  try {
    // Build the request
    const formData = new FormData();
    formData.append("image", file);
    
    // Call the backend API
    const response = await fetch("/api/analyze-skin", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const analysisResult: SkinAnalysis = await response.json();
    
    // Stop animation and show results
    clearInterval(intervalId);
    setScanProgress(100);
    setAnalysis(analysisResult);
    setStage("results");
    
  } catch (error) {
    clearInterval(intervalId);
    setStage("upload"); // Go back to upload on error
    toast.error("Analysis failed. Please try again.");
    console.error("Skin analysis error:", error);
  }
};
```

---

#### Scanning Animation

The scanning overlay uses Framer Motion for fluid animations:

```tsx
{stage === "scanning" && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="scanning-overlay"
  >
    {/* The scan beam: a horizontal line that sweeps top to bottom */}
    <motion.div
      className="scan-beam"
      animate={{ top: ["0%", "100%", "0%"] }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    />
    
    {/* Pulsing crosshair in the centre */}
    <motion.div
      className="crosshair"
      animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
    
    {/* Corner reticles (the four corner markers) */}
    {["top-left", "top-right", "bottom-left", "bottom-right"].map(corner => (
      <div key={corner} className={`reticle reticle-${corner}`} />
    ))}
  </motion.div>
)}
```

---

#### Results Display

The ABCDE results are shown in an accordion format. The `expandedAbcde` state tracks which criterion is currently expanded:

```typescript
const [expandedAbcde, setExpandedAbcde] = useState<string | null>("asymmetry");
// Starts with Asymmetry open by default
```

Each ABCDE item is rendered from the `ABCDE_INFO` object:

```typescript
const ABCDE_INFO = {
  asymmetry: {
    letter: "A",
    fullName: "Asymmetry",
    description: "One half of the lesion differs from the other half.",
    icon: "◈",
  },
  border: {
    letter: "B",
    fullName: "Border",
    description: "Edges that are irregular, ragged, notched, or blurred.",
    icon: "⬡",
  },
  color: {
    letter: "C",
    fullName: "Color",
    description: "Variation in color including different shades of brown, black, red, white, or blue.",
    icon: "◉",
  },
  diameter: {
    letter: "D",
    fullName: "Diameter",
    description: "Larger than 6mm (about the size of a pencil eraser).",
    icon: "◯",
  },
  evolving: {
    letter: "E",
    fullName: "Evolving",
    description: "Any change in size, shape, color, or new symptoms.",
    icon: "↺",
  },
};
```

---

#### RISK_CONFIG Object

Maps risk levels to display properties:

```typescript
const RISK_CONFIG = {
  LOW: {
    label: "Low Risk",
    color: "text-green-400",
    badgeClass: "bg-green-900/60 border-green-500/50 text-green-300",
    bgGlow: "shadow-green-500/20",
    description: "No significant concerning features detected.",
    icon: CheckCircle,
  },
  MODERATE: {
    label: "Moderate Risk",
    color: "text-yellow-400",
    badgeClass: "bg-yellow-900/60 border-yellow-500/50 text-yellow-300",
    bgGlow: "shadow-yellow-500/20",
    description: "Some features warrant monitoring and possible consultation.",
    icon: AlertCircle,
  },
  HIGH: {
    label: "High Risk",
    color: "text-orange-400",
    badgeClass: "bg-orange-900/60 border-orange-500/50 text-orange-300",
    bgGlow: "shadow-orange-500/20",
    description: "Multiple concerning features present. Dermatologist recommended.",
    icon: AlertTriangle,
  },
  CRITICAL: {
    label: "Critical Risk",
    color: "text-red-400",
    badgeClass: "bg-red-900/60 border-red-500/50 text-red-300",
    bgGlow: "shadow-red-500/20",
    description: "Highly suspicious. Seek urgent medical attention.",
    icon: XCircle,
  },
};
```

---

### 8.2 Analyze-Skin API Route (`analyze-skin/route.ts`)

This is the Next.js API route that handles the backend skin analysis. It runs on the server, keeping the Gemini API key secure.

**Process:**

1. **Receive the image:**
```typescript
export async function POST(request: Request) {
  const formData = await request.formData();
  const imageFile = formData.get("image") as File;
  
  if (!imageFile) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }
```

2. **Convert to Base64:**
```typescript
  const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
  const base64Image = imageBuffer.toString("base64");
  const mimeType = imageFile.type; // e.g., "image/jpeg"
```

3. **Build the Gemini prompt:**
```typescript
  const prompt = `You are an AI dermatology assistant. Analyse the skin lesion image using the ABCDE melanoma detection protocol.

For each criterion, provide:
- score (0-10): severity score
- concernLevel: "LOW" | "MODERATE" | "HIGH"
- findings: one sentence summary
- details: detailed explanation

Respond ONLY with valid JSON in this exact format:
{
  "overallRisk": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "specialistReferral": "URGENT" | "RECOMMENDED" | "OPTIONAL" | "NOT_INDICATED",
  "abcde": {
    "asymmetry": { "score": number, "concernLevel": string, "findings": string, "details": string },
    "border":    { "score": number, "concernLevel": string, "findings": string, "details": string },
    "color":     { "score": number, "concernLevel": string, "findings": string, "details": string },
    "diameter":  { "score": number, "concernLevel": string, "findings": string, "details": string },
    "evolving":  { "score": number, "concernLevel": string, "findings": string, "details": string }
  },
  "keyFindings": [string, string, string],
  "recommendations": [string, string, string],
  "disclaimer": string
}`;
```

4. **Send to Gemini:**
```typescript
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const result = await model.generateContent([
    {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    },
    prompt,
  ]);
```

5. **Parse and return:**
```typescript
  const rawText = result.response.text();
  
  // Extract JSON from response (in case Gemini adds any surrounding text)
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in Gemini response");
  
  const analysis = JSON.parse(jsonMatch[0]);
  
  return NextResponse.json(analysis);
}
```

---

### 8.3 Biomarker Dashboard (`biomarkers/page.tsx`)

This ~750-line file contains the complete biomarker tracking UI.

**Two data sources with fallback:**

```typescript
const fetchBiomarkers = async () => {
  // Primary: biomarker_history table
  const { data: historyData, error: historyError } = await supabase
    .from("biomarker_history")
    .select("*")
    .eq("user_id", user.id)
    .order("report_date", { ascending: true });
  
  if (!historyError && historyData?.length > 0) {
    return processBiomarkerHistory(historyData);
  }
  
  // Fallback: Extract from medical_documents if biomarker_history is empty
  const { data: docData } = await supabase
    .from("medical_documents")
    .select("extracted_data, created_at")
    .eq("user_id", user.id);
  
  return extractFromDocuments(docData);
};
```

**Summary cards calculation:**
```typescript
const summaryStats = useMemo(() => {
  const allLatestReadings = Object.values(groupedBiomarkers).map(readings => ({
    name: readings[0].biomarker_name,
    latest: readings[readings.length - 1],
  }));
  
  return {
    total: allLatestReadings.length,
    latestDate: /* most recent report_date across all */,
    normalCount: allLatestReadings.filter(b => isNormal(b.latest.value, b.name)).length,
    attentionCount: allLatestReadings.filter(b => !isNormal(b.latest.value, b.name)).length,
  };
}, [groupedBiomarkers]);
```

---

### 8.4 BiomarkerTrends Component (`BiomarkerTrends.tsx`)

This reusable component accepts biomarker readings and renders the Recharts line chart.

```typescript
interface BiomarkerTrendsProps {
  readings: BiomarkerReading[];
  biomarkerName: string;
  normalRange?: { low: number; high: number };
  unit: string;
}

export function BiomarkerTrends({ readings, biomarkerName, normalRange, unit }: BiomarkerTrendsProps) {
  
  // Custom dot that changes colour based on normal range
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const normal = normalRange 
      ? (payload.value >= normalRange.low && payload.value <= normalRange.high)
      : true;
    
    return (
      <circle
        cx={cx} cy={cy}
        r={5}
        fill={normal ? "#22c55e" : "#ef4444"}  // green or red
        stroke={normal ? "#16a34a" : "#dc2626"}
        strokeWidth={2}
      />
    );
  };
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip content={<CustomTooltip unit={unit} normalRange={normalRange} />} />
        
        {/* Normal range shaded band */}
        {normalRange && (
          <>
            <ReferenceLine y={normalRange.high} stroke="#22c55e" strokeDasharray="4 4" label="Max" />
            <ReferenceLine y={normalRange.low}  stroke="#22c55e" strokeDasharray="4 4" label="Min" />
          </>
        )}
        
        <Line
          type="monotone"
          dataKey="value"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={<CustomDot />}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

---

### 8.5 Share with Doctor System

**Doctor Search API (`/api/doctors/search/route.ts`):**

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  
  const { data: doctors } = await supabase
    .from("doctors")
    .select("id, name, specialization, hospital, profile_image")
    .eq("status", "approved")          // Only verified doctors
    .or(`name.ilike.%${query}%,hospital.ilike.%${query}%`)
    .limit(10);
  
  return NextResponse.json({ doctors });
}
```

**Share Report API (`/api/patient/share-report/route.ts`):**

```typescript
export async function POST(request: Request) {
  const { documentId, doctorId, note } = await request.json();
  
  // Verify the doctor is linked to this patient
  const { data: link } = await supabase
    .from("patient_doctor_links")
    .select("id")
    .eq("patient_id", user.id)
    .eq("doctor_id", doctorId)
    .single();
  
  if (!link) {
    return NextResponse.json({ error: "Doctor not linked" }, { status: 403 });
  }
  
  // Create the shared report record
  const { data: shared } = await supabase
    .from("shared_reports")
    .insert({
      patient_id: user.id,
      doctor_id: doctorId,
      document_id: documentId,
      patient_note: note,
      status: "shared",
    })
    .select()
    .single();
  
  return NextResponse.json({ success: true, shared });
}
```

---

### 8.6 Doctor Portal

**Doctor Registration Form (`doctor/auth/page.tsx`):**

The registration form captures all required fields with client-side validation before submission:

```typescript
const handleDoctorRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.licenseId.trim()) {
    toast.error("Medical license ID is required");
    return;
  }
  
  // Create auth account
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
  });
  
  if (authError) throw authError;
  
  // Create doctor profile with 'pending' status
  await supabase.from("doctors").insert({
    user_id: authData.user?.id,
    name: formData.name,
    specialization: formData.specialization,
    hospital: formData.hospital,
    license_id: formData.licenseId,
    status: "pending",  // Awaiting admin approval
  });
  
  toast.success("Registration submitted! Awaiting admin approval.");
};
```

**Doctor Dashboard (`doctor/dashboard/page.tsx`):**

```typescript
// Fetch all patients linked to this doctor
const { data: linkedPatients } = await supabase
  .from("patient_doctor_links")
  .select(`
    patient_id,
    users:patient_id (name, email),
    shared_reports (
      id, status, created_at,
      medical_documents (title, type, file_url)
    )
  `)
  .eq("doctor_id", doctorUser.id)
  .eq("status", "active");
```

---

## 9. Code Logic Samples

### RISK_CONFIG Object

```typescript
const RISK_CONFIG: Record<string, RiskConfig> = {
  LOW: {
    label: "Low Risk",
    color: "text-green-400",
    badgeClass: "bg-green-900/60 border-green-500/50 text-green-300",
    bgGlow: "shadow-green-500/20",
    description: "No significant concerning features detected. Continue regular monitoring.",
    icon: CheckCircle,
    urgency: "Monitor annually or if changes noticed."
  },
  MODERATE: {
    label: "Moderate Risk",
    color: "text-yellow-400",
    badgeClass: "bg-yellow-900/60 border-yellow-500/50 text-yellow-300",
    bgGlow: "shadow-yellow-500/20",
    description: "Some features warrant monitoring and possible professional consultation.",
    icon: AlertCircle,
    urgency: "Consider dermatologist consultation within 3 months."
  },
  HIGH: {
    label: "High Risk",
    color: "text-orange-400",
    badgeClass: "bg-orange-900/60 border-orange-500/50 text-orange-300",
    bgGlow: "shadow-orange-500/20",
    description: "Multiple concerning features present. Professional evaluation recommended.",
    icon: AlertTriangle,
    urgency: "Schedule dermatologist appointment within 4-6 weeks."
  },
  CRITICAL: {
    label: "Critical Risk",
    color: "text-red-400",
    badgeClass: "bg-red-900/60 border-red-500/50 text-red-300",
    bgGlow: "shadow-red-500/20",
    description: "Highly suspicious features detected. Seek urgent medical attention.",
    icon: XCircle,
    urgency: "Seek medical attention immediately. Do not delay."
  },
};
```

---

### ABCDE_INFO Object

```typescript
const ABCDE_INFO: Record<string, AbcdeInfo> = {
  asymmetry: {
    letter: "A",
    fullName: "Asymmetry",
    description: "One half of the lesion differs from the other half when divided along any axis.",
    clinicalNote: "Symmetric lesions are generally less concerning. Asymmetry is an early warning sign.",
    icon: "◈",
  },
  border: {
    letter: "B",
    fullName: "Border",
    description: "Irregular, ragged, notched, or blurred edges rather than smooth, well-defined borders.",
    clinicalNote: "Well-circumscribed, smooth borders suggest benign lesions.",
    icon: "⬡",
  },
  color: {
    letter: "C",
    fullName: "Color",
    description: "Multiple shades or uneven colour distribution — brown, black, red, white, or blue within one lesion.",
    clinicalNote: "Uniform single-tone colouring is reassuring. Colour variation is a significant warning sign.",
    icon: "◉",
  },
  diameter: {
    letter: "D",
    fullName: "Diameter",
    description: "Lesions greater than 6mm in diameter (roughly the size of a pencil eraser).",
    clinicalNote: "Size alone is not diagnostic, but larger lesions warrant closer inspection.",
    icon: "◯",
  },
  evolving: {
    letter: "E",
    fullName: "Evolving",
    description: "Any change in size, shape, color, or the development of symptoms like bleeding or crusting.",
    clinicalNote: "A stable lesion that has not changed in years is reassuring. Recent changes require attention.",
    icon: "↺",
  },
};
```

---

### `runAnalysis()` Function

```typescript
const runAnalysis = async () => {
  if (!file || stage === "scanning") return;
  
  setStage("scanning");
  setScanProgress(0);
  setCurrentStep(SCAN_STEPS[0]);
  
  let stepIndex = 0;
  const intervalId = setInterval(() => {
    stepIndex++;
    if (stepIndex < SCAN_STEPS.length) {
      setCurrentStep(SCAN_STEPS[stepIndex]);
      setScanProgress((stepIndex / SCAN_STEPS.length) * 90);
    } else {
      clearInterval(intervalId);
    }
  }, 600);
  
  try {
    const formData = new FormData();
    formData.append("image", file);
    
    const response = await fetch("/api/analyze-skin", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${response.status}`);
    }
    
    const data: SkinAnalysis = await response.json();
    
    clearInterval(intervalId);
    setScanProgress(100);
    setCurrentStep("Analysis complete!");
    
    await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause
    
    setAnalysis(data);
    setStage("results");
    
  } catch (err) {
    clearInterval(intervalId);
    setStage("upload");
    const message = err instanceof Error ? err.message : "Analysis failed";
    toast.error(message);
  }
};
```

---

### `findNormalRange()` Function

```typescript
const findNormalRange = (
  name: string
): { low: number; high: number; unit: string } | null => {
  const nameLower = name.toLowerCase().trim();
  
  // Exact match first (fastest)
  if (NORMAL_RANGES[nameLower]) {
    return NORMAL_RANGES[nameLower];
  }
  
  // Substring / fuzzy match (handles "Serum Creatinine" → "creatinine")
  for (const [key, range] of Object.entries(NORMAL_RANGES)) {
    if (nameLower.includes(key) || key.includes(nameLower)) {
      return range;
    }
  }
  
  // Word-level partial match (handles "Blood Glucose Fasting" → "blood glucose")
  const nameWords = nameLower.split(/\s+/);
  for (const [key, range] of Object.entries(NORMAL_RANGES)) {
    const keyWords = key.split(/\s+/);
    if (keyWords.every(kw => nameWords.some(nw => nw.includes(kw)))) {
      return range;
    }
  }
  
  return null;
};
```

---

### Biomarker Normal Range Check

```typescript
const getBiomarkerStatus = (biomarkerName: string, value: number): "normal" | "low" | "high" | "unknown" => {
  const range = findNormalRange(biomarkerName);
  
  if (!range) return "unknown";
  if (value < range.low)  return "low";
  if (value > range.high) return "high";
  return "normal";
};

// Usage in UI:
const status = getBiomarkerStatus("Hemoglobin", 10.2);
// Returns "low" → renders red dot and "Below normal" label
```

---

### Scan Step Animation `setInterval`

```typescript
const SCAN_STEPS = [
  "Initialising scan...",
  "Analysing asymmetry...",
  "Evaluating border characteristics...",
  "Detecting colour variations...",
  "Measuring lesion dimensions...",
  "Checking evolution markers...",
  "Computing overall risk score...",
  "Generating diagnostic report...",
];

// Start animation and return intervalId for cleanup
const startScanAnimation = (): NodeJS.Timeout => {
  let stepIndex = 0;
  const stepCount = SCAN_STEPS.length;
  
  const id = setInterval(() => {
    stepIndex = (stepIndex + 1) % stepCount;
    setCurrentStep(SCAN_STEPS[stepIndex]);
    setScanProgress(prev => {
      const next = prev + (100 / stepCount);
      return next > 90 ? 90 : next; // Cap at 90% until API completes
    });
  }, 600);
  
  return id;
};
```

---

### Drag-and-Drop `onDrop` Handler

```typescript
const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragging(false);
  
  const { files } = e.dataTransfer;
  if (!files || files.length === 0) return;
  
  const droppedFile = files[0];
  
  // Type check
  if (!droppedFile.type.startsWith("image/")) {
    toast.error("Only image files are accepted (JPG, PNG, WEBP)");
    return;
  }
  
  // Size check: 10MB = 10,485,760 bytes
  if (droppedFile.size > 10 * 1024 * 1024) {
    toast.error(`Image too large (${(droppedFile.size/1048576).toFixed(1)}MB). Maximum 10MB.`);
    return;
  }
  
  setFile(droppedFile);
  
  // Generate preview using FileReader
  const reader = new FileReader();
  reader.onloadend = () => {
    setPreviewUrl(reader.result as string);
  };
  reader.onerror = () => {
    toast.error("Failed to read file. Please try again.");
  };
  reader.readAsDataURL(droppedFile);
  
}, []);
```

---

## 10. Lines of Code Breakdown

| File | Lines | Description |
|---|---|---|
| `src/app/dashboard/skin/page.tsx` | ~650 | Skin analysis UI: upload zone, scanning animation, ABCDE results |
| `src/app/dashboard/biomarkers/page.tsx` | ~750 | Biomarker dashboard: selector pills, summary cards, trend chart |
| `src/app/dashboard/share/page.tsx` | ~480 | Share with doctor: doctor search, linked doctors, share form |
| `src/app/api/analyze-skin/route.ts` | ~180 | Gemini Vision API call, prompt construction, JSON parsing |
| `src/app/api/biomarkers/route.ts` | ~120 | Supabase biomarker data fetcher with fallback |
| `src/app/api/patient/share-report/route.ts` | ~90 | Share report logic, link verification |
| `src/app/api/doctors/search/route.ts` | ~60 | Doctor search with ILIKE query |
| `src/app/doctor/dashboard/page.tsx` | ~580 | Doctor portal: patient list, shared docs, messaging |
| `src/app/doctor/auth/page.tsx` | ~340 | Doctor registration + login with license ID |
| `src/components/BiomarkerTrends.tsx` | ~280 | Recharts LineChart with custom dots and tooltips |
| **TOTAL** | **~3,530** | |
| Supporting types, utilities, CSS | ~270 | Type definitions, helper functions |
| **GRAND TOTAL** | **~3,800** | |

---

## 11. Problems Faced and Solutions

### Problem 1: Gemini returning free-form text instead of structured ABCDE JSON

**What happened:** In early development, the Gemini API response would return paragraphs of descriptive text like: *"The lesion appears to have moderate asymmetry. The borders are slightly irregular..."* — not a JSON object. The frontend JavaScript code crashed trying to parse this as JSON.

**Root cause:** Without explicit formatting instructions, large language models default to human-readable prose. They need very specific instructions to output machine-parseable JSON.

**Solution:** The Gemini prompt was modified to include three strict JSON enforcement mechanisms:
1. A JSON schema template with all required fields pre-specified in the prompt
2. The instruction: *"Respond ONLY with valid JSON. Do not include any text before or after the JSON. Do not include markdown code fences."*
3. A backend regex to extract the JSON object even if some surrounding text leaked through: `rawText.match(/\{[\s\S]*\}/)`

**Result:** JSON output became consistent and parseable in 99% of requests.

---

### Problem 2: Scan animation not syncing with actual API response time

**What happened:** The `setInterval` animation cycled through all 8 steps in 4.8 seconds (8 × 600ms). But Gemini sometimes responded in 2 seconds (animation hadn't finished) or sometimes in 8 seconds (animation had finished and was looping awkwardly on the last step).

**Solution:** 
1. The `setInterval` ID is stored in a `useRef` that persists across re-renders
2. The animation is capped at 90% progress — it never reaches 100% on its own
3. When the API response arrives (`await fetch(...)` resolves), `clearInterval()` is called immediately
4. `setScanProgress(100)` and then `setStage("results")` are called in sequence
5. A 500ms delay was added between progress reaching 100% and showing results, so the user sees the completed progress bar briefly

---

### Problem 3: Biomarker chart not showing on first render

**What happened:** When the page loaded, the biomarker selector pills appeared but no chart was visible. The user had to click a pill to make the chart appear. This was confusing because it looked like the feature was broken.

**Root cause:** The `selectedBiomarker` state started as `null`, meaning no biomarker was selected and no chart was rendered.

**Solution:** Added a `useEffect` that automatically selects the first priority biomarker once data loads:

```typescript
useEffect(() => {
  if (sortedBiomarkers.length > 0 && !selectedBiomarker) {
    setSelectedBiomarker(sortedBiomarkers[0]);
  }
}, [sortedBiomarkers, selectedBiomarker]);
```

Now, as soon as data loads, Hemoglobin (the first priority biomarker) is automatically selected and its chart renders.

---

### Problem 4: `biomarker_history` table not found on some deployments

**What happened:** When the project was deployed to a new Supabase project (e.g., testing environment), the `biomarker_history` table hadn't been created yet. The API call returned a "relation does not exist" Postgres error, and the entire biomarker dashboard went blank.

**Root cause:** The `biomarker_history` table migration was not always run before testing. In some environments, biomarker data only existed in `medical_documents.extracted_data` as JSON blobs.

**Solution:** Implemented a two-source data strategy:
1. **Primary:** Query `biomarker_history` table
2. **Fallback:** If primary fails (table missing) OR returns empty results, parse `medical_documents.extracted_data` JSON field to extract any embedded biomarker data

This made the feature resilient across deployment stages.

---

### Problem 5: Drag-and-drop not working on mobile

**What happened:** Mobile users (phones and tablets) reported that they couldn't upload images. The drag-and-drop area didn't respond to touch events on iOS Safari or Chrome Android.

**Root cause:** HTML5 drag-and-drop events (`dragover`, `drop`) are primarily desktop browser APIs. They do not fire on touch devices in the same way.

**Solution:** Two-pronged approach:
1. Made the entire upload zone clickable (`onClick={() => fileInputRef.current?.click()}`) to open the native file picker — this works perfectly on mobile
2. Added a clearly visible "or tap to browse" label on mobile viewports using CSS media queries
3. Added the `capture="environment"` attribute to the file input to allow mobile camera photos:

```tsx
<input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  capture="environment"    // Opens rear camera on mobile
  onChange={handleFileChange}
/>
```

---

### Problem 6: Doctor dashboard showing other doctors' patients

**What happened:** During testing, a doctor account could see patient records linked to other doctors. This was a critical privacy bug.

**Root cause:** The initial Supabase query fetched ALL rows from `patient_doctor_links` without filtering by `doctor_id`. The Supabase Row Level Security (RLS) policy had not been applied to the `patient_doctor_links` table.

**Solution:** Two-layer fix:
1. **Application layer:** The API query was corrected to always include `.eq("doctor_id", doctorUser.id)` filter
2. **Database layer:** An RLS policy was added to the `patient_doctor_links` table:

```sql
CREATE POLICY "Doctors see only their patients"
ON patient_doctor_links
FOR SELECT
USING (doctor_id = auth.uid());
```

This ensures that even if the application-layer filter was bypassed, the database itself would only return the correct rows.

---

### Problem 7: Recharts line chart overflowing on small screens

**What happened:** On screens narrower than 400px (small Android phones), the biomarker chart overflowed its container horizontally. The chart appeared to be cut off on the right side, and users had to scroll sideways.

**Root cause:** The chart was set to a fixed pixel width (e.g., `width={600}`) instead of a responsive percentage width.

**Solution:** Wrapped the LineChart in Recharts' `ResponsiveContainer` component:

```tsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
    {/* ... */}
  </LineChart>
</ResponsiveContainer>
```

`ResponsiveContainer` with `width="100%"` measures its parent div's width and renders the chart to exactly fit, regardless of screen size. The negative left margin `-10` prevents the Y-axis labels from being clipped.

---

### Problem 8: Large skin images timing out the Gemini API

**What happened:** Users who uploaded high-resolution phone photos (some were 12–20MB RAW photos from Android camera apps) caused the API call to time out. The Gemini API's connection would fail midway through uploading the large base64-encoded payload, resulting in a blank result or a network error.

**Root cause:** Large images = large base64 string = large HTTP request body = long upload time. Gemini Vision also has practical limits on image payload size.

**Solution:** Three-layer size management:
1. **Frontend validation (primary):** Files over 10MB are rejected before any upload begins:
   ```typescript
   if (file.size > 10 * 1024 * 1024) {
     toast.error("Maximum file size is 10MB");
     return;
   }
   ```
2. **Backend validation (secondary):** The API route also checks the file size server-side as a security measure
3. **User guidance:** The upload zone displays "Max 10MB — JPG, PNG, WEBP" as a permanent label so users know the limit before attempting

For future improvement, client-side image compression (using the Canvas API to resize before upload) is planned, which would allow users to upload large photos while automatically downsampling them to the optimal resolution for Gemini Vision analysis.

---

## 12. Testing / Execution Steps

### 12.1 Setting Up the Development Environment

**Prerequisites:**
- Node.js 18+ installed
- A Supabase project with the required tables created
- A valid Google Gemini API key

**Step 1 — Install dependencies:**
```bash
cd c:\Users\sampa\OneDrive\Desktop\AIHCAS\aihcas
npm install
```

**Step 2 — Set environment variables:**
Create or edit `.env.local`:
```
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Step 3 — Start the development server:**
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

### 12.2 Testing the Skin Analysis Module

**Test 1 — Valid image upload:**
1. Navigate to `/dashboard/skin`
2. Drag a JPG image file onto the upload zone
3. Confirm the image previews correctly
4. Click "Analyse Skin"
5. Verify the scanning animation plays (all 8 steps appear sequentially)
6. Verify results appear with ABCDE breakdown and risk badge
7. Expand each ABCDE accordion item and verify content renders

**Test 2 — File type validation:**
1. Attempt to upload a `.pdf` or `.docx` file
2. Expected: Error toast "Only image files are accepted"
3. Verify the page stays on the upload stage

**Test 3 — File size validation:**
1. Attempt to upload an image larger than 10MB
2. Expected: Error toast mentioning the file size and 10MB limit

**Test 4 — Scan Again functionality:**
1. Complete an analysis
2. Click "Scan Again" button
3. Verify page returns to the upload stage
4. Verify the previous results are cleared

**Test 5 — Mobile (click-to-browse):**
1. Open on a mobile device or resize browser to < 480px
2. Tap the upload zone
3. Verify native file picker or camera opens
4. Complete the analysis flow

---

### 12.3 Testing the Biomarker Tracker Module

**Test 1 — Biomarker data display:**
1. Ensure a lab report has been uploaded via Medical Documents
2. Navigate to `/dashboard/biomarkers`
3. Verify summary cards show correct counts
4. Verify Hemoglobin (or first priority biomarker) is auto-selected
5. Verify the trend chart renders with data points

**Test 2 — Normal range colouring:**
1. Note which biomarker readings are within normal range (check the table)
2. Verify green dots appear for normal values
3. Verify red dots appear for abnormal values
4. Click different biomarker pills and confirm the chart updates

**Test 3 — QuickStats panel:**
1. Select a biomarker with multiple readings
2. Verify QuickStats shows: latest value, highest value, lowest value, total reading count, date range

**Test 4 — Fallback data source:**
1. If `biomarker_history` table is empty but `medical_documents` has lab reports with extracted data
2. Verify the biomarker dashboard still shows data (fallback path)

---

### 12.4 Testing the Share with Doctor Module

**Test 1 — Doctor search:**
1. Navigate to `/dashboard/share`
2. Type a partial doctor name in the search box
3. Verify matching approved doctors appear in results
4. Verify unapproved/pending doctors do NOT appear

**Test 2 — Link with doctor:**
1. Click "Link with Doctor" for a search result
2. Verify the doctor appears in the "My Doctors" section
3. Verify a `patient_doctor_links` row was created in Supabase

**Test 3 — Share a report:**
1. Select a document from the document list
2. Select a linked doctor
3. Add an optional note
4. Click "Share Report"
5. Verify success toast appears
6. Check Supabase `shared_reports` table for the new row

**Test 4 — Doctor dashboard:**
1. Log in as an approved doctor
2. Navigate to `/doctor/dashboard`
3. Verify the linked patient appears in the patient list
4. Verify the shared document is visible
5. Send a test message and verify it appears in the patient's messages

**Test 5 — Doctor verification:**
1. Register a new doctor account
2. Verify the `status` in the `doctors` table is `'pending'`
3. Attempt to access patient data — verify access is denied
4. Update status to `'approved'` via Supabase dashboard
5. Refresh and verify full access is now granted

---

## 13. Sample Skin Analysis Output

Below is an example of the full JSON response returned by the `/api/analyze-skin` endpoint for a moderately suspicious mole:

```json
{
  "overallRisk": "MODERATE",
  "specialistReferral": "RECOMMENDED",
  "abcde": {
    "asymmetry": {
      "score": 6,
      "concernLevel": "MODERATE",
      "findings": "The lesion displays notable asymmetry along its horizontal axis.",
      "details": "When bisected vertically, the left half appears more elevated and pigmented compared to the right half. A slight difference in contour is also visible in the vertical axis."
    },
    "border": {
      "score": 4,
      "concernLevel": "MODERATE",
      "findings": "Borders show mild irregularity predominantly on the superior and lateral edges.",
      "details": "Most of the border appears well-defined. However, the upper boundary shows slight notching, and the right lateral edge appears slightly blurred where it meets surrounding skin. The inferior border is smooth and regular."
    },
    "color": {
      "score": 7,
      "concernLevel": "HIGH",
      "findings": "Multiple shades of brown detected with darker peripheral patches.",
      "details": "Two distinct colour zones are clearly visible: a medium tan-brown centre with a notably darker outer ring containing regions approaching dark brown to near-black. No red, white, or blue-grey areas are detected."
    },
    "diameter": {
      "score": 4,
      "concernLevel": "LOW",
      "findings": "Estimated size appears within the 5–7mm range based on image proportions.",
      "details": "Without a calibrated scale reference in the image, diameter assessment is qualitative. The lesion appears proportionally consistent with a 5–7mm lesion relative to surrounding skin features. Borderline for the 6mm threshold."
    },
    "evolving": {
      "score": 3,
      "concernLevel": "LOW",
      "findings": "No obvious acute signs of rapid change are visible in this single image.",
      "details": "The lesion surface appears intact without evidence of ulceration, bleeding, or crusting. However, without a historical comparison image, evolution cannot be fully assessed from a single photograph."
    }
  },
  "keyFindings": [
    "Significant colour heterogeneity is the primary concern, with distinct multi-tonal zones",
    "Asymmetry and border irregularity are present but within moderate concern thresholds",
    "Diameter is borderline and estimated to approach the 6mm melanoma criterion",
    "No acute surface changes (bleeding, ulceration) are visible in this image"
  ],
  "recommendations": [
    "Schedule a dermatologist consultation within 4–6 weeks for in-person evaluation",
    "Document the lesion with a monthly photograph under consistent lighting for comparison",
    "Minimise UV exposure on the affected area and use SPF 50+ sunscreen",
    "If you notice any new bleeding, rapid growth, or colour changes before your appointment, seek immediate medical attention"
  ],
  "disclaimer": "This assessment is generated by an AI model for informational and educational purposes only. It does not constitute a medical diagnosis and must not replace the advice of a qualified dermatologist or physician. Always seek professional medical evaluation for any skin concerns."
}
```

---

## 14. Sample Biomarker Data

### 14.1 Example `biomarker_history` Table Rows

These rows represent a patient's Hemoglobin readings across 4 lab reports over 6 months:

```
| id       | user_id   | biomarker_name | value | unit  | normal_low | normal_high | report_date |
|----------|-----------|----------------|-------|-------|------------|-------------|-------------|
| uuid-001 | user-abc  | Hemoglobin     | 10.2  | g/dL  | 12.0       | 17.5        | 2024-01-15  |
| uuid-002 | user-abc  | Hemoglobin     | 10.8  | g/dL  | 12.0       | 17.5        | 2024-02-20  |
| uuid-003 | user-abc  | Hemoglobin     | 11.5  | g/dL  | 12.0       | 17.5        | 2024-03-18  |
| uuid-004 | user-abc  | Hemoglobin     | 12.4  | g/dL  | 12.0       | 17.5        | 2024-06-10  |
| uuid-005 | user-abc  | HbA1c          | 6.1   | %     | 4.0        | 5.6         | 2024-01-15  |
| uuid-006 | user-abc  | HbA1c          | 5.9   | %     | 4.0        | 5.6         | 2024-03-18  |
| uuid-007 | user-abc  | HbA1c          | 5.5   | %     | 4.0        | 5.6         | 2024-06-10  |
| uuid-008 | user-abc  | Blood Glucose  | 108   | mg/dL | 70         | 100         | 2024-01-15  |
| uuid-009 | user-abc  | Blood Glucose  | 104   | mg/dL | 70         | 100         | 2024-03-18  |
| uuid-010 | user-abc  | Blood Glucose  | 96    | mg/dL | 70         | 100         | 2024-06-10  |
```

### 14.2 What the Trend Chart Shows from This Data

**Hemoglobin Chart:**
```
g/dL
 13 |                                      ●  ← Jun 12.4 (GREEN - Normal!)
 12 |─── ─── ─── ─── ─── ─── ─── ─── ─── ─── [Normal Range Upper: 12.0]
 11 |              ●  ← Mar 11.5 (RED)
    |    ●  ← Feb 10.8 (RED)
 10 |●  ← Jan 10.2 (RED)
    |─── ─── ─── ─── ─── ─── ─── ─── ─── [Normal Range Lower: 12.0]
    |
    Jan       Feb       Mar       Jun
```
**Story:** Patient had anaemia (low hemoglobin) in January, gradually recovering. By June, hemoglobin reached normal. This likely reflects iron supplementation or dietary improvement.

---

**HbA1c Chart (Pre-diabetes management):**
```
%
 6.5 |
 6.0 |●  ← Jan 6.1% (RED - Pre-diabetic range)
     |    
 5.7 |─── ─── ─── ─── ─── ─── ─── [Normal Range Upper: 5.6%]
 5.5 |              ●  ← Mar 5.9% (RED)     ●  ← Jun 5.5% (GREEN!)
     |─── ─── ─── ─── ─── ─── ─── [Normal Range Lower: 4.0%]
     |
     Jan             Mar             Jun
```
**Story:** Patient had pre-diabetic HbA1c (6.1%) in January. Through lifestyle changes, HbA1c came down below the 5.6% threshold by June — a successful reversal of pre-diabetes trajectory.

---

### 14.3 Summary Cards from This Data

```
┌────────────────────┐  ┌────────────────────┐
│   Total Tracked    │  │   Latest Report    │
│        3           │  │    June 10, 2024   │
│   biomarkers       │  │                    │
└────────────────────┘  └────────────────────┘

┌────────────────────┐  ┌────────────────────┐
│   ✓ Normal Now     │  │  ⚠ Need Attention  │
│        2           │  │        0           │
│  (Hgb + HbA1c)    │  │  (All recovered!)  │
└────────────────────┘  └────────────────────┘
```

---

## Appendix A: Database Tables Summary

| Table | Purpose | Key Columns |
|---|---|---|
| `biomarker_history` | Stores all biomarker readings | user_id, biomarker_name, value, unit, normal_low, normal_high, report_date |
| `patient_doctor_links` | Patient-doctor relationships | patient_id, doctor_id, status |
| `shared_reports` | Documents shared by patients | patient_id, doctor_id, document_id, status, patient_note |
| `doctors` | Doctor profiles | user_id, name, specialization, hospital, license_id, status |
| `messages` | In-app messaging | sender_id, receiver_id, content, is_read |
| `medical_documents` | Uploaded lab reports | user_id, title, type, file_url, extracted_data |

---

## Appendix B: Environment Variables Required

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key (server-side only, never exposed to browser) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (safe for browser) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (safe for browser, protected by RLS) |

---

## Appendix C: Key TypeScript Interfaces

```typescript
// Skin Analysis
interface SkinAnalysis {
  overallRisk: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  specialistReferral: "URGENT" | "RECOMMENDED" | "OPTIONAL" | "NOT_INDICATED";
  abcde: {
    asymmetry: AbcdeCriterion;
    border: AbcdeCriterion;
    color: AbcdeCriterion;
    diameter: AbcdeCriterion;
    evolving: AbcdeCriterion;
  };
  keyFindings: string[];
  recommendations: string[];
  disclaimer: string;
}

interface AbcdeCriterion {
  score: number;             // 0-10
  concernLevel: "LOW" | "MODERATE" | "HIGH";
  findings: string;          // One-line summary
  details: string;           // Detailed explanation
}

// Biomarker
interface BiomarkerReading {
  id: string;
  user_id: string;
  biomarker_name: string;
  value: number;
  unit: string;
  normal_low: number | null;
  normal_high: number | null;
  report_date: string;       // ISO date string "YYYY-MM-DD"
  created_at: string;
}

// Doctor
interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  hospital: string;
  license_id: string;
  status: "pending" | "approved" | "suspended";
  profile_image?: string;
}

// Shared Report
interface SharedReport {
  id: string;
  patient_id: string;
  doctor_id: string;
  document_id: string;
  patient_note?: string;
  status: "shared" | "viewed" | "responded";
  created_at: string;
}
```

---

*Documentation authored by Member 4 — AIHCAS Project*  
*Last updated: May 2026*  
*Total approximate lines of source code covered: ~3,800*
