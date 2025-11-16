🚀 LegalLens – AI-Powered Legal Document Simplifier

LegalLens is an AI-driven platform designed to help rural citizens, low-literacy individuals, and first-time legal document users understand complicated legal contracts safely and confidently.

The system extracts, analyzes, summarizes, and explains legal documents in Tamil, Hindi, and English, ensuring every person can make informed decisions before signing anything important.

🧠 Why LegalLens? – The Problem

Legal agreements often contain complex language, hidden clauses, and legal jargon.
For many rural families, this leads to:

Signing documents without understanding consequences

Exploitation through hidden risks

Loss of land, money, or rights

No access to lawyers or guidance

LegalLens solves this by bringing AI-powered legal understanding to everyone.

✅ Our Solution

LegalLens simplifies any uploaded legal document using:
✔ OCR text extraction (supports Tamil, Hindi, English)
✔ AI summary in the same language as the document
✔ Clear explanation of risks
✔ Extraction of key legal terms
✔ Audio summary in native language
✔ Multimodal support (images, PDFs, DOCX, TXT)

This ensures maximum accessibility for individuals from rural and low-literacy backgrounds.

🔧 Tech Stack
Frontend

React.js

Custom CSS + Minimal Tailwind

React-Dropzone

Lucide-React icons

Web Speech API / Google TTS

AI & Document Processing

Google Cloud API (Summaries, Risk analysis, Classification)

Tesseract.js (OCR for images)

PDF.js (PDF text extraction)

Mammoth.js (DOCX extraction)

franc (Language detection)

Build & Deployment

Firebase Hosting

GitHub Actions (CI/CD optional)

Supported Documents:
PDF
DOCX
IMAGES
TXT

🛠 System Workflow

User uploads document

OCR / Extraction

Language detection using franc

AI processing (OCR,Google Clous API)

Summary + Key Terms + Risk Flags generated

Audio generation

Results shown in clean UI

⭐ Key Features
🎯 1. Multilingual Understanding

AI summaries + risk warnings in Tamil, Hindi, and English.

📝 2. Smart AI Legal Summarization

Simplifies long legal jargon into 3–4 sentence easy-to-understand statements.

⚠️ 3. Risk Identification

Detects hidden clauses such as:

Penalties

Non-compete

Liability

Termination risks

🔊 4. Audio Summary

Reads the summary in the same language as the original document.

📦 5. Completely Client-side OCR (privacy-friendly)

Uses browser-based OCR—no file leaves user’s system until summary generation.

📄 Sample Documents  
We have included sample legal files to help you test the system quickly:

- Tamil Agreement — `samples/tamil_contract_sample.pdf`
- Hindi Rental File — `samples/hindi_rental_agreement.jpg`
- English Loan Document — `samples/english_loan_document.docx`
