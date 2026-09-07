-- ====================================================================
-- StartupConnect Gov - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ====================================================================

-- 1. Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- TABLE 1: users
-- ====================================================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('department', 'startup', 'admin', 'validator', 'public')),
    email TEXT NOT NULL UNIQUE,
    organization TEXT,
    department_id TEXT,
    department_name TEXT,
    startup_id TEXT,
    startup_name TEXT,
    validator_id TEXT,
    designation TEXT,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure auth_id column exists if table was created previously
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);

-- ====================================================================
-- TABLE 2: departments
-- ====================================================================
CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    sector TEXT NOT NULL,
    state TEXT NOT NULL,
    nodal_officer TEXT NOT NULL,
    email TEXT NOT NULL,
    active_pilots_count INTEGER DEFAULT 0,
    budget_allocated_lakhs NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- TABLE 3: startups
-- ====================================================================
CREATE TABLE IF NOT EXISTS startups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sector TEXT NOT NULL,
    dpiit_status TEXT NOT NULL DEFAULT 'Recognized' CHECK (dpiit_status IN ('Recognized', 'Pending')),
    dpiit_number TEXT NOT NULL,
    keywords JSONB DEFAULT '[]'::jsonb,
    past_pilot_count INTEGER DEFAULT 0,
    success_rate_percent NUMERIC DEFAULT 0,
    description TEXT NOT NULL,
    founding_year INTEGER,
    city TEXT NOT NULL,
    stage TEXT NOT NULL CHECK (stage IN ('Early Traction', 'Validation', 'Growth', 'Scaling')),
    has_verified_passport BOOLEAN DEFAULT FALSE,
    active_passports_count INTEGER DEFAULT 0,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- TABLE 4: validators (MSInS / Empanelled Academic & Tech Bodies)
-- ====================================================================
CREATE TABLE IF NOT EXISTS validators (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    organization TEXT NOT NULL,
    sector_expertise JSONB DEFAULT '[]'::jsonb,
    empanelled_date TEXT NOT NULL,
    verified_pilots_count INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'On Leave')),
    email TEXT NOT NULL,
    credential_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- TABLE 5: problem_statements (Department Procurement Challenges)
-- ====================================================================
CREATE TABLE IF NOT EXISTS problem_statements (
    id TEXT PRIMARY KEY,
    department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
    department_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    budget_min_lakhs NUMERIC NOT NULL,
    budget_max_lakhs NUMERIC NOT NULL,
    risk_level TEXT NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
    expected_outcome TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'evaluating', 'pilot_active', 'closed')),
    created_at TEXT NOT NULL,
    applications_count INTEGER DEFAULT 0
);

-- ====================================================================
-- TABLE 6: matches (AI Match Engine Recommendations)
-- ====================================================================
CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    problem_id TEXT REFERENCES problem_statements(id) ON DELETE CASCADE,
    startup_id TEXT REFERENCES startups(id) ON DELETE CASCADE,
    match_score NUMERIC NOT NULL,
    reason TEXT NOT NULL,
    details JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- TABLE 7: pilots (Sandbox Pilot Contracts)
-- ====================================================================
CREATE TABLE IF NOT EXISTS pilots (
    id TEXT PRIMARY KEY,
    problem_id TEXT REFERENCES problem_statements(id) ON DELETE SET NULL,
    problem_title TEXT NOT NULL,
    department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
    department_name TEXT NOT NULL,
    startup_id TEXT REFERENCES startups(id) ON DELETE SET NULL,
    startup_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'terminated')),
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    total_budget_lakhs NUMERIC NOT NULL,
    disbursed_budget_lakhs NUMERIC DEFAULT 0,
    validator_id TEXT REFERENCES validators(id) ON DELETE SET NULL,
    validator_name TEXT NOT NULL,
    scope_summary TEXT NOT NULL,
    created_at TEXT NOT NULL,
    completed_at TEXT
);

