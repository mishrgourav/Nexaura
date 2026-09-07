export type UserRole = 'department' | 'startup' | 'admin' | 'validator' | 'public';

export interface User {
  id: string;
  authId?: string;
  name: string;
  role: UserRole;
  email: string;
  organization?: string;
  departmentId?: string;
  departmentName?: string;
  startupId?: string;
  startupName?: string;
  validatorId?: string;
  designation?: string;
  avatar?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  sector: string;
  state: string;
  nodalOfficer: string;
  email: string;
  activePilotsCount: number;
  budgetAllocatedLakhs: number;
}

export interface Startup {
  id: string;
  name: string;
  sector: string;
  dpiitStatus: 'Recognized' | 'Pending';
  dpiitNumber: string;
  keywords: string[];
  pastPilotCount: number;
  successRatePercent: number;
  description: string;
  foundingYear: number;
  city: string;
  stage: 'Early Traction' | 'Validation' | 'Growth' | 'Scaling';
  hasVerifiedPassport: boolean;
  activePassportsCount: number;
  website?: string;
}

export interface Validator {
  id: string;
  name: string;
  organization: string;
  sectorExpertise: string[];
  empanelledDate: string;
  verifiedPilotsCount: number;
  status: 'Active' | 'On Leave';
  email: string;
  credentialHash: string;
}

export type RiskLevel = 'low' | 'medium' | 'high';
export type ProblemStatus = 'open' | 'evaluating' | 'pilot_active' | 'closed';

export interface ProblemStatement {
  id: string;
  departmentId: string;
  departmentName: string;
  title: string;
  description: string;
  category: string;
  budgetMinLakhs: number;
  budgetMaxLakhs: number;
  riskLevel: RiskLevel;
  expectedOutcome: string;
  status: ProblemStatus;
  createdAt: string;
  applicationsCount: number;
}

export interface MatchScoreDetails {
  sectorMatch: boolean;
  keywordMatches: string[];
  pastExperienceScore: number;
  dpiitBonus: number;
  passportBonus: number;
  riskAlignmentScore: number;
}

export interface StartupMatch {
  id: string;
  problemId: string;
  startupId: string;
  startup?: Startup;
  matchScore: number;
  reason: string;
  details: MatchScoreDetails;
  createdAt: string;
}

export type PilotStatus = 'draft' | 'active' | 'completed' | 'terminated';

export type PassportCategory =
  | 'Platinum Pilot Passport'
  | 'Gold Pilot Passport'
  | 'Silver Pilot Passport'
  | 'Not Recommended for Scale-Up';

export interface Pilot {
  id: string;
  problemId: string;
  problemTitle: string;
  departmentId: string;
  departmentName: string;
  startupId: string;
  startupName: string;
  status: PilotStatus;
  startDate: string;
  endDate: string;
  totalBudgetLakhs: number;
  disbursedBudgetLakhs: number;
  validatorId: string;
  validatorName: string;
  // Pilot sector / domain
  sector?: string;
  scopeSummary: string;
  createdAt: string;
  completedAt?: string;
  milestones?: Milestone[];
  payments?: PaymentRecord[];
  passport?: PilotPassport;

  // Exact Supabase columns for Pilot Passport
  kpi_achievement_pct?: number;
  on_time_completion_pct?: number;
  compliance_score?: number;
  reliability_score?: number;
  user_feedback_score?: number;
  expert_validation_score?: number;
  passport_score?: number;
  passport_category?: string;
  scale_up_recommended?: boolean;

  // CamelCase accessors
  kpiAchievementPct?: number;
  onTimeCompletionPct?: number;
  complianceScore?: number;
  reliabilityScore?: number;
  userFeedbackScore?: number;
  expertValidationScore?: number;
  passportScore?: number;
  passportCategory?: string;
  scaleUpRecommended?: boolean;

  // Auxiliary evaluation details
  systemUptimePct?: number;
  criticalIssuesCount?: number;
  officerRating?: number;
  citizenRating?: number;
  dataPrivacyScore?: number;
  cybersecurityScore?: number;
  govtStandardsScore?: number;
  docCompletenessScore?: number;
  validatorNotes?: string;
}

