# 🚀 Netlify Deployment Guide — myHealthMate AI

This guide provides complete, step-by-step instructions for deploying **myHealthMate AI** on [Netlify](https://www.netlify.com/).

---

## 🏗️ Architecture on Netlify

| Layer | Configuration | Description |
|---|---|---|
| **Frontend Client** | `publish = "client"` (or `.`) | High-performance HTML5, CSS3, vanilla ES Modules. |
| **Serverless API** | `netlify/functions/api.js` | Built-in serverless functions for `/api/v1/health`, `/api/v1/auth`, `/api/v1/dashboard`, etc. |
| **Clean Routing** | `netlify.toml` & `_redirects` | Automatic clean URL rewrites (`/dashboard`, `/assistant`, `/login`). |
| **Security & Privacy** | `_headers` & `netlify.toml` | Hospital-grade CSP, anti-clickjacking (`X-Frame-Options: DENY`), strict origin policies. |
| **Resilient Fallback** | In-Browser Synthetic Engine | If disconnected or offline, client automatically runs in demo mode without crashing. |

---

## ⚡ Deployment Methods

Choose the deployment method that fits your workflow:

### Option A: Netlify Drop (Fastest — 30 Seconds, No CLI or Git Needed)

1. Open your web browser and go to: **[https://app.netlify.com/drop](https://app.netlify.com/drop)**
2. Sign in or sign up for a free Netlify account.
3. Open your file explorer and locate the `client/` folder in your project directory:
   ```
   c:\Users\Smile\OneDrive\New folder\myHealthMate-AI\client
   ```
4. **Drag and drop the entire `client` folder** into the upload box on Netlify Drop.
5. Netlify will upload and publish your site immediately. You will receive a live URL (e.g., `https://random-name-12345.netlify.app`).

---

### Option B: Netlify CLI (Direct Terminal Deployment)

If you have Node.js installed, you can deploy directly from PowerShell or Command Prompt:

1. **Open PowerShell** in the project directory:
   ```powershell
   cd "c:\Users\Smile\OneDrive\New folder\myHealthMate-AI"
   ```

2. **Log into Netlify** (one-time authorization):
   ```powershell
   npx netlify-cli login
   ```
   *(A browser tab will open asking you to authorize the Netlify CLI)*

3. **Deploy the site to production**:
   ```powershell
   npx netlify-cli deploy --prod --dir=client
   ```
   - When prompted `Create & configure a new site`: Choose **Yes**.
   - Select your Netlify team account.
   - Enter an optional custom site name (e.g. `myhealthmate-ai-demo`).

4. Once the upload finishes, Netlify outputs your live production URL:
   ```
   Website URL:       https://myhealthmate-ai-demo.netlify.app
   ```

---

### Option C: GitHub / Git Continuous Deployment (Recommended for Teams)

Connecting your Git repository enables automatic deployment on every `git push`:

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. In the Netlify Dashboard ([app.netlify.com](https://app.netlify.com)), click **"Add new site"** &rarr; **"Import an existing project"**.
3. Select your Git provider and choose the repository (`myHealthMate-AI`).
4. Netlify will automatically detect the [`netlify.toml`](file:///c:/Users/Smile/OneDrive/New%20folder/myHealthMate-AI/netlify.toml) configuration file:
   - **Base directory**: *(Leave blank)*
   - **Build command**: *(Leave blank)*
   - **Publish directory**: `client`
   - **Functions directory**: `netlify/functions`
5. Click **"Deploy myHealthMate-AI"**.
6. Every future push to your `main` branch will automatically trigger a new deployment with instant zero-downtime rollouts.

---

## ⚙️ Configuration Files Reference

### 1. `netlify.toml` (Root Configuration)
Located at the root of the project, this controls build settings, rewrites, and headers:
```toml
[build]
  publish = "client"
  functions = "netlify/functions"

[[redirects]]
  from = "/dashboard"
  to = "/dashboard.html"
  status = 200

[[redirects]]
  from = "/api/v1/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2. `client/_redirects` (Clean URLs & API Routing)
Provides clean, bookmarkable URLs:
```
/dashboard    /dashboard.html    200
/reports      /reports.html      200
/analysis     /analysis.html     200
/assistant    /assistant.html    200
/history      /history.html      200
/login        /login.html        200
/register     /register.html     200
/profile      /profile.html      200
/admin        /admin.html        200
/api/v1/*     /.netlify/functions/api/:splat  200
/*            /index.html        200
```

### 3. `client/_headers` (Healthcare Security & Performance)
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()

/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

---

## 🌐 Connecting an External Full-Stack Backend (Optional)

If you deploy the Node/Express backend (`server/`) to a platform like Render, Railway, or Fly.io:

1. In the Netlify Dashboard, navigate to:
   **Site configuration** &rarr; **Environment variables**.
2. Add a variable:
   - **Key**: `BACKEND_URL`
   - **Value**: `https://your-api.onrender.com`
3. In `netlify.toml`, replace the `/api/v1/*` redirect with:
   ```toml
   [[redirects]]
     from = "/api/v1/*"
     to = "https://your-api.onrender.com/api/v1/:splat"
     status = 200
     force = true
   ```
4. Netlify will now automatically proxy all frontend API requests to your remote backend, bypassing CORS restrictions!

---

## 🔒 Custom Domain & SSL Setup

1. In the Netlify Dashboard, go to **Domain management** &rarr; **Add custom domain**.
2. Enter your custom domain (e.g. `myhealthmate.ai`).
3. Point your DNS records at your domain registrar:
   - **Apex domain (`@`)**: Point A record to Netlify IP `75.2.60.5`
   - **Subdomain (`www`)**: Point CNAME to your Netlify site URL (e.g., `myhealthmate-ai.netlify.app`)
4. Netlify will automatically provision a **free SSL/TLS certificate** via Let's Encrypt within minutes.

---

## ✅ Deployment Verification Checklist

After deploying to Netlify, test the following:

- [ ] **Home Page**: Hero section renders the doctor background image and animated cyan ECG heartbeat line.
- [ ] **Clean URLs**: Visiting `https://<your-site>.netlify.app/dashboard` opens the dashboard without error.
- [ ] **Interactive Demo**: Clicking **"Launch Interactive Demo"** or **"Sign In"** logs into Alex Morgan's account.
- [ ] **Multilingual Support**: Selecting Hindi, Telugu, or Tamil switches interface strings instantly.
- [ ] **Report Upload & Analysis**: Uploading a PDF/image processes synthetic lab parameters.
- [ ] **AI Assistant**: Asking about cholesterol, glucose, or vitamin D returns clinical insights.
- [ ] **Health Endpoint**: Visiting `https://<your-site>.netlify.app/api/v1/health` returns HTTP 200 `ONLINE`.
