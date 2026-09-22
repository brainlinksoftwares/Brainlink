# Brainlink Studio — Lead Generation & CRM System

Production-grade Lead Generation and CRM platform built specifically for **Brainlink Softwares** (`studio.brainlink.in`).

The platform enables Brainlink Softwares to generate, capture, manage, track, qualify, and convert customer leads into client accounts and delivery projects, with full audit trails, automated duplicate detection, role-based access controls, and real-time executive analytics.

---

## 1. System Architecture

- **Domain**: `studio.brainlink.in` (Production CRM Subdomain)
- **Marketing Domain**: `brainlink.in` (100% untouched and preserved)
- **Public Lead Form**: `/apply` (Embeddable webhook lead capture form for marketing pages)
- **Frontend Framework**: React (TypeScript, Tailwind CSS, Lucide Icons, Framer Motion)
- **Authentication**: Firebase Authentication (Email/Password, Google OAuth, Password Recovery, Role Synchronization)
- **Backend / Database**: Firestore + Clean Service/Repository Architecture with resilient persistence
- **Access Control (RBAC)**: Centralized authorization for `Admin`, `Manager`, and `Sales`
- **Hosting / Deployment**: Vercel

### Service Layer Design

UI components do not execute raw database queries. All operations flow through dedicated typed services:
- `authService`: Firebase Auth sessions, Google login, password reset, and user synchronization.
- `leadService`: Lead CRUD, multi-criteria filtering, stage transitions, assignment, and batch ingestion.
- `duplicateService`: Multi-vector duplicate detection (Email, Phone, WhatsApp, Company+Email).
- `activityService`: Immutable audit log recording all status changes, touches, and updates.
- `followUpService`: Scheduling, queue grouping (Today, Upcoming, Overdue, Completed), and resolution notes.
- `taskService`: Milestones and action item tracking linked to leads.
- `clientService`: Converts `Won` pipeline leads into contracted client accounts.
- `projectService`: Milestone delivery and contract execution linked to clients.
- `teamService`: User provisioning, role assignment, and access enabling/disabling.
- `analyticsService`: Real-time calculation of pipeline KPIs, conversion funnel, attribution, and team velocity.
- `csvService`: CSV bulk lead importing with preview, schema validation, duplicate blocking, and filtered export.
- `settingsService`: Configurable pipeline stages, lead sources, and service offerings.

---

## 2. Roles & Permissions (RBAC)

| Feature / Action | Admin | Manager | Sales |
| :--- | :---: | :---: | :---: |
| **View All Leads** | Yes | Yes (Team Leads) | No (Assigned Only) |
| **Create New Lead** | Yes | Yes | Yes |
| **Edit Any Lead** | Yes | Yes | No (Assigned Only) |
| **Delete / Archive Lead** | Yes | No | No |
| **Assign Leads to Members** | Yes | Yes | No |
| **Schedule / Complete Follow-ups** | Yes | Yes | Yes |
| **Convert Won Lead to Client** | Yes | Yes | No |
| **Import / Export CSV** | Yes | Export Only | No |
| **Team Management** | Yes | No | No |
| **CRM Settings & Customization** | Yes | No | No |
| **Full Audit Activity Log** | Yes | Yes | No |

---

## 3. Environment Variables Configuration

Copy `.env.example` to `.env` for local development. In Vercel, configure these under **Project Settings &rarr; Environment Variables**:

```bash
# Firebase Configuration for Brainlink Softwares
REACT_APP_FIREBASE_API_KEY=AIzaSyA42rWcSnG2mUokdGOKTRVz0O5K62DSaAQ
REACT_APP_FIREBASE_AUTH_DOMAIN=brainlinksoftwares.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=brainlinksoftwares
REACT_APP_FIREBASE_STORAGE_BUCKET=brainlinksoftwares.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=595517739090
REACT_APP_FIREBASE_APP_ID=1:595517739090:web:4579d915f2c5dfcf950f8b
REACT_APP_FIREBASE_MEASUREMENT_ID=G-BS6RR7WKZS

# Vite / Modern Framework Equivalents (both supported):
VITE_FIREBASE_API_KEY=AIzaSyA42rWcSnG2mUokdGOKTRVz0O5K62DSaAQ
VITE_FIREBASE_AUTH_DOMAIN=brainlinksoftwares.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=brainlinksoftwares
VITE_FIREBASE_STORAGE_BUCKET=brainlinksoftwares.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=595517739090
VITE_FIREBASE_APP_ID=1:595517739090:web:4579d915f2c5dfcf950f8b
VITE_FIREBASE_MEASUREMENT_ID=G-BS6RR7WKZS
```

---

## 4. Local Development

1. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Start development server**:
   ```bash
   npm start
   ```

3. **Accessing the Applications**:
   - **Brainlink Marketing Website**: `http://localhost:3000/`
   - **Brainlink Studio CRM**: `http://localhost:3000/studio` (or simulate subdomain via `http://studio.localhost:3000/`)
   - **Public Lead Form**: `http://localhost:3000/apply`

4. **Testing Quick Logins**:
   - Admin: `admin@brainlink.in`
   - Manager: `manager@brainlink.in`
   - Sales: `sales@brainlink.in`
   - Or click "Continue with Google" / preset test shortcuts on the login screen.

5. **Sample Data (Zero Fake Data Guarantee)**:
   - Production loads completely clean with proper empty states.
   - For local development, click **"Load Sample Test Leads"** on the Dashboard banner to populate demo leads, follow-ups, and clients, or click **"Reset to Zero"** to wipe clean.

---

## 5. Vercel Deployment Instructions

1. **Connect Repository**:
   - Import this Git repository into your Vercel team account.
   - Framework Preset: **Create React App** / **Other**.
   - Build Command: `npm run build`
   - Output Directory: `build`

2. **Add Environment Variables**:
   - In Vercel Project Settings &rarr; **Environment Variables**, paste all `REACT_APP_FIREBASE_*` variables from above.

3. **Deploy**:
   - Trigger deployment. Vercel will automatically run the build and provide your deployment preview URL.

---

## 6. DNS Configuration for `studio.brainlink.in`

To connect the subdomain `studio.brainlink.in` on Vercel:

1. In the **Vercel Dashboard**, open your project and go to:
   **Settings &rarr; Domains &rarr; Add Domain**
2. Enter:
   `studio.brainlink.in`
3. Select your routing preference (Production Branch).
4. Vercel will display the required DNS records.
5. In your domain registrar / DNS provider for `brainlink.in` (e.g. GoDaddy, Cloudflare, Namecheap, Google Domains), add the following CNAME record:

| Type | Name / Host | Value / Target | TTL |
| :--- | :--- | :--- | :--- |
| **CNAME** | `studio` | `cname.vercel-dns.com.` | Auto / 300 |

*(Note: If you manage DNS via Cloudflare, remember to set proxy status to DNS-only initially during SSL issuance).*

Once the DNS propagates (usually 1–5 minutes), Vercel automatically issues an SSL certificate, and `https://studio.brainlink.in` will serve the Brainlink Studio CRM!

---

## 7. Automated Test Suite

To run all CRM unit tests:
```bash
npm test -- --watchAll=false
```

Tests verify:
- Role-based permissions matrix (`permissions.test.ts`)
- Multi-criteria duplicate lead detection (`duplicateService.test.ts`)
- CSV batch parsing, validation, and export formatting (`csvService.test.ts`)
- KPI metrics, conversion rates, and channel attribution aggregation (`analyticsService.test.ts`)