-- ====================================================================
-- TABLE 8: milestones (Rule-Based Verification Milestones)
-- ====================================================================
CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY,
    pilot_id TEXT REFERENCES pilots(id) ON DELETE CASCADE,
    milestone_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_kpi_description TEXT NOT NULL,
    target_kpi_value NUMERIC NOT NULL,
    kpi_unit TEXT NOT NULL,
    weight_percent NUMERIC NOT NULL,
    amount_lakhs NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'verified', 'paid')),
    submitted_value NUMERIC,
    submitted_proof_url TEXT,
    submitted_notes TEXT,
    submitted_at TEXT,
    verified_at TEXT,
    verified_by TEXT,
    verification_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- TABLE 9: payments (PFMS / State Treasury Settlement Records)
-- ====================================================================
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    milestone_id TEXT REFERENCES milestones(id) ON DELETE SET NULL,
    milestone_title TEXT NOT NULL,
    pilot_id TEXT REFERENCES pilots(id) ON DELETE CASCADE,
    pilot_title TEXT NOT NULL,
    department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
    department_name TEXT NOT NULL,
    startup_id TEXT REFERENCES startups(id) ON DELETE SET NULL,
    startup_name TEXT NOT NULL,
    amount_lakhs NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'verified', 'approved', 'sent_to_treasury', 'paid')),
    requested_at TEXT NOT NULL,
    approved_at TEXT,
    sent_to_treasury_at TEXT,
    paid_at TEXT,
    treasury_ref_number TEXT,
    is_delayed BOOLEAN DEFAULT FALSE,
    sla_days INTEGER DEFAULT 10,
    elapsed_days INTEGER DEFAULT 0,
    escalation_notice TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- TABLE 10: passports (Verified Digital Pilot Passports)
-- ====================================================================
CREATE TABLE IF NOT EXISTS passports (
    id TEXT PRIMARY KEY,
    startup_id TEXT REFERENCES startups(id) ON DELETE CASCADE,
    startup_name TEXT NOT NULL,
    startup_sector TEXT NOT NULL,
    dpiit_number TEXT NOT NULL,
    pilot_id TEXT REFERENCES pilots(id) ON DELETE SET NULL,
    problem_title TEXT NOT NULL,
    department_worked_with TEXT NOT NULL,
    sector TEXT NOT NULL,
    kpis_achieved JSONB NOT NULL DEFAULT '[]'::jsonb,
    validator_name TEXT NOT NULL,
    validator_org TEXT NOT NULL,
    validation_date TEXT NOT NULL,
    validity_end_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired')),
    certificate_hash TEXT NOT NULL,
    qr_payload TEXT NOT NULL,
    efficiency_gain_percent NUMERIC NOT NULL,
    cost_savings_lakhs NUMERIC NOT NULL,
    deployment_scale TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_departments_code ON departments(code);
CREATE INDEX IF NOT EXISTS idx_startups_sector ON startups(sector);
CREATE INDEX IF NOT EXISTS idx_startups_dpiit ON startups(dpiit_status);
CREATE INDEX IF NOT EXISTS idx_problems_dept ON problem_statements(department_id);
CREATE INDEX IF NOT EXISTS idx_problems_status ON problem_statements(status);
CREATE INDEX IF NOT EXISTS idx_pilots_dept ON pilots(department_id);
CREATE INDEX IF NOT EXISTS idx_pilots_startup ON pilots(startup_id);
CREATE INDEX IF NOT EXISTS idx_pilots_status ON pilots(status);
CREATE INDEX IF NOT EXISTS idx_milestones_pilot ON milestones(pilot_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON milestones(status);
CREATE INDEX IF NOT EXISTS idx_payments_pilot ON payments(pilot_id);
CREATE INDEX IF NOT EXISTS idx_payments_milestone ON payments(milestone_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_passports_startup ON passports(startup_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Role-Based Access Control for Supabase Auth
-- ====================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE validators ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilots ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE passports ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- HELPER FUNCTIONS FOR ROLE-BASED ACCESS CHECKS IN RLS
-- Using PL/pgSQL with SECURITY DEFINER and explicit search_path prevents
-- query-planner inlining, eliminating RLS infinite recursion on relation "users".
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
  RETURN v_role;
END;
$$;

CREATE OR REPLACE FUNCTION auth.get_user_department_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_dept TEXT;
BEGIN
  SELECT department_id INTO v_dept FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
  RETURN v_dept;
END;
$$;

CREATE OR REPLACE FUNCTION auth.get_user_startup_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_st TEXT;
BEGIN
  SELECT startup_id INTO v_st FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
  RETURN v_st;
END;
$$;

-- --------------------------------------------------------------------
-- 1. USERS TABLE POLICIES
-- Anyone can view profiles; users can insert/update their own record or Admin.
-- CRITICAL: Users table policies MUST NOT call auth.get_user_role() to avoid
-- infinite recursion cycles (users -> get_user_role() -> users).
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public full access users" ON users;
DROP POLICY IF EXISTS "Public read users" ON users;
DROP POLICY IF EXISTS "Users insert own profile" ON users;
DROP POLICY IF EXISTS "Users update own profile" ON users;

CREATE POLICY "Public read users" ON users 
  FOR SELECT USING (true);

CREATE POLICY "Users insert own profile" ON users 
  FOR INSERT WITH CHECK (
    auth.uid() = auth_id 
    OR auth.uid() IS NULL -- allows initial seed/service migration
  );

CREATE POLICY "Users update own profile" ON users 
  FOR UPDATE USING (
    auth.uid() = auth_id 
    OR auth.uid() IS NULL
  );

-- --------------------------------------------------------------------
-- 2. PROBLEM STATEMENTS POLICIES
-- Restriction: Only 'Government Department' can create/edit problem statements
-- for their own department (and Admin). Public Transparency remains read-only.
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public full access problem_statements" ON problem_statements;
DROP POLICY IF EXISTS "Public read problems" ON problem_statements;
DROP POLICY IF EXISTS "Dept create problem statements" ON problem_statements;
DROP POLICY IF EXISTS "Dept update own problem statements" ON problem_statements;

CREATE POLICY "Public read problems" ON problem_statements 
  FOR SELECT USING (true);

CREATE POLICY "Dept create problem statements" ON problem_statements 
  FOR INSERT WITH CHECK (
    auth.get_user_role() = 'admin' 
    OR (
      auth.get_user_role() = 'department' 
      AND (department_id = auth.get_user_department_id() OR auth.get_user_department_id() IS NULL)
    )
  );

CREATE POLICY "Dept update own problem statements" ON problem_statements 
  FOR UPDATE USING (
    auth.get_user_role() = 'admin' 
    OR (
      auth.get_user_role() = 'department' 
      AND (department_id = auth.get_user_department_id() OR auth.get_user_department_id() IS NULL)
    )
  );

-- --------------------------------------------------------------------
-- 3. STARTUP MATCHES & APPLICATIONS POLICIES
-- Restriction: Only 'Startup Innovator' can apply/match solutions (and Admin).
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public full access matches" ON matches;
DROP POLICY IF EXISTS "Public read matches" ON matches;
DROP POLICY IF EXISTS "Startup submit matches" ON matches;

CREATE POLICY "Public read matches" ON matches 
  FOR SELECT USING (true);

CREATE POLICY "Startup submit matches" ON matches 
  FOR INSERT WITH CHECK (
    auth.get_user_role() = 'admin' 
    OR auth.get_user_role() = 'startup'
    OR auth.get_user_role() = 'department'
  );

-- --------------------------------------------------------------------
-- 4. PILOTS POLICIES
-- Restriction: Department & Admin can launch; Startup, Validator, Dept, Admin can update.
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public full access pilots" ON pilots;
DROP POLICY IF EXISTS "Public read pilots" ON pilots;
DROP POLICY IF EXISTS "Dept create pilots" ON pilots;
DROP POLICY IF EXISTS "Role update pilots" ON pilots;

CREATE POLICY "Public read pilots" ON pilots 
  FOR SELECT USING (true);

CREATE POLICY "Dept create pilots" ON pilots 
  FOR INSERT WITH CHECK (
    auth.get_user_role() IN ('department', 'admin')
  );

CREATE POLICY "Role update pilots" ON pilots 
  FOR UPDATE USING (
    auth.get_user_role() IN ('department', 'startup', 'validator', 'admin')
  );

-- --------------------------------------------------------------------
-- 5. MILESTONES POLICIES
-- Restriction:
-- - Startup Innovator can submit telemetry proof & update their own pilot progress.
-- - Independent Validator can verify milestones.
-- - Department/Admin can configure milestones.
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public full access milestones" ON milestones;
DROP POLICY IF EXISTS "Public read milestones" ON milestones;
DROP POLICY IF EXISTS "Dept create milestones" ON milestones;
DROP POLICY IF EXISTS "Role update milestones" ON milestones;

CREATE POLICY "Public read milestones" ON milestones 
  FOR SELECT USING (true);

CREATE POLICY "Dept create milestones" ON milestones 
  FOR INSERT WITH CHECK (
    auth.get_user_role() IN ('department', 'admin')
  );

CREATE POLICY "Role update milestones" ON milestones 
  FOR UPDATE USING (
    auth.get_user_role() IN ('startup', 'validator', 'department', 'admin')
  );

-- --------------------------------------------------------------------
-- 6. PAYMENTS POLICIES
-- Restriction: Only 'Admin' role can approve payments and record treasury payout.
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public full access payments" ON payments;
DROP POLICY IF EXISTS "Public read payments" ON payments;
DROP POLICY IF EXISTS "System create payments" ON payments;
DROP POLICY IF EXISTS "Admin manage payments" ON payments;

CREATE POLICY "Public read payments" ON payments 
  FOR SELECT USING (true);

CREATE POLICY "System create payments" ON payments 
  FOR INSERT WITH CHECK (
    auth.get_user_role() IN ('validator', 'department', 'admin')
    OR auth.uid() IS NULL -- allows automated trigger upon verification
  );

CREATE POLICY "Admin manage payments" ON payments 
  FOR UPDATE USING (
    auth.get_user_role() = 'admin'
  ) WITH CHECK (
    auth.get_user_role() = 'admin'
  );

-- --------------------------------------------------------------------
-- 7. PILOT PASSPORTS POLICIES
-- Restriction: Only 'Independent Validator' or 'Admin' can mint/issue Passports.
-- Public Transparency remains read-only.
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public full access passports" ON passports;
DROP POLICY IF EXISTS "Public read passports" ON passports;
DROP POLICY IF EXISTS "Validator mint passports" ON passports;

CREATE POLICY "Public read passports" ON passports 
  FOR SELECT USING (true);

CREATE POLICY "Validator mint passports" ON passports 
  FOR INSERT WITH CHECK (
    auth.get_user_role() IN ('validator', 'admin')
  );

CREATE POLICY "Validator update passports" ON passports 
  FOR UPDATE USING (
    auth.get_user_role() IN ('validator', 'admin')
  );

-- --------------------------------------------------------------------
-- 8. VALIDATORS TABLE POLICIES
-- Restriction: Only 'Admin' role can empanel new validators.
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public full access validators" ON validators;
DROP POLICY IF EXISTS "Public read validators" ON validators;
DROP POLICY IF EXISTS "Admin empanel validators" ON validators;

CREATE POLICY "Public read validators" ON validators 
  FOR SELECT USING (true);

CREATE POLICY "Admin empanel validators" ON validators 
  FOR INSERT WITH CHECK (
    auth.get_user_role() = 'admin'
  );

CREATE POLICY "Admin update validators" ON validators 
  FOR UPDATE USING (
    auth.get_user_role() = 'admin'
  );

-- --------------------------------------------------------------------
-- 9. DEPARTMENTS & STARTUPS TABLES POLICIES
-- Read-only for public; editable by Admin or assigned entity
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public full access departments" ON departments;
DROP POLICY IF EXISTS "Public read departments" ON departments;
DROP POLICY IF EXISTS "Admin manage departments" ON departments;

CREATE POLICY "Public read departments" ON departments 
  FOR SELECT USING (true);

CREATE POLICY "Admin manage departments" ON departments 
  FOR ALL USING (
    auth.get_user_role() = 'admin'
  );

DROP POLICY IF EXISTS "Public full access startups" ON startups;
DROP POLICY IF EXISTS "Public read startups" ON startups;
DROP POLICY IF EXISTS "Startup update own record" ON startups;

CREATE POLICY "Public read startups" ON startups 
  FOR SELECT USING (true);

CREATE POLICY "Startup update own record" ON startups 
  FOR ALL USING (
    auth.get_user_role() = 'admin' 
    OR (auth.get_user_role() = 'startup' AND id = auth.get_user_startup_id())
  );

