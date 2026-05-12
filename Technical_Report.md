# AIHCAS: Technical Architecture & Feature Analysis Report

## 1. Overview
**AIHCAS (Artificial Intelligence Healthcare Assistant System)** is a state-of-the-art medical companion application designed to provide private, local-first health assessments. It integrates advanced Natural Language Processing (NLP) and Computer Vision to assist users with symptom checking, medication management, and medical document interpretation.

---

## 2. Analysis Pipelines

### 🩺 Text Analysis (Medical Assessment)
The chat system follows a "Local-First, Accuracy-Second" approach.
- **Hybrid AI Engine**: 
    - **Primary**: A custom TypeScript-based engine using **TF-IDF (Term Frequency-Inverse Document Frequency)** and **Cosine Similarity** to match user symptoms against a curated Medical Knowledge Base.
    - **Advanced Logic**: Uses a **Python NLP backend** (`medical_ai.py`) for complex symptom clusters and body-part context awareness.
- **Doctor Persona**: The AI is programmed with a heuristic rule engine that behaves like a clinical doctor—asking follow-up questions about duration, severity, and location before providing an assessment.
- **Safety First**: Integrated emergency keyword detection that immediately triggers emergency response protocols if life-threatening symptoms are detected.

### 🎙️ Voice Analysis
- **Speech-to-Text (STT)**: Utilizes the **Web Speech API** for real-time transcription, allowing hands-free interaction for patients with mobility issues or urgent needs.
- **Text-to-Speech (TTS)**: The "Doctor AI" responds vocally, providing a multi-modal interface that feels more interactive and human-like.

### 💊 Prescription Analysis
- **Vision AI**: Uses **Google Gemini 1.5 Flash** for high-fidelity OCR and clinical extraction. It converts handwritten or printed prescription images into structured JSON data.
- **Parsing Logic**:
    - Extracts medication names, dosages (BD, TDS, etc.), and durations.
    - **Drug Database**: Cross-references medications with a local database to provide purpose, class, and safety warnings.
- **Local Fallback**: Features a local Python-based OCR (`analyzer.py`) using **Tesseract OCR** for private, offline extraction when cloud APIs are unavailable.

### 📊 Medical Report Analysis
- **Pathology Intelligence**: Specifically designed to parse lab reports (CBC, Liver Function, Thyroid, etc.).
- **Reference Benchmarking**: The system doesn't just read numbers; it benchmarks values against standard medical ranges (`report-parser.ts`).
- **Visual Feedback**: Automatically categorizes results as **Normal**, **High**, or **Low** with specific clinical interpretations for each finding.
- **Urgency Scoring**: Calculates an "Urgency Level" (Routine vs. Urgent) based on how far values deviate from the norm.

---

## 3. Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, Node.js, Python 3.x |
| **Database/Auth** | Supabase (PostgreSQL, Auth, Storage) |
| **AI Models** | Google Gemini 1.5 Flash (Cloud), TF-IDF/Scikit-learn (Local) |
| **OCR** | Tesseract.js / PyTesseract |
| **Communication** | Web Speech API |

---

## 4. Key Features & Modules
1. **Emergency Dashboard**: City-based emergency contact filtering and direct SOS triggers.
2. **Health Profile**: Secure storage of blood group, allergies, and chronic conditions to personalize AI responses.
3. **Medication Vault**: Tracks active prescriptions and provides automated drug-interaction warnings.
4. **Offline Capability**: Core chat and basic document parsing are designed to function without an active internet connection to ensure privacy.

---

## 5. Privacy & Security
- **Data Isolation**: User data is isolated at the database level using Supabase Row Level Security (RLS).
- **Local Processing**: Sensitive medical chat data is processed locally whenever possible, reducing exposure to external APIs.
