# AIHCAS — Artificial Intelligence Healthcare Assistant System

---

## PREFACE

Healthcare accessibility remains one of the most pressing challenges of our time. In a densely populated country like India, millions of citizens face significant barriers to timely medical consultation — whether due to geographic remoteness, financial constraints, long wait times in overburdened hospitals, or the inability to interpret complex medical documents. It is within this context that the **Artificial Intelligence Healthcare Assistant System (AIHCAS)** was conceived and developed.

This project was born out of a simple but profound observation: most people carry a smartphone in their pocket that is more powerful than the computers used to land on the moon — yet when they receive a blood test report, they are left entirely dependent on a doctor's appointment to understand what their own body is telling them. When they experience an unusual symptom at midnight, they have no reliable, private, and intelligent resource to turn to.

AIHCAS is our answer to that gap.

The development of this system was motivated by three core beliefs:

1. **Medical literacy is a fundamental right.** Every individual deserves to understand their own health data — not in isolation, but with context, interpretation, and guidance.

2. **Privacy must not be sacrificed for convenience.** A medical assistant that relays personal health information to unknown third-party servers is not truly serving the patient. AIHCAS is designed with a *local-first* philosophy — processing sensitive data on-device or on a private server wherever possible.

3. **Artificial Intelligence, used responsibly, can save lives.** AI is not a replacement for doctors. It is a bridge — reducing the distance between a patient's concern and a clinician's expertise, especially in the critical window before a consultation can occur.

This report documents the complete design, architecture, and implementation of AIHCAS — from the intelligent symptom-analysis engine and voice-enabled consultations to OCR-powered prescription reading and automated lab report interpretation. It is intended to serve as both a technical reference and a justification for the design decisions made during development.

The authors wish to acknowledge that this system is intended purely as an **informational and educational tool**. It does not replace the judgment of a qualified medical professional, and all outputs are clearly labeled as AI-generated interpretations requiring clinical verification.

We hope this work contributes meaningfully to the growing field of AI-assisted healthcare and serves as a foundation for future advancements in patient-facing medical intelligence.

---

## ABSTRACT

### Title
**AIHCAS: Design and Development of a Multi-Modal Artificial Intelligence Healthcare Assistant System with Offline OCR-Based Medical Document Analysis**

---

### Overview

**AIHCAS (Artificial Intelligence Healthcare Assistant System)** is a full-stack, web-based healthcare companion application that leverages Natural Language Processing (NLP), Optical Character Recognition (OCR), Computer Vision, and cloud-based Large Language Models (LLMs) to provide intelligent, accessible, and privacy-conscious medical guidance to end users. The system is built as a Progressive Web Application (PWA) using **Next.js 16**, **TypeScript**, and a **Python** backend, deployed on cloud infrastructure with **Supabase** providing secure, row-level isolated database and authentication services.

---

### Problem Statement

In India and other developing nations, the ratio of doctors to patients remains critically low (approximately 1 doctor per 1,511 people as per WHO standards). The majority of citizens receive handwritten prescriptions and printed lab reports that they cannot interpret without medical expertise. Furthermore, existing digital health tools either require expensive subscriptions, are inaccessible in low-connectivity environments, or compromise user privacy by sending sensitive data to opaque cloud services. AIHCAS addresses all three of these shortcomings.

---

### System Architecture

AIHCAS is structured as a **hybrid intelligence system** comprising four primary analytical modules:

**1. Conversational Symptom Analysis Engine**
The chat module implements a dual-engine NLP architecture. A custom TypeScript-based engine using **TF-IDF (Term Frequency–Inverse Document Frequency)** and **Cosine Similarity** is used to match user-described symptoms against a curated Medical Knowledge Base containing over 50 conditions across 12 medical categories. For complex or ambiguous symptom clusters, the system escalates to a **Python NLP backend** (`medical_ai.py`) that applies weighted keyword scoring, body-part context disambiguation, and negation detection to deliver a more precise classification. The AI adopts a structured clinical interview model — asking follow-up questions about symptom duration, severity, and anatomical location before rendering an assessment.

**2. Voice-Enabled Consultation Interface**
The voice module integrates the browser-native **Web Speech API** to provide real-time bidirectional voice communication. Speech-to-Text (STT) enables hands-free input, while Text-to-Speech (TTS) delivers spoken AI responses, creating a multi-modal conversational experience accessible to users with limited digital literacy or physical disabilities.

