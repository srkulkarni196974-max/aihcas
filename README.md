<div align="center">

# 🏥 AIHCAS
### Artificial Intelligence Healthcare Assistant System

[![Next.js](https://img.shields.io/badge/Next.js-16.2.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.9--3.12-3776AB?logo=python)](https://python.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Google-Gemini%201.5%20Flash-4285F4?logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**A full-stack, privacy-first, multi-modal AI healthcare assistant combining offline NLP, OCR, voice interaction, and cloud Vision AI — built for the Indian healthcare context.**

[Features](#-features) • [How It Was Built](#️-how-it-was-built) • [Prerequisites](#-prerequisites) • [Installation](#-installation--setup) • [Running the App](#-running-the-app) • [Project Structure](#-project-structure) • [Deployment](#️-deployment) • [Troubleshooting](#-troubleshooting)

</div>

---

## 📌 Overview

AIHCAS is a **local-first, multi-modal medical companion** that helps users:

- Analyse symptoms through a clinically-structured AI chatbot
- Consult via hands-free voice interaction
- Read and interpret handwritten/printed prescriptions
- Understand pathology lab reports with urgency scoring
- Access city-specific Indian emergency contacts instantly
- Share reports securely with verified doctors

The system processes sensitive health data **locally on-device first** using a Python NLP engine and Tesseract OCR, falling back to Google Gemini 1.5 Flash only when cloud processing is needed — ensuring privacy without sacrificing capability.

> ⚕️ **Medical Disclaimer:** AIHCAS is an informational tool only. All AI-generated outputs are advisory in nature and must be verified by a qualified medical professional. This system does not replace clinical diagnosis.

---

## ✨ Features

| Module | Description | Technology |
|--------|-------------|------------|
| 🩺 **Symptom Chat** | Dual-engine NLP chatbot with triage (Self-Care / Doctor / Emergency) | TF-IDF + Cosine Similarity + Python NLP |
| 🎙️ **Voice Consultation** | Hands-free bidirectional voice consultation with echo prevention | Web Speech API (STT + TTS) |
| 💊 **Prescription Reader** | Extracts drug names, dosages, frequencies from handwritten prescriptions | Gemini Vision AI + PyTesseract fallback |
| 📊 **Lab Report Analyser** | Benchmarks 60+ parameters against reference ranges with urgency score | Python OCR + TypeScript parser |
| 🚨 **Emergency Hub** | City-filtered Indian emergency contacts with direct dial | Next.js + Geo lookup |
| 🧬 **Biomarker Tracker** | Log and chart health biomarkers over time | Supabase + Recharts |
| 🔬 **Skin Analyser** | AI-powered skin condition identification from photos | Gemini Vision AI |
| 👨‍⚕️ **Doctor Dashboard** | Verified doctor portal for receiving patient-shared reports | Supabase Auth + RLS |
| 👤 **Health Profile** | Secure storage of blood group, allergies, and chronic conditions | Supabase PostgreSQL |

---

## 🏗️ How It Was Built

### Architecture Philosophy

AIHCAS follows a **Hybrid Intelligence Architecture** — every operation attempts local processing first, escalating to cloud AI only when necessary:

```
User Input
    │
    ├─► Text Symptoms ──► TypeScript TF-IDF Engine (< 50ms, no network)
    │                          └─► Low confidence? ──► Python NLP Backend
    │
    ├─► Voice Input ────► Web Speech API (STT) ──► Symptom Engine ──► TTS Response
    │
    └─► Image / PDF ────► Python + Tesseract OCR (offline, private)
                               └─► OCR failed? ──► Gemini 1.5 Flash Vision (cloud)
```

### Technology Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| **Framework** | Next.js 16 App Router | Unified frontend + API routes, server components, edge-ready |
| **Language** | TypeScript + Python | TypeScript for UI/API safety; Python for NLP/OCR ecosystem |
| **Database** | Supabase (PostgreSQL) | Free tier, built-in auth, Row-Level Security for data isolation |
| **Cloud AI** | Google Gemini 1.5 Flash | Best-in-class multimodal OCR on handwritten documents |
| **Local NLP** | Custom TF-IDF | Zero latency, zero cost, offline-capable symptom classification |
| **OCR** | Tesseract + PyTesseract | Open-source, privacy-preserving, runs entirely on-device |
| **Voice** | Web Speech API | No SDK dependency, built into Chrome/Edge, supports `en-IN` locale |
| **Styling** | Vanilla CSS (Glassmorphism) | Full control, no framework overhead, premium dark-mode aesthetic |

### How the NLP Engine Works

The symptom classification runs as a **cascade of two engines**:

**Engine 1 — TypeScript TF-IDF (Fast Path)**
```
User types: "I have severe throbbing headache and light sensitivity"
    │
    ▼
Tokenise → ["severe", "throbbing", "headache", "light", "sensitivity"]
    │
    ▼
Compute TF-IDF vectors for each token
    │
    ▼
Calculate Cosine Similarity against 100+ condition keyword vectors
    │
    ▼
Return top match: { id: "headache", score: 0.87 }  ← in < 50ms
```

**Engine 2 — Python NLP (Precision Path)**  
Invoked when confidence is low or multiple conditions tie:
```
medical_ai.py applies:
  - Weighted keyword scoring per condition
  - Body-part context disambiguation
  - Negation detection ("no stomach pain" → penalise stomach_pain score)
  - Returns: {"id": "headache", "score": 38}
```

### How the OCR Pipeline Works

```
Upload prescription/report image
    │
    ├─► /api/analyze-medical  (Cloud Path)
    │       └─► Base64 image → Gemini 1.5 Flash Vision API
    │               └─► Returns structured JSON with medications/values
    │
    └─► /api/analyze-local  (Offline Path)
            └─► analyzer.py
                    ├─► PIL: Convert to grayscale
                    ├─► PIL: Enhance contrast ×1.5
                    ├─► Tesseract OCR: Extract raw text
                    └─► Returns: { "extracted_text": "..." }
                            └─► report-parser.ts: Match 60+ lab parameters
                                    └─► Returns: benchmarked JSON with urgency score
```

---

## 📋 Prerequisites

Ensure all of the following are installed and configured before setup:

| Requirement | Version | Purpose | Download |
|-------------|---------|---------|----------|
| **Node.js** | v18.x or v20.x | Run Next.js application | [nodejs.org](https://nodejs.org/) |
| **npm** | v9+ | Package management (bundled with Node) | — |
| **Python** | 3.9 – 3.12 | Local NLP and OCR scripts | [python.org](https://python.org/) |
| **Tesseract OCR** | 5.x | Offline document text extraction | [UB Mannheim](https://github.com/UB-Mannheim/tesseract/wiki) |
| **Git** | Any | Clone the repository | [git-scm.com](https://git-scm.com/) |
| **Supabase Account** | Free | Database + Authentication | [supabase.com](https://supabase.com/) |
| **Google AI Studio Key** | Free tier | Gemini Vision AI access | [aistudio.google.com](https://aistudio.google.com/) |

---

## ⚙️ Installation & Setup

### Step 1 — Clone the Repository

```powershell
git clone https://github.com/your-username/aihcas.git
cd aihcas
```

---

### Step 2 — Install Tesseract OCR (Windows)

Tesseract is required for offline prescription and lab report processing.

1. Download the Windows installer from [UB Mannheim Tesseract Repository](https://github.com/UB-Mannheim/tesseract/wiki)
2. Run the installer — use the **default path**: `C:\Program Files\Tesseract-OCR\`
3. Add Tesseract to your system PATH:
   - Open **Start Menu** → search **"Edit the system environment variables"**
   - Click **Environment Variables** → Under **System variables**, select **Path** → click **Edit**
   - Click **New** → add: `C:\Program Files\Tesseract-OCR`
   - Click **OK** on all dialogs to save
4. Verify the installation:
   ```powershell
   tesseract --version
   # Expected: tesseract 5.x.x
   ```

> **Note:** If Tesseract is not found at runtime, AIHCAS will automatically fall back to Google Gemini Vision AI for all document processing.

---

### Step 3 — Set Up Supabase Database

1. Log in at [supabase.com](https://supabase.com/) and create a **New Project**
2. Note your **Project URL** and **Anon Public Key** from **Settings → API**
3. Go to **SQL Editor → New Query**, paste the following, and click **Run**:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS public.aihcas_users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  provider      TEXT NOT NULL DEFAULT 'credentials',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS public.aihcas_reset_tokens (
  id         SERIAL PRIMARY KEY,
  email      TEXT NOT NULL,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow server-side API access
ALTER TABLE public.aihcas_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.aihcas_reset_tokens DISABLE ROW LEVEL SECURITY;

-- Performance indexes
CREATE INDEX IF NOT EXISTS aihcas_users_email_idx ON public.aihcas_users (email);
CREATE INDEX IF NOT EXISTS aihcas_reset_tokens_token_idx ON public.aihcas_reset_tokens (token);
```

4. Run the doctor schema migration (`doctor_schema_migration.sql`) and biomarkers migration (`biomarkers_migration.sql`) from the project root in the same way.

---

### Step 4 — Configure Environment Variables

Create a `.env.local` file in the project root (`/aihcas`):

```env
# ─── JWT / Session Security ───────────────────────────────────────────────────
JWT_SECRET=your_random_32_character_secret_key_here

# ─── Google Gemini AI ─────────────────────────────────────────────────────────
# Get your free key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=AIzaSy_your_gemini_api_key_here

# ─── NextAuth Configuration ───────────────────────────────────────────────────
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_nextauth_secret_hash

# ─── Google OAuth (for "Sign in with Google") ─────────────────────────────────
# Set up at: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_google_oauth_client_secret

# ─── Supabase ─────────────────────────────────────────────────────────────────
# Found in: Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your_project_ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key

# ─── Email (Password Reset) ───────────────────────────────────────────────────
# Option A — Resend (recommended): https://resend.com/
RESEND_API_KEY=re_your_resend_api_key

# Option B — Gmail SMTP fallback
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password
```

> **Getting a Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App Passwords → Generate for "Mail".

---

### Step 5 — Install Dependencies

```powershell
# Install all Node.js dependencies (this also runs pip install automatically via postinstall)
npm install

# If the postinstall pip step was skipped or failed, run manually:
pip install -r requirements.txt
```

After `npm install`, your `python_lib/` folder will be populated with the Python packages needed for cloud deployments (Render, Docker).

---

## 🚀 Running the App

### Development Server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in **Chrome** or **Edge** (required for Web Speech API voice features).

---

### Verify Gemini API Connection

Before starting, confirm your API key is working:

```powershell
node test_models.js
```

Expected output:
```
Testing model: gemini-2.5-flash
✅ Success for gemini-2.5-flash: Hello! How can I help you today?
```

To list all models available under your quota:
```powershell
node list_models.js
```

---

### Test the Local Python NLP Engine

Test symptom classification directly from terminal:

```powershell
# Basic symptom classification
python src/scripts/medical_ai.py "I have a severe throbbing headache and sensitivity to light"
# Expected: {"id": "headache", "score": 38}

# Negation detection test
python src/scripts/medical_ai.py "I have a headache but no stomach pain"
# Expected: {"id": "headache", "score": 38}  ← stomach_pain score penalised

# Emergency condition test
python src/scripts/medical_ai.py "crushing chest pain radiating to my left arm"
# Expected: {"id": "heart_attack", "score": 45}
```

---

### Test the Local OCR Engine

```powershell
# Test prescription image parsing
python src/scripts/analyzer.py "path\to\your\prescription.jpg" "prescription"
# Expected: {"extracted_text": "Amoxicillin 500mg\nTake 1 capsule TDS..."}

# Test lab report parsing
python src/scripts/analyzer.py "path\to\your\report.jpg" "report"
# Expected: {"extracted_text": "Haemoglobin: 10.2 g/dL\nWBC: 14200..."}
```

---

### Production Build (for validation)

```powershell
npm run build
npm start
```

Expected build output:
```
✓ Compiled successfully in ~12s
✓ TypeScript: 0 errors
✓ 43 pages generated
```

---

## 📁 Project Structure

```
aihcas/
│
├── 📄 README.md                        ← You are here
├── 📄 About_project.md                 ← Full academic project documentation
├── 📄 PREFACE_AND_ABSTRACT.md          ← Project abstract and preface
├── 📄 Technical_Report.md              ← Technical architecture report
│
├── 📄 .env.local                       ← Environment variables (never commit this)
├── 📄 package.json                     ← Node.js dependencies and scripts
├── 📄 requirements.txt                 ← Python dependencies (pymupdf, pytesseract, Pillow)
├── 📄 next.config.ts                   ← Next.js configuration
├── 📄 tsconfig.json                    ← TypeScript configuration
├── 📄 Dockerfile                       ← Docker container definition
├── 📄 render.yaml                      ← Render cloud deployment config
├── 📄 capacitor.config.json            ← Android (Capacitor) config
│
├── 📄 supabase_migration.sql           ← Core DB schema (users, reset tokens)
├── 📄 doctor_schema_migration.sql      ← Doctor portal DB schema
├── 📄 biomarkers_migration.sql         ← Biomarker tracker DB schema
│
├── 📂 src/
│   ├── 📂 app/
│   │   ├── 📄 page.tsx                 ← Landing homepage
│   │   ├── 📄 layout.tsx               ← Root layout with fonts and metadata
│   │   ├── 📄 globals.css              ← Global CSS variables and design system
│   │   │
│   │   ├── 📂 auth/                    ← Patient authentication (login/signup/reset)
│   │   │   ├── page.tsx                ← Login + Signup page
│   │   │   └── reset-password/         ← Password reset flow
│   │   │
│   │   ├── 📂 dashboard/              ← Main patient dashboard
│   │   │   ├── page.tsx                ← Dashboard home overview
│   │   │   ├── layout.tsx              ← Dashboard sidebar layout
│   │   │   ├── chat/                   ← 🩺 Symptom chat module
│   │   │   ├── voice/                  ← 🎙️ Voice consultation module
│   │   │   ├── prescription/           ← 💊 Prescription reader module
│   │   │   ├── reports/                ← 📊 Lab report analyser module
│   │   │   ├── emergency/              ← 🚨 Emergency hub module
│   │   │   ├── skin/                   ← 🔬 Skin analyser module
│   │   │   ├── biomarkers/             ← 🧬 Biomarker tracker module
│   │   │   ├── profile/                ← 👤 Health profile module
│   │   │   └── share/                  ← 📤 Share report with doctor
│   │   │
│   │   ├── 📂 doctor/                  ← Doctor portal
│   │   │   ├── auth/                   ← Doctor login/register
│   │   │   ├── dashboard/              ← Doctor dashboard (patient reports)
│   │   │   └── login/ register/        ← Doctor auth pages
│   │   │
│   │   └── 📂 api/                     ← Next.js API Routes (serverless)
│   │       ├── analyze-medical/        ← Cloud: Gemini Vision OCR endpoint
│   │       ├── analyze-local/          ← Local: Python Tesseract OCR endpoint
│   │       ├── analyze-skin/           ← Skin condition analysis endpoint
│   │       ├── biomarkers/             ← Biomarker CRUD operations
│   │       ├── auth/                   ← Patient auth (login, signup, reset, me)
│   │       ├── doctor/                 ← Doctor auth + dashboard APIs
│   │       ├── doctors/                ← Doctor search for patients
│   │       └── patient/                ← Patient-doctor link, messaging, sharing
│   │
│   ├── 📂 lib/
│   │   ├── medical-kb.ts               ← 🧠 Medical Knowledge Base (100+ conditions)
│   │   ├── custom-ai.ts                ← AI conversation logic, follow-up questions
│   │   ├── report-parser.ts            ← 60+ lab parameter definitions + benchmarking
│   │   ├── drug-database.ts            ← Drug class, purpose, interaction database
│   │   ├── supabase.ts                 ← Supabase client (server + browser)
│   │   ├── auth.ts                     ← Patient auth helpers
│   │   ├── doctor-auth.ts              ← Doctor auth helpers
│   │   └── storage.ts                  ← Local storage utilities
│   │
│   ├── 📂 scripts/
│   │   ├── medical_ai.py               ← Python NLP engine (TF-IDF + negation)
│   │   └── analyzer.py                 ← Python OCR engine (Tesseract + Pillow)
│   │
│   ├── 📂 context/
│   │   └── AuthContext.tsx             ← React auth context provider
│   │
│   └── 📂 app/actions.ts               ← Next.js Server Actions (chatAction)
│
├── 📂 public/                          ← Static assets (images, icons, manifest)
├── 📂 android/                         ← Capacitor Android wrapper
└── 📂 scratch/                         ← Development test scripts
    └── test_python_classification.py   ← NLP classification test suite
```

---

## 📖 Feature Usage Guide

### 1. 🩺 Symptom Chat (`/dashboard/chat`)

1. Log in and navigate to **Symptom Analysis** in the sidebar
2. Type your symptoms in plain English: *"I have had a high fever, body aches, and chills for 2 days"*
3. The AI will:
   - Classify the condition (e.g., Viral Fever / Dengue)
   - Show a **Triage Badge**: 🟢 Self-Care / 🟡 See a Doctor / 🔴 Emergency
   - Ask clinical follow-up questions (duration, severity, location)
4. For emergencies (e.g., *"crushing chest pain"*), an **SOS Alert** fires immediately

---

### 2. 🎙️ Voice Consultation (`/dashboard/voice`)

> **Requires:** Chrome or Edge browser, microphone permission

1. Navigate to **Voice Assistant**
2. Click the **Microphone button** — it will turn red when active
3. Speak your symptoms clearly: *"I have a runny nose and sneezing since morning"*
4. The AI processes, responds in text, and **speaks the response aloud**
5. The microphone **automatically reopens** after the AI finishes speaking (400ms cooldown to prevent echo)
6. Click the **Stop button** (square icon) to end the session

---

### 3. 💊 Prescription Reader (`/dashboard/prescription`)

1. Navigate to **Prescription Understanding**
2. Click **Upload Image** — select a JPG, PNG, or PDF of a prescription
3. Click **Analyze Prescription**
4. Output includes:
   - Drug names, strength, frequency (OD/BD/TDS decoded to plain English)
   - Drug class and therapeutic purpose
   - ⚠️ **Allergy Warning** if any drug matches your profile's listed allergies

---

### 4. 📊 Lab Report Analyser (`/dashboard/reports`)

1. Navigate to **Report Interpretation**
2. Upload a blood test report image or PDF (CBC, LFT, KFT, Thyroid, Lipid, etc.)
3. Click **Analyze Report**
4. Results display in a table with:
   - Each parameter coloured 🟢 Normal / 🟡 High / 🔴 Low
   - Reference range shown alongside the patient value
   - Plain-English interpretation per finding
   - **Overall Urgency Score**: Routine / Soon / Urgent

---

### 5. 🚨 Emergency Hub (`/dashboard/emergency`)

1. Navigate to **Emergency Guidance**
2. Search or select your city (e.g., Mumbai, Bangalore, Delhi, Hyderabad)
3. View verified emergency contacts:
   - 🚑 Ambulance: `102` / `108`
   - 🏥 National Health Helpline: `104`
   - 👮 Police: `100`
   - 👩 Women Helpline: `1091`
4. Click any number to **direct dial** instantly

---

### 6. 🧬 Biomarker Tracker (`/dashboard/biomarkers`)

1. Log your health biomarkers (Blood Pressure, Blood Sugar, BMI, SpO₂, etc.)
2. View trend charts over time using interactive Recharts graphs
3. Data is stored per-user in Supabase

---

### 7. 👨‍⚕️ Doctor Portal (`/doctor`)

**For Doctors:**
1. Register at `/doctor/register` — provide your medical license ID
2. Await admin approval (manual verification)
3. Access the dashboard to view patient-shared reports and send messages

**For Patients:**
1. Go to `/dashboard/share`
2. Search for your doctor by name or specialisation
3. Share a report — the doctor sees it in their dashboard

---

## 🌐 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Patient login with email/password |
| `/api/auth/signup` | POST | Patient registration |
| `/api/auth/me` | GET | Get current authenticated user |
| `/api/auth/forgot-password` | POST | Send password reset email |
| `/api/auth/reset-password` | POST | Reset password using token |
| `/api/analyze-medical` | POST | Cloud OCR via Gemini Vision AI |
| `/api/analyze-local` | POST | Local OCR via Python + Tesseract |
| `/api/analyze-skin` | POST | Skin condition analysis via Gemini |
| `/api/biomarkers` | GET/POST/DELETE | Biomarker CRUD |
| `/api/doctors/search` | GET | Search registered doctors |
| `/api/patient/share-report` | POST | Share a report with a doctor |
| `/api/doctor/auth/login` | POST | Doctor login |
| `/api/doctor/auth/register` | POST | Doctor registration |
| `/api/doctor/dashboard` | GET | Doctor's received patient reports |
| `/api/doctor/messages` | GET/POST | Doctor–patient messaging |

---

## ☁️ Deployment

### Option A — Deploy on Render (Recommended, Free)

1. Push your code to a GitHub repository
2. Sign in at [render.com](https://render.com/) and click **New → Web Service**
3. Connect your GitHub repository
4. Configure the service:
   - **Runtime:** Docker
   - **Build Command:** *(handled by Dockerfile)*
   - **Start Command:** `npm start`
5. Add all environment variables from your `.env.local` under **Environment**
6. Add the Tesseract system dependency:
   ```
   APT_PACKAGES = tesseract-ocr tesseract-ocr-eng
   ```
7. Click **Deploy** — Render will build and host your app automatically

### Option B — Docker (Self-Hosted / VPS)

```powershell
# Build the Docker image
docker build -t aihcas .

# Run the container
docker run -p 3000:10000 --env-file .env.local aihcas
```

Open [http://localhost:3000](http://localhost:3000).

### Option C — Android App (via Capacitor)

```powershell
# Build the Next.js static export
npm run build

# Sync with Capacitor Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at `localhost:3000` |
| `npm run build` | Build production bundle (Turbopack) |
| `npm start` | Start production server (after build) |
| `npm run lint` | Run ESLint code quality checks |
| `node test_models.js` | Verify Gemini API key connectivity |
| `node list_models.js` | List all available Gemini models |
| `python src/scripts/medical_ai.py "<symptoms>"` | Test NLP symptom classifier |
| `python src/scripts/analyzer.py "<path>" "<type>"` | Test OCR document extractor |
| `python scratch/test_python_classification.py` | Run full NLP test suite |

---

## 🔒 Security Overview

| Security Measure | Implementation |
|---|---|
| **Password Hashing** | `bcryptjs` with salt factor 10 — plaintext never stored |
| **Password Length Limit** | Max 45 characters (frontend + server-side validation) |
| **Session Management** | JWT tokens via `jose` + NextAuth.js |
| **Data Isolation** | Supabase Row-Level Security per user |
| **OAuth** | Google OAuth 2.0 via NextAuth — credentials never touched directly |
| **Password Reset** | Cryptographic single-use token with 1-hour TTL |
| **Local-First Processing** | Sensitive medical data processed locally before any cloud call |

---

## 🛠️ Troubleshooting

### ❌ `tesseract is not installed or it's not in your PATH`
**Fix:** Ensure Tesseract is installed at `C:\Program Files\Tesseract-OCR\` and that path is added to your System **PATH** environment variable. Restart your terminal after editing PATH.

### ❌ `Gemini API rate limit (HTTP 429)`
**Fix:** Free-tier Gemini keys have per-minute quotas. AIHCAS automatically falls back to the local Python OCR engine. Wait 60 seconds and retry, or upgrade your Gemini API tier.

### ❌ Voice recognition not working
**Fix:** Voice features require **Chrome** or **Edge** — Firefox does not support the Web Speech API. Ensure microphone permissions are granted in the browser's site settings.

### ❌ `ModuleNotFoundError: No module named 'pytesseract'`
**Fix:** Run `pip install -r requirements.txt` manually in your Python environment. If you are using a virtual environment, ensure it is activated.

### ❌ `npm run build` fails with TypeScript errors
**Fix:** Run `npx tsc --noEmit` to see type errors. Ensure your `.env.local` is present — missing environment variables cause type failures in server-side API routes.

### ❌ Supabase login errors (`Invalid API key`)
**Fix:** Double-check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`. These must match exactly what's shown in **Supabase → Settings → API**.

### ❌ Google OAuth redirect mismatch
**Fix:** In [Google Cloud Console](https://console.cloud.google.com/), add `http://localhost:3000/api/auth/callback/google` to the list of **Authorised Redirect URIs** for your OAuth 2.0 client.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature description"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please ensure `npm run lint` and `npx tsc --noEmit` pass before submitting.

---

## 📚 Additional Documentation

| Document | Description |
|----------|-------------|
| [About_project.md](./About_project.md) | Full academic project report (Introduction → References) |
| [PREFACE_AND_ABSTRACT.md](./PREFACE_AND_ABSTRACT.md) | Project preface, abstract, and keyword index |
| [Technical_Report.md](./Technical_Report.md) | Technical architecture deep-dive |
| [supabase_migration.sql](./supabase_migration.sql) | Core database schema |
| [doctor_schema_migration.sql](./doctor_schema_migration.sql) | Doctor portal schema |
| [biomarkers_migration.sql](./biomarkers_migration.sql) | Biomarker tracker schema |

---

## 📄 License

This project is licensed under the **MIT License** — you are free to use, modify, and distribute this software with attribution.

---

<div align="center">

**AIHCAS** — Built with ❤️ by **Sampada Kulkarni**  
S.D.M. College of Engineering and Technology (SDMCET) · May 2026

*Empowering every patient with the medical literacy they deserve.*

</div>
<img width="958" height="473" alt="image" src="https://github.com/user-attachments/assets/6002c975-8397-41cc-9774-603381db373c" />
<img width="959" height="418" alt="image" src="https://github.com/user-attachments/assets/282a77ec-5d7d-4232-a1f1-1fe3a1591cb9" />
<img width="729" height="407" alt="image" src="https://github.com/user-attachments/assets/b90cdff0-0fa7-424e-8576-2d6a87ea2f76" />
<img width="958" height="471" alt="image" src="https://github.com/user-attachments/assets/cf9b9892-62ee-4d09-b1e3-f8ff8813312e" />
<img width="959" height="463" alt="image" src="https://github.com/user-attachments/assets/4f3fddb0-6b0f-4ca1-ace8-dcd019fff366" />
<img width="953" height="474" alt="image" src="https://github.com/user-attachments/assets/8f7f7cc9-60af-4039-806a-7c5bd46556a0" />
<img width="953" height="422" alt="image" src="https://github.com/user-attachments/assets/7a0bc21b-6bca-4920-8c0e-3ab7102e5c2f" />






