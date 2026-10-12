# myHealthMate AI — REST API Documentation (v1)

Base URL: `/api/v1`

---

## 1. Authentication (`/api/v1/auth`)

### `POST /auth/register`
Creates a new patient account.
- **Request Body:**
  ```json
  {
    "name": "Alex Morgan",
    "email": "alex.morgan@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Registration successful.",
    "data": {
      "user": { "id": "usr_...", "name": "Alex Morgan", "email": "alex.morgan@example.com", "role": "PATIENT" },
      "token": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
  ```

### `POST /auth/login`
Authenticates a user and sets an HTTP-only secure cookie `mhm_token`.
- **Request Body:**
  ```json
  {
    "email": "alex.morgan@example.com",
    "password": "PatientPass123!"
  }
  ```

### `POST /auth/logout`
Clears the session cookie.

### `GET /auth/me`
Retrieves authenticated user profile. (Requires Authentication).

---

## 2. Dashboard (`/api/v1/dashboard`)

### `GET /dashboard/summary`
Returns high-level statistics and vital telemetry.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "totalReports": 3,
      "abnormalFindings": 2,
      "recordsCount": 4,
      "upcomingAppointments": 1,
      "vitalMetrics": {
        "bloodPressure": "118/78 mmHg",
        "heartRate": "72 bpm",
        "oxygenSaturation": "99%"
      }
    }
  }
  ```

### `GET /dashboard/health-trends`
Returns 6-month historical telemetry trends for Chart.js visualization.

---

## 3. Reports Pipeline (`/api/v1/reports`)

### `GET /reports`
Lists all medical reports belonging to the authenticated user.

### `POST /reports`
Uploads a medical report (`multipart/form-data` with field `file` or JSON payload). Validates MIME type (PDF, PNG, JPG) and enforces private storage.

### `GET /reports/:id`
Retrieves report metadata. Enforces tenant ownership.

### `DELETE /reports/:id`
Removes a report and deletes private stored binary.

### `GET /reports/:id/download`
Streams secure report download.

### `POST /reports/:id/analyze`
Triggers simulated OCR and educational lab parameter extraction.

### `GET /reports/:id/analysis`
Returns extracted parameters, optimal range tracks, and clinician discussion questions.

---

## 4. Chat & Intelligence (`/api/v1/chat`)

### `POST /chat/message`
Submits user inquiry to AI companion engine.
- **Request Body:**
  ```json
  { "message": "Explain my Total Cholesterol level of 218 mg/dL" }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "reply": "### Understanding Lipid Panels...",
      "isEmergencyAlert": false,
      "disclaimer": "Educational demonstration only; not a diagnosis or medication advice."
    }
  }
  ```

---

## 5. Admin Governance (`/api/v1/admin`)
*Strictly restricted to users with `role: ADMIN`.*

### `GET /admin/stats`
Returns aggregate operational metrics (total accounts, processed files, system uptime).

### `GET /admin/users`
Lists registered accounts with metadata only. **Admins cannot view patient report contents or chat logs.**
