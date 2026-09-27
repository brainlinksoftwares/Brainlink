-- ==============================================================================
-- BRAINLINK STUDIO — RELATIONAL DATABASE SCHEMA & MIGRATIONS
-- Database: Neon PostgreSQL
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Users & RBAC
CREATE TABLE IF NOT EXISTS studio_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'DEVELOPER',
    phone VARCHAR(50),
    department VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Initial Super Admins
INSERT INTO studio_users (email, full_name, role, department, status)
VALUES
    ('vishnoiaaditya29@gmail.com', 'Aaditya Vishnoi', 'SUPER_ADMIN', 'Executive', 'ACTIVE'),
    ('ceo.brainlink@gmail.com', 'CEO Brainlink', 'SUPER_ADMIN', 'Executive', 'ACTIVE')
ON CONFLICT (email) DO UPDATE
SET role = EXCLUDED.role, status = EXCLUDED.status, updated_at = NOW();

-- 2. CRM Leads
CREATE TABLE IF NOT EXISTS studio_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    budget NUMERIC(15, 2) DEFAULT 0,
    service VARCHAR(100),
    source VARCHAR(100) DEFAULT 'Website Form',
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    score INTEGER DEFAULT 50,
    assigned_to VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Sales Deals & Pipeline
CREATE TABLE IF NOT EXISTS studio_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    value NUMERIC(15, 2) NOT NULL DEFAULT 0,
    stage VARCHAR(50) NOT NULL DEFAULT 'New Lead',
    probability INTEGER NOT NULL DEFAULT 10,
    expected_close DATE,
    assigned_to VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Clients
CREATE TABLE IF NOT EXISTS studio_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    gstin VARCHAR(50),
    pan VARCHAR(50),
    address TEXT,
    state VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    onboarding_progress INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Projects
CREATE TABLE IF NOT EXISTS studio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    client_id UUID REFERENCES studio_clients(id) ON DELETE SET NULL,
    client_name VARCHAR(255) NOT NULL,
    budget NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
    health VARCHAR(50) NOT NULL DEFAULT 'GOOD',
    start_date DATE,
    target_delivery DATE,
    completed_at TIMESTAMPTZ,
    repo_url TEXT,
    staging_url TEXT,
    production_url TEXT,
    project_manager VARCHAR(255),
    closure_protocol JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Milestones
CREATE TABLE IF NOT EXISTS studio_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES studio_projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    percentage INTEGER NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    due_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Tasks
CREATE TABLE IF NOT EXISTS studio_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES studio_projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(50) NOT NULL DEFAULT 'TODO',
    assigned_to VARCHAR(255),
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. GST Invoices
CREATE TABLE IF NOT EXISTS studio_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    client_id UUID REFERENCES studio_clients(id) ON DELETE SET NULL,
    client_name VARCHAR(255) NOT NULL,
    client_gstin VARCHAR(50),
    client_address TEXT,
    client_state VARCHAR(100),
    project_id UUID REFERENCES studio_projects(id) ON DELETE SET NULL,
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    taxable_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    cgst NUMERIC(15, 2) NOT NULL DEFAULT 0,
    sgst NUMERIC(15, 2) NOT NULL DEFAULT 0,
    igst NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_tax NUMERIC(15, 2) NOT NULL DEFAULT 0,
    grand_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
    amount_paid NUMERIC(15, 2) NOT NULL DEFAULT 0,
    balance_due NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'SENT',
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Payments
CREATE TABLE IF NOT EXISTS studio_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_number VARCHAR(100) NOT NULL UNIQUE,
    invoice_id UUID REFERENCES studio_invoices(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'BANK_TRANSFER',
    transaction_ref VARCHAR(255),
    payment_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Expenses
CREATE TABLE IF NOT EXISTS studio_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL,
    vendor VARCHAR(255) NOT NULL,
    description TEXT,
    amount NUMERIC(15, 2) NOT NULL,
    tax_deductible BOOLEAN DEFAULT true,
    gst_paid NUMERIC(15, 2) DEFAULT 0,
    expense_date DATE NOT NULL,
    receipt_url TEXT,
    recorded_by VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Immutable Financial Ledger (Append-Only)
CREATE TABLE IF NOT EXISTS studio_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('CREDIT', 'DEBIT', 'ADJUSTMENT')),
    amount NUMERIC(15, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    reference_id VARCHAR(255),
    reference_type VARCHAR(50),
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Security Audit Logs (Append-Only)
CREATE TABLE IF NOT EXISTS studio_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    performed_by VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    details JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_studio_leads_status ON studio_leads(status);
CREATE INDEX IF NOT EXISTS idx_studio_deals_stage ON studio_deals(stage);
CREATE INDEX IF NOT EXISTS idx_studio_projects_status ON studio_projects(status);
CREATE INDEX IF NOT EXISTS idx_studio_invoices_status ON studio_invoices(status);
CREATE INDEX IF NOT EXISTS idx_studio_transactions_type ON studio_transactions(type);
CREATE INDEX IF NOT EXISTS idx_studio_audit_module ON studio_audit_logs(module);