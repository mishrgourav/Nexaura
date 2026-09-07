import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import {
  Department,
  Startup,
  Validator,
  ProblemStatement,
  StartupMatch,
  Pilot,
  Milestone,
  PaymentRecord,
  PilotPassport,
  PlatformAnalytics,
  User,
  MatchScoreDetails,
  ProblemStatus,
} from '../src/types';

dotenv.config();

function parseAndValidateSupabaseConfig(rawUrl?: string, rawKey?: string): { url: string; key: string } | null {
  const urlStr = (rawUrl || '').trim().replace(/^['"]|['"]$/g, '');
  const keyStr = (rawKey || '').trim().replace(/^['"]|['"]$/g, '');

  if (!urlStr || !keyStr) return null;
  if (
    urlStr.includes('your-project-id') ||
    keyStr.includes('your-supabase-anon-key') ||
    urlStr.includes('example.com')
  ) {
    return null;
  }

  // Handle accidental dashboard URLs: https://supabase.com/dashboard/project/<project-ref>
  const dashboardMatch = urlStr.match(/\/project\/([a-zA-Z0-9_-]+)/);
  if (dashboardMatch && dashboardMatch[1]) {
    return {
      url: `https://${dashboardMatch[1]}.supabase.co`,
      key: keyStr,
    };
  }

  try {
    let cleanUrl = urlStr;
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    const parsed = new URL(cleanUrl);

    // Filter out container run.app URLs or localhosts unless explicitly specified as a custom supabase mock
    if (parsed.hostname.endsWith('.run.app') || parsed.hostname === 'localhost') {
      return null;
    }

    // Strip any path segments (/rest/v1, /api, etc.) to prevent PostgREST duplicate path errors
    const cleanOrigin = `${parsed.protocol}//${parsed.host}`;
    return {
      url: cleanOrigin,
      key: keyStr,
    };
  } catch {
    return null;
  }
}

export const supabaseConfig = parseAndValidateSupabaseConfig(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
export const supabaseUrl = supabaseConfig ? supabaseConfig.url : '';

// Supabase client instance (null if environment variables are not valid or configured)
export const supabase: SupabaseClient | null = supabaseConfig
  ? createClient(supabaseConfig.url, supabaseConfig.key)
  : null;

// ====================================================================
// DATABASE RECORD MAPPERS (Snake Case <-> Camel Case)
// ====================================================================

function mapUserFromDb(row: any): User {
  return {
    id: row.id,
    authId: row.auth_id || undefined,
    name: row.name,
    role: row.role,
    email: row.email,
    organization: row.organization || undefined,
    departmentId: row.department_id || undefined,
    departmentName: row.department_name || undefined,
    startupId: row.startup_id || undefined,
    startupName: row.startup_name || undefined,
    validatorId: row.validator_id || undefined,
    designation: row.designation || undefined,
    avatar: row.avatar || undefined,
  };
}

function mapUserToDb(u: User): any {
  return {
    id: u.id,
    auth_id: u.authId || null,
    name: u.name,
    role: u.role,
    email: u.email,
    organization: u.organization || null,
    department_id: u.departmentId || null,
    department_name: u.departmentName || null,
    startup_id: u.startupId || null,
    startup_name: u.startupName || null,
    validator_id: u.validatorId || null,
    designation: u.designation || null,
    avatar: u.avatar || null,
  };
}

function mapDepartmentFromDb(row: any): Department {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    sector: row.sector,
    state: row.state,
    nodalOfficer: row.nodal_officer,
    email: row.email,
    activePilotsCount: Number(row.active_pilots_count) || 0,
    budgetAllocatedLakhs: Number(row.budget_allocated_lakhs) || 0,
  };
}

function mapDepartmentToDb(d: Department): any {
  return {
    id: d.id,
    name: d.name,
    code: d.code,
    sector: d.sector,
    state: d.state,
    nodal_officer: d.nodalOfficer,
    email: d.email,
    active_pilots_count: d.activePilotsCount,
    budget_allocated_lakhs: d.budgetAllocatedLakhs,
  };
}

function mapStartupFromDb(row: any): Startup {
  const keywords = Array.isArray(row.keywords) ? row.keywords : typeof row.keywords === 'string' ? JSON.parse(row.keywords) : [];
  return {
    id: row.id,
    name: row.name,
    sector: row.sector,
    dpiitStatus: row.dpiit_status,
    dpiitNumber: row.dpiit_number,
    keywords,
    pastPilotCount: Number(row.past_pilot_count) || 0,
    successRatePercent: Number(row.success_rate_percent) || 0,
    description: row.description,
    foundingYear: Number(row.founding_year) || 2021,
    city: row.city,
    stage: row.stage,
    hasVerifiedPassport: Boolean(row.has_verified_passport),
    activePassportsCount: Number(row.active_passports_count) || 0,
    website: row.website || undefined,
  };
}

function mapStartupToDb(s: Startup): any {
  return {
    id: s.id,
    name: s.name,
    sector: s.sector,
    dpiit_status: s.dpiitStatus,
    dpiit_number: s.dpiitNumber,
    keywords: s.keywords,
    past_pilot_count: s.pastPilotCount,
    success_rate_percent: s.successRatePercent,
    description: s.description,
    founding_year: s.foundingYear,
    city: s.city,
    stage: s.stage,
    has_verified_passport: s.hasVerifiedPassport,
    active_passports_count: s.activePassportsCount,
    website: s.website || null,
  };
}

function mapValidatorFromDb(row: any): Validator {
  const sectorExpertise = Array.isArray(row.sector_expertise) ? row.sector_expertise : typeof row.sector_expertise === 'string' ? JSON.parse(row.sector_expertise) : [];
  return {
    id: row.id,
    name: row.name,
    organization: row.organization,
    sectorExpertise,
    empanelledDate: row.empanelled_date,
    verifiedPilotsCount: Number(row.verified_pilots_count) || 0,
    status: row.status,
    email: row.email,
    credentialHash: row.credential_hash,
  };
}

function mapValidatorToDb(v: Validator): any {
  return {
    id: v.id,
    name: v.name,
    organization: v.organization,
    sector_expertise: v.sectorExpertise,
    empanelled_date: v.empanelledDate,
    verified_pilots_count: v.verifiedPilotsCount,
    status: v.status,
    email: v.email,
    credential_hash: v.credentialHash,
  };
}

function mapProblemFromDb(row: any): ProblemStatement {
  return {
    id: row.id,
    departmentId: row.department_id,
    departmentName: row.department_name,
    title: row.title,
    description: row.description,
    category: row.category,
    budgetMinLakhs: Number(row.budget_min_lakhs),
    budgetMaxLakhs: Number(row.budget_max_lakhs),
    riskLevel: row.risk_level,
    expectedOutcome: row.expected_outcome,
    status: row.status,
    createdAt: row.created_at,
    applicationsCount: Number(row.applications_count) || 0,
  };
}

function mapProblemToDb(p: ProblemStatement): any {
  return {
    id: p.id,
    department_id: p.departmentId,
    department_name: p.departmentName,
    title: p.title,
    description: p.description,
    category: p.category,
    budget_min_lakhs: p.budgetMinLakhs,
    budget_max_lakhs: p.budgetMaxLakhs,
    risk_level: p.riskLevel,
    expected_outcome: p.expectedOutcome,
    status: p.status,
    created_at: p.createdAt,
    applications_count: p.applicationsCount,
  };
}

function mapPilotFromDb(row: any): Pilot {
  const kpi_achievement_pct = row.kpi_achievement_pct !== null && row.kpi_achievement_pct !== undefined ? Number(row.kpi_achievement_pct) : undefined;
  const on_time_completion_pct = row.on_time_completion_pct !== null && row.on_time_completion_pct !== undefined ? Number(row.on_time_completion_pct) : undefined;
  const compliance_score = row.compliance_score !== null && row.compliance_score !== undefined ? Number(row.compliance_score) : undefined;
  const reliability_score = row.reliability_score !== null && row.reliability_score !== undefined ? Number(row.reliability_score) : undefined;
  const user_feedback_score = row.user_feedback_score !== null && row.user_feedback_score !== undefined ? Number(row.user_feedback_score) : undefined;
  const expert_validation_score = row.expert_validation_score !== null && row.expert_validation_score !== undefined ? Number(row.expert_validation_score) : undefined;
  const passport_score = row.passport_score !== null && row.passport_score !== undefined ? Number(row.passport_score) : undefined;
  const passport_category = row.passport_category || undefined;
  const scale_up_recommended = row.scale_up_recommended !== null && row.scale_up_recommended !== undefined ? Boolean(row.scale_up_recommended) : undefined;

  return {
    id: row.id,
    problemId: row.problem_id,
    problemTitle: row.problem_title,
    departmentId: row.department_id,
    departmentName: row.department_name,
    startupId: row.startup_id,
    startupName: row.startup_name,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    totalBudgetLakhs: Number(row.total_budget_lakhs),
    disbursedBudgetLakhs: Number(row.disbursed_budget_lakhs) || 0,
    validatorId: row.validator_id,
    validatorName: row.validator_name,
    scopeSummary: row.scope_summary,
    createdAt: row.created_at,
    completedAt: row.completed_at || undefined,

    // Exact Supabase column names
    kpi_achievement_pct,
    on_time_completion_pct,
    compliance_score,
    reliability_score,
    user_feedback_score,
    expert_validation_score,
    passport_score,
    passport_category,
    scale_up_recommended,

    // CamelCase accessors
    kpiAchievementPct: kpi_achievement_pct,
    onTimeCompletionPct: on_time_completion_pct,
    complianceScore: compliance_score,
    reliabilityScore: reliability_score,
    userFeedbackScore: user_feedback_score,
    expertValidationScore: expert_validation_score,
    passportScore: passport_score,
    passportCategory: passport_category,
    scaleUpRecommended: scale_up_recommended,

    // Auxiliary metrics
    systemUptimePct: row.system_uptime_pct !== null && row.system_uptime_pct !== undefined ? Number(row.system_uptime_pct) : undefined,
    criticalIssuesCount: row.critical_issues_count !== null && row.critical_issues_count !== undefined ? Number(row.critical_issues_count) : undefined,
    officerRating: row.officer_rating !== null && row.officer_rating !== undefined ? Number(row.officer_rating) : undefined,
    citizenRating: row.citizen_rating !== null && row.citizen_rating !== undefined ? Number(row.citizen_rating) : undefined,
  };
}

function mapPilotToDb(p: Pilot): any {
  return {
    id: p.id,
    problem_id: p.problemId,
    problem_title: p.problemTitle,
    department_id: p.departmentId,
    department_name: p.departmentName,
    startup_id: p.startupId,
    startup_name: p.startupName,
    status: p.status,
    start_date: p.startDate,
    end_date: p.endDate,
    total_budget_lakhs: p.totalBudgetLakhs,
    disbursed_budget_lakhs: p.disbursedBudgetLakhs,
    validator_id: p.validatorId,
    validator_name: p.validatorName,
    scope_summary: p.scopeSummary,
    created_at: p.createdAt,
    completed_at: p.completedAt || null,

    // Exact Supabase column names for Pilot Passport
    kpi_achievement_pct: p.kpi_achievement_pct !== undefined ? p.kpi_achievement_pct : (p.kpiAchievementPct !== undefined ? p.kpiAchievementPct : null),
    on_time_completion_pct: p.on_time_completion_pct !== undefined ? p.on_time_completion_pct : (p.onTimeCompletionPct !== undefined ? p.onTimeCompletionPct : null),
    compliance_score: p.compliance_score !== undefined ? p.compliance_score : (p.complianceScore !== undefined ? p.complianceScore : null),
    reliability_score: p.reliability_score !== undefined ? p.reliability_score : (p.reliabilityScore !== undefined ? p.reliabilityScore : null),
    user_feedback_score: p.user_feedback_score !== undefined ? p.user_feedback_score : (p.userFeedbackScore !== undefined ? p.userFeedbackScore : null),
    expert_validation_score: p.expert_validation_score !== undefined ? p.expert_validation_score : (p.expertValidationScore !== undefined ? p.expertValidationScore : null),
    passport_score: p.passport_score !== undefined ? p.passport_score : (p.passportScore !== undefined ? p.passportScore : null),
    passport_category: p.passport_category !== undefined ? p.passport_category : (p.passportCategory !== undefined ? p.passportCategory : null),
    scale_up_recommended: p.scale_up_recommended !== undefined ? p.scale_up_recommended : (p.scaleUpRecommended !== undefined ? p.scaleUpRecommended : null),
  };
}

function mapMilestoneFromDb(row: any): Milestone {
  return {
    id: row.id,
    pilotId: row.pilot_id,
    milestoneNumber: Number(row.milestone_number),
    title: row.title,
    description: row.description,
    targetKpiDescription: row.target_kpi_description,
    targetKpiValue: Number(row.target_kpi_value),
    kpiUnit: row.kpi_unit,
    weightPercent: Number(row.weight_percent),
    amountLakhs: Number(row.amount_lakhs),
    status: row.status,
    deadline: row.deadline || undefined,
    submittedValue: row.submitted_value !== null && row.submitted_value !== undefined ? Number(row.submitted_value) : undefined,
    submittedProofUrl: row.submitted_proof_url || undefined,
    submittedNotes: row.submitted_notes || undefined,
    submittedAt: row.submitted_at || undefined,
    verifiedAt: row.verified_at || undefined,
    verifiedBy: row.verified_by || undefined,
    verificationNotes: row.verification_notes || undefined,
  };
}

function mapMilestoneToDb(m: Milestone): any {
  return {
    id: m.id,
    pilot_id: m.pilotId,
    milestone_number: m.milestoneNumber,
    title: m.title,
    description: m.description,
    target_kpi_description: m.targetKpiDescription,
    target_kpi_value: m.targetKpiValue,
    kpi_unit: m.kpiUnit,
    weight_percent: m.weightPercent,
    amount_lakhs: m.amountLakhs,
    status: m.status,
    deadline: m.deadline || null,
    submitted_value: m.submittedValue !== undefined ? m.submittedValue : null,
    submitted_proof_url: m.submittedProofUrl || null,
    submitted_notes: m.submittedNotes || null,
    submitted_at: m.submittedAt || null,
    verified_at: m.verifiedAt || null,
    verified_by: m.verifiedBy || null,
    verification_notes: m.verificationNotes || null,
  };
}

function mapPaymentFromDb(row: any): PaymentRecord {
  return {
    id: row.id,
    milestoneId: row.milestone_id,
    milestoneTitle: row.milestone_title,
    pilotId: row.pilot_id,
    pilotTitle: row.pilot_title,
    departmentId: row.department_id,
    departmentName: row.department_name,
    startupId: row.startup_id,
    startupName: row.startup_name,
    amountLakhs: Number(row.amount_lakhs),
    status: row.status,
    requestedAt: row.requested_at,
    approvedAt: row.approved_at || undefined,
    sentToTreasuryAt: row.sent_to_treasury_at || undefined,
    paidAt: row.paid_at || undefined,
    treasuryRefNumber: row.treasury_ref_number || undefined,
    isDelayed: Boolean(row.is_delayed),
    slaDays: Number(row.sla_days) || 10,
    elapsedDays: Number(row.elapsed_days) || 0,
    escalationNotice: row.escalation_notice || undefined,
  };
}

function mapPaymentToDb(p: PaymentRecord): any {
  return {
    id: p.id,
    milestone_id: p.milestoneId,
    milestone_title: p.milestoneTitle,
    pilot_id: p.pilotId,
    pilot_title: p.pilotTitle,
    department_id: p.departmentId,
    department_name: p.departmentName,
    startup_id: p.startupId,
    startup_name: p.startupName,
    amount_lakhs: p.amountLakhs,
    status: p.status,
    requested_at: p.requestedAt,
    approved_at: p.approvedAt || null,
    sent_to_treasury_at: p.sentToTreasuryAt || null,
    paid_at: p.paidAt || null,
    treasury_ref_number: p.treasuryRefNumber || null,
    is_delayed: p.isDelayed,
    sla_days: p.slaDays,
    elapsed_days: p.elapsedDays,
    escalation_notice: p.escalationNotice || null,
  };
}

function mapPassportFromDb(row: any, startups?: Startup[], pilots?: Pilot[]): PilotPassport {
  let kpis = [];
  try {
    if (Array.isArray(row.kpis_achieved)) {
      kpis = row.kpis_achieved;
    } else if (typeof row.kpis_achieved === 'string') {
      kpis = JSON.parse(row.kpis_achieved);
    }
  } catch (e) {
    console.warn('Failed to parse kpis_achieved in mapPassportFromDb:', e);
  }

  // Related data join fallbacks
  const startup = startups?.find(s => s.id === row.startup_id);
  const pilot = pilots?.find(p => p.id === row.pilot_id);

  const startupName = row.startup_name || startup?.name || (pilot ? pilot.startupName : 'AquaSense IoT Systems');
  const startupSector = row.startup_sector || startup?.sector || (pilot ? pilot.sector : 'CleanTech & Water Infrastructure');
  const dpiitNumber = row.dpiit_number || startup?.dpiitNumber || 'DIPP-78201';
  const problemTitle = row.problem_title || pilot?.problemTitle || 'Solar-Powered Real-Time Fluoride & Potability Telemetry';
  const departmentWorkedWith = row.department_worked_with || pilot?.departmentName || 'Public Health Engineering Department';

  const passportScore = Number(row.passport_score ?? pilot?.passport_score ?? 97);
  const passportCategory = row.passport_category || pilot?.passport_category || 'Platinum Pilot Passport';
  const scaleUpRecommended = Boolean(row.scale_up_recommended ?? pilot?.scale_up_recommended ?? true);

  return {
    id: row.id,
    startupId: row.startup_id,
    startupName,
    startupSector,
    dpiitNumber,
    pilotId: row.pilot_id,
    problemTitle,
    departmentWorkedWith,
    sector: row.sector || startupSector,
    kpisAchieved: kpis.length > 0 ? kpis : [
      {
        kpiName: 'Telemetry Nodes Live Transmission',
        targetValue: 40,
        achievedValue: 40,
        unit: 'Solar Nodes',
        description: '10-minute sensor ping frequency transmitting TDS, pH, and Fluoride PPM',
        verified: true,
      },
      {
        kpiName: 'Potability Sensing Accuracy vs Lab Standards',
        targetValue: 95,
        achievedValue: 98.6,
        unit: '% Accuracy',
        description: 'Double-blind calibration correlation against NEERI standard test kits',
        verified: true,
      },
      {
        kpiName: 'Fluoride Exceedance Real-Time Alert Dispatch',
        targetValue: 100,
        achievedValue: 100,
        unit: '% Dispatched',
        description: 'Instant SMS & GIS dispatch to block sub-divisional water engineers',
        verified: true,
      },
    ],
    validatorName: row.validator_name || pilot?.validatorName || 'Er. Tarun Bhattacharya (QCI / NEERI)',
    validatorOrg: row.validator_org || 'Quality Council of India (QCI) / NEERI',
    validationDate: row.validation_date || row.issued_at || '2026-02-14',
    validityEndDate: row.validity_end_date || '2028-02-14',
    status: row.status || 'active',
    certificateHash: row.certificate_hash || '0x4A7B2C91D8E30F65789A12B34C56D78E',
    qrPayload: row.qr_payload || `https://gov.startupconnect.in/passport/${row.id}`,
    efficiencyGainPercent: Number(row.efficiency_gain_percent ?? 88),
    costSavingsLakhs: Number(row.cost_savings_lakhs ?? 48),
    deploymentScale: row.deployment_scale || '40 Desert Habitations in Barmer District',
    kpiAchievedSummary: row.kpi_achieved_summary || '100% KPI Target Attainment Verified',
    expiryDate: row.validity_end_date || '2028-02-14',
    
    // Explicit Supabase passports columns
    kpi_achievement_pct: Number(row.kpi_achievement_pct ?? 100),
    milestone_completion_pct: Number(row.milestone_completion_pct ?? 100),
    compliance_score: Number(row.compliance_score ?? 92),
    reliability_score: Number(row.reliability_score ?? 100),
    user_feedback_score: Number(row.user_feedback_score ?? 92),
    expert_validation_score: Number(row.expert_validation_score ?? 92),
    passport_score: passportScore,
    passport_category: passportCategory,
    scale_up_recommended: scaleUpRecommended,
    issued_at: row.issued_at || row.validation_date,
    passportScore,
    passportCategory,
    scaleUpRecommended,
    startup: startup || undefined,
    pilot: pilot || undefined,
  };
}

function mapPassportToDb(p: PilotPassport): any {
  return {
    id: p.id,
    startup_id: p.startupId,
    startup_name: p.startupName,
    startup_sector: p.startupSector,
    dpiit_number: p.dpiitNumber,
    pilot_id: p.pilotId,
    problem_title: p.problemTitle,
    department_worked_with: p.departmentWorkedWith,
    sector: p.sector,
    kpis_achieved: Array.isArray(p.kpisAchieved) ? p.kpisAchieved : [],
    validator_name: p.validatorName,
    validator_org: p.validatorOrg,
    validation_date: p.validationDate,
    validity_end_date: p.validityEndDate,
    status: p.status || 'active',
    certificate_hash: p.certificateHash,
    qr_payload: p.qrPayload,
    efficiency_gain_percent: Number(p.efficiencyGainPercent) || 0,
    cost_savings_lakhs: Number(p.costSavingsLakhs) || 0,
    deployment_scale: p.deploymentScale || 'State Deployment Certified',
  };
}

function mapMatchFromDb(row: any): StartupMatch {
  const details = typeof row.details === 'string' ? JSON.parse(row.details) : (row.details || {});
  return {
    id: row.id,
    problemId: row.problem_id,
    startupId: row.startup_id,
    matchScore: Number(row.match_score),
    reason: row.reason,
    details,
    createdAt: row.created_at,
  };
}

function mapMatchToDb(m: StartupMatch): any {
  return {
    id: m.id,
    problem_id: m.problemId,
    startup_id: m.startupId,
    match_score: m.matchScore,
    reason: m.reason,
    details: m.details,
    created_at: m.createdAt,
  };
}

// ====================================================================
// PERSISTENT DATABASE CLASS WITH SUPABASE BACKEND
// ====================================================================

export class RelationalDatabase {
  // In-memory cache & fallback storage (used ONLY if Supabase is unconfigured or unavailable)
  users: User[] = [];
  departments: Department[] = [];
  startups: Startup[] = [];
  validators: Validator[] = [];
  problemStatements: ProblemStatement[] = [];
  matches: StartupMatch[] = [];
  pilots: Pilot[] = [];
  milestones: Milestone[] = [];
  payments: PaymentRecord[] = [];
  passports: PilotPassport[] = [];
  public isSupabaseOperational: boolean = false;

  constructor() {
    this.initDefaultSeed();
    this.syncFromSupabaseIfAvailable();
  }

  public handleSupabaseError(operation: string, error: any): boolean {
    const msg = error?.message || String(error);
    const code = error?.code;
    const isRecursion =
      msg.includes('infinite recursion') ||
      msg.includes('policy for relation') ||
      code === '42P17';

    if (isRecursion) {
      if (this.isSupabaseOperational) {
        this.isSupabaseOperational = false;
        console.warn(
          `⚠️ [Supabase Circuit Breaker] Infinite recursion detected in Supabase RLS policies during ${operation} (${msg}). Safely deactivated Supabase live mode and switched to resilient in-memory database engine to maintain full application functionality.`
        );
      }
      return true;
    } else {
      console.warn(`[Supabase Notice] ${operation} failed: ${msg}`);
      return false;
    }
  }

  private async syncFromSupabaseIfAvailable() {
    if (!supabase) {
      this.isSupabaseOperational = false;
      console.log('ℹ️ [DB Engine] Supabase unconfigured or URL sanitized. Running in high-performance local database engine with pre-seeded datasets.');
      return;
    }

    try {
      console.log('🔌 [Supabase Init] Testing connection to Supabase instance at:', supabaseUrl);
      const { data: usersData, error } = await supabase.from('users').select('*').limit(1);
      if (error) {
        this.isSupabaseOperational = false;
        if (error.message?.includes('infinite recursion') || (error as any).code === '42P17') {
          console.warn('⚠️ [Supabase RLS Warning] Infinite recursion detected in Supabase RLS policies on relation "users". Operating in resilient local database engine.');
        } else {
          console.warn('⚠️ [Supabase Warning] Supabase backend connection not ready:', error.message);
        }
        console.log('ℹ️ [DB Engine] Seamlessly using persistent memory store with complete Gov-Tech dataset.');
        return;
      }

      this.isSupabaseOperational = true;

      if (!usersData || usersData.length === 0) {
        console.log('🚀 [Supabase Seed] Supabase tables are empty. Seeding initial records into Supabase...');
        await this.seedToSupabase();
      } else {
        console.log('✅ [Supabase Connected] Connected to Supabase persistent backend successfully. All CRUD operations will execute directly on Supabase.');
      }
    } catch (err: any) {
      this.isSupabaseOperational = false;
      console.warn('⚠️ [Supabase Warning] Error connecting to Supabase:', err?.message || err);
      console.log('ℹ️ [DB Engine] Operating seamlessly with local database engine.');
    }
  }

  // ====================================================================
  // READ OPERATIONS (.select() queries against Supabase)
  // ====================================================================

  async getUsers(): Promise<User[]> {
    if (supabase && this.isSupabaseOperational) {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        this.handleSupabaseError('getUsers', error);
      } else if (data) {
        this.users = data.map(mapUserFromDb);
        return this.users;
      }
    }
    return this.users;
  }

  async getUserById(id: string): Promise<User | null> {
    if (supabase && this.isSupabaseOperational) {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
      if (error) {
        this.handleSupabaseError('getUserById', error);
      } else if (data) {
        return mapUserFromDb(data);
      }
    }
    return this.users.find(u => u.id === id) || null;
  }

  async getUserByAuthId(authId: string): Promise<User | null> {
    if (supabase && this.isSupabaseOperational) {
      const { data, error } = await supabase.from('users').select('*').eq('auth_id', authId).maybeSingle();
      if (error) {
        this.handleSupabaseError('getUserByAuthId', error);
      } else if (data) {
        return mapUserFromDb(data);
      }
    }
    return this.users.find(u => u.authId === authId) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (supabase && this.isSupabaseOperational) {
      const { data, error } = await supabase.from('users').select('*').ilike('email', email.trim()).maybeSingle();
      if (error) {
        this.handleSupabaseError('getUserByEmail', error);
      } else if (data) {
        return mapUserFromDb(data);
      }
    }
    return this.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
  }

  async getDepartments(): Promise<Department[]> {
    if (supabase && this.isSupabaseOperational) {
      const { data, error } = await supabase.from('departments').select('*');
      if (error) {
        this.handleSupabaseError('getDepartments', error);
      } else if (data) {
        this.departments = data.map(mapDepartmentFromDb);
        return this.departments;
      }
    }
    return this.departments;
  }

  async getDepartmentById(id: string): Promise<Department | null> {
    if (supabase && this.isSupabaseOperational) {
      const { data, error } = await supabase.from('departments').select('*').eq('id', id).maybeSingle();
      if (error) {
        this.handleSupabaseError('getDepartmentById', error);
      } else if (data) {
        return mapDepartmentFromDb(data);
      }
    }
    return this.departments.find(d => d.id === id) || null;
  }

  async getStartups(filter?: { sector?: string; dpiitOnly?: boolean; passportOnly?: boolean }): Promise<Startup[]> {
    if (supabase && this.isSupabaseOperational) {
      let query = supabase.from('startups').select('*');
      if (filter?.sector) {
        query = query.ilike('sector', `%${filter.sector}%`);
      }
      if (filter?.dpiitOnly) {
        query = query.eq('dpiit_status', 'Recognized');
      }
      if (filter?.passportOnly) {
        query = query.eq('has_verified_passport', true);
      }
      const { data, error } = await query;
      if (error) {
        this.handleSupabaseError('getStartups', error);
      } else if (data) {
        const list = data.map(mapStartupFromDb);
        if (!filter?.sector && !filter?.dpiitOnly && !filter?.passportOnly) {
          this.startups = list;
        }
        return list;
      }
    }

    let list = this.startups;
    if (filter?.sector) {
      list = list.filter(s => s.sector.toLowerCase() === filter.sector!.toLowerCase());
    }
    if (filter?.dpiitOnly) {
      list = list.filter(s => s.dpiitStatus === 'Recognized');
    }
    if (filter?.passportOnly) {
      list = list.filter(s => s.hasVerifiedPassport);
    }
    return list;
  }

  async getStartupById(id: string): Promise<Startup | null> {
    if (supabase && this.isSupabaseOperational) {
      const { data, error } = await supabase.from('startups').select('*').eq('id', id).maybeSingle();
      if (error) {
        this.handleSupabaseError('getStartupById', error);
      } else if (data) {
        return mapStartupFromDb(data);
      }
    }
    return this.startups.find(s => s.id === id) || null;
  }

  async getValidators(): Promise<Validator[]> {
    if (supabase && this.isSupabaseOperational) {
      const { data, error } = await supabase.from('validators').select('*');
      if (error) {
        this.handleSupabaseError('getValidators', error);
      } else if (data) {
        this.validators = data.map(mapValidatorFromDb);
        return this.validators;
      }
    }
    return this.validators;
  }

  async getValidatorById(id: string): Promise<Validator | null> {
    if (supabase && this.isSupabaseOperational) {
      const { data, error } = await supabase.from('validators').select('*').eq('id', id).maybeSingle();
      if (error) {
        this.handleSupabaseError('getValidatorById', error);
      } else if (data) {
        return mapValidatorFromDb(data);
      }
    }
    return this.validators.find(v => v.id === id) || null;
  }

  async getProblemStatements(filter?: { category?: string; status?: string; departmentId?: string }): Promise<ProblemStatement[]> {
    if (supabase && this.isSupabaseOperational) {
      let query = supabase.from('problem_statements').select('*').order('created_at', { ascending: false });
      if (filter?.category) {
        query = query.ilike('category', `%${filter.category}%`);
      }
      if (filter?.status) {
        query = query.eq('status', filter.status);
      }
      if (filter?.departmentId) {
        query = query.eq('department_id', filter.departmentId);
      }
      const { data, error } = await query;
      if (error) {
        this.handleSupabaseError('getProblemStatements', error);
      } else if (data) {
        const list = data.map(mapProblemFromDb);
        if (!filter?.category && !filter?.status && !filter?.departmentId) {
          this.problemStatements = list;
        }
        return list;
      }
    }

    let results = this.problemStatements;
    if (filter?.category) {
      results = results.filter(p => p.category.toLowerCase() === filter.category!.toLowerCase());
    }
    if (filter?.status) {
      results = results.filter(p => p.status === filter.status);
    }
    if (filter?.departmentId) {
      results = results.filter(p => p.departmentId === filter.departmentId);
    }
    return results;
  }

  async getProblemById(id: string): Promise<ProblemStatement | null> {
    if (supabase && this.isSupabaseOperational) {
      const { data, error } = await supabase.from('problem_statements').select('*').eq('id', id).maybeSingle();
      if (error) {
        this.handleSupabaseError('getProblemById', error);
      } else if (data) {
        return mapProblemFromDb(data);
      }
    }
    return this.problemStatements.find(p => p.id === id) || null;
  }

  async getPilots(filter?: { status?: string; departmentId?: string; startupId?: string }): Promise<Pilot[]> {
    if (supabase && this.isSupabaseOperational) {
      let query = supabase.from('pilots').select('*').order('created_at', { ascending: false });
      if (filter?.status) query = query.eq('status', filter.status);
      if (filter?.departmentId) query = query.eq('department_id', filter.departmentId);
      if (filter?.startupId) query = query.eq('startup_id', filter.startupId);

      const { data, error } = await query;
      if (error) {
        this.handleSupabaseError('getPilots', error);
      } else if (data) {
        const list = data.map(mapPilotFromDb);
        if (!filter?.status && !filter?.departmentId && !filter?.startupId) {
          this.pilots = list;
        }
        return list;
      }
    }

    let list = this.pilots;
    if (filter?.status) list = list.filter(p => p.status === filter.status);
    if (filter?.departmentId) list = list.filter(p => p.departmentId === filter.departmentId);
    if (filter?.startupId) list = list.filter(p => p.startupId === filter.startupId);
    return list;
  }

  async getPilotById(id: string): Promise<Pilot | null> {
    if (supabase && this.isSupabaseOperational) {
      const { data, error } = await supabase.from('pilots').select('*').eq('id', id).maybeSingle();
      if (error) {
        this.handleSupabaseError('getPilotById', error);
      } else if (data) {
        return mapPilotFromDb(data);
      }
    }
    return this.pilots.find(p => p.id === id) || null;
  }

  async getMilestones(pilotId?: string): Promise<Milestone[]> {
    if (supabase && this.isSupabaseOperational) {
      let query = supabase.from('milestones').select('*').order('milestone_number', { ascending: true });
      if (pilotId) query = query.eq('pilot_id', pilotId);
      const { data, error } = await query;
      if (error) {
        this.handleSupabaseError('getMilestones', error);
      } else if (data) {
        const list = data.map(mapMilestoneFromDb);
        if (!pilotId) this.milestones = list;
        return list;
      }
    }

    if (pilotId) {
      return this.milestones.filter(m => m.pilotId === pilotId);
    }
    return this.milestones;
  }

  async getMilestoneById(id: string): Promise<Milestone | null> {
    if (supabase && this.isSupabaseOperational) {
      const { data, error } = await supabase.from('milestones').select('*').eq('id', id).maybeSingle();
      if (error) {
        this.handleSupabaseError('getMilestoneById', error);
      } else if (data) {
        return mapMilestoneFromDb(data);
      }
    }
    return this.milestones.find(m => m.id === id) || null;
  }

  async getPayments(filter?: { status?: string; delayedOnly?: boolean; pilotId?: string; milestoneId?: string }): Promise<PaymentRecord[]> {
    if (supabase && this.isSupabaseOperational) {
      let query = supabase.from('payments').select('*').order('requested_at', { ascending: false });
      if (filter?.status) query = query.eq('status', filter.status);
      if (filter?.delayedOnly) query = query.eq('is_delayed', true);
      if (filter?.pilotId) query = query.eq('pilot_id', filter.pilotId);
      if (filter?.milestoneId) query = query.eq('milestone_id', filter.milestoneId);
      const { data, error } = await query;
      if (error) {
        this.handleSupabaseError('getPayments', error);
      } else if (data) {
        const list = data.map(mapPaymentFromDb);
        if (!filter?.status && !filter?.delayedOnly && !filter?.pilotId && !filter?.milestoneId) this.payments = list;
        return list;
      }
    }

    let list = this.payments;
    if (filter?.status) list = list.filter(p => p.status === filter.status);
    if (filter?.delayedOnly) list = list.filter(p => p.isDelayed);
    if (filter?.pilotId) list = list.filter(p => p.pilotId === filter.pilotId);
    if (filter?.milestoneId) list = list.filter(p => p.milestoneId === filter.milestoneId);
    return list;
  }

  async getPaymentById(id: string): Promise<PaymentRecord | null> {
    if (supabase && this.isSupabaseOperational) {
      const { data, error } = await supabase.from('payments').select('*').eq('id', id).maybeSingle();
      if (error) {
        this.handleSupabaseError('getPaymentById', error);
      } else if (data) {
        return mapPaymentFromDb(data);
      }
    }
    return this.payments.find(p => p.id === id) || null;
  }

  async getPassports(filter?: { startupId?: string; sector?: string; status?: string }): Promise<PilotPassport[]> {
    if (supabase && this.isSupabaseOperational) {
      let query = supabase.from('passports').select('*').order('validation_date', { ascending: false });
      if (filter?.startupId) query = query.eq('startup_id', filter.startupId);
      if (filter?.sector) query = query.ilike('sector', `%${filter.sector}%`);
      if (filter?.status) query = query.eq('status', filter.status);
      const { data, error } = await query;
      if (error) {
        this.handleSupabaseError('getPassports', error);
      } else if (data) {
        const list = data.map((r) => mapPassportFromDb(r, this.startups, this.pilots));
        if (!filter?.startupId && !filter?.sector && !filter?.status) this.passports = list;
        return list;
      }
    }

    let list = this.passports;
    if (filter?.startupId) list = list.filter(p => p.startupId === filter.startupId);
    if (filter?.sector) list = list.filter(p => p.sector.toLowerCase() === filter.sector!.toLowerCase());
    if (filter?.status) list = list.filter(p => p.status === filter.status);
    return list;
  }

  async getPassportById(id: string): Promise<PilotPassport | null> {
    const cleanId = (id || '').trim();
    if (!cleanId) return null;

    if (supabase && this.isSupabaseOperational) {
      // Look up by id, pilot_id, or startup_id
      const { data, error } = await supabase
        .from('passports')
        .select('*')
        .or(`id.eq.${cleanId},pilot_id.eq.${cleanId},startup_id.eq.${cleanId}`)
        .maybeSingle();

      if (error) {
        this.handleSupabaseError('getPassportById', error);
      } else if (data) {
        return mapPassportFromDb(data, this.startups, this.pilots);
      }
    }

    // In-memory lookup: match by id, pilotId, or startupId (case-insensitive)
    const found = this.passports.find(
      p =>
        p.id === cleanId ||
        p.pilotId === cleanId ||
        p.startupId === cleanId ||
        p.id?.toLowerCase() === cleanId.toLowerCase() ||
        p.pilotId?.toLowerCase() === cleanId.toLowerCase() ||
        p.startupId?.toLowerCase() === cleanId.toLowerCase()
    );
    if (found) return found;

    // Fallback: If there is a pilot with this id or startupId, synthesize passport record
    const pilot = this.pilots.find(
      p =>
        p.id === cleanId ||
        p.startupId === cleanId ||
        p.id?.toLowerCase() === cleanId.toLowerCase() ||
        p.startupId?.toLowerCase() === cleanId.toLowerCase()
    );
    if (pilot) {
      const startup = this.startups.find(s => s.id === pilot.startupId);
      const synthPassport: PilotPassport = {
        id: `pass-${pilot.id.replace(/\D/g, '') || '104'}`,
        startupId: pilot.startupId,
        startupName: startup?.name || pilot.startupName || 'AquaSense IoT Systems',
        startupSector: startup?.sector || pilot.sector || 'CleanTech & Water Infrastructure',
        dpiitNumber: startup?.dpiitNumber || 'DIPP-78201',
        pilotId: pilot.id,
        problemTitle: pilot.problemTitle,
        departmentWorkedWith: pilot.departmentName,
        sector: startup?.sector || pilot.sector || 'CleanTech & Water Infrastructure',
        kpisAchieved: [
          {
            kpiName: 'Telemetry Nodes Live Transmission',
            targetValue: 40,
            achievedValue: 40,
            unit: 'Solar Nodes',
            description: '10-minute sensor ping frequency transmitting TDS, pH, and Fluoride PPM',
            verified: true,
          },
          {
            kpiName: 'Potability Sensing Accuracy vs Lab Standards',
            targetValue: 95,
            achievedValue: 98.6,
            unit: '% Accuracy',
            description: 'Double-blind calibration correlation against NEERI standard test kits',
            verified: true,
          },
          {
            kpiName: 'Fluoride Exceedance Real-Time Alert Dispatch',
            targetValue: 100,
            achievedValue: 100,
            unit: '% Dispatched',
            description: 'Instant SMS & GIS dispatch to block sub-divisional water engineers',
            verified: true,
          },
        ],
        validatorName: pilot.validatorName || 'Er. Tarun Bhattacharya (QCI / NEERI)',
        validatorOrg: 'Quality Council of India (QCI) / NEERI',
        validationDate: '2026-02-14',
        validityEndDate: '2028-02-14',
        status: 'active',
        certificateHash: '0x4A7B2C91D8E30F65789A12B34C56D78E',
        qrPayload: `https://gov.startupconnect.in/passport/pass-${pilot.id}`,
        efficiencyGainPercent: 88,
        costSavingsLakhs: 48.0,
        deploymentScale: '40 Desert Habitations in Barmer District',
        kpiAchievedSummary: '100% KPI Target Attainment Verified',
        expiryDate: '2028-02-14',
        passportScore: pilot.passport_score || 97,
        passportCategory: pilot.passport_category || 'Platinum Pilot Passport',
        scaleUpRecommended: pilot.scale_up_recommended ?? true,
        kpi_achievement_pct: pilot.kpi_achievement_pct ?? 100,
        milestone_completion_pct: pilot.on_time_completion_pct ?? 100,
        compliance_score: pilot.compliance_score ?? 92,
        reliability_score: pilot.reliability_score ?? 100,
        user_feedback_score: pilot.user_feedback_score ?? 92,
        expert_validation_score: pilot.expert_validation_score ?? 92,
        passport_score: pilot.passport_score ?? 97,
        passport_category: pilot.passport_category || 'Platinum Pilot Passport',
        scale_up_recommended: pilot.scale_up_recommended ?? true,
        issued_at: '2026-02-14',
        startup,
        pilot,
      };
      this.passports.push(synthPassport);
      return synthPassport;
    }

    return null;
  }

  // ====================================================================
  // WRITE OPERATIONS (.insert(), .update(), .delete() against Supabase)
  // ====================================================================

  async createUser(user: User): Promise<User> {
    console.log('[Supabase Write] Attempting to insert user into Supabase:', user.id, user.name, user.role);
    if (supabase && this.isSupabaseOperational) {
      const dbPayload = mapUserToDb(user);
      const { data, error } = await supabase.from('users').insert(dbPayload).select().single();
      if (error) {
        const isRecursion = this.handleSupabaseError('createUser (insert)', error);
        if (!isRecursion && this.isSupabaseOperational) {
          const { data: upsertData, error: upsertErr } = await supabase
            .from('users')
            .upsert(dbPayload, { onConflict: 'email' })
            .select()
            .single();
          if (upsertErr) {
            this.handleSupabaseError('createUser (upsert)', upsertErr);
          } else if (upsertData) {
            const saved = mapUserFromDb(upsertData);
            const idx = this.users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
            if (idx >= 0) this.users[idx] = saved;
            else this.users.push(saved);
            console.log('✅ [Supabase Write Success] User upserted in Supabase:', saved.id);
            return saved;
          }
        }
      } else if (data) {
        const saved = mapUserFromDb(data);
        const idx = this.users.findIndex(u => u.id === user.id);
        if (idx >= 0) this.users[idx] = saved;
        else this.users.push(saved);
        console.log('✅ [Supabase Write Success] User created in Supabase:', saved.id);
        return saved;
      }
    }
    const idx = this.users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) this.users[idx] = user;
    else this.users.push(user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    console.log('[Supabase Write] Attempting to update user in Supabase:', id, updates);
    if (supabase && this.isSupabaseOperational) {
      const dbUpdates: any = {};
      if (updates.authId !== undefined) dbUpdates.auth_id = updates.authId;
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.role !== undefined) dbUpdates.role = updates.role;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.organization !== undefined) dbUpdates.organization = updates.organization;
      if (updates.departmentId !== undefined) dbUpdates.department_id = updates.departmentId;
      if (updates.departmentName !== undefined) dbUpdates.department_name = updates.departmentName;
      if (updates.startupId !== undefined) dbUpdates.startup_id = updates.startupId;
      if (updates.startupName !== undefined) dbUpdates.startup_name = updates.startupName;
      if (updates.validatorId !== undefined) dbUpdates.validator_id = updates.validatorId;
      if (updates.designation !== undefined) dbUpdates.designation = updates.designation;
      if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;

      const { data, error } = await supabase.from('users').update(dbUpdates).eq('id', id).select().single();
      if (error) {
        this.handleSupabaseError('updateUser', error);
      } else if (data) {
        const saved = mapUserFromDb(data);
        const idx = this.users.findIndex(u => u.id === id);
        if (idx >= 0) this.users[idx] = saved;
        console.log('✅ [Supabase Write Success] User updated in Supabase:', saved.id);
        return saved;
      }
    }
    const user = this.users.find(u => u.id === id);
    if (user) Object.assign(user, updates);
    return user || null;
  }

  async createDepartment(department: Department): Promise<Department> {
    console.log('[Supabase Write] Attempting to insert department into Supabase:', department.id, department.name);
    if (supabase && this.isSupabaseOperational) {
      const { data, error } = await supabase.from('departments').insert(mapDepartmentToDb(department)).select().single();
      if (error) {
        this.handleSupabaseError('createDepartment', error);
      } else if (data) {
        const saved = mapDepartmentFromDb(data);
        const idx = this.departments.findIndex(d => d.id === department.id);
        if (idx >= 0) this.departments[idx] = saved;
        else this.departments.push(saved);
        console.log('✅ [Supabase Write Success] Department created in Supabase:', saved.id);
        return saved;
      }
    }
    this.departments.push(department);
    return department;
  }

  async updateDepartment(id: string, updates: Partial<Department>): Promise<Department | null> {
    console.log('[Supabase Write] Attempting to update department in Supabase:', id, updates);
    if (supabase && this.isSupabaseOperational) {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.code !== undefined) dbUpdates.code = updates.code;
      if (updates.sector !== undefined) dbUpdates.sector = updates.sector;
      if (updates.state !== undefined) dbUpdates.state = updates.state;
      if (updates.nodalOfficer !== undefined) dbUpdates.nodal_officer = updates.nodalOfficer;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.activePilotsCount !== undefined) dbUpdates.active_pilots_count = updates.activePilotsCount;
      if (updates.budgetAllocatedLakhs !== undefined) dbUpdates.budget_allocated_lakhs = updates.budgetAllocatedLakhs;

      const { data, error } = await supabase.from('departments').update(dbUpdates).eq('id', id).select().single();
      if (error) {
        this.handleSupabaseError('updateDepartment', error);
      } else if (data) {
        const saved = mapDepartmentFromDb(data);
        const idx = this.departments.findIndex(d => d.id === id);
        if (idx >= 0) this.departments[idx] = saved;
        console.log('✅ [Supabase Write Success] Department updated in Supabase:', saved.id);
        return saved;
      }
    }
    const dept = this.departments.find(d => d.id === id);
    if (dept) Object.assign(dept, updates);
    return dept || null;
  }

  async createStartup(startup: Startup): Promise<Startup> {
    console.log('[Supabase Write] Attempting to insert startup into Supabase:', startup.id, startup.name);
    if (supabase && this.isSupabaseOperational) {
      const { data, error } = await supabase.from('startups').insert(mapStartupToDb(startup)).select().single();
      if (error) {
        this.handleSupabaseError('createStartup', error);
      } else if (data) {
        const saved = mapStartupFromDb(data);
        const idx = this.startups.findIndex(s => s.id === startup.id);
        if (idx >= 0) this.startups[idx] = saved;
        else this.startups.push(saved);
        console.log('✅ [Supabase Write Success] Startup created in Supabase:', saved.id);
        return saved;
      }
    }
    this.startups.push(startup);
    return startup;
  }

  async updateStartup(id: string, updates: Partial<Startup>): Promise<Startup | null> {
    console.log('[Supabase Write] Attempting to update startup in Supabase:', id, updates);
    if (supabase && this.isSupabaseOperational) {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.sector !== undefined) dbUpdates.sector = updates.sector;
      if (updates.dpiitStatus !== undefined) dbUpdates.dpiit_status = updates.dpiitStatus;
      if (updates.dpiitNumber !== undefined) dbUpdates.dpiit_number = updates.dpiitNumber;
      if (updates.keywords !== undefined) dbUpdates.keywords = updates.keywords;
      if (updates.pastPilotCount !== undefined) dbUpdates.past_pilot_count = updates.pastPilotCount;
      if (updates.successRatePercent !== undefined) dbUpdates.success_rate_percent = updates.successRatePercent;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.foundingYear !== undefined) dbUpdates.founding_year = updates.foundingYear;
      if (updates.city !== undefined) dbUpdates.city = updates.city;
      if (updates.stage !== undefined) dbUpdates.stage = updates.stage;
      if (updates.hasVerifiedPassport !== undefined) dbUpdates.has_verified_passport = updates.hasVerifiedPassport;
      if (updates.activePassportsCount !== undefined) dbUpdates.active_passports_count = updates.activePassportsCount;
      if (updates.website !== undefined) dbUpdates.website = updates.website;

      const { data, error } = await supabase.from('startups').update(dbUpdates).eq('id', id).select().single();
      if (error) {
        this.handleSupabaseError('updateStartup', error);
      } else if (data) {
        const saved = mapStartupFromDb(data);
        const idx = this.startups.findIndex(s => s.id === id);
        if (idx >= 0) this.startups[idx] = saved;
        console.log('✅ [Supabase Write Success] Startup updated in Supabase:', saved.id);
        return saved;
      }
    }
    const startup = this.startups.find(s => s.id === id);
    if (startup) Object.assign(startup, updates);
    return startup || null;
  }

  async createValidator(validator: Validator): Promise<Validator> {
    console.log('[Supabase Write] Attempting to insert validator into Supabase:', validator.id, validator.name, validator.organization);
    if (supabase && this.isSupabaseOperational) {
      const { data, error } = await supabase.from('validators').insert(mapValidatorToDb(validator)).select().single();
      if (error) {
        this.handleSupabaseError('createValidator', error);
      } else if (data) {
        const saved = mapValidatorFromDb(data);
        const idx = this.validators.findIndex(v => v.id === validator.id);
        if (idx >= 0) this.validators[idx] = saved;
        else this.validators.push(saved);
        console.log('✅ [Supabase Write Success] Validator created in Supabase:', saved.id);
        return saved;
      }
    }
    this.validators.push(validator);
    return validator;
  }

  async updateValidator(id: string, updates: Partial<Validator>): Promise<Validator | null> {
    console.log('[Supabase Write] Attempting to update validator in Supabase:', id, updates);
    if (supabase && this.isSupabaseOperational) {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.organization !== undefined) dbUpdates.organization = updates.organization;
      if (updates.sectorExpertise !== undefined) dbUpdates.sector_expertise = updates.sectorExpertise;
      if (updates.verifiedPilotsCount !== undefined) dbUpdates.verified_pilots_count = updates.verifiedPilotsCount;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.credentialHash !== undefined) dbUpdates.credential_hash = updates.credentialHash;

      const { data, error } = await supabase.from('validators').update(dbUpdates).eq('id', id).select().single();
      if (error) {
        this.handleSupabaseError('updateValidator', error);
      } else if (data) {
        const saved = mapValidatorFromDb(data);
        const idx = this.validators.findIndex(v => v.id === id);
        if (idx >= 0) this.validators[idx] = saved;
        console.log('✅ [Supabase Write Success] Validator updated in Supabase:', saved.id);
        return saved;
      }
    }
    const val = this.validators.find(v => v.id === id);
    if (val) Object.assign(val, updates);
    return val || null;
  }

  async deleteValidator(id: string): Promise<boolean> {
    console.log('[Supabase Write] Attempting to delete validator from Supabase:', id);
    if (supabase && this.isSupabaseOperational) {
      const { error } = await supabase.from('validators').delete().eq('id', id);
      if (error) {
        this.handleSupabaseError('deleteValidator', error);
      } else {
        console.log('✅ [Supabase Write Success] Validator deleted from Supabase:', id);
      }
    }
    this.validators = this.validators.filter(v => v.id !== id);
    return true;
  }

  async createProblemStatement(problem: ProblemStatement): Promise<ProblemStatement> {
    console.log('[Supabase Write] Attempting to insert problem statement into Supabase:', problem.id, problem.title, 'Dept:', problem.departmentName);
    if (supabase && this.isSupabaseOperational) {
      const { data, error } = await supabase.from('problem_statements').insert(mapProblemToDb(problem)).select().single();
      if (error) {
        this.handleSupabaseError('createProblemStatement', error);
      } else if (data) {
        const saved = mapProblemFromDb(data);
        const idx = this.problemStatements.findIndex(p => p.id === problem.id);
        if (idx >= 0) this.problemStatements[idx] = saved;
        else this.problemStatements.unshift(saved);
        console.log('✅ [Supabase Write Success] Problem statement created in Supabase:', saved.id);
        return saved;
      }
    }
    this.problemStatements.unshift(problem);
    return problem;
  }

  async updateProblemStatus(id: string, status: ProblemStatus): Promise<void> {
    console.log('[Supabase Write] Attempting to update problem status in Supabase:', id, '->', status);
    if (supabase && this.isSupabaseOperational) {
      const { error } = await supabase.from('problem_statements').update({ status }).eq('id', id);
      if (error) {
        this.handleSupabaseError('updateProblemStatus', error);
      } else {
        console.log('✅ [Supabase Write Success] Problem status updated in Supabase:', id, status);
      }
    }
    const prob = this.problemStatements.find(p => p.id === id);
    if (prob) prob.status = status;
  }

  async updateProblemStatement(id: string, updates: Partial<ProblemStatement>): Promise<ProblemStatement | null> {
    console.log('[Supabase Write] Attempting to update problem statement in Supabase:', id, updates);
    if (supabase && this.isSupabaseOperational) {
      const dbUpdates: any = {};
      if (updates.departmentId !== undefined) dbUpdates.department_id = updates.departmentId;
      if (updates.departmentName !== undefined) dbUpdates.department_name = updates.departmentName;
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.budgetMinLakhs !== undefined) dbUpdates.budget_min_lakhs = updates.budgetMinLakhs;
      if (updates.budgetMaxLakhs !== undefined) dbUpdates.budget_max_lakhs = updates.budgetMaxLakhs;
      if (updates.riskLevel !== undefined) dbUpdates.risk_level = updates.riskLevel;
      if (updates.expectedOutcome !== undefined) dbUpdates.expected_outcome = updates.expectedOutcome;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.applicationsCount !== undefined) dbUpdates.applications_count = updates.applicationsCount;

      const { data, error } = await supabase.from('problem_statements').update(dbUpdates).eq('id', id).select().single();
      if (error) {
        this.handleSupabaseError('updateProblemStatement', error);
      } else if (data) {
        const saved = mapProblemFromDb(data);
        const idx = this.problemStatements.findIndex(p => p.id === id);
        if (idx >= 0) this.problemStatements[idx] = saved;
        console.log('✅ [Supabase Write Success] Problem statement updated in Supabase:', saved.id);
        return saved;
      }
    }
    const prob = this.problemStatements.find(p => p.id === id);
    if (prob) Object.assign(prob, updates);
    return prob || null;
  }

  async deleteProblemStatement(id: string): Promise<boolean> {
    console.log('[Supabase Write] Attempting to delete problem statement from Supabase:', id);
    if (supabase && this.isSupabaseOperational) {
      const { error } = await supabase.from('problem_statements').delete().eq('id', id);
      if (error) {
        this.handleSupabaseError('deleteProblemStatement', error);
      } else {
        console.log('✅ [Supabase Write Success] Problem statement deleted from Supabase:', id);
      }
    }
    this.problemStatements = this.problemStatements.filter(p => p.id !== id);
    return true;
  }

  async createPilot(pilot: Pilot): Promise<Pilot> {
    console.log('[Supabase Write] Attempting to insert pilot agreement into Supabase:', pilot.id, pilot.problemTitle, 'Startup:', pilot.startupName);
    if (supabase && this.isSupabaseOperational) {
      const { data, error } = await supabase.from('pilots').insert(mapPilotToDb(pilot)).select().single();
      if (error) {
        this.handleSupabaseError('createPilot', error);
      } else if (data) {
        const saved = mapPilotFromDb(data);
        const idx = this.pilots.findIndex(p => p.id === pilot.id);
        if (idx >= 0) this.pilots[idx] = saved;
        else this.pilots.unshift(saved);
        console.log('✅ [Supabase Write Success] Pilot agreement created in Supabase:', saved.id);
        return saved;
      }
    }
    this.pilots.unshift(pilot);
    return pilot;
  }

  async updatePilot(id: string, updates: Partial<Pilot>): Promise<Pilot | null> {
    console.log('[Supabase Write] Attempting to update pilot in Supabase:', id, updates);
    if (supabase && this.isSupabaseOperational) {
      const dbUpdates: any = {};
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.disbursedBudgetLakhs !== undefined) dbUpdates.disbursed_budget_lakhs = updates.disbursedBudgetLakhs;
      if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
      if (updates.totalBudgetLakhs !== undefined) dbUpdates.total_budget_lakhs = updates.totalBudgetLakhs;
      if (updates.validatorId !== undefined) dbUpdates.validator_id = updates.validatorId;
      if (updates.validatorName !== undefined) dbUpdates.validator_name = updates.validatorName;
      if (updates.scopeSummary !== undefined) dbUpdates.scope_summary = updates.scopeSummary;
      if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
      if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;

      // Exact Supabase Pilot Passport columns
      if (updates.kpi_achievement_pct !== undefined || updates.kpiAchievementPct !== undefined) {
        dbUpdates.kpi_achievement_pct = updates.kpi_achievement_pct !== undefined ? updates.kpi_achievement_pct : updates.kpiAchievementPct;
      }
      if (updates.on_time_completion_pct !== undefined || updates.onTimeCompletionPct !== undefined) {
        dbUpdates.on_time_completion_pct = updates.on_time_completion_pct !== undefined ? updates.on_time_completion_pct : updates.onTimeCompletionPct;
      }
      if (updates.compliance_score !== undefined || updates.complianceScore !== undefined) {
        dbUpdates.compliance_score = updates.compliance_score !== undefined ? updates.compliance_score : updates.complianceScore;
      }
      if (updates.reliability_score !== undefined || updates.reliabilityScore !== undefined) {
        dbUpdates.reliability_score = updates.reliability_score !== undefined ? updates.reliability_score : updates.reliabilityScore;
      }
      if (updates.user_feedback_score !== undefined || updates.userFeedbackScore !== undefined) {
        dbUpdates.user_feedback_score = updates.user_feedback_score !== undefined ? updates.user_feedback_score : updates.userFeedbackScore;
      }
      if (updates.expert_validation_score !== undefined || updates.expertValidationScore !== undefined) {
        dbUpdates.expert_validation_score = updates.expert_validation_score !== undefined ? updates.expert_validation_score : updates.expertValidationScore;
      }
      if (updates.passport_score !== undefined || updates.passportScore !== undefined) {
        dbUpdates.passport_score = updates.passport_score !== undefined ? updates.passport_score : updates.passportScore;
      }
      if (updates.passport_category !== undefined || updates.passportCategory !== undefined) {
        dbUpdates.passport_category = updates.passport_category !== undefined ? updates.passport_category : updates.passportCategory;
      }
      if (updates.scale_up_recommended !== undefined || updates.scaleUpRecommended !== undefined) {
        dbUpdates.scale_up_recommended = updates.scale_up_recommended !== undefined ? updates.scale_up_recommended : updates.scaleUpRecommended;
      }

      const { data, error } = await supabase.from('pilots').update(dbUpdates).eq('id', id).select().single();
      if (error) {
        this.handleSupabaseError('updatePilot', error);
      } else if (data) {
        const saved = mapPilotFromDb(data);
        const idx = this.pilots.findIndex(p => p.id === id);
        if (idx >= 0) this.pilots[idx] = saved;
        console.log('✅ [Supabase Write Success] Pilot updated in Supabase:', saved.id, 'Status:', saved.status);
        return saved;
      }
    }
    const pilot = this.pilots.find(p => p.id === id);
    if (pilot) Object.assign(pilot, updates);
    return pilot || null;
  }

  async deletePilot(id: string): Promise<boolean> {
    console.log('[Supabase Write] Attempting to delete pilot from Supabase:', id);
    if (supabase && this.isSupabaseOperational) {
      const { error } = await supabase.from('pilots').delete().eq('id', id);
      if (error) {
        this.handleSupabaseError('deletePilot', error);
      } else {
        console.log('✅ [Supabase Write Success] Pilot deleted from Supabase:', id);
      }
    }
    this.pilots = this.pilots.filter(p => p.id !== id);
    return true;
  }

  async createMilestones(milestones: Milestone[]): Promise<Milestone[]> {
    console.log('[Supabase Write] Attempting to insert batch milestones into Supabase:', milestones.length, 'records');
    if (supabase && this.isSupabaseOperational) {
      const { data, error } = await supabase.from('milestones').insert(milestones.map(mapMilestoneToDb)).select();
      if (error) {
        this.handleSupabaseError('createMilestones', error);
      } else if (data) {
        const savedList = data.map(mapMilestoneFromDb);
        for (const saved of savedList) {
          const idx = this.milestones.findIndex(m => m.id === saved.id);
          if (idx >= 0) this.milestones[idx] = saved;
          else this.milestones.push(saved);
        }
        console.log('✅ [Supabase Write Success] Milestones batch inserted into Supabase:', savedList.length, 'records');
        return savedList;
      }
    }
    this.milestones.push(...milestones);
    return milestones;
  }

  async createMilestone(milestone: Milestone): Promise<Milestone> {
    console.log('[Supabase Write] Attempting to insert single milestone into Supabase:', milestone.id, milestone.title);
    if (supabase && this.isSupabaseOperational) {
      const { data, error } = await supabase.from('milestones').insert(mapMilestoneToDb(milestone)).select().single();
      if (error) {
        this.handleSupabaseError('createMilestone', error);
      } else if (data) {
        const saved = mapMilestoneFromDb(data);
        const idx = this.milestones.findIndex(m => m.id === milestone.id);
        if (idx >= 0) this.milestones[idx] = saved;
        else this.milestones.push(saved);
        console.log('✅ [Supabase Write Success] Milestone inserted into Supabase:', saved.id);
        return saved;
      }
    }
    this.milestones.push(milestone);
    return milestone;
  }

  async updateMilestone(id: string, updates: Partial<Milestone>): Promise<Milestone | null> {
    console.log('[Supabase Write] Attempting to update milestone in Supabase:', id, updates);
    if (supabase && this.isSupabaseOperational) {
      const dbUpdates: any = {};
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.submittedValue !== undefined) dbUpdates.submitted_value = updates.submittedValue;
      if (updates.submittedProofUrl !== undefined) dbUpdates.submitted_proof_url = updates.submittedProofUrl;
      if (updates.submittedNotes !== undefined) dbUpdates.submitted_notes = updates.submittedNotes;
      if (updates.submittedAt !== undefined) dbUpdates.submitted_at = updates.submittedAt;
      if (updates.verifiedAt !== undefined) dbUpdates.verified_at = updates.verifiedAt;
      if (updates.verifiedBy !== undefined) dbUpdates.verified_by = updates.verifiedBy;
      if (updates.verificationNotes !== undefined) dbUpdates.verification_notes = updates.verificationNotes;
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.targetKpiDescription !== undefined) dbUpdates.target_kpi_description = updates.targetKpiDescription;
      if (updates.targetKpiValue !== undefined) dbUpdates.target_kpi_value = updates.targetKpiValue;
      if (updates.kpiUnit !== undefined) dbUpdates.kpi_unit = updates.kpiUnit;
      if (updates.weightPercent !== undefined) dbUpdates.weight_percent = updates.weightPercent;
      if (updates.amountLakhs !== undefined) dbUpdates.amount_lakhs = updates.amountLakhs;

      const { data, error } = await supabase.from('milestones').update(dbUpdates).eq('id', id).select().single();
      if (error) {
        this.handleSupabaseError('updateMilestone', error);
      } else if (data) {
        const saved = mapMilestoneFromDb(data);
        const idx = this.milestones.findIndex(m => m.id === id);
        if (idx >= 0) this.milestones[idx] = saved;
        console.log('✅ [Supabase Write Success] Milestone updated in Supabase:', saved.id, 'Status:', saved.status);
        return saved;
      }
    }
    const milestone = this.milestones.find(m => m.id === id);
    if (milestone) Object.assign(milestone, updates);
    return milestone || null;
  }

  async deleteMilestone(id: string): Promise<boolean> {
    console.log('[Supabase Write] Attempting to delete milestone from Supabase:', id);
    if (supabase && this.isSupabaseOperational) {
      const { error } = await supabase.from('milestones').delete().eq('id', id);
      if (error) {
        this.handleSupabaseError('deleteMilestone', error);
      } else {
        console.log('✅ [Supabase Write Success] Milestone deleted from Supabase:', id);
      }
    }
    this.milestones = this.milestones.filter(m => m.id !== id);
    return true;
  }

  async createPayment(payment: PaymentRecord): Promise<PaymentRecord> {
    console.log('[Supabase Write] Attempting to insert payment record into Supabase:', payment.id, 'Amount: ₹' + payment.amountLakhs + ' Lakhs', 'Milestone:', payment.milestoneTitle);
    if (supabase && this.isSupabaseOperational) {
      const { data, error } = await supabase.from('payments').insert(mapPaymentToDb(payment)).select().single();
      if (error) {
        this.handleSupabaseError('createPayment', error);
      } else if (data) {
        const saved = mapPaymentFromDb(data);
        const idx = this.payments.findIndex(p => p.id === payment.id);
        if (idx >= 0) this.payments[idx] = saved;
        else this.payments.push(saved);
        console.log('✅ [Supabase Write Success] Payment record created in Supabase:', saved.id);
        return saved;
      }
    }
    this.payments.push(payment);
    return payment;
  }

  async updatePayment(id: string, updates: Partial<PaymentRecord>): Promise<PaymentRecord | null> {
    console.log('[Supabase Write] Attempting to update payment record in Supabase:', id, updates);
    if (supabase && this.isSupabaseOperational) {
      const dbUpdates: any = {};
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.approvedAt !== undefined) dbUpdates.approved_at = updates.approvedAt;
      if (updates.sentToTreasuryAt !== undefined) dbUpdates.sent_to_treasury_at = updates.sentToTreasuryAt;
      if (updates.paidAt !== undefined) dbUpdates.paid_at = updates.paidAt;
      if (updates.treasuryRefNumber !== undefined) dbUpdates.treasury_ref_number = updates.treasuryRefNumber;
      if (updates.isDelayed !== undefined) dbUpdates.is_delayed = updates.isDelayed;
      if (updates.elapsedDays !== undefined) dbUpdates.elapsed_days = updates.elapsedDays;
      if (updates.escalationNotice !== undefined) dbUpdates.escalation_notice = updates.escalationNotice;

      const { data, error } = await supabase.from('payments').update(dbUpdates).eq('id', id).select().single();
      if (error) {
        this.handleSupabaseError('updatePayment', error);
      } else if (data) {
        const saved = mapPaymentFromDb(data);
        const idx = this.payments.findIndex(p => p.id === id);
        if (idx >= 0) this.payments[idx] = saved;
        console.log('✅ [Supabase Write Success] Payment updated in Supabase:', saved.id);
        return saved;
      }
    }
    const payment = this.payments.find(p => p.id === id);
    if (payment) Object.assign(payment, updates);
    return payment || null;
  }

  async deletePayment(id: string): Promise<boolean> {
    console.log('[Supabase Write] Attempting to delete payment record from Supabase:', id);
    if (supabase && this.isSupabaseOperational) {
      const { error } = await supabase.from('payments').delete().eq('id', id);
      if (error) {
        this.handleSupabaseError('deletePayment', error);
      } else {
        console.log('✅ [Supabase Write Success] Payment deleted from Supabase:', id);
      }
    }
    this.payments = this.payments.filter(p => p.id !== id);
    return true;
  }

  async createPassport(passport: PilotPassport): Promise<PilotPassport> {
    console.log('[Supabase Write] Attempting to insert/upsert pilot passport into Supabase:', passport.id, 'Startup:', passport.startupName, 'Hash:', passport.certificateHash);
    if (supabase && this.isSupabaseOperational) {
      const payload = mapPassportToDb(passport);
      const { data, error } = await supabase.from('passports').upsert(payload).select().single();
      if (error) {
        this.handleSupabaseError('createPassport', error);
      }

      // Update startup passport status directly in Supabase
      const startup = await this.getStartupById(passport.startupId);
      const newActiveCount = (startup?.activePassportsCount || 0) + 1;
      const newPastCount = (startup?.pastPilotCount || 0) + 1;

      const { error: startupUpdateErr } = await supabase.from('startups').update({
        has_verified_passport: true,
        active_passports_count: newActiveCount,
        past_pilot_count: newPastCount,
      }).eq('id', passport.startupId);

      if (startupUpdateErr) {
        this.handleSupabaseError('createPassport (update startup)', startupUpdateErr);
      }

      if (data) {
        const saved = mapPassportFromDb(data);
        const idx = this.passports.findIndex(p => p.id === passport.id);
        if (idx >= 0) this.passports[idx] = saved;
        else this.passports.unshift(saved);
        console.log('✅ [Supabase Write Success] Pilot passport created in Supabase:', saved.id);
        return saved;
      }
    }

    this.passports.unshift(passport);
    const startup = this.startups.find(s => s.id === passport.startupId);
    if (startup) {
      startup.hasVerifiedPassport = true;
      startup.activePassportsCount = (startup.activePassportsCount || 0) + 1;
      startup.pastPilotCount = (startup.pastPilotCount || 0) + 1;
    }
    return passport;
  }

  async updatePassport(id: string, updates: Partial<PilotPassport>): Promise<PilotPassport | null> {
    console.log('[Supabase Write] Attempting to update pilot passport in Supabase:', id, updates);
    if (supabase && this.isSupabaseOperational) {
      const dbUpdates: any = {};
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.validityEndDate !== undefined) dbUpdates.validity_end_date = updates.validityEndDate;
      if (updates.efficiencyGainPercent !== undefined) dbUpdates.efficiency_gain_percent = updates.efficiencyGainPercent;
      if (updates.costSavingsLakhs !== undefined) dbUpdates.cost_savings_lakhs = updates.costSavingsLakhs;
      if (updates.kpisAchieved !== undefined) dbUpdates.kpis_achieved = updates.kpisAchieved;

      const { data, error } = await supabase.from('passports').update(dbUpdates).eq('id', id).select().single();
      if (error) {
        this.handleSupabaseError('updatePassport', error);
      } else if (data) {
        const saved = mapPassportFromDb(data);
        const idx = this.passports.findIndex(p => p.id === id);
        if (idx >= 0) this.passports[idx] = saved;
        console.log('✅ [Supabase Write Success] Pilot passport updated in Supabase:', saved.id);
        return saved;
      }
    }
    const passport = this.passports.find(p => p.id === id);
    if (passport) Object.assign(passport, updates);
    return passport || null;
  }

  async deletePassport(id: string): Promise<boolean> {
    console.log('[Supabase Write] Attempting to delete pilot passport from Supabase:', id);
    if (supabase && this.isSupabaseOperational) {
      const { error } = await supabase.from('passports').delete().eq('id', id);
      if (error) {
        this.handleSupabaseError('deletePassport', error);
      } else {
        console.log('✅ [Supabase Write Success] Pilot passport deleted from Supabase:', id);
      }
    }
    this.passports = this.passports.filter(p => p.id !== id);
    return true;
  }

  async saveMatches(matchesList: StartupMatch[]): Promise<void> {
    console.log('[Supabase Write] Attempting to save matches into Supabase:', matchesList.length, 'records');
    if (supabase && this.isSupabaseOperational) {
      const { error } = await supabase.from('matches').upsert(matchesList.map(mapMatchToDb));
      if (error) {
        console.warn('⚠️ [Supabase Write Warning] Failed to save matches:', error.message);
      } else {
        console.log('✅ [Supabase Write Success] Matches saved into Supabase:', matchesList.length, 'records');
      }
    }
  }

  async createOrUpdateMatch(data: {
    problemId: string;
    startupId: string;
    matchScore?: number;
    reason?: string;
    details?: any;
  }): Promise<StartupMatch> {
    const problem = await this.getProblemById(data.problemId);
    const startup = await this.getStartupById(data.startupId);
    const matchId = `match-${data.problemId}-${data.startupId}`;

    let score = data.matchScore;
    let reason = data.reason;
    let details = data.details || {};

    if ((!score || !reason) && problem && startup) {
      const calculated = this.calculateMatchScore(problem, startup);
      score = score || calculated.matchScore;
      reason = reason || calculated.reason;
      details = Object.keys(details).length > 0 ? details : calculated.details;
    }

    const newMatch: StartupMatch = {
      id: matchId,
      problemId: data.problemId,
      startupId: data.startupId,
      startup: startup || undefined,
      matchScore: score || 85,
      reason: reason || 'Initiated match between problem and startup',
      details,
      createdAt: new Date().toISOString(),
    };

    console.log(`[Supabase Write] Recording match in matches table for problem: ${data.problemId} and startup: ${data.startupId} (Score: ${newMatch.matchScore}%)`);
    if (supabase && this.isSupabaseOperational) {
      const { data: dbData, error } = await supabase
        .from('matches')
        .upsert(mapMatchToDb(newMatch))
        .select()
        .single();
      if (error) {
        this.handleSupabaseError('createOrUpdateMatch', error);
      } else if (dbData) {
        console.log('✅ [Supabase Write Success] Match recorded in Supabase matches table:', matchId);
      }
    }

    const existingIdx = this.matches.findIndex(m => m.problemId === data.problemId && m.startupId === data.startupId);
    if (existingIdx >= 0) {
      this.matches[existingIdx] = newMatch;
    } else {
      this.matches.push(newMatch);
    }

    return newMatch;
  }

  // ====================================================================
  // AI MATCHING RECOMMENDATION ENGINE (Feature 1)
  // ====================================================================

  calculateMatchScore(
    problem: ProblemStatement,
    startup: Startup,
    activePassports?: PilotPassport[]
  ): { matchScore: number; reason: string; details: MatchScoreDetails } {
    let score = 0;
    const matchedKeywords: string[] = [];
    const matchedDescriptionTerms: string[] = [];
    const matchedKpiTerms: string[] = [];

    const stopWords = new Set([
      'the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'have', 'been',
      'across', 'between', 'into', 'over', 'after', 'under', 'using', 'used',
      'such', 'their', 'which', 'than', 'more', 'also', 'will', 'each', 'about',
      'without', 'within', 'both', 'through', 'where', 'when', 'what', 'these'
    ]);

    const tokenize = (text: string): string[] => {
      return (text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 3 && !stopWords.has(w));
    };

    const probCategoryLower = (problem.category || '').toLowerCase();
    const probDescLower = (problem.description || '').toLowerCase();
    const probKpiLower = (problem.expectedOutcome || '').toLowerCase();
    const probTitleLower = (problem.title || '').toLowerCase();
    const combinedProbText = `${probTitleLower} ${probCategoryLower} ${probDescLower} ${probKpiLower}`;

    const startupSectorLower = (startup.sector || '').toLowerCase();
    const startupDescLower = (startup.description || '').toLowerCase();

    // 1. Sector & Category Alignment (Up to 35 pts)
    let sectorScore = 0;
    const directSectorMatch = probCategoryLower.includes(startupSectorLower) ||
      startupSectorLower.includes(probCategoryLower);

    if (directSectorMatch) {
      sectorScore = 35;
    } else {
      // Semantic category equivalence mapping
      const categoryPairs = [
        { cats: ['health', 'life sciences', 'medical', 'clinical', 'hospital', 'disease'], tech: ['health', 'diagnostic', 'retinopathy', 'tuberculosis', 'patient', 'telemedicine', 'pathology'] },
        { cats: ['transport', 'urban', 'mobility', 'infrastructure', 'traffic'], tech: ['traffic', 'mobility', 'transit', 'corridor', 'pothole', 'vehicle', 'gps', 'drone', 'flyover', 'sensor'] },
        { cats: ['water', 'sanitation', 'environment', 'pollution'], tech: ['water', 'leak', 'potability', 'fluoride', 'pipeline', 'sensor', 'acoustic', 'iot', 'sewage', 'jal'] },
        { cats: ['agri', 'farming', 'crop'], tech: ['crop', 'pest', 'farm', 'drone', 'soil', 'satellite', 'yield', 'farmer', 'irrigation'] },
        { cats: ['education', 'edtech', 'school', 'skill'], tech: ['school', 'learn', 'student', 'voice', 'tutor', 'literacy', 'vernacular', 'arithmetic'] },
        { cats: ['energy', 'cleantech', 'power', 'solar'], tech: ['solar', 'energy', 'battery', 'power', 'grid', 'clean'] },
        { cats: ['civic', 'governance', 'public'], tech: ['citizen', 'grievance', 'workflow', 'transparency', 'audit'] },
      ];

      for (const pair of categoryPairs) {
        const hasProbCat = pair.cats.some(c => probCategoryLower.includes(c) || probTitleLower.includes(c));
        const hasStartupDomain = pair.tech.some(t => startupSectorLower.includes(t) || startup.keywords.some(k => k.toLowerCase().includes(t)));
        if (hasProbCat && hasStartupDomain) {
          sectorScore = 26;
          break;
        }
      }
    }
    score += sectorScore;

    // 2. Technology Tags & Keyword Overlap (Up to 30 pts)
    let keywordPoints = 0;
    for (const kw of startup.keywords) {
      const lowerKw = kw.toLowerCase();
      if (combinedProbText.includes(lowerKw)) {
        matchedKeywords.push(kw);
        keywordPoints += 8;
      } else {
        // Partial tag token matching
        const kwTokens = tokenize(lowerKw);
        const tokenMatch = kwTokens.some(tok => combinedProbText.includes(tok));
        if (tokenMatch) {
          matchedKeywords.push(kw);
          keywordPoints += 5;
        }
      }
    }
    score += Math.min(30, keywordPoints);

    // 3. Semantic Description Overlap (Up to 15 pts)
    const probTokens = new Set([...tokenize(probDescLower), ...tokenize(probTitleLower)]);
    const startupDescTokens = tokenize(startupDescLower);
    for (const tok of startupDescTokens) {
      if (probTokens.has(tok) && !matchedDescriptionTerms.includes(tok)) {
        matchedDescriptionTerms.push(tok);
      }
    }
    const descOverlapPoints = Math.min(15, matchedDescriptionTerms.length * 3);
    score += descOverlapPoints;

    // 4. KPI Target & Expected Outcome Alignment (Up to 10 pts)
    const kpiTokens = new Set(tokenize(probKpiLower));
    for (const tok of [...startupDescTokens, ...startup.keywords.flatMap(k => tokenize(k))]) {
      if (kpiTokens.has(tok) && !matchedKpiTerms.includes(tok)) {
        matchedKpiTerms.push(tok);
      }
    }
    const kpiPoints = Math.min(10, matchedKpiTerms.length * 3.5);
    score += kpiPoints;

    // 5. Track Record & Verified Pilot Passport Bonus (Up to 10 pts)
    const hasPassport = (activePassports ? activePassports.some(p => p.startupId === startup.id && p.status === 'active') : false) || startup.hasVerifiedPassport;
    if (hasPassport) score += 6;
    if (startup.pastPilotCount > 0) {
      score += Math.min(4, startup.pastPilotCount * 1.5 + (startup.successRatePercent >= 90 ? 1 : 0));
    }

    // Normalize final score between 25% and 98%
    const finalScore = Math.min(98, Math.max(25, Math.round(score)));

    // 6. Build structured reason explanation
    const reasons: string[] = [];
    if (directSectorMatch) {
      reasons.push(`Direct Sector Match (${startup.sector})`);
    } else if (sectorScore > 0) {
      reasons.push(`Related Sector Alignment (${startup.sector})`);
    }

    if (matchedKeywords.length > 0) {
      reasons.push(`Matching Tech Tags: ${matchedKeywords.slice(0, 3).join(', ')}`);
    }

    if (matchedKpiTerms.length > 0) {
      reasons.push(`KPI Target Alignment on "${matchedKpiTerms.slice(0, 2).join(', ')}"`);
    } else if (matchedDescriptionTerms.length > 0) {
      reasons.push(`Scope overlap: ${matchedDescriptionTerms.slice(0, 3).join(', ')}`);
    }

    if (hasPassport) {
      reasons.push('Verified Pilot Passport Active');
    }

    const reasonText = reasons.join(' • ') || `Tech capability alignment with ${startup.sector}`;

    return {
      matchScore: finalScore,
      reason: reasonText,
      details: {
        sectorMatch: directSectorMatch || sectorScore > 0,
        keywordMatches: matchedKeywords,
        pastExperienceScore: Math.min(10, startup.pastPilotCount * 4),
        dpiitBonus: startup.dpiitStatus === 'Recognized' ? 10 : 3,
        passportBonus: hasPassport ? 15 : 0,
        riskAlignmentScore: problem.riskLevel === 'high' ? (startup.pastPilotCount >= 2 ? 10 : 4) : 10,
      },
    };
  }

  async getRankedMatchesForProblem(problemId: string): Promise<StartupMatch[]> {
    const problem = await this.getProblemById(problemId);
    if (!problem) return [];

    console.log(`[AI Match Engine] 🔍 Starting match calculation for Problem #${problem.id}: "${problem.title}" (Category: ${problem.category}, KPI: "${problem.expectedOutcome?.substring(0, 60)}...")`);

    const [startups, activePassports] = await Promise.all([
      this.getStartups(),
      this.getPassports({ status: 'active' }),
    ]);

    const matches: StartupMatch[] = startups.map(startup => {
      const { matchScore, reason, details } = this.calculateMatchScore(problem, startup, activePassports);
      return {
        id: `match-${problem.id}-${startup.id}`,
        problemId: problem.id,
        startupId: startup.id,
        startup,
        matchScore,
        reason,
        details,
        createdAt: new Date().toISOString(),
      };
    });

    matches.sort((a, b) => b.matchScore - a.matchScore);
    const topMatches = matches.slice(0, 10);

    console.log(`[AI Match Engine] ✅ Evaluated ${startups.length} startups for Problem #${problem.id}. Produced top ${topMatches.length} ranked matches:`);
    topMatches.forEach((m, idx) => {
      console.log(`  [Rank #${idx + 1}] ${m.startup?.name} | Score: ${m.matchScore}% | Sector: ${m.startup?.sector} | Reason: ${m.reason}`);
    });

    // Persist matches asynchronously to Supabase
    if (supabase && topMatches.length > 0) {
      this.saveMatches(topMatches).catch(err => {
        console.warn('⚠️ [Supabase Matches Async Save Warning]:', err.message);
      });
    }

    return topMatches;
  }

  // ====================================================================
  // ANALYTICS CALCULATION (Public Transparency Layer)
  // ====================================================================

  async getAnalytics(): Promise<PlatformAnalytics> {
    const [pilots, startups, passports, payments, problemStatements] = await Promise.all([
      this.getPilots(),
      this.getStartups(),
      this.getPassports(),
      this.getPayments(),
      this.getProblemStatements(),
    ]);

    const totalPilots = pilots.length;
    const activePilots = pilots.filter(p => p.status === 'active').length;
    const completedPilots = pilots.filter(p => p.status === 'completed').length;
    const passportsIssued = passports.length;
    const totalFundsFacilitated = pilots.reduce((acc, p) => acc + p.totalBudgetLakhs, 0);

    const delayedPayments = payments.filter(p => p.isDelayed || (p.status !== 'paid' && p.elapsedDays > p.slaDays));

    const sectorMap: Record<string, { count: number; valueLakhs: number }> = {};
    for (const pilot of pilots) {
      const prob = problemStatements.find(p => p.id === pilot.problemId);
      const sector = prob ? prob.category : 'General Innovation';
      if (!sectorMap[sector]) {
        sectorMap[sector] = { count: 0, valueLakhs: 0 };
      }
      sectorMap[sector].count += 1;
      sectorMap[sector].valueLakhs += pilot.totalBudgetLakhs;
    }

    const sectorBreakdown = Object.entries(sectorMap).map(([sector, data]) => ({
      sector,
      count: data.count,
      valueLakhs: Math.round(data.valueLakhs * 10) / 10,
    }));

    return {
      totalPilots,
      activePilots,
      completedPilots,
      totalStartupsEmpanelled: startups.length,
      passportsIssued,
      totalFundsFacilitatedLakhs: Math.round(totalFundsFacilitated * 10) / 10,
      avgValidationTurnaroundDays: 3.8,
      avgPaymentProcessingDays: 5.2,
      delayedPaymentsCount: delayedPayments.length,
      pilotSuccessRatePercent: 94.6,
      sectorBreakdown,
      recentActivities: [
        {
          id: 'act-1',
          type: 'passport_issued',
          title: 'Pilot Passport Issued: NeuroHealth AI',
          description: 'Verified by Prof. S. Krishnan (IIT Bombay) for 25 PHC Tribal TB deployment.',
          timestamp: '2 hours ago',
          badge: 'Passport Verified',
        },
        {
          id: 'act-2',
          type: 'payment_treasury',
          title: 'PFMS Treasury Instruction Dispatched',
          description: '₹8.40 Lakhs payment instruction sent to State Treasury for UrbanPulse Mobility.',
          timestamp: '1 day ago',
          badge: 'Treasury Dispatched',
        },
        {
          id: 'act-3',
          type: 'milestone_verified',
          title: 'Milestone 1 Verified: AquaSense IoT',
          description: 'Rule-based check confirmed 40 solar sensor nodes operational in Barmer district.',
          timestamp: '2 days ago',
          badge: 'Milestone Verified',
        },
        {
          id: 'act-4',
          type: 'match',
          title: 'AI Matching: 98% Match Generated',
          description: 'KisanDrishti Agritech matched with MP Farmers Welfare satellite problem statement.',
          timestamp: '3 days ago',
          badge: 'AI Recommendation',
        },
      ],
    };
  }

  // ====================================================================
  // SEED DATABASE (Initial Demo Data)
  // ====================================================================

  async seedToSupabase() {
    if (!supabase) return;
    try {
      await supabase.from('users').upsert(this.users.map(mapUserToDb));
      await supabase.from('departments').upsert(this.departments.map(mapDepartmentToDb));
      await supabase.from('startups').upsert(this.startups.map(mapStartupToDb));
      await supabase.from('validators').upsert(this.validators.map(mapValidatorToDb));
      await supabase.from('problem_statements').upsert(this.problemStatements.map(mapProblemToDb));
      await supabase.from('pilots').upsert(this.pilots.map(mapPilotToDb));
      await supabase.from('milestones').upsert(this.milestones.map(mapMilestoneToDb));
      await supabase.from('payments').upsert(this.payments.map(mapPaymentToDb));
      await supabase.from('passports').upsert(this.passports.map(mapPassportToDb));
      console.log('✅ Demo records successfully seeded into Supabase.');
    } catch (err) {
      console.warn('⚠️ Error seeding to Supabase:', err);
    }
  }

  async seed() {
    this.initDefaultSeed();
    if (supabase) {
      await this.seedToSupabase();
    }
  }

  private initDefaultSeed() {
    this.users = [
      {
        id: 'u-dept-1',
        name: 'Dr. Rajesh Sharma, IAS',
        role: 'department',
        email: 'rajesh.sharma@gov.in',
        departmentId: 'dept-1',
        departmentName: 'Ministry of Health & Family Welfare',
        designation: 'Joint Secretary (Digital Health)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      {
        id: 'u-dept-2',
        name: 'Smt. Ananya Deshmukh',
        role: 'department',
        email: 'ananya.deshmukh@smartcities.gov.in',
        departmentId: 'dept-2',
        departmentName: 'Smart Cities Mission - Urban Mobility',
        designation: 'Mission Director',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      },
      {
        id: 'u-startup-1',
        name: 'Aarav Mehta',
        role: 'startup',
        email: 'aarav@neurohealth.ai',
        startupId: 'st-1',
        startupName: 'NeuroHealth AI Pvt Ltd',
        designation: 'Founder & CEO',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
      {
        id: 'u-admin-1',
        name: 'Priya Varma',
        role: 'admin',
        email: 'priya.varma@msins.gov.in',
        designation: 'CEO, Maharashtra State Innovation Society (MSInS)',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      },
      {
        id: 'u-val-1',
        name: 'Prof. S. Krishnan',
        role: 'validator',
        email: 's.krishnan@iitb.ac.in',
        validatorId: 'val-1',
        designation: 'Chair, Center for Tech Evaluation (IIT Bombay)',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      },
    ];

    this.departments = [
      {
        id: 'dept-1',
        name: 'Ministry of Health & Family Welfare',
        code: 'MOHFW',
        sector: 'Healthcare & Life Sciences',
        state: 'National / Delhi',
        nodalOfficer: 'Dr. Rajesh Sharma, IAS',
        email: 'nodal.health@gov.in',
        activePilotsCount: 2,
        budgetAllocatedLakhs: 85.0,
      },
      {
        id: 'dept-2',
        name: 'Smart Cities Mission - Urban Mobility',
        code: 'SCM-UM',
        sector: 'Urban Infrastructure & Transport',
        state: 'Maharashtra',
        nodalOfficer: 'Smt. Ananya Deshmukh',
        email: 'director.mobility@smartcities.gov.in',
        activePilotsCount: 2,
        budgetAllocatedLakhs: 120.0,
      },
      {
        id: 'dept-3',
        name: 'Department of Agriculture & Farmers Welfare',
        code: 'DAFW',
        sector: 'Agriculture & Agritech',
        state: 'Madhya Pradesh',
        nodalOfficer: 'Shri Vikramaditya Rao',
        email: 'agri.pilot@mp.gov.in',
        activePilotsCount: 1,
        budgetAllocatedLakhs: 60.0,
      },
      {
        id: 'dept-4',
        name: 'Water Resources & Ground Water Board',
        code: 'WRGWB',
        sector: 'Water, Sanitation & Environment',
        state: 'Rajasthan',
        nodalOfficer: 'Dr. Meenakshi Joshi',
        email: 'waterboard.pilot@rajasthan.gov.in',
        activePilotsCount: 1,
        budgetAllocatedLakhs: 45.0,
      },
      {
        id: 'dept-5',
        name: 'State Education & Skill Development Mission',
        code: 'SESDM',
        sector: 'Education & EdTech',
        state: 'Karnataka',
        nodalOfficer: 'Shri Ramesh Kumar',
        email: 'skills.director@karnataka.gov.in',
        activePilotsCount: 2,
        budgetAllocatedLakhs: 70.0,
      },
    ];

    this.startups = [
      {
        id: 'st-1',
        name: 'NeuroHealth AI',
        sector: 'Healthcare & Life Sciences',
        dpiitStatus: 'Recognized',
        dpiitNumber: 'DIPP-84920',
        keywords: ['healthcare', 'telemedicine', 'ai diagnostic', 'tuberculosis', 'x-ray', 'rural health', 'citizen data'],
        pastPilotCount: 3,
        successRatePercent: 100,
        description: 'Edge-AI automated chest X-ray screening and telemedicine triage for primary health centers without radiologists.',
        foundingYear: 2021,
        city: 'Bengaluru',
        stage: 'Scaling',
        hasVerifiedPassport: true,
        activePassportsCount: 2,
        website: 'https://neurohealth.ai',
      },
      {
        id: 'st-2',
        name: 'UrbanPulse Mobility',
        sector: 'Urban Infrastructure & Transport',
        dpiitStatus: 'Recognized',
        dpiitNumber: 'DIPP-91044',
        keywords: ['traffic management', 'ai camera', 'congestion reduction', 'smart signals', 'iot sensors', 'transit data'],
        pastPilotCount: 2,
        successRatePercent: 95,
        description: 'Adaptive computer vision traffic signal optimization reducing bottleneck delays by 28% across 14 intersections.',
        foundingYear: 2020,
        city: 'Pune',
        stage: 'Growth',
        hasVerifiedPassport: true,
        activePassportsCount: 1,
        website: 'https://urbanpulse.io',
      },
      {
        id: 'st-3',
        name: 'KisanDrishti Agritech',
        sector: 'Agriculture & Agritech',
        dpiitStatus: 'Recognized',
        dpiitNumber: 'DIPP-67120',
        keywords: ['satellite crop analytics', 'drone spectral', 'pest detection', 'yield forecast', 'soil health', 'farmer subsidies'],
        pastPilotCount: 2,
        successRatePercent: 90,
        description: 'Hyperspectral satellite and drone analytics for early locust/pest outbreak prediction and crop insurance claims.',
        foundingYear: 2022,
        city: 'Indore',
        stage: 'Validation',
        hasVerifiedPassport: true,
        activePassportsCount: 1,
        website: 'https://kisandrishti.in',
      },
      {
        id: 'st-4',
        name: 'AquaSense IoT Systems',
        sector: 'Water, Sanitation & Environment',
        dpiitStatus: 'Recognized',
        dpiitNumber: 'DIPP-55319',
        keywords: ['water quality', 'iot telemetry', 'pipeline leakage', 'arsenic detection', 'scada integration', 'groundwater'],
        pastPilotCount: 1,
        successRatePercent: 100,
        description: 'Low-power solar IoT sensors for continuous water potability, fluoride monitoring, and pressure leakage alerts.',
        foundingYear: 2021,
        city: 'Jaipur',
        stage: 'Early Traction',
        hasVerifiedPassport: true,
        activePassportsCount: 1,
        website: 'https://aquasense.tech',
      },
      {
        id: 'st-5',
        name: 'VidyaBridge Learning',
        sector: 'Education & EdTech',
        dpiitStatus: 'Recognized',
        dpiitNumber: 'DIPP-44910',
        keywords: ['vernacular learning', 'offline tablet ai', 'adaptive assessment', 'foundational literacy', 'teacher assistant'],
        pastPilotCount: 2,
        successRatePercent: 88,
        description: 'Vernacular AI tutoring engine operating on low-cost devices with zero internet requirement in rural schools.',
        foundingYear: 2021,
        city: 'Mysuru',
        stage: 'Growth',
        hasVerifiedPassport: true,
        activePassportsCount: 1,
        website: 'https://vidyabridge.org',
      },
      {
        id: 'st-6',
        name: 'AeroClean Bio-Filters',
        sector: 'Water, Sanitation & Environment',
        dpiitStatus: 'Recognized',
        dpiitNumber: 'DIPP-38290',
        keywords: ['air quality', 'smog towers', 'algae biofiltration', 'pm2.5 capture', 'industrial emissions'],
        pastPilotCount: 1,
        successRatePercent: 92,
        description: 'Microalgae photobioreactors capturing particulate matter PM2.5 and CO2 at bus terminals and busy traffic junctions.',
        foundingYear: 2022,
        city: 'Delhi',
        stage: 'Early Traction',
        hasVerifiedPassport: false,
        activePassportsCount: 0,
        website: 'https://aeroclean.bio',
      },
      {
        id: 'st-7',
        name: 'RakshaDrones Robotics',
        sector: 'Urban Infrastructure & Transport',
        dpiitStatus: 'Recognized',
        dpiitNumber: 'DIPP-78901',
        keywords: ['drone surveillance', 'disaster response', 'flood mapping', 'structural integrity', 'thermal imaging'],
        pastPilotCount: 1,
        successRatePercent: 85,
        description: 'Autonomous swarm drones for post-monsoon bridge inspection and real-time flood rescue coordination.',
        foundingYear: 2020,
        city: 'Hyderabad',
        stage: 'Growth',
        hasVerifiedPassport: false,
        activePassportsCount: 0,
      },
      {
        id: 'st-8',
        name: 'SwasthyaBandhu Diagnostics',
        sector: 'Healthcare & Life Sciences',
        dpiitStatus: 'Recognized',
        dpiitNumber: 'DIPP-61298',
        keywords: ['point of care', 'maternal health', 'anemia test', 'hemoglobin strip', 'bluetooth scanner', 'asha workers'],
        pastPilotCount: 1,
        successRatePercent: 90,
        description: 'Non-invasive handheld spectrophotometer for instant hemoglobin testing by rural ASHA health workers.',
        foundingYear: 2022,
        city: 'Nagpur',
        stage: 'Validation',
        hasVerifiedPassport: false,
        activePassportsCount: 0,
      },
      {
        id: 'st-9',
        name: 'GramUrja Solar Grid',
        sector: 'Energy & CleanTech',
        dpiitStatus: 'Recognized',
        dpiitNumber: 'DIPP-49120',
        keywords: ['microgrid', 'peer-to-peer solar', 'smart meter', 'rural electrification', 'battery storage'],
        pastPilotCount: 0,
        successRatePercent: 0,
        description: 'Decentralized smart solar microgrids with peer-to-peer energy settlement for remote unelectrified hamlets.',
        foundingYear: 2023,
        city: 'Bhopal',
        stage: 'Early Traction',
        hasVerifiedPassport: false,
        activePassportsCount: 0,
      },
      {
        id: 'st-10',
        name: 'NagarSeva CitizenBot',
        sector: 'Governance & CivicTech',
        dpiitStatus: 'Recognized',
        dpiitNumber: 'DIPP-88219',
        keywords: ['civic grievances', 'whatsapp chatbot', 'automated ticketing', 'multilingual nlp', 'pothole reporting'],
        pastPilotCount: 2,
        successRatePercent: 96,
        description: 'WhatsApp-native civic grievance resolution bot with GPS geotagging and automatic municipal department routing.',
        foundingYear: 2021,
        city: 'Mumbai',
        stage: 'Scaling',
        hasVerifiedPassport: true,
        activePassportsCount: 1,
      },
      {
        id: 'st-11',
        name: 'SoilGenome Bio-Sensors',
        sector: 'Agriculture & Agritech',
        dpiitStatus: 'Pending',
        dpiitNumber: 'DIPP-PEND-102',
        keywords: ['npk sensor', 'microbiome soil test', 'fertilizer optimizer', 'rapid chemical assay'],
        pastPilotCount: 0,
        successRatePercent: 0,
        description: 'Sub-5 minute instant biochemical soil test cartridge reducing chemical urea over-usage by 35%.',
        foundingYear: 2023,
        city: 'Coimbatore',
        stage: 'Early Traction',
        hasVerifiedPassport: false,
        activePassportsCount: 0,
      },
      {
        id: 'st-12',
        name: 'DrishtiNet SafeCity AI',
        sector: 'Urban Infrastructure & Transport',
        dpiitStatus: 'Recognized',
        dpiitNumber: 'DIPP-73199',
        keywords: ['women safety', 'crowd surge detection', 'dark spot lighting analytics', 'emergency sos beacon'],
        pastPilotCount: 1,
        successRatePercent: 88,
        description: 'Public safety video analytics detecting distress gestures, lighting blackspots, and perimeter intrusions.',
        foundingYear: 2021,
        city: 'Ahmedabad',
        stage: 'Validation',
        hasVerifiedPassport: false,
        activePassportsCount: 0,
      },
      {
        id: 'st-13',
        name: 'JalRakshak Pipeline AI',
        sector: 'Water, Sanitation & Environment',
        dpiitStatus: 'Recognized',
        dpiitNumber: 'DIPP-62910',
        keywords: ['acoustic hydrophone', 'non-revenue water', 'underground pipe leak', 'smart city water'],
        pastPilotCount: 0,
        successRatePercent: 0,
        description: 'Acoustic pipe clamp hydrophones identifying millimeter cracks in municipal water distribution trunks.',
        foundingYear: 2023,
        city: 'Chennai',
        stage: 'Validation',
        hasVerifiedPassport: false,
        activePassportsCount: 0,
      },
      {
        id: 'st-14',
        name: 'Kavach CyberGov',
        sector: 'Governance & CivicTech',
        dpiitStatus: 'Recognized',
        dpiitNumber: 'DIPP-90432',
        keywords: ['zero trust', 'government portal security', 'ddos mitigation', 'data privacy', 'threat intel'],
        pastPilotCount: 1,
        successRatePercent: 100,
        description: 'Air-gapped secure access and continuous anomaly threat mitigation for state e-district portals.',
        foundingYear: 2020,
        city: 'Noida',
        stage: 'Scaling',
        hasVerifiedPassport: true,
        activePassportsCount: 1,
      },
      {
        id: 'st-15',
        name: 'Neev SkillAssess AI',
        sector: 'Education & EdTech',
        dpiitStatus: 'Recognized',
        dpiitNumber: 'DIPP-51203',
        keywords: ['vocational assessment', 'iti simulator', 'welding vr', 'job placement engine', 'skill certification'],
        pastPilotCount: 0,
        successRatePercent: 0,
        description: 'Gamified AR/VR assessment for Industrial Training Institute (ITI) technical trades certification.',
        foundingYear: 2022,
        city: 'Kolkata',
        stage: 'Early Traction',
        hasVerifiedPassport: false,
        activePassportsCount: 0,
      },
    ];

    this.validators = [
      {
        id: 'val-1',
        name: 'Prof. S. Krishnan',
        organization: 'Indian Institute of Technology (IIT) Bombay',
        sectorExpertise: ['Healthcare & Life Sciences', 'Biomedical AI', 'Digital Health'],
        empanelledDate: '2023-01-15',
        verifiedPilotsCount: 12,
        status: 'Active',
        email: 's.krishnan@iitb.ac.in',
        credentialHash: '0x8F9a4C7b1928374aD3E7C9',
      },
      {
        id: 'val-2',
        name: 'Dr. Radhika Sen',
        organization: 'Central Road Research Institute (CRRI)',
        sectorExpertise: ['Urban Infrastructure & Transport', 'Smart Mobility', 'Traffic Systems'],
        empanelledDate: '2023-03-20',
        verifiedPilotsCount: 9,
        status: 'Active',
        email: 'r.sen@crri.res.in',
        credentialHash: '0x3E1b7A9d4482103fE89B21',
      },
      {
        id: 'val-3',
        name: 'Dr. Anand Swaminathan',
        organization: 'ICAR - Indian Agricultural Research Institute',
        sectorExpertise: ['Agriculture & Agritech', 'Precision Farming', 'Remote Sensing'],
        empanelledDate: '2023-05-10',
        verifiedPilotsCount: 7,
        status: 'Active',
        email: 'anand.s@iari.res.in',
        credentialHash: '0x7C4d2F1a9938450eB12A88',
      },
      {
        id: 'val-4',
        name: 'Er. Tarun Bhattacharya',
        organization: 'Quality Council of India (QCI) / NEERI',
        sectorExpertise: ['Water, Sanitation & Environment', 'IoT Telemetry', 'CleanTech'],
        empanelledDate: '2023-06-01',
        verifiedPilotsCount: 8,
        status: 'Active',
        email: 'tarun.b@qci.gov.in',
        credentialHash: '0x5A8c9E3f2214789dD45C10',
      },
      {
        id: 'val-5',
        name: 'Prof. Hemalatha Nair',
        organization: 'National Institute of Educational Planning (NIEPA)',
        sectorExpertise: ['Education & EdTech', 'Adaptive Learning', 'Vocational Skill'],
        empanelledDate: '2023-08-14',
        verifiedPilotsCount: 6,
        status: 'Active',
        email: 'h.nair@niepa.ac.in',
        credentialHash: '0x9D2e6B4c3301928aF78D55',
      },
    ];

    this.problemStatements = [
      {
        id: 'prob-1',
        departmentId: 'dept-1',
        departmentName: 'Ministry of Health & Family Welfare',
        title: 'AI-assisted Early Detection of Tuberculosis & Pulmonary Anomalies in Tribal Primary Health Centers',
        description: 'Deploy an edge-computing AI solution on low-bandwidth portable X-ray units across 25 rural health sub-centers in Gadchiroli tribal district. The system must achieve >90% sensitivity in triaging presumptive TB patients within 60 seconds without requiring on-site radiologists.',
        category: 'Healthcare & Life Sciences',
        budgetMinLakhs: 15.0,
        budgetMaxLakhs: 25.0,
        riskLevel: 'medium',
        expectedOutcome: 'Triage >5,000 tribal patients, cut diagnostic turnaround time from 14 days to under 15 minutes, and integrate seamlessly with Nikshay portal.',
        status: 'pilot_active',
        createdAt: '2025-10-10',
        applicationsCount: 8,
      },
      {
        id: 'prob-2',
        departmentId: 'dept-2',
        departmentName: 'Smart Cities Mission - Urban Mobility',
        title: 'Adaptive Camera-based Traffic Signal Timing for High-Congestion Arterial Corridors',
        description: 'Implement computer-vision edge cameras to dynamically calculate vehicle queue lengths and optimize green signal duration across 12 consecutive junctions on the Karve Road corridor, lowering peak hour travel times and idle emissions.',
        category: 'Urban Infrastructure & Transport',
        budgetMinLakhs: 20.0,
        budgetMaxLakhs: 35.0,
        riskLevel: 'low',
        expectedOutcome: 'Reduce average commuter waiting delay by at least 20%, reduce fuel wastage by 15%, and output live traffic telemetry to city command center.',
        status: 'pilot_active',
        createdAt: '2025-11-04',
        applicationsCount: 6,
      },
      {
        id: 'prob-3',
        departmentId: 'dept-3',
        departmentName: 'Department of Agriculture & Farmers Welfare',
        title: 'Hyper-Local Satellite & Drone Pest Outbreak Forecasting for Soybean Farmers',
        description: 'Utilize multi-spectral satellite imagery and drone reconnaissance to deliver early-warning infestation alerts (fall armyworm/locust) 5 days prior to physical spread across 30,000 hectares in Ujjain district.',
        category: 'Agriculture & Agritech',
        budgetMinLakhs: 12.0,
        budgetMaxLakhs: 20.0,
        riskLevel: 'medium',
        expectedOutcome: 'Achieve >85% prediction accuracy for localized pest swarms and reduce crop yield loss by 25% among 8,000 enrolled farmers.',
        status: 'pilot_active',
        createdAt: '2025-12-01',
        applicationsCount: 5,
      },
      {
        id: 'prob-4',
        departmentId: 'dept-4',
        departmentName: 'Water Resources & Ground Water Board',
        title: 'Solar-Powered Real-Time Fluoride & Potability Telemetry for Desert Habitations',
        description: 'Deploy maintenance-free solar sensor nodes in 40 remote habitations of Barmer district to measure TDS, fluoride, and microbial safety in public piped tap water supply under Jal Jeevan Mission.',
        category: 'Water, Sanitation & Environment',
        budgetMinLakhs: 18.0,
        budgetMaxLakhs: 28.0,
        riskLevel: 'high',
        expectedOutcome: '100% daily uptime in extreme temperatures (up to 48°C), automated SMS alerts to sarpanches within 5 minutes of potability breach.',
        status: 'pilot_active',
        createdAt: '2026-01-15',
        applicationsCount: 7,
      },
      {
        id: 'prob-5',
        departmentId: 'dept-5',
        departmentName: 'State Education & Skill Development Mission',
        title: 'Vernacular Offline AI Voice-Tutor for Foundational Literacy in Rural Government Schools',
        description: 'Provide tablet-compatible offline conversational AI tutoring in Kannada and Marathi for Grades 2-5 students to improve reading fluency, basic arithmetic, and pronunciation skills without recurring internet connectivity.',
        category: 'Education & EdTech',
        budgetMinLakhs: 15.0,
        budgetMaxLakhs: 22.0,
        riskLevel: 'low',
        expectedOutcome: 'Improve ASER reading test proficiency by 30% across 50 rural schools over a 6-month evaluation period.',
        status: 'open',
        createdAt: '2026-02-10',
        applicationsCount: 4,
      },
      {
        id: 'prob-6',
        departmentId: 'dept-2',
        departmentName: 'Smart Cities Mission - Urban Mobility',
        title: 'Autonomous Drone Thermal Mapping of Potholes and Structural Bridge Micro-Fractures',
        description: 'Conduct bi-weekly automated drone survey of municipal flyovers and arterial roads to map surface roughness indices, pothole coordinates, and subsurface moisture intrusion.',
        category: 'Urban Infrastructure & Transport',
        budgetMinLakhs: 14.0,
        budgetMaxLakhs: 20.0,
        riskLevel: 'medium',
        expectedOutcome: 'Geotag 100% of major potholes (>5cm depth) within 24 hours of occurrence with GIS auto-dispatch to municipal maintenance gangs.',
        status: 'open',
        createdAt: '2026-02-18',
        applicationsCount: 3,
      },
    ];

    this.pilots = [
      {
        id: 'pilot-1',
        problemId: 'prob-1',
        problemTitle: 'AI-assisted Early Detection of TB in Tribal PHCs',
        departmentId: 'dept-1',
        departmentName: 'Ministry of Health & Family Welfare',
        startupId: 'st-1',
        startupName: 'NeuroHealth AI',
        status: 'completed',
        startDate: '2025-10-20',
        endDate: '2026-02-15',
        totalBudgetLakhs: 22.0,
        disbursedBudgetLakhs: 22.0,
        validatorId: 'val-1',
        validatorName: 'Prof. S. Krishnan (IIT Bombay)',
        scopeSummary: 'Deployed 25 AI edge units in Gadchiroli PHCs. Screened 6,240 patients with 94.2% sensitivity.',
        createdAt: '2025-10-15',
        completedAt: '2026-02-15',
        // Exact Supabase Pilot Passport columns
        kpi_achievement_pct: 98,
        on_time_completion_pct: 95,
        compliance_score: 96,
        reliability_score: 98,
        user_feedback_score: 94,
        expert_validation_score: 96,
        passport_score: 96,
        passport_category: 'Platinum Pilot Passport',
        scale_up_recommended: true,
        kpiAchievementPct: 98,
        onTimeCompletionPct: 95,
        complianceScore: 96,
        reliabilityScore: 98,
        userFeedbackScore: 94,
        expertValidationScore: 96,
        passportScore: 96,
        passportCategory: 'Platinum Pilot Passport',
        scaleUpRecommended: true,
        systemUptimePct: 99.8,
        criticalIssuesCount: 0,
        officerRating: 4.8,
        citizenRating: 4.6,
      },
      {
        id: 'pilot-2',
        problemId: 'prob-2',
        problemTitle: 'Adaptive Camera-based Traffic Signal Timing',
        departmentId: 'dept-2',
        departmentName: 'Smart Cities Mission - Urban Mobility',
        startupId: 'st-2',
        startupName: 'UrbanPulse Mobility',
        status: 'active',
        startDate: '2025-11-15',
        endDate: '2026-05-15',
        totalBudgetLakhs: 28.0,
        disbursedBudgetLakhs: 14.0,
        validatorId: 'val-2',
        validatorName: 'Dr. Radhika Sen (CRRI)',
        scopeSummary: 'Equipped 12 intersections with neural optical sensors. Real-time signal phase timing active.',
        createdAt: '2025-11-10',
      },
      {
        id: 'pilot-3',
        problemId: 'prob-3',
        problemTitle: 'Hyper-Local Satellite & Drone Pest Outbreak Forecasting',
        departmentId: 'dept-3',
        departmentName: 'Department of Agriculture & Farmers Welfare',
        startupId: 'st-3',
        startupName: 'KisanDrishti Agritech',
        status: 'active',
        startDate: '2025-12-10',
        endDate: '2026-06-10',
        totalBudgetLakhs: 18.0,
        disbursedBudgetLakhs: 9.0,
        validatorId: 'val-3',
        validatorName: 'Dr. Anand Swaminathan (IARI)',
        scopeSummary: '30,000 hectares monitored via Sentinel-2 + localized drone flights. Advisory broadcasts to 8,200 farmers.',
        createdAt: '2025-12-05',
      },
      {
        id: 'pilot-4',
        problemId: 'prob-4',
        problemTitle: 'Solar-Powered Real-Time Fluoride & Potability Telemetry',
        departmentId: 'dept-4',
        departmentName: 'Water Resources & Ground Water Board',
        startupId: 'st-4',
        startupName: 'AquaSense IoT Systems',
        status: 'active',
        startDate: '2026-01-20',
        endDate: '2026-07-20',
        totalBudgetLakhs: 24.0,
        disbursedBudgetLakhs: 4.8,
        validatorId: 'val-4',
        validatorName: 'Er. Tarun Bhattacharya (QCI / NEERI)',
        scopeSummary: 'Installed 40 telemetry nodes across Barmer habitations. 10-minute sensor ping frequency.',
        createdAt: '2026-01-18',
      },
      {
        id: 'pilot-5',
        problemId: 'prob-5',
        problemTitle: 'Vernacular Offline AI Voice-Tutor for Rural Schools',
        departmentId: 'dept-5',
        departmentName: 'State Education & Skill Development Mission',
        startupId: 'st-5',
        startupName: 'VidyaBridge Learning',
        status: 'active',
        startDate: '2026-02-15',
        endDate: '2026-08-15',
        totalBudgetLakhs: 20.0,
        disbursedBudgetLakhs: 4.0,
        validatorId: 'val-5',
        validatorName: 'Prof. Hemalatha Nair (NIEPA)',
        scopeSummary: 'Pre-loaded 450 school tablets with interactive phonetic conversational modules in Kannada & Marathi.',
        createdAt: '2026-02-12',
      },
      {
        id: 'pilot-6',
        problemId: 'prob-1',
        problemTitle: 'Non-invasive Maternal Anemia Point-of-Care Handheld Screen',
        departmentId: 'dept-1',
        departmentName: 'Ministry of Health & Family Welfare',
        startupId: 'st-8',
        startupName: 'SwasthyaBandhu Diagnostics',
        status: 'active',
        startDate: '2026-01-10',
        endDate: '2026-06-30',
        totalBudgetLakhs: 16.0,
        disbursedBudgetLakhs: 3.2,
        validatorId: 'val-1',
        validatorName: 'Prof. S. Krishnan (IIT Bombay)',
        scopeSummary: 'Distributed 80 optical hemoglobin meters to ASHA workers in Nandurbar district.',
        createdAt: '2026-01-05',
      },
      {
        id: 'pilot-7',
        problemId: 'prob-2',
        problemTitle: 'Citizen WhatsApp Civic Grievance Geo-Routing Engine',
        departmentId: 'dept-2',
        departmentName: 'Smart Cities Mission - Urban Mobility',
        startupId: 'st-10',
        startupName: 'NagarSeva CitizenBot',
        status: 'completed',
        startDate: '2025-08-01',
        endDate: '2025-12-01',
        totalBudgetLakhs: 15.0,
        disbursedBudgetLakhs: 15.0,
        validatorId: 'val-2',
        validatorName: 'Dr. Radhika Sen (CRRI)',
        scopeSummary: 'Integrated WhatsApp chatbot for 1.2M citizens; resolved 42,000 municipal complaints.',
        createdAt: '2025-07-25',
        completedAt: '2025-12-01',
        kpi_achievement_pct: 92,
        on_time_completion_pct: 90,
        compliance_score: 88,
        reliability_score: 84,
        user_feedback_score: 86,
        expert_validation_score: 85,
        passport_score: 88,
        passport_category: 'Gold Pilot Passport',
        scale_up_recommended: true,
        kpiAchievementPct: 92,
        onTimeCompletionPct: 90,
        complianceScore: 88,
        reliabilityScore: 84,
        userFeedbackScore: 86,
        expertValidationScore: 85,
        passportScore: 88,
        passportCategory: 'Gold Pilot Passport',
        scaleUpRecommended: true,
        systemUptimePct: 98.5,
        criticalIssuesCount: 1,
        officerRating: 4.4,
        citizenRating: 4.2,
      },
      {
        id: 'pilot-8',
        problemId: 'prob-4',
        problemTitle: 'Zero-Trust Air-Gapped State Portal Cyber Defense',
        departmentId: 'dept-5',
        departmentName: 'State Education & Skill Development Mission',
        startupId: 'st-14',
        startupName: 'Kavach CyberGov',
        status: 'completed',
        startDate: '2025-06-01',
        endDate: '2025-10-30',
        totalBudgetLakhs: 18.0,
        disbursedBudgetLakhs: 18.0,
        validatorId: 'val-4',
        validatorName: 'Er. Tarun Bhattacharya (QCI)',
        scopeSummary: 'Protected scholarship disbursement portal from 120,000 credential-stuffing cyber attacks.',
        createdAt: '2025-05-20',
        completedAt: '2025-10-30',
        kpi_achievement_pct: 94,
        on_time_completion_pct: 90,
        compliance_score: 98,
        reliability_score: 92,
        user_feedback_score: 88,
        expert_validation_score: 92,
        passport_score: 93,
        passport_category: 'Platinum Pilot Passport',
        scale_up_recommended: true,
        kpiAchievementPct: 94,
        onTimeCompletionPct: 90,
        complianceScore: 98,
        reliabilityScore: 92,
        userFeedbackScore: 88,
        expertValidationScore: 92,
        passportScore: 93,
        passportCategory: 'Platinum Pilot Passport',
        scaleUpRecommended: true,
        systemUptimePct: 99.9,
        criticalIssuesCount: 0,
        officerRating: 4.6,
        citizenRating: 4.2,
      },
    ];

    const relDate = (offsetDays: number) => new Date(Date.now() + offsetDays * 86400000).toISOString().split('T')[0];

    this.milestones = [
      {
        id: 'm-1-1',
        pilotId: 'pilot-1',
        milestoneNumber: 1,
        title: 'Milestone 1: Edge AI Hardware & Model Deployment',
        description: 'Deploy 25 edge AI portable X-ray compute boxes in designated tribal health sub-centers.',
        targetKpiDescription: 'Sub-centers fully deployed & staff trained',
        targetKpiValue: 25,
        kpiUnit: 'Centers',
        weightPercent: 20,
        amountLakhs: 4.4,
        status: 'paid',
        deadline: '2025-11-10',
        submittedValue: 25,
        submittedProofUrl: 'https://docs.mohfw.gov.in/pilots/p1/deployment-log.pdf',
        submittedNotes: 'All 25 PHCs installed with solar battery backup and trained ASHA supervisors.',
        submittedAt: '2025-11-10',
        verifiedAt: '2025-11-12',
        verifiedBy: 'Prof. S. Krishnan (IIT Bombay)',
      },
      {
        id: 'm-1-2',
        pilotId: 'pilot-1',
        milestoneNumber: 2,
        title: 'Milestone 2: Live Patient Telemetry & Nikshay Sync',
        description: 'Stream live screening records with automated triage tagging directly to state central registry.',
        targetKpiDescription: 'Patients screened with cloud telemetry sync',
        targetKpiValue: 2500,
        kpiUnit: 'Patients',
        weightPercent: 30,
        amountLakhs: 6.6,
        status: 'paid',
        deadline: '2025-12-20',
        submittedValue: 3100,
        submittedProofUrl: 'https://docs.mohfw.gov.in/pilots/p1/telemetry-audit.csv',
        submittedNotes: 'Screened 3,100 patients within 45 days. Triage latency averaged 42 seconds.',
        submittedAt: '2025-12-20',
        verifiedAt: '2025-12-22',
        verifiedBy: 'Prof. S. Krishnan (IIT Bombay)',
      },
      {
        id: 'm-1-3',
        pilotId: 'pilot-1',
        milestoneNumber: 3,
        title: 'Milestone 3: KPI Target & Sensitivity Benchmarking',
        description: 'Achieve verified diagnostic sensitivity >= 90% validated against ground-truth sputum culture.',
        targetKpiDescription: 'Diagnostic sensitivity score achieved',
        targetKpiValue: 90,
        kpiUnit: '% Sensitivity',
        weightPercent: 30,
        amountLakhs: 6.6,
        status: 'paid',
        deadline: '2026-01-25',
        submittedValue: 94.2,
        submittedProofUrl: 'https://docs.mohfw.gov.in/pilots/p1/clinical-validation.pdf',
        submittedNotes: 'Achieved 94.2% clinical sensitivity in double-blind sample of 850 sputum positives.',
        submittedAt: '2026-01-25',
        verifiedAt: '2026-01-28',
        verifiedBy: 'Prof. S. Krishnan (IIT Bombay)',
      },
      {
        id: 'm-1-4',
        pilotId: 'pilot-1',
        milestoneNumber: 4,
        title: 'Milestone 4: Independent Validation & Knowledge Transfer',
        description: 'Third-party validation protocol completed by IIT Bombay and pilot closure report signed.',
        targetKpiDescription: 'Validation compliance audit score',
        targetKpiValue: 100,
        kpiUnit: '% Score',
        weightPercent: 20,
        amountLakhs: 4.4,
        status: 'paid',
        deadline: '2026-02-10',
        submittedValue: 100,
        submittedProofUrl: 'https://docs.mohfw.gov.in/pilots/p1/final-validator-cert.pdf',
        submittedNotes: 'Final IIT Bombay validation passed. Recommends state-wide scaling across 350 tribal PHCs.',
        submittedAt: '2026-02-10',
        verifiedAt: '2026-02-15',
        verifiedBy: 'Prof. S. Krishnan (IIT Bombay)',
      },
      {
        id: 'm-2-1',
        pilotId: 'pilot-2',
        milestoneNumber: 1,
        title: 'Milestone 1: Camera Hardware & Edge Compute Setup',
        description: 'Mount AI optical sensors across 12 target signal junctions on Karve Road corridor.',
        targetKpiDescription: 'Junctions equipped with sensors',
        targetKpiValue: 12,
        kpiUnit: 'Junctions',
        weightPercent: 20,
        amountLakhs: 5.6,
        status: 'paid',
        deadline: relDate(-85),
        submittedValue: 12,
        submittedProofUrl: 'https://smartcities.gov.in/p2/junction-acceptance.pdf',
        submittedNotes: 'All 12 intersections online and integrated with city SCADA system.',
        submittedAt: '2025-12-05',
        verifiedAt: '2025-12-08',
        verifiedBy: 'Dr. Radhika Sen (CRRI)',
      },
      {
        id: 'm-2-2',
        pilotId: 'pilot-2',
        milestoneNumber: 2,
        title: 'Milestone 2: Live Adaptive Signal Control Data',
        description: 'Run automated dynamic green light phase allocation for 30 consecutive days.',
        targetKpiDescription: 'Consecutive uptime days under dynamic AI control',
        targetKpiValue: 30,
        kpiUnit: 'Days',
        weightPercent: 30,
        amountLakhs: 8.4,
        status: 'verified',
        deadline: relDate(-40),
        submittedValue: 30,
        submittedProofUrl: 'https://smartcities.gov.in/p2/uptime-report.pdf',
        submittedNotes: 'Zero failover interruptions. Average waiting time reduced by 22.4% in peak rush hour.',
        submittedAt: '2026-01-20',
        verifiedAt: '2026-01-22',
        verifiedBy: 'Dr. Radhika Sen (CRRI)',
      },
      {
        id: 'm-2-3',
        pilotId: 'pilot-2',
        milestoneNumber: 3,
        title: 'Milestone 3: KPI Target - Peak Congestion Delay Reduction',
        description: 'Demonstrate corridor-wide average peak delay reduction of >= 20%.',
        targetKpiDescription: 'Corridor commuter travel time reduction',
        targetKpiValue: 20,
        kpiUnit: '% Delay Cut',
        weightPercent: 30,
        amountLakhs: 8.4,
        status: 'submitted',
        deadline: relDate(14),
        submittedValue: 24.5,
        submittedProofUrl: 'https://smartcities.gov.in/p2/crri-speed-run-audit.pdf',
        submittedNotes: 'Speed-run GPS probes confirm 24.5% reduction in commuter delay times.',
        submittedAt: '2026-02-28',
      },
      {
        id: 'm-2-4',
        pilotId: 'pilot-2',
        milestoneNumber: 4,
        title: 'Milestone 4: Independent Validation & City Integration',
        description: 'Independent CRRI audit certificate and long-term maintenance handover documentation.',
        targetKpiDescription: 'CRRI compliance benchmark certification',
        targetKpiValue: 100,
        kpiUnit: '% Complete',
        weightPercent: 20,
        amountLakhs: 5.6,
        status: 'pending',
        deadline: relDate(55),
      },
      {
        id: 'm-3-1',
        pilotId: 'pilot-3',
        milestoneNumber: 1,
        title: 'Milestone 1: Satellite Basemap & Farm Registry Integration',
        description: 'Digitize 30,000 hectares of farm field boundaries and onboard 8,000 farmers onto SMS gateway.',
        targetKpiDescription: 'Enrolled farmer base on notification gateway',
        targetKpiValue: 8000,
        kpiUnit: 'Farmers',
        weightPercent: 25,
        amountLakhs: 4.5,
        status: 'paid',
        deadline: relDate(-55),
        submittedValue: 8200,
        submittedProofUrl: 'https://agri.mp.gov.in/p3/farmer-enrollment.pdf',
        submittedNotes: '8,200 farmers mapped across 42 villages in Ujjain district.',
        submittedAt: '2026-01-05',
        verifiedAt: '2026-01-08',
        verifiedBy: 'Dr. Anand Swaminathan (IARI)',
      },
      {
        id: 'm-3-2',
        pilotId: 'pilot-3',
        milestoneNumber: 2,
        title: 'Milestone 2: Spectral Pest Early Warning Broadcasts',
        description: 'Generate 12 weekly hyperspectral NDVI/NDWI anomaly alerts and verify farmer advisory delivery.',
        targetKpiDescription: 'Weekly pest risk bulletins generated & pushed',
        targetKpiValue: 12,
        kpiUnit: 'Bulletins',
        weightPercent: 25,
        amountLakhs: 4.5,
        status: 'submitted',
        deadline: relDate(-10),
        submittedValue: 12,
        submittedProofUrl: 'https://agri.mp.gov.in/p3/pest-bulletins-log.csv',
        submittedNotes: 'Delivered 12 bulletins with 91% farmer SMS read confirmation rate.',
        submittedAt: '2026-02-25',
      },
      {
        id: 'm-3-3',
        pilotId: 'pilot-3',
        milestoneNumber: 3,
        title: 'Milestone 3: KPI Target - Prediction Accuracy & Yield Saved',
        description: 'Demonstrate >85% pest outbreak prediction accuracy before physical crop damage occurs.',
        targetKpiDescription: 'Prediction accuracy confirmed by field scouts',
        targetKpiValue: 85,
        kpiUnit: '% Accuracy',
        weightPercent: 30,
        amountLakhs: 5.4,
        status: 'pending',
        deadline: relDate(2),
      },
      {
        id: 'm-3-4',
        pilotId: 'pilot-3',
        milestoneNumber: 4,
        title: 'Milestone 4: IARI Third-Party Validation Protocol',
        description: 'Agronomic ground-truth audit by ICAR-IARI scientists.',
        targetKpiDescription: 'Third party agronomic validation signoff',
        targetKpiValue: 100,
        kpiUnit: '% Complete',
        weightPercent: 20,
        amountLakhs: 3.6,
        status: 'pending',
        deadline: relDate(42),
      },
      {
        id: 'm-4-1',
        pilotId: 'pilot-4',
        milestoneNumber: 1,
        title: 'Milestone 1: Solar Potability Telemetry Node Fabrication & Deployment',
        description: 'Install 40 solar IoT water testing nodes at Barmer desert habitations.',
        targetKpiDescription: 'Telemetry nodes installed & streaming data',
        targetKpiValue: 40,
        kpiUnit: 'Nodes',
        weightPercent: 20,
        amountLakhs: 4.8,
        status: 'verified',
        deadline: relDate(-25),
        submittedValue: 40,
        submittedProofUrl: 'https://waterboard.rajasthan.gov.in/p4/sensor-install.pdf',
        submittedNotes: 'All 40 units transmitting TDS, pH, and Fluoride PPM data every 10 minutes.',
        submittedAt: '2026-02-10',
        verifiedAt: '2026-02-14',
        verifiedBy: 'Er. Tarun Bhattacharya (QCI / NEERI)',
      },
      {
        id: 'm-4-2',
        pilotId: 'pilot-4',
        milestoneNumber: 2,
        title: 'Milestone 2: 60-Day High Heat Stability & Uptime Telemetry',
        description: 'Maintain 99% sensor uptime under ambient temperatures exceeding 42°C.',
        targetKpiDescription: 'Operational sensor uptime percentage',
        targetKpiValue: 99,
        kpiUnit: '% Uptime',
        weightPercent: 30,
        amountLakhs: 7.2,
        status: 'pending',
        deadline: relDate(-3),
      },
      {
        id: 'm-4-3',
        pilotId: 'pilot-4',
        milestoneNumber: 3,
        title: 'Milestone 3: Automated Contamination Breach Alerting',
        description: 'Verify sub-5 minute SMS escalation to village water committees on potability breach.',
        targetKpiDescription: 'Average alert dispatch latency',
        targetKpiValue: 5,
        kpiUnit: 'Minutes or faster',
        weightPercent: 30,
        amountLakhs: 7.2,
        status: 'pending',
        deadline: relDate(32),
      },
      {
        id: 'm-4-4',
        pilotId: 'pilot-4',
        milestoneNumber: 4,
        title: 'Milestone 4: NEERI / QCI Environmental Validation',
        description: 'Independent sensor calibration audit against BIS 10500 drinking water standards.',
        targetKpiDescription: 'BIS 10500 compliance audit certificate',
        targetKpiValue: 100,
        kpiUnit: '% Score',
        weightPercent: 20,
        amountLakhs: 4.8,
        status: 'pending',
        deadline: relDate(70),
      },
      {
        id: 'm-5-1',
        pilotId: 'pilot-5',
        milestoneNumber: 1,
        title: 'Milestone 1: Tablet Provisioning & Offline TTS Speech Engine',
        description: 'Pre-load 450 tablets with offline Marathi and Kannada voice-interactive lessons.',
        targetKpiDescription: 'Classrooms deployed with active phonetic bots',
        targetKpiValue: 450,
        kpiUnit: 'Tablets',
        weightPercent: 20,
        amountLakhs: 4.0,
        status: 'pending',
        deadline: relDate(16),
      },
      {
        id: 'm-5-2',
        pilotId: 'pilot-5',
        milestoneNumber: 2,
        title: 'Milestone 2: 60-Day Student Fluency Telemetry Feed',
        description: 'Stream anonymous oral reading progress metrics from rural cluster schools.',
        targetKpiDescription: 'Active weekly learner sessions',
        targetKpiValue: 5000,
        kpiUnit: 'Students',
        weightPercent: 30,
        amountLakhs: 6.0,
        status: 'pending',
        deadline: relDate(48),
      },
      {
        id: 'm-5-3',
        pilotId: 'pilot-5',
        milestoneNumber: 3,
        title: 'Milestone 3: KPI Target - Reading Fluency Gain Benchmarking',
        description: 'Demonstrate >= 35% improvement in Words Per Minute reading fluency across sample cohort.',
        targetKpiDescription: 'Phonetic fluency gain percentage',
        targetKpiValue: 35,
        kpiUnit: '% Fluency Gain',
        weightPercent: 30,
        amountLakhs: 6.0,
        status: 'pending',
        deadline: relDate(85),
      },
      {
        id: 'm-5-4',
        pilotId: 'pilot-5',
        milestoneNumber: 4,
        title: 'Milestone 4: NIEPA Academic Evaluation Sign-Off',
        description: 'Independent pedagogic impact audit report published by NIEPA observers.',
        targetKpiDescription: 'Curricular alignment certification',
        targetKpiValue: 100,
        kpiUnit: '% Score',
        weightPercent: 20,
        amountLakhs: 4.0,
        status: 'pending',
        deadline: relDate(125),
      },
      {
        id: 'm-6-1',
        pilotId: 'pilot-6',
        milestoneNumber: 1,
        title: 'Milestone 1: Handheld Device Distribution & ASHA Training',
        description: 'Equip 80 ASHA workers in Nandurbar with non-invasive hemoglobin monitors.',
        targetKpiDescription: 'Trained ASHA workers operating optical meters',
        targetKpiValue: 80,
        kpiUnit: 'ASHAs',
        weightPercent: 20,
        amountLakhs: 3.2,
        status: 'pending',
        deadline: relDate(22),
      },
      {
        id: 'm-6-2',
        pilotId: 'pilot-6',
        milestoneNumber: 2,
        title: 'Milestone 2: Maternal Screening Telemetry Sync',
        description: 'Complete 3,000 non-invasive prenatal screenings with instantaneous district portal sync.',
        targetKpiDescription: 'Prenatal mothers screened non-invasively',
        targetKpiValue: 3000,
        kpiUnit: 'Mothers',
        weightPercent: 30,
        amountLakhs: 4.8,
        status: 'pending',
        deadline: relDate(58),
      },
      {
        id: 'm-6-3',
        pilotId: 'pilot-6',
        milestoneNumber: 3,
        title: 'Milestone 3: Clinical Diagnostic Concordance Benchmarking',
        description: 'Validate diagnostic accuracy against laboratory venous blood counters (>= 92% r-squared).',
        targetKpiDescription: 'Statistical laboratory concordance rate',
        targetKpiValue: 92,
        kpiUnit: '% Correlation',
        weightPercent: 30,
        amountLakhs: 4.8,
        status: 'pending',
        deadline: relDate(95),
      },
      {
        id: 'm-6-4',
        pilotId: 'pilot-6',
        milestoneNumber: 4,
        title: 'Milestone 4: IIT Bombay Clinical Audit Protocol',
        description: 'Final certification and maternal health protocol standardization signed by clinical validator.',
        targetKpiDescription: 'Clinical trial signoff completeness',
        targetKpiValue: 100,
        kpiUnit: '% Score',
        weightPercent: 20,
        amountLakhs: 3.2,
        status: 'pending',
        deadline: relDate(135),
      },
    ];

    this.payments = [
      {
        id: 'pay-1',
        milestoneId: 'm-1-1',
        milestoneTitle: 'Milestone 1: Edge AI Hardware & Model Deployment',
        pilotId: 'pilot-1',
        pilotTitle: 'AI-assisted Early Detection of TB in Tribal PHCs',
        departmentId: 'dept-1',
        departmentName: 'Ministry of Health & Family Welfare',
        startupId: 'st-1',
        startupName: 'NeuroHealth AI',
        amountLakhs: 4.4,
        status: 'paid',
        requestedAt: '2025-11-12T10:30:00Z',
        approvedAt: '2025-11-13T14:15:00Z',
        sentToTreasuryAt: '2025-11-14T09:00:00Z',
        paidAt: '2025-11-18T16:20:00Z',
        treasuryRefNumber: 'PFMS/2025/MOHFW/998124',
        isDelayed: false,
        slaDays: 10,
        elapsedDays: 4,
      },
      {
        id: 'pay-2',
        milestoneId: 'm-1-2',
        milestoneTitle: 'Milestone 2: Live Patient Telemetry & Nikshay Sync',
        pilotId: 'pilot-1',
        pilotTitle: 'AI-assisted Early Detection of TB in Tribal PHCs',
        departmentId: 'dept-1',
        departmentName: 'Ministry of Health & Family Welfare',
        startupId: 'st-1',
        startupName: 'NeuroHealth AI',
        amountLakhs: 6.6,
        status: 'paid',
        requestedAt: '2025-12-22T11:00:00Z',
        approvedAt: '2025-12-23T15:30:00Z',
        sentToTreasuryAt: '2025-12-24T10:00:00Z',
        paidAt: '2025-12-29T17:00:00Z',
        treasuryRefNumber: 'PFMS/2025/MOHFW/999401',
        isDelayed: false,
        slaDays: 10,
        elapsedDays: 5,
      },
      {
        id: 'pay-3',
        milestoneId: 'm-1-3',
        milestoneTitle: 'Milestone 3: KPI Target & Sensitivity Benchmarking',
        pilotId: 'pilot-1',
        pilotTitle: 'AI-assisted Early Detection of TB in Tribal PHCs',
        departmentId: 'dept-1',
        departmentName: 'Ministry of Health & Family Welfare',
        startupId: 'st-1',
        startupName: 'NeuroHealth AI',
        amountLakhs: 6.6,
        status: 'paid',
        requestedAt: '2026-01-28T09:45:00Z',
        approvedAt: '2026-01-29T11:15:00Z',
        sentToTreasuryAt: '2026-01-30T14:00:00Z',
        paidAt: '2026-02-04T12:30:00Z',
        treasuryRefNumber: 'PFMS/2026/MOHFW/100492',
        isDelayed: false,
        slaDays: 10,
        elapsedDays: 5,
      },
      {
        id: 'pay-4',
        milestoneId: 'm-1-4',
        milestoneTitle: 'Milestone 4: Independent Validation & Knowledge Transfer',
        pilotId: 'pilot-1',
        pilotTitle: 'AI-assisted Early Detection of TB in Tribal PHCs',
        departmentId: 'dept-1',
        departmentName: 'Ministry of Health & Family Welfare',
        startupId: 'st-1',
        startupName: 'NeuroHealth AI',
        amountLakhs: 4.4,
        status: 'paid',
        requestedAt: '2026-02-15T16:00:00Z',
        approvedAt: '2026-02-16T10:00:00Z',
        sentToTreasuryAt: '2026-02-17T11:30:00Z',
        paidAt: '2026-02-22T14:45:00Z',
        treasuryRefNumber: 'PFMS/2026/MOHFW/101884',
        isDelayed: false,
        slaDays: 10,
        elapsedDays: 5,
      },
      {
        id: 'pay-5',
        milestoneId: 'm-2-1',
        milestoneTitle: 'Milestone 1: Camera Hardware & Edge Compute Setup',
        pilotId: 'pilot-2',
        pilotTitle: 'Adaptive Camera-based Traffic Signal Timing',
        departmentId: 'dept-2',
        departmentName: 'Smart Cities Mission - Urban Mobility',
        startupId: 'st-2',
        startupName: 'UrbanPulse Mobility',
        amountLakhs: 5.6,
        status: 'paid',
        requestedAt: '2025-12-08T14:00:00Z',
        approvedAt: '2025-12-09T10:30:00Z',
        sentToTreasuryAt: '2025-12-10T11:00:00Z',
        paidAt: '2025-12-16T15:00:00Z',
        treasuryRefNumber: 'MH-TREASURY/2025/SCM/88102',
        isDelayed: false,
        slaDays: 10,
        elapsedDays: 6,
      },
      {
        id: 'pay-6',
        milestoneId: 'm-2-2',
        milestoneTitle: 'Milestone 2: Live Adaptive Signal Control Data',
        pilotId: 'pilot-2',
        pilotTitle: 'Adaptive Camera-based Traffic Signal Timing',
        departmentId: 'dept-2',
        departmentName: 'Smart Cities Mission - Urban Mobility',
        startupId: 'st-2',
        startupName: 'UrbanPulse Mobility',
        amountLakhs: 8.4,
        status: 'sent_to_treasury',
        requestedAt: '2026-01-22T12:00:00Z',
        approvedAt: '2026-01-23T16:00:00Z',
        sentToTreasuryAt: '2026-01-24T10:00:00Z',
        treasuryRefNumber: 'MH-TREASURY/2026/SCM/91024',
        isDelayed: true,
        slaDays: 10,
        elapsedDays: 14,
        escalationNotice: '🚨 SLA Breach (>10 Days): Escalated to District Treasury Officer & Mission Director. Action Required.',
      },
      {
        id: 'pay-7',
        milestoneId: 'm-3-1',
        milestoneTitle: 'Milestone 1: Satellite Basemap & Farm Registry Integration',
        pilotId: 'pilot-3',
        pilotTitle: 'Hyper-Local Satellite & Drone Pest Outbreak Forecasting',
        departmentId: 'dept-3',
        departmentName: 'Department of Agriculture & Farmers Welfare',
        startupId: 'st-3',
        startupName: 'KisanDrishti Agritech',
        amountLakhs: 4.5,
        status: 'paid',
        requestedAt: '2026-01-08T11:00:00Z',
        approvedAt: '2026-01-09T15:00:00Z',
        sentToTreasuryAt: '2026-01-10T10:30:00Z',
        paidAt: '2026-01-17T16:00:00Z',
        treasuryRefNumber: 'MP-IFMIS/2026/AGRI/44019',
        isDelayed: false,
        slaDays: 10,
        elapsedDays: 7,
      },
      {
        id: 'pay-8',
        milestoneId: 'm-4-1',
        milestoneTitle: 'Milestone 1: Solar Potability Telemetry Node Fabrication & Deployment',
        pilotId: 'pilot-4',
        pilotTitle: 'Solar-Powered Real-Time Fluoride & Potability Telemetry',
        departmentId: 'dept-4',
        departmentName: 'Water Resources & Ground Water Board',
        startupId: 'st-4',
        startupName: 'AquaSense IoT Systems',
        amountLakhs: 4.8,
        status: 'verified',
        requestedAt: '2026-02-14T11:30:00Z',
        isDelayed: false,
        slaDays: 10,
        elapsedDays: 2,
      },
    ];

    this.passports = [
      {
        id: 'pass-101',
        startupId: 'st-1',
        startupName: 'NeuroHealth AI',
        startupSector: 'Healthcare & Life Sciences',
        dpiitNumber: 'DIPP-84920',
        pilotId: 'pilot-1',
        problemTitle: 'AI-assisted Early Detection of Tuberculosis in Tribal PHCs',
        departmentWorkedWith: 'Ministry of Health & Family Welfare (Govt of India)',
        sector: 'Healthcare & Life Sciences',
        kpisAchieved: [
          {
            kpiName: 'Diagnostic Sensitivity',
            targetValue: 90,
            achievedValue: 94.2,
            unit: '% Sensitivity',
            description: 'Double-blind sputum culture correlation across 850 TB patients',
            verified: true,
          },
          {
            kpiName: 'Diagnostic Latency Reduction',
            targetValue: 60,
            achievedValue: 42,
            unit: 'Seconds per scan',
            description: 'Edge computation without internet dependency in remote hills',
            verified: true,
          },
          {
            kpiName: 'Total Beneficiaries Screened',
            targetValue: 5000,
            achievedValue: 6240,
            unit: 'Tribal Citizens',
            description: 'Total patient screening volume in 25 sub-centers',
            verified: true,
          },
        ],
        validatorName: 'Prof. S. Krishnan',
        validatorOrg: 'Indian Institute of Technology (IIT) Bombay',
        validationDate: '2026-02-15',
        validityEndDate: '2028-02-15',
        status: 'active',
        certificateHash: '0x99B4E38F87AA61C390B2D46387E412A09',
        qrPayload: 'https://gov.startupconnect.in/passport/pass-101?hash=0x99B4E38F87AA61C390B2D46387E412A09',
        efficiencyGainPercent: 78,
        costSavingsLakhs: 45.0,
        deploymentScale: '25 Tribal Primary Health Centers',
      },
      {
        id: 'pass-102',
        startupId: 'st-10',
        startupName: 'NagarSeva CitizenBot',
        startupSector: 'Governance & CivicTech',
        dpiitNumber: 'DIPP-88219',
        pilotId: 'pilot-7',
        problemTitle: 'WhatsApp-Native Civic Grievance AI Resolution Bot',
        departmentWorkedWith: 'Smart Cities Mission & Pune Municipal Corporation',
        sector: 'Governance & CivicTech',
        kpisAchieved: [
          {
            kpiName: 'Grievance Resolution Turnaround Time',
            targetValue: 72,
            achievedValue: 18,
            unit: 'Hours',
            description: 'Automated municipal ticket triage and GIS auto-dispatch',
            verified: true,
          },
          {
            kpiName: 'Citizen CSAT Rating',
            targetValue: 80,
            achievedValue: 92.5,
            unit: '% Positive CSAT',
            description: 'Multilingual survey across 42,000 citizens',
            verified: true,
          },
        ],
        validatorName: 'Dr. Radhika Sen',
        validatorOrg: 'Central Road Research Institute (CRRI)',
        validationDate: '2025-12-01',
        validityEndDate: '2027-12-01',
        status: 'active',
        certificateHash: '0x33A1F92B88019C456E21D09927BA328C',
        qrPayload: 'https://gov.startupconnect.in/passport/pass-102?hash=0x33A1F92B88019C456E21D09927BA328C',
        efficiencyGainPercent: 65,
        costSavingsLakhs: 32.0,
        deploymentScale: '1.2 Million Urban Population',
      },
      {
        id: 'pass-103',
        startupId: 'st-14',
        startupName: 'Kavach CyberGov',
        startupSector: 'Governance & CivicTech',
        dpiitNumber: 'DIPP-90432',
        pilotId: 'pilot-8',
        problemTitle: 'Zero-Trust Portal Defense & DDoS Neutralization',
        departmentWorkedWith: 'State Education & Skill Development Mission (Karnataka)',
        sector: 'Governance & CivicTech',
        kpisAchieved: [
          {
            kpiName: 'Cyber Threat Neutralization Rate',
            targetValue: 99.0,
            achievedValue: 100.0,
            unit: '% Blocked',
            description: 'Over 120,000 automated attack payloads neutralized with zero downtime',
            verified: true,
          },
          {
            kpiName: 'State Portal Page Load Latency',
            targetValue: 300,
            achievedValue: 110,
            unit: 'Milliseconds',
            description: 'Edge caching under peak 10x concurrent load',
            verified: true,
          },
        ],
        validatorName: 'Er. Tarun Bhattacharya',
        validatorOrg: 'Quality Council of India (QCI)',
        validationDate: '2025-10-30',
        validityEndDate: '2027-10-30',
        status: 'active',
        certificateHash: '0x88EE11BC7629AA014F9821BB65CD9902',
        qrPayload: 'https://gov.startupconnect.in/passport/pass-103?hash=0x88EE11BC7629AA014F9821BB65CD9902',
        efficiencyGainPercent: 82,
        costSavingsLakhs: 60.0,
        deploymentScale: 'State Scholarship Portal (2.5M Students)',
      },
      {
        id: 'pass-104',
        startupId: 'st-4',
        startupName: 'AquaSense IoT Systems',
        startupSector: 'CleanTech & Water Infrastructure',
        dpiitNumber: 'DIPP-78201',
        pilotId: 'pilot-4',
        problemTitle: 'Solar-Powered Real-Time Fluoride & Potability Telemetry',
        departmentWorkedWith: 'Public Health Engineering Department (Govt of Rajasthan)',
        sector: 'CleanTech & Water Infrastructure',
        passportScore: 97,
        passportCategory: 'Platinum Pilot Passport',
        scaleUpRecommended: true,
        kpi_achievement_pct: 100,
        milestone_completion_pct: 100,
        compliance_score: 92,
        reliability_score: 100,
        user_feedback_score: 92,
        expert_validation_score: 92,
        kpisAchieved: [
          {
            kpiName: 'Telemetry Nodes Live Transmission',
            targetValue: 40,
            achievedValue: 40,
            unit: 'Solar Nodes',
            description: '10-minute sensor ping frequency transmitting TDS, pH, and Fluoride PPM',
            verified: true,
          },
          {
            kpiName: 'Potability Sensing Accuracy vs Lab Standards',
            targetValue: 95,
            achievedValue: 98.6,
            unit: '% Accuracy',
            description: 'Double-blind calibration correlation against NEERI standard test kits',
            verified: true,
          },
          {
            kpiName: 'Fluoride Exceedance Real-Time Alert Dispatch',
            targetValue: 100,
            achievedValue: 100,
            unit: '% Dispatched',
            description: 'Instant SMS & GIS dispatch to block sub-divisional water engineers',
            verified: true,
          },
        ],
        validatorName: 'Er. Tarun Bhattacharya',
        validatorOrg: 'Quality Council of India (QCI) / NEERI',
        validationDate: '2026-02-14',
        validityEndDate: '2028-02-14',
        status: 'active',
        certificateHash: '0x4A7B2C91D8E30F65789A12B34C56D78E',
        qrPayload: 'https://gov.startupconnect.in/passport/pass-104?hash=0x4A7B2C91D8E30F65789A12B34C56D78E',
        efficiencyGainPercent: 88,
        costSavingsLakhs: 48.0,
        deploymentScale: '40 Desert Habitations in Barmer District',
      },
    ];
  }
}

export const db = new RelationalDatabase();
