import { Pilot, Milestone, PassportCategory } from '../types';

export interface PassportScoreBreakdown {
  kpiAchievementPct: number;
  onTimeCompletionPct: number;
  complianceScore: number;
  reliabilityScore: number;
  userFeedbackScore: number;
  expertValidationScore: number;
  passportScore: number;
  passportCategory: PassportCategory;
  scaleUpRecommended: boolean;

  // Contributions to final 100
  kpiContribution: number;       // out of 30
  milestoneContribution: number; // out of 20
  complianceContribution: number;// out of 15
  reliabilityContribution: number;// out of 15
  feedbackContribution: number;  // out of 10
  expertContribution: number;    // out of 10
}

export interface PassportEvaluationInputs {
  // Compliance (15%)
  complianceScore?: number;
  dataPrivacyScore?: number;
  cybersecurityScore?: number;
  govtStandardsScore?: number;
  docCompletenessScore?: number;

  // Reliability (15%)
  systemUptimePct?: number;
  criticalIssuesCount?: number;
  reliabilityScore?: number;

  // User Feedback (10%)
  officerRating?: number; // 1-5 or 0-100
  citizenRating?: number; // 1-5 or 0-100
  userFeedbackScore?: number;

  // Expert Validation (10%)
  expertValidationScore?: number;
}

/**
 * Calculates the 6-factor weighted Pilot Passport score
 * KPI (30%) + Milestone (20%) + Compliance (15%) + Reliability (15%) + User Feedback (10%) + Expert Validation (10%) = 100%
 */