export type MilestoneStatus = 'pending' | 'submitted' | 'verified' | 'paid';

export interface Milestone {
  id: string;
  pilotId: string;
  milestoneNumber: number;
  title: string;
  description: string;
  targetKpiDescription: string;
  targetKpiValue: number;
  kpiUnit: string;
  weightPercent: number;
  amountLakhs: number;
  status: MilestoneStatus;
  deadline?: string;
  submittedValue?: number;
  submittedProofUrl?: string;
  submittedNotes?: string;
  submittedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  verificationNotes?: string;
  payment?: PaymentRecord;
}

export type DelayRiskStatus = 'low' | 'medium' | 'high';

export interface PilotMonitoringMetrics {
  pilotId: string;
  pilotTitle: string;
  startupName: string;
  departmentName: string;
  completionPercentage: number;
  elapsedTimePercentage: number;
  nextMilestone: Milestone | null;
  daysUntilNextDeadline: number | null;
  deadlineDate: string | null;
  isOverdue: boolean;
  isDeadlineNear: boolean; // within 3 days
  riskOfDelay: DelayRiskStatus;
  riskReason: string;
  scheduleDifference: number; // completionPercentage - elapsedTimePercentage
  totalMilestones: number;
  completedMilestones: number;
}

export type PaymentStatus = 'submitted' | 'verified' | 'approved' | 'sent_to_treasury' | 'paid';

export interface PaymentRecord {
  id: string;
  milestoneId: string;
  milestoneTitle: string;
  pilotId: string;
  pilotTitle: string;
  departmentId: string;
  departmentName: string;
  startupId: string;
  startupName: string;
  amountLakhs: number;
  status: PaymentStatus;
  requestedAt: string;
  approvedAt?: string;
  sentToTreasuryAt?: string;
  paidAt?: string;
  treasuryRefNumber?: string;
  isDelayed: boolean;
  slaDays: number;
  elapsedDays: number;
  escalationNotice?: string;
}

export interface KpiAchievement {
  kpiName: string;
  targetValue: number;
  achievedValue: number;
  unit: string;
  description: string;
  verified: boolean;
}

export interface PilotPassport {
  id: string;
  startupId: string;
  startupName: string;
  startupSector: string;
  dpiitNumber: string;
  pilotId: string;
  problemTitle: string;
  departmentWorkedWith: string;
  sector: string;
  kpisAchieved: KpiAchievement[];
  validatorName: string;
  validatorOrg: string;
  validationDate: string;
  validityEndDate: string;
  status: 'active' | 'expired';
  certificateHash: string;
  qrPayload: string;
  efficiencyGainPercent: number;
  costSavingsLakhs: number;
  deploymentScale: string;
  createdAt?: string;
  kpiAchievedSummary?: string;
  expiryDate?: string;
  startup?: any;
  pilot?: any;
  department?: any;
  validator?: any;

  // Passport Score & Evaluation Fields
  passportScore?: number;
  passportCategory?: string;
  scaleUpRecommended?: boolean;
  passport_score?: number;
  passport_category?: string;
  scale_up_recommended?: boolean;
  kpi_achievement_pct?: number;
  milestone_completion_pct?: number;
  compliance_score?: number;
  reliability_score?: number;
  user_feedback_score?: number;
  expert_validation_score?: number;
  issued_at?: string;
}

export interface PlatformAnalytics {
  totalPilots: number;
  activePilots: number;
  completedPilots: number;
  totalStartupsEmpanelled: number;
  passportsIssued: number;
  totalFundsFacilitatedLakhs: number;
  avgValidationTurnaroundDays: number;
  avgPaymentProcessingDays: number;
  delayedPaymentsCount: number;
  pilotSuccessRatePercent: number;
  sectorBreakdown: { sector: string; count: number; valueLakhs: number }[];
  recentActivities: {
    id: string;
    type: 'match' | 'milestone_verified' | 'payment_treasury' | 'passport_issued' | 'pilot_started';
    title: string;
    description: string;
    timestamp: string;
    badge: string;
  }[];
}
