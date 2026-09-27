# Brainlink Studio — Production Operating System Guide

**Brainlink Studio** is the complete internal business management and enterprise operating system for **Brainlink Softwares** ([brainlink.in](https://brainlink.in)), designed for production deployment on **[studio.brainlink.in](https://studio.brainlink.in)**.

---

## 1. System Architecture & Capabilities

Brainlink Studio integrates the entire business lifecycle into a single unified platform:

$$\text{Lead Generation} \longrightarrow \text{CRM} \longrightarrow \text{Sales Pipeline} \longrightarrow \text{Meetings} \longrightarrow \text{Proposals \& Quotations} \longrightarrow \text{Deal Won} \longrightarrow \text{Client Onboarding} \longrightarrow \text{Projects \& Milestones} \longrightarrow \text{Tasks \& Time Tracking} \longrightarrow \text{GST Invoices} \longrightarrow \text{Payments \& Expenses} \longrightarrow \text{Auditable Ledger} \longrightarrow \text{Document Vault} \longrightarrow \text{Project Closure}$$

### Core Modules
* **Executive Command Center:** Real-time metrics calculating actual Firestore records (Total Leads, Pipeline Volume, Weighted Pipeline, Won Deals, Active Deliveries, Inflow Cash, Overdue Receivables, Expenses, Net Revenue).
* **CRM System:** Complete CRUD for Leads, Contacts, Companies, and Chronological Activity Timelines. Supports CSV import/export and 1-click conversion to pipeline opportunities.
* **Sales Pipeline Kanban:** 8-stage interactive Kanban board (`New Lead`, `Contacted`, `Qualified`, `Meeting`, `Proposal`, `Negotiation`, `Won`, `Lost`) with probability weighting.
* **Proposals & Quotations:** Multi-line quotation builder, executive scope summaries, and branded PDF generation.
* **Client Onboarding & 360 Profiles:** 10-point standardized onboarding checklist (MSA, GSTIN/PAN, Deliverables, Team assignment, Kickoff) with 0% to 100% progress tracking.
* **Isolated Client Portal (`/portal`):** Client-facing view strictly filtered to the client's projects, milestones, documents, and verified GST invoices (internal costs, staff salaries, and margins strictly hidden).
* **Project Management & Milestones:** Milestone-based billing schedules (e.g. 30% Architecture, 40% Core, 30% UAT signoff), Tasks with List/Kanban views, and team effort time tracking.
* **11-Step Project Closure Protocol:** Section 27 compliance ensuring deliverables, source repositories, credentials, warranty maintenance, and final payments are satisfied before a project can be closed.
* **Indian GST Invoicing Engine:** Automated computation for intra-state (CGST 9% + SGST 9%) vs inter-state (IGST 18%), HSN/SAC codes, discount deductions, number-to-words currency formatting, bank/UPI coordinates, and branded PDF downloads.
* **Auto-Reconciling Payments & Expenses:** Partial and full payments automatically update outstanding balances, while all events are appended to the immutable Financial Ledger.
* **Audit Ledger & RBAC Security:** Every sensitive mutation is recorded with timestamps, user credentials, and entity mutation payload.

---

## 2. Super Admin Credentials & Provisioning

Initial authorized Super Administrators:
1. `vishnoiaaditya29@gmail.com` (Founder / CEO Aaditya Vishnoi)
2. `ceo.brainlink@gmail.com` (Super Admin)

### Provisioning Workflow
* On first sign-in via Email/Password or Google OAuth, the system verifies whether the user document exists in `/users/{uid}` in Firestore.
* If the user's email matches the configured Super Admin list, they are granted the `SUPER_ADMIN` role with universal permissions across the platform.
* Super Admins can simulate other roles (`Sales Manager`, `Project Manager`, `Finance`, `Client Portal`) using the "View As" switcher in the topbar for rapid testing.

---

## 3. Role-Based Access Control (RBAC) Matrix

| Operational Role | Scope of Access | Permissions |
| :--- | :--- | :--- |
| `SUPER_ADMIN` | Universal operational & administrative access | All 24 platform permissions |
| `ADMIN` | Operational management across modules | CRM, Sales, Projects, Finance, Users (configurable) |
| `SALES_MANAGER` | Leads, contacts, companies, pipeline, proposals, quotations | `crm.*`, `sales.*`, `invoice.create`, `invoice.send` |
| `SALES_EXECUTIVE` | Assigned leads and deals | View and edit assigned CRM records |
| `PROJECT_MANAGER` | Clients, projects, milestones, tasks, team allocation | `projects.*`, `crm.view`, project finance overview |
| `FINANCE` | Invoices, payment records, operating expenses, financial ledger | `finance.*`, `invoice.*`, receivables |
| `DEVELOPER` / `DESIGNER` | Assigned engineering sprints and tasks | `projects.view`, `projects.edit` |
| `CLIENT` | Isolated client portal view only | `client.portal` (Zero access to internal costs/margins) |

---

## 4. Environment Variables

Create `.env` (or configure in Vercel Project Settings):

```bash
# Firebase Client Configuration for Brainlink Studio
# Supported with both REACT_APP_ and NEXT_PUBLIC_ prefixes:
REACT_APP_FIREBASE_API_KEY=AIzaSyA42rWcSnG2mUokdGOKTRVz0O5K62DSaAQ
REACT_APP_FIREBASE_AUTH_DOMAIN=brainlinksoftwares.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=brainlinksoftwares
REACT_APP_FIREBASE_STORAGE_BUCKET=brainlinksoftwares.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=595517739090
REACT_APP_FIREBASE_APP_ID=1:595517739090:web:4579d915f2c5dfcf950f8b
REACT_APP_FIREBASE_MEASUREMENT_ID=G-BS6RR7WKZS

NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA42rWcSnG2mUokdGOKTRVz0O5K62DSaAQ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=brainlinksoftwares.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=brainlinksoftwares
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=brainlinksoftwares.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=595517739090
NEXT_PUBLIC_FIREBASE_APP_ID=1:595517739090:web:4579d915f2c5dfcf950f8b
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-BS6RR7WKZS
```

---

## 5. Security Rules Deployment

Deploy the provided security rules to Cloud Firestore and Firebase Storage:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy rules
firebase deploy --only firestore:rules,storage
```

---

## 6. Domain Setup for studio.brainlink.in

1. In your **Vercel Dashboard**, open project **Brainlink**.
2. Go to **Settings** → **Domains**.
3. Add **`studio.brainlink.in`**.
4. In your DNS provider (e.g. Cloudflare, GoDaddy, or Namecheap), create a CNAME record:
   * **Type:** `CNAME`
   * **Host / Name:** `studio`
   * **Value:** `cname.vercel-dns.com`
5. The application includes native hostname detection: when accessed via `https://studio.brainlink.in`, it mounts Brainlink Studio as the root application. When accessed via `https://brainlink.in/studio/*` or `http://localhost:3000/studio/*`, it mounts via the subpath router.

---

## 7. Developer & Seeding Tools

Under **Administration** → **Settings & Configuration** → **Developer Tools**, you can click **"Populate Starter Dataset"** to seed realistic initial deals, accounts, and GST invoices into Cloud Firestore for demonstration or testing.