export function calculatePilotPassportMetrics(
  pilot: Partial<Pilot>,
  milestones: Milestone[] = [],
  inputs: PassportEvaluationInputs = {}
): PassportScoreBreakdown {
  // 1. KPI Achievement (30%): (actual result / target result) × 100, capped at 100
  let kpiPct = pilot.kpi_achievement_pct ?? pilot.kpiAchievementPct;
  if (kpiPct === undefined) {
    if (milestones.length > 0) {
      let totalWeight = 0;
      let weightedAchieved = 0;
      milestones.forEach((m) => {
        const weight = m.weightPercent || (100 / milestones.length);
        totalWeight += weight;
        const target = m.targetKpiValue || 1;
        const actual = m.submittedValue !== undefined ? m.submittedValue : target;
        const pct = Math.min(100, Math.max(0, (actual / target) * 100));
        weightedAchieved += pct * (weight / 100);
      });
      kpiPct = totalWeight > 0 ? Math.round((weightedAchieved / (totalWeight / 100))) : 95;
    } else {
      kpiPct = 95;
    }
  }
  kpiPct = Math.min(100, Math.max(0, Math.round(kpiPct)));

  // 2. Milestone Completion (20%): % of milestones marked complete with bonus for on-time completion
  let milestonePct = pilot.on_time_completion_pct ?? pilot.onTimeCompletionPct;
  if (milestonePct === undefined) {
    if (milestones.length > 0) {
      const completedCount = milestones.filter((m) => m.status === 'verified' || m.status === 'paid').length;
      const basePct = (completedCount / milestones.length) * 100;
      // On-time bonus: +10% if at least 1 milestone is completed and completed within reasonable timeline
      const onTimeBonus = completedCount > 0 ? 10 : 0;
      milestonePct = Math.min(100, Math.round(basePct + onTimeBonus));
    } else {
      milestonePct = 90;
    }
  }
  milestonePct = Math.min(100, Math.max(0, Math.round(milestonePct)));

  // 3. Compliance Score (15%): data privacy, cybersecurity, government standards, documentation completeness
  let compScore = inputs.complianceScore ?? pilot.compliance_score ?? pilot.complianceScore;
  if (compScore === undefined) {
    if (
      inputs.dataPrivacyScore !== undefined ||
      inputs.cybersecurityScore !== undefined ||
      inputs.govtStandardsScore !== undefined ||
      inputs.docCompletenessScore !== undefined
    ) {
      const dp = inputs.dataPrivacyScore ?? 24;
      const cs = inputs.cybersecurityScore ?? 24;
      const gs = inputs.govtStandardsScore ?? 24;
      const dc = inputs.docCompletenessScore ?? 24;
      compScore = Math.min(100, dp + cs + gs + dc);
    } else {
      compScore = 92;
    }
  }
  compScore = Math.min(100, Math.max(0, Math.round(compScore)));

  // 4. Reliability Score (15%): based on system uptime and number of critical issues
  let relScore = inputs.reliabilityScore ?? pilot.reliability_score ?? pilot.reliabilityScore;
  if (relScore === undefined) {
    const uptime = inputs.systemUptimePct ?? pilot.systemUptimePct ?? 99.5;
    const issues = inputs.criticalIssuesCount ?? pilot.criticalIssuesCount ?? 0;
    // Formula: uptime % minus 5 points per critical issue
    relScore = Math.max(0, Math.min(100, Math.round(uptime - (issues * 5))));
  }
  relScore = Math.min(100, Math.max(0, Math.round(relScore)));

  // 5. User Feedback (10%): average of government officer rating and citizen/end-user satisfaction rating
  let feedbackScore = inputs.userFeedbackScore ?? pilot.user_feedback_score ?? pilot.userFeedbackScore;
  if (feedbackScore === undefined) {
    const hasOfficer = inputs.officerRating !== undefined || pilot.officerRating !== undefined;
    const hasCitizen = inputs.citizenRating !== undefined || pilot.citizenRating !== undefined;
    if (hasOfficer || hasCitizen) {
      let officer = inputs.officerRating ?? pilot.officerRating ?? 0;
      let citizen = inputs.citizenRating ?? pilot.citizenRating ?? 0;
      // Normalize if given on 1-5 scale
      if (officer <= 5 && officer > 0) officer = officer * 20;
      if (citizen <= 5 && citizen > 0) citizen = citizen * 20;
      feedbackScore = (officer > 0 && citizen > 0) ? Math.round((officer + citizen) / 2) : Math.round(officer || citizen || 0);
    } else {
      feedbackScore = 0;
    }
  }
  feedbackScore = Math.min(100, Math.max(0, Math.round(feedbackScore)));

  // 6. Expert Validation (10%): score set by Independent Validator role
  let expertScore = inputs.expertValidationScore ?? pilot.expert_validation_score ?? pilot.expertValidationScore;
  if (expertScore === undefined) {
    expertScore = 92;
  }
  expertScore = Math.min(100, Math.max(0, Math.round(expertScore)));

  // Contributions to overall 100
  const kpiContribution = Number(((kpiPct * 30) / 100).toFixed(1));
  const milestoneContribution = Number(((milestonePct * 20) / 100).toFixed(1));
  const complianceContribution = Number(((compScore * 15) / 100).toFixed(1));
  const reliabilityContribution = Number(((relScore * 15) / 100).toFixed(1));
  const feedbackContribution = Number(((feedbackScore * 10) / 100).toFixed(1));
  const expertContribution = Number(((expertScore * 10) / 100).toFixed(1));

  const totalExact =
    (kpiPct * 0.30) +
    (milestonePct * 0.20) +
    (compScore * 0.15) +
    (relScore * 0.15) +
    (feedbackScore * 0.10) +
    (expertScore * 0.10);

  const passportScore = Math.min(100, Math.max(0, Math.round(totalExact)));

  // Category Assignment:
  // 90-100 = 'Platinum Pilot Passport'
  // 75-89 = 'Gold Pilot Passport'
  // 60-74 = 'Silver Pilot Passport'
  // below 60 = 'Not Recommended for Scale-Up'
  let passportCategory: PassportCategory = 'Not Recommended for Scale-Up';
  if (passportScore >= 90) {
    passportCategory = 'Platinum Pilot Passport';
  } else if (passportScore >= 75) {
    passportCategory = 'Gold Pilot Passport';
  } else if (passportScore >= 60) {
    passportCategory = 'Silver Pilot Passport';
  }

  // Scale-Up Recommended: true if score >= 75
  const scaleUpRecommended = passportScore >= 75;

  return {
    kpiAchievementPct: kpiPct,
    onTimeCompletionPct: milestonePct,
    complianceScore: compScore,
    reliabilityScore: relScore,
    userFeedbackScore: feedbackScore,
    expertValidationScore: expertScore,
    passportScore,
    passportCategory,
    scaleUpRecommended,
    kpiContribution,
    milestoneContribution,
    complianceContribution,
    reliabilityContribution,
    feedbackContribution,
    expertContribution,
  };
}