**3. Prescription Image Analysis**
The prescription module employs a cloud-primary, local-fallback strategy for medical image parsing. **Google Gemini 1.5 Flash** serves as the primary Vision AI engine, performing high-fidelity OCR and clinical entity extraction — converting handwritten or printed prescriptions into structured JSON objects containing medication names, dosages, timings (with shorthand-to-plain-language conversion: OD, BD, TDS, QID, etc.), drug class, and safety warnings. When cloud access is restricted, the local **PyTesseract + Pillow** pipeline provides an offline fallback for privacy-sensitive use cases.

**4. Medical Lab Report Analysis**
The report analysis module is the most technically sophisticated component of AIHCAS. It employs a dual-engine approach:
- **Primary Engine:** Python + Tesseract OCR (`analyzer.py`) — extracts raw text from uploaded images or PDFs of lab reports using grayscale preprocessing and contrast enhancement for improved OCR accuracy.
- **Secondary Engine:** Google Gemini 1.5 Flash — used as an intelligent fallback when the local OCR pipeline is unavailable.
- **Parsing Engine:** A proprietary TypeScript library (`report-parser.ts`) containing **60+ pre-defined lab parameter definitions** with associated reference ranges, clinical interpretations, and urgency scoring logic. Parameters span Complete Blood Count (CBC), Liver Function Tests (LFT), Kidney Function Tests (KFT), Thyroid Profile (TSH, T3, T4, FT3, FT4), Lipid Profile, Diabetes markers, Electrolytes, Iron Studies, Vitamins, Urine Routine, and Inflammation markers. Each detected parameter is classified as **Normal**, **High**, or **Low**, and the system calculates an overall urgency score (**Routine**, **Soon**, or **Urgent**) to guide patient action.

---

### Key Features

| Feature | Description |
|---|---|
| **AI Symptom Chat** | Clinically-structured NLP chatbot with dual-engine intelligence |
| **Voice Consultation** | Hands-free bi-directional voice interface using Web Speech API |
| **Prescription Reader** | Vision AI extraction of medication data from handwritten prescriptions |
| **Report Analyser** | Automated lab value extraction, benchmarking, and interpretation |
| **Emergency Hub** | City-filtered Indian emergency contacts with direct dial integration |
| **Health Profile** | Secure storage of blood group, allergies, and chronic conditions |
| **Offline OCR** | Tesseract-based local fallback for zero-cloud document processing |
| **Secure Auth** | Supabase authentication with Google OAuth and Row-Level Security |

---

### Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Vanilla CSS with glassmorphism design system |
| **Backend API** | Next.js API Routes, Node.js |
| **Database & Auth** | Supabase (PostgreSQL + Row-Level Security) |
| **Cloud AI** | Google Gemini 1.5 Flash (Vision + Text) |
| **Local NLP** | Python 3, custom TF-IDF / Cosine Similarity engine |
| **OCR** | PyTesseract + Pillow (local), Tesseract binary (Linux/Render) |
| **PDF Parsing** | PyMuPDF (fitz) |
| **Voice** | Web Speech API (STT + TTS) |
| **Deployment** | Render (Web Service with automated Python/Tesseract build) |

---

### Results & Evaluation

The system successfully demonstrates:
- Accurate symptom classification across 6 primary medical categories with negation-awareness and body-part disambiguation.
- Structured extraction of medication data from both printed and handwritten prescriptions via Gemini Vision AI.
- Detection and benchmarking of 60+ distinct laboratory parameters against clinically validated reference ranges.
- Seamless failover between local OCR and cloud AI engines, ensuring the Report Analysis feature remains functional regardless of server configuration.
- Full user data isolation through Supabase Row-Level Security policies, ensuring no cross-user data leakage.

---

### Conclusion

AIHCAS demonstrates that a thoughtfully engineered, privacy-first AI system can meaningfully improve the accessibility of healthcare information for the general population. By combining local-first processing with intelligent cloud fallbacks, a rich NLP knowledge base, and a clinically inspired conversational interface, the system offers a responsible and practical step toward democratizing medical literacy. Future work includes integration of wearable sensor data, expansion of the drug interaction database, and development of a dedicated native mobile application for rural and low-connectivity environments.

---

### Keywords

`Artificial Intelligence` · `Healthcare` · `OCR` · `Tesseract` · `PyTesseract` · `Natural Language Processing` · `Medical Report Analysis` · `Prescription Recognition` · `Gemini Vision AI` · `Next.js` · `Python` · `Supabase` · `TF-IDF` · `Symptom Classification` · `Voice Interface` · `Web Speech API` · `Local-First Computing` · `Lab Report Interpretation`

---

*This document is part of the official project documentation for AIHCAS.*  
*Developed by: Sampada Kulkarni | Institution: SDMCET | Date: May 2026*
