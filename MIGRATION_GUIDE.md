# Complete Zero-Downtime Migration Guide
## From: `vishnoiaaditya29@gmail.com` ➔ To: `dev.brainlink@gmail.com`
**Projects**: Brainlink Main Website (`brainlink.in`) & Brainlink Studio CRM (`studio.brainlink.in`)  
**Database**: Neon PostgreSQL (`posts`, `certificates`) & Firebase (`brainlinksoftwares`)

---

## 📋 Overview of What We Have Already Prepared
1. **Full Database SQL Dump & Restore Script**:
   - Location: [`db/migrations/neon_database_restore.sql`](file:///c:/my-react-app/db/migrations/neon_database_restore.sql)
   - Contains: Complete schema creation (tables `posts`, `certificates`, UUID extensions, triggers, indexes) and `INSERT` statements for all 5 published blog posts and verified student certificates.
2. **Full Database JSON Export**:
   - Location: [`neon_database_backup.json`](file:///c:/my-react-app/neon_database_backup.json)
3. **Automated Backup Script**:
   - Location: [`backup-db.js`](file:///c:/my-react-app/backup-db.js)

---

## 🗄️ Step 1: Migrate the Database (Neon PostgreSQL)

### Option A: 1-Click Restore in a New Neon Account (Recommended)
1. Go to [https://neon.tech](https://neon.tech) and Sign Up / Log In using **`dev.brainlink@gmail.com`**.
2. Click **Create Project**:
   - Project Name: `brainlink-prod`
   - Region: Select the closest region (e.g., `AWS us-east-2` or `AWS ap-south-1`).
   - PostgreSQL Version: `16` (or default).
3. Once the project is created, click on **SQL Editor** in the left sidebar.
4. Open the file [`db/migrations/neon_database_restore.sql`](file:///c:/my-react-app/db/migrations/neon_database_restore.sql) on your computer, copy the entire SQL content, paste it into the Neon SQL Editor, and click **Run**.
5. Verify your data:
   - Run `SELECT count(*) FROM posts;` (should return 5).
   - Run `SELECT count(*) FROM certificates;` (should return 2).
6. Copy your new Connection String:
   - Go to **Dashboard** ➔ **Connection Details** ➔ Select **Pooled connection** or **Direct connection**.
   - Copy the URI:
     ```text
     DATABASE_URL=postgresql://neondb_owner:YOUR_NEW_PASSWORD@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```

### Option B: Invite `dev.brainlink@gmail.com` to Existing Neon Project
If you prefer to keep the existing database instance without changing connection strings:
1. Log into Neon with `vishnoiaaditya29@gmail.com`.
2. Go to **Settings** ➔ **Members** ➔ **Invite Member**.
3. Add `dev.brainlink@gmail.com` as an **Admin / Owner**.

---

## 🔥 Step 2: Transfer Firebase Ownership (CRM & Auth)

The CRM system connects to the Firebase project `brainlinksoftwares`.
To transfer control to `dev.brainlink@gmail.com`:
1. Log into [Firebase Console](https://console.firebase.google.com/) with `vishnoiaaditya29@gmail.com`.
2. Select the project **`brainlinksoftwares`**.
3. Click the gear icon ⚙️ (top-left) ➔ **Project Settings** ➔ **Users and permissions**.
4. Click **Add member**:
   - Email: `dev.brainlink@gmail.com`
   - Role: **Owner**
5. Check your inbox at `dev.brainlink@gmail.com` and accept the invitation.
6. (Optional) Once verified, you can remove `vishnoiaaditya29@gmail.com` or keep it as backup admin.
7. Under **Authentication** ➔ **Settings** ➔ **Authorized domains**, make sure both domains are listed:
   - `brainlink.in`
   - `studio.brainlink.in`
   - `localhost`

---

## 🚀 Step 3: Migrate Vercel Project & Domains

### Method 1: Seamless Vercel Project Transfer (Zero Downtime — Recommended)
This is the cleanest method because it moves the project, history, environment variables, and domains in 1 click:
1. Log into [https://vercel.com](https://vercel.com) using `vishnoiaaditya29@gmail.com`.
2. Open your website project (e.g. `brainlink` / `my-react-app`).
3. Go to **Settings** ➔ **General** ➔ scroll down to the bottom to **Transfer Project**.
4. Click **Transfer**:
   - Select the target team / username: `dev.brainlink@gmail.com` (or the `brainlinksoftwares` team).
5. Open `dev.brainlink@gmail.com` on Vercel and accept the incoming project transfer.
6. Go to **Settings** ➔ **Environment Variables** in the transferred project and update `DATABASE_URL` with your new database connection string from Step 1.
7. Click **Redeploy** on the latest deployment so it picks up the new database.

---

### Method 2: Fresh Deployment under `dev.brainlink@gmail.com`

If you are setting up a fresh project under `dev.brainlink@gmail.com`:
1. Log into [https://vercel.com](https://vercel.com) using `dev.brainlink@gmail.com`.
2. Click **Add New...** ➔ **Project**.
3. Import the GitHub repository: `aadityavishnoi/Brainlink` (or grant repository access).
4. Configure Project Settings:
   - **Framework Preset**: Create React App
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Add the **Environment Variables**:
   ```ini
   DATABASE_URL=postgresql://neondb_owner:YOUR_NEW_PASSWORD@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   REACT_APP_FIREBASE_API_KEY=AIzaSyA42rWcSnG2mUokdGOKTRVz0O5K62DSaAQ
   REACT_APP_FIREBASE_AUTH_DOMAIN=brainlinksoftwares.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=brainlinksoftwares
   REACT_APP_FIREBASE_STORAGE_BUCKET=brainlinksoftwares.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=595517739090
   REACT_APP_FIREBASE_APP_ID=1:595517739090:web:4579d915f2c5dfcf950f8b
   REACT_APP_FIREBASE_MEASUREMENT_ID=G-BS6RR7WKZS
   ```
6. Click **Deploy**.

---

## 🌐 Step 4: Domain & DNS Routing

Under the new Vercel project in `dev.brainlink@gmail.com`:
1. Go to **Settings** ➔ **Domains**.
2. Add:
   - `brainlink.in` (and `www.brainlink.in` with redirect to `brainlink.in`)
   - `studio.brainlink.in`
3. If your DNS is managed on Cloudflare, GoDaddy, Hostinger, or Namecheap:
   - **Root apex (`brainlink.in`)**:
     - Type: `A`
     - Name: `@`
     - Value: `76.76.21.21`
   - **Subdomain (`studio.brainlink.in`)**:
     - Type: `CNAME`
     - Name: `studio`
     - Value: `cname.vercel-dns.com`
4. Once DNS records propagate, Vercel will automatically provision free SSL certificates.

---

## ✅ Step 5: Verification Checklist

Once migrated, test these exact endpoints to ensure 100% functionality:

- [ ] **Homepage**: `https://brainlink.in` loads properly.
- [ ] **Blog Posts (Database test)**: Visit `https://brainlink.in/blog` and click on any blog post (e.g. `/blog/why-brainlink-is-best`). Ensure content renders from PostgreSQL.
- [ ] **Certificates Lookup (Database test)**: Check student certificate verification at `https://brainlink.in/verify-certificate` with code `BL-2025-001`.
- [ ] **Lead Generation CRM**: Visit `https://studio.brainlink.in` (or `https://brainlink-studio.vercel.app`), log in, and check leads, pipeline, and follow-ups.
- [ ] **Public Lead Capture**: Submit a test lead at `https://studio.brainlink.in/apply` and verify it appears in the CRM dashboard.
