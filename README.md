# myHealthMate AI — Your AI Health Companion

> **An advanced, ethical, fully responsive personal health AI platform built for the Altrix Labs AI-Powered Personal Health Copilot hackathon.**
> **Frontend:** Pure HTML5, CSS3, Vanilla JavaScript (ES Modules). No React, Angular, Vue, or TypeScript.
> **Backend:** Node.js, Express.js REST API, PostgreSQL, and Prisma ORM.

[![Tests](https://img.shields.io/badge/Tests-14%20Passed-00E6B8?style=flat-square)](#-automated-testing)
[![Languages](https://img.shields.io/badge/Languages-EN%20%7C%20TE%20%7C%20HI%20%7C%20TA-00D4FF?style=flat-square)](#-multilingual-support-en--te--hi--ta)
[![AI Integration](https://img.shields.io/badge/AI-OpenAI%20%7C%20Gemini%20%7C%20Groq%20%7C%20Demo-8B5CF6?style=flat-square)](#-ai-health-assistant-architecture)
[![Design](https://img.shields.io/badge/Responsive-320px--1920px-0AA981?style=flat-square)](#-laptop-tablet-and-mobile-responsiveness)

---

## 🌟 The 4 Core Upgrades Delivered

### 1. Fixed & Fully Functional AI Health Assistant
- **End-to-End Working Flow:** User queries are sent via REST to the backend, validated, authenticated, and passed to the configured AI engine.
- **Real AI Provider Integration:** Seamless server-side integration for **OpenAI** (`gpt-4o-mini`, etc.), **Google Gemini**, **Groq**, and **Ollama**.
- **Transparent Demo Mode:** When no API key is configured, an educational multilingual demo engine answers lab questions accurately without falsely claiming to be an external model.
- **Honest Error Handling:** If the configured AI provider fails (e.g. invalid key or network timeout), an honest error message is returned with a **Retry** button—never inventing simulated success.
- **Conversation Persistence:** Multi-turn conversational threads are stored in PostgreSQL/memory. Users can create new chats, switch between past conversations in the history drawer, and delete threads.
- **UX Features:** Typing status animation, formatted responses, one-click copy response, suggested prompt chips, and multi-language emergency triage.

### 2. Clear, Readable & Professionally Organized Medical Reports
- **Section A: Report Information & Processing Transparency:** Title, category, collection date, original filename, detected document language, and clear processing states (`UPLOADED`, `PROCESSING`, `COMPLETED`, `NEEDS_REVIEW`, `FAILED`).
- **Section B: Key Findings Parameter Cards:** Clean glassmorphism cards featuring parameter name, extracted value, unit, reference range, status badge (`OPTIMAL`, `BORDERLINE`, `ELEVATED`, `LOW`, `NEEDS_REVIEW`), visual range tracks, and educational explanations.
- **Section C: Structured Table:** Desktop and mobile-scrollable table (`Parameter | Result | Unit | Reference Range | Status | Interpretation`).
- **Section D: Plain-Language Explanations & Doctor Questions:** Step-by-step guidance on what biomarkers mean and tailored discussion questions users can copy and bring to their physician.
- **Section E: Secure Original Document Preview:** Modal previewing simulated or genuine uploaded clinical documents.
- **Section F: Processing Transparency:** Explicit notices distinguishing genuine extracted laboratory text from synthetic hackathon demonstration data.

### 3. Full Multilingual Support (English, Telugu, Hindi, Tamil)
- **4 Supported Languages:**
  - **English (`en`)**
  - **Telugu (`te` — తెలుగు)**
  - **Hindi (`hi` — हिन्दी)**
  - **Tamil (`ta` — தமிழ்)**
- **Centralized Locale Files:** `client/locales/en.json`, `client/locales/te.json`, `client/locales/hi.json`, `client/locales/ta.json`.
- **Reusable i18n Engine:** `I18nManager` (`js/i18n.js`) with instant DOM translation via `data-i18n` and custom event broadcasting.
- **Native Typography:** Integrated Google Fonts (`Noto Sans Telugu`, `Noto Sans Devanagari`, `Noto Sans Tamil`, `Plus Jakarta Sans`, `Inter`).
- **Persistent Preferences:** Saved in `localStorage` and authenticated user profile settings.
- **Language-Aware AI & Reports:** The AI assistant replies in the selected language. Doctor discussion guides dynamically switch into Telugu, Hindi, Tamil, or English while strictly preserving exact numerical laboratory values (`218 mg/dL`, `92 mg/dL`), units, and drug names.

### 4. Flawless Multi-Device Responsiveness (320px to 1920px)
- **Mobile (320px – 430px):** Single-column cards, collapsible navigation drawer, minimum 44px touch targets, mobile chat history drawer, horizontal table scrolling container (`.table-responsive`), and zero horizontal document overflow.
- **Tablet (768px – 1024px):** Balanced 2-column grids for vitals and lab parameters, responsive charts, and collapsible sidebar.
- **Laptop & Desktop (1024px – 1920px):** Comfortable multi-column layouts, expanded chat sidebar, spacious report tables, and optimal line-lengths.
- **Accessibility:** Full `prefers-reduced-motion` compliance.

---

## 🚀 Installation & Running Instructions

### Prerequisites
- Node.js (v18.x or v20.x+)
- (Optional) PostgreSQL running locally on port 5432. *Note: If PostgreSQL is not running, the application automatically activates a resilient in-memory synthetic provider with zero errors.*

### Step 1: Clone & Configure Environment
```bash
cd myHealthMate-AI/server
cp .env.example .env
```

### Step 2: Configure AI Provider (Optional)
Open `myHealthMate-AI/server/.env` and configure your preferred AI provider:
```ini
# For Demo Mode (Default, No key required):
AI_PROVIDER=demo
AI_ENABLED=false

# For Real OpenAI:
AI_PROVIDER=openai
AI_API_KEY=sk-your-openai-key-here
AI_MODEL=gpt-4o-mini
AI_ENABLED=true

# For Real Google Gemini:
AI_PROVIDER=gemini
AI_API_KEY=your-gemini-api-key
AI_MODEL=gemini-1.5-flash
AI_ENABLED=true
```

### Step 3: Install Dependencies
```bash
cd myHealthMate-AI/server
npm install
```

### Step 4: Run the Integration Test Suite
```bash
npm test
```
*Expected: 14 passing tests across authentication, dashboard, reports, multilingual chat, and admin access.*

### Step 5: Start the Server
```bash
npm start
```
The server will start on `http://localhost:5000`.

### Step 6: Access the Application
Open your browser and navigate to:
- **Landing Page:** [http://localhost:5000/index.html](http://localhost:5000/index.html)
- **Dashboard:** [http://localhost:5000/dashboard.html](http://localhost:5000/dashboard.html)
- **AI Health Assistant:** [http://localhost:5000/assistant.html](http://localhost:5000/assistant.html)
- **Medical Reports Upload:** [http://localhost:5000/reports.html](http://localhost:5000/reports.html)
- **Report Analysis:** [http://localhost:5000/analysis.html](http://localhost:5000/analysis.html)
- **Medical History:** [http://localhost:5000/history.html](http://localhost:5000/history.html)
- **Profile & Settings:** [http://localhost:5000/profile.html](http://localhost:5000/profile.html)

---

## 👥 Instant Demo Login Credentials

Autofill buttons are provided on `login.html`:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Patient** | `alex.morgan@example.com` | `PatientPass123!` | Dashboard, Reports, Analysis, AI Assistant, History |
| **Admin** | `admin@myhealthmate.ai` | `AdminPass123!` | System Telemetry, Audit Logs (No Private Medical Records) |

---

## 🌐 Netlify Cloud Deployment

myHealthMate AI is preconfigured for instant 1-click deployment on **Netlify**:

- **Method 1 (Instant Drag & Drop):** Open [app.netlify.com/drop](https://app.netlify.com/drop) and drag the `client/` folder.
- **Method 2 (Netlify CLI):** Run `npx netlify-cli deploy --prod --dir=client`
- **Method 3 (Git Connected):** Push to GitHub/GitLab and link to Netlify. Settings are auto-loaded from `netlify.toml`.

See [docs/NETLIFY_DEPLOYMENT.md](file:///docs/NETLIFY_DEPLOYMENT.md) for full instructions, custom domains, and serverless API proxy configuration.

---

## 🧪 Automated Testing Results

Run `npm test` inside `myHealthMate-AI/server`:
```
✔ GET /api/v1/health should return system status (200 OK)
✔ POST /api/v1/auth/login should authenticate demo patient with valid credentials (200 OK)
✔ POST /api/v1/auth/login should reject invalid credentials with 401 Unauthorized
✔ POST /api/v1/auth/register should create a new patient account (201 Created)
✔ GET /api/v1/dashboard/summary should return dashboard metrics (200 OK)
✔ GET /api/v1/reports should list patient medical reports (200 OK)
✔ GET /api/v1/reports/:id/analysis should return lab parameter cards (200 OK)
✔ POST /api/v1/chat/message should provide educational responses with emergency safeguards (200 OK)
✔ GET /api/v1/admin/stats should reject patient access with 403 Forbidden
✔ GET /api/v1/admin/stats should allow admin access with 200 OK
✔ DELETE /api/v1/account should delete account and purge session (200 OK)
✔ GET /api/v1/chat/conversations should return active conversation list (200 OK)
✔ POST /api/v1/chat/conversations should create and delete a conversation thread (201 Created)
✔ GET /api/v1/reports/:id/analysis should support multilingual doctor discussion guides (200 OK)

Tests: 14 passed | Suites: 1 passed | Time: 5.3s
```

---

## 📁 Key Files & Modifications Summary

| File | Status | Description |
| :--- | :--- | :--- |
| `server/src/services/aiService.js` | Upgraded | Real AI integrations (OpenAI, Gemini, Groq, Ollama), multilingual demo engine (`en`, `te`, `hi`, `ta`), emergency symptom detection |
| `server/src/controllers/chatController.js` | Upgraded | Conversation lifecycle, persistence in PostgreSQL/memory, message threads |
| `server/src/services/reportAnalysisService.js` | Upgraded | Lab parameter range normalization, structured tables, multilingual clinician questions |
| `client/locales/en.json`, `te.json`, `hi.json`, `ta.json` | Created | Centralized dictionary files for English, Telugu, Hindi, and Tamil |
| `client/js/i18n.js` | Created | Reusable `I18nManager` class for client-side translation and event dispatching |
| `client/assistant.html` & `client/js/assistant.js` | Upgraded | Rebuilt AI chat: history drawer, typing indicator, copy/retry buttons, language select |
| `client/analysis.html` & `client/js/analysis.js` | Upgraded | Sections A–F: metadata, visual range tracks, structured table, clinician discussion guide, preview modal |
| `client/reports.html` & `client/js/reports.js` | Upgraded | Status filters, drag-and-drop intake, `analysis.html?id=...` routing, remove support |
| `client/profile.html` & `client/js/profile.js` | Upgraded | Preferred language selector in settings with persistent storage and data export |
| `client/css/style.css` | Upgraded | Indic Google Fonts, language selector styles, range track styles |
| `client/css/responsive.css` | Upgraded | 320px–1920px responsiveness, 44px touch targets, mobile drawers, table scrolling |
| `server/tests/api.test.js` | Upgraded | 14 integration tests covering conversation CRUD, multilingual chat, and report localization |

---

## 🔒 Healthcare Safety & Privacy

- **Educational Purpose:** myHealthMate AI provides educational insights and health record organization. It does not provide medical diagnoses or prescribe medications.
- **Emergency Safeguards:** The AI Assistant immediately triages acute symptoms (e.g. chest pain, difficulty breathing) across all 4 languages with urgent emergency contacts (911 / 108 / 112).
- **Data Protection:** No sensitive protected health information (PHI) is ever stored in browser `localStorage`.
