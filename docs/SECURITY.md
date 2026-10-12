# myHealthMate AI — Security & Privacy Architecture

Security and patient confidentiality are fundamental tenets of myHealthMate AI.

---

## 1. Storage & State Isolation
- **No Sensitive Health Data in localStorage:** LocalStorage is never used to persist medical records, blood test results, or authentication secrets. Only ephemeral in-memory state or HTTP-only session cookies are used.
- **Private File System Driver:** Uploaded documents are never saved in publicly accessible web roots (`client/`, `public/`, or `static/`). Files reside in a segregated private directory accessible only via authorized streaming endpoints.

---

## 2. Authentication & Session Governance
- **Password Protection:** Cryptographic hashing using `bcrypt` (10 rounds).
- **HTTP-Only Cookies:** JWT authentication tokens are transmitted via `HttpOnly`, `SameSite=Lax`, and `Secure` (in production) cookies, mitigating Cross-Site Scripting (XSS) token exfiltration.
- **Rate Limiting:** `express-rate-limit` throttles brute-force attempts on `/api/v1/auth/login` to 20 attempts per 15 minutes.

---

## 3. Multi-Tenant Authorization
- **Ownership Verification:** Every private report query validates `report.userId === req.user.id`. The server never trusts client-supplied user IDs.
- **Admin Privacy Boundaries:** Administrators have access to aggregate operational statistics (total users, system health), but **cannot access, inspect, or download patient report contents or chat logs**.

---

## 4. Medical Disclaimer & Non-Diagnostic Scope
- **Non-Diagnostic Policy:** myHealthMate AI explicitly informs users that all extractions and explanations are educational.
- **Emergency Safeguards:** The AI chat companion detects life-threatening symptom keywords (chest pain, severe shortness of breath) and directs the user immediately to emergency services (e.g., 911).
- **No Medication Recommendations:** The system never prescribes drugs, suggests medication dosages, or alters clinical regimens.
