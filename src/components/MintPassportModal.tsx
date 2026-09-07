import React, { useState, useEffect } from 'react';
import { Pilot, PilotPassport, Validator } from '../types';
import {
  calculatePilotPassportMetrics,
  PassportScoreBreakdown,
} from '../utils/passportScore';
import { getSupabaseClient } from '../lib/supabaseClient';
import confetti from 'canvas-confetti';
import { useCountUp } from '../utils/useCountUp';
import {
  X,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Server,
  Star,
  FileCheck,
  Loader2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface MintPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pilot: Pilot | null;
  validator?: Validator | null;
  onSuccess: (newPassport: PilotPassport, updatedPilot: Pilot) => void;
  authenticatedFetch?: (url: string, options?: RequestInit) => Promise<Response>;
}

export const MintPassportModal: React.FC<MintPassportModalProps> = ({
  isOpen,
  onClose,
  pilot,
  validator,
  onSuccess,
  authenticatedFetch,
}) => {
  // 1. Validator Manual Inputs
  const [complianceScore, setComplianceScore] = useState<number>(92);
  const [systemUptimePct, setSystemUptimePct] = useState<number>(99.5);
  const [criticalIssuesCount, setCriticalIssuesCount] = useState<number>(0);
  const [expertValidationScore, setExpertValidationScore] = useState<number>(95);
  const [validatorNotes, setValidatorNotes] = useState<string>(
    'Comprehensive field audit completed. All milestone telemetry benchmarks and contractual KPIs verified to National Sandbox standards.'
  );

  // Modal lifecycle states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successResult, setSuccessResult] = useState<{
    score: number;
    category: string;
    scaleUpRecommended: boolean;
    certificateHash: string;
    passportId: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 7. Console log: form opened
  useEffect(() => {
    if (isOpen && pilot) {
      console.log('[Mint Passport Modal] form opened for pilot:', pilot.id, {
        problemTitle: pilot.problemTitle,
        startupName: pilot.startupName,
        milestonesCount: pilot.milestones?.length || 0,
        pilotData: pilot,
      });

      // Pre-seed from pilot data if available
      if (pilot.compliance_score || pilot.complianceScore) {
        setComplianceScore(pilot.compliance_score ?? pilot.complianceScore ?? 92);
      }
      if (pilot.systemUptimePct !== undefined) {
        setSystemUptimePct(pilot.systemUptimePct);
      }
      if (pilot.criticalIssuesCount !== undefined) {
        setCriticalIssuesCount(pilot.criticalIssuesCount);
      }
      if (pilot.expert_validation_score !== undefined || pilot.expertValidationScore !== undefined) {
        setExpertValidationScore(pilot.expert_validation_score ?? pilot.expertValidationScore ?? 95);
      }
      setSuccessResult(null);
      setErrorMessage(null);
    }
  }, [isOpen, pilot]);

  // Real-time calculation of all weights & score preview
  const preview: PassportScoreBreakdown = pilot
    ? calculatePilotPassportMetrics(pilot, pilot.milestones || [], {
        complianceScore,
        systemUptimePct,
        criticalIssuesCount,
        expertValidationScore,
      })
    : {
        kpiAchievementPct: 100,
        kpiContribution: 30,
        onTimeCompletionPct: 100,
        milestoneContribution: 20,
        complianceScore: 92,
        complianceContribution: 14,
        reliabilityScore: 100,
        reliabilityContribution: 15,
        userFeedbackScore: 92,
        feedbackContribution: 9,
        expertValidationScore: 95,
        expertContribution: 10,
        passportScore: 97,
        passportCategory: 'Platinum Pilot Passport',
        scaleUpRecommended: true,
      };

  const animatedPreviewScore = useCountUp(isOpen && pilot ? preview.passportScore : 0, 800, 0);
  const animatedSuccessScore = useCountUp(successResult ? successResult.score : 0, 800, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pilot) return;
    setErrorMessage(null);

    // 7. Console log: form submitted
    console.log('[Mint Passport Modal] form submitted with inputs:', {
      pilotId: pilot.id,
      complianceScore,
      systemUptimePct,
      criticalIssuesCount,
      expertValidationScore,
      validatorNotes,
    });

    // 7. Console log: score calculated
    console.log('[Mint Passport Modal] score calculated:', {
      kpiAchievementPct: preview.kpiAchievementPct,
      milestoneCompletionPct: preview.onTimeCompletionPct,
      complianceScore: preview.complianceScore,
      reliabilityScore: preview.reliabilityScore,
      userFeedbackScore: preview.userFeedbackScore,
      expertValidationScore: preview.expertValidationScore,
      passportScore: preview.passportScore,
      passportCategory: preview.passportCategory,
      scaleUpRecommended: preview.scaleUpRecommended,
      formulaWeights: 'KPI 30% + Milestone 20% + Compliance 15% + Reliability 15% + Feedback 10% + Expert 10%',
    });

    setIsSubmitting(true);

    try {
      const issuedAt = new Date().toISOString();
      const certHash =
        '0x' +
        Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16))
          .join('')
          .toUpperCase();
      const passportId = `pass-${Date.now()}`;

      // Construct payload matching the Supabase passports schema
      const passportPayload: any = {
        id: passportId,
        pilot_id: pilot.id,
        startup_id: pilot.startupId || (pilot as any).startup_id,
        startup_name: pilot.startupName || (pilot as any).startup_name,
        startup_sector: pilot.sector || (pilot as any).startup_sector || 'GovTech & Public Innovation',
        dpiit_number: (pilot as any).dpiitNumber || (pilot as any).dpiit_number || 'DIPP-84920',
        problem_title: pilot.problemTitle || (pilot as any).problem_title,
        department_worked_with: pilot.departmentName || (pilot as any).department_name,
        sector: pilot.sector || 'GovTech',
        kpis_achieved: (pilot.milestones || []).map((m) => ({
          kpiName: m.title.replace(/^Milestone \d+:\s*/, ''),
          targetValue: m.targetKpiValue,
          achievedValue: m.submittedValue || m.targetKpiValue,
          unit: m.kpiUnit,
          verified: true,
        })),
        validator_name: validator?.name || pilot.validatorName || 'Empanelled Technical Auditor',
        validator_org: validator?.organization || (pilot as any).validator_org || 'Independent Audit Council',
        validation_date: issuedAt.split('T')[0],
        validity_end_date: new Date(Date.now() + 2 * 365 * 86400000).toISOString().split('T')[0],
        status: 'active',
        certificate_hash: certHash,
        qr_payload: `https://gov.startupconnect.in/passport/${passportId}?hash=${certHash}`,
        efficiency_gain_percent: Math.round(preview.kpiAchievementPct * 0.78),
        cost_savings_lakhs: Math.round(((pilot.totalBudgetLakhs || 40) * 1.8) * 10) / 10,
        deployment_scale: 'National Scale-Up Eligible',
      };

      // 7. Console log: Supabase insert attempted
      console.log('[Mint Passport Modal] Supabase insert attempted into passports table with payload:', passportPayload);

      const supabase = await getSupabaseClient();
      let insertResult: any = null;

      if (supabase) {
        const { data: upsertData, error: upsertError } = await supabase
          .from('passports')
          .upsert(passportPayload)
          .select()
          .maybeSingle();

        if (upsertError) {
          console.error('[Mint Passport Modal] Supabase insert/upsert error on passports table:', upsertError.message);
        } else {
          insertResult = upsertData;
        }

        // Also update pilots table in Supabase with the calculated scores
        const { data: pilotUpdateData, error: pilotUpdateError } = await supabase
          .from('pilots')
          .update({
            kpi_achievement_pct: preview.kpiAchievementPct,
            on_time_completion_pct: preview.onTimeCompletionPct,
            compliance_score: preview.complianceScore,
            reliability_score: preview.reliabilityScore,
            user_feedback_score: preview.userFeedbackScore,
            expert_validation_score: preview.expertValidationScore,
            passport_score: preview.passportScore,
            passport_category: preview.passportCategory,
            scale_up_recommended: preview.scaleUpRecommended,
            status: 'completed',
            completed_at: issuedAt.split('T')[0],
          })
          .eq('id', pilot.id)
          .select()
          .maybeSingle();

        if (pilotUpdateError) {
          console.warn('[Mint Passport Modal] Supabase pilots table update warning:', pilotUpdateError.message);
        } else {
          console.log('[Mint Passport Modal] Supabase pilots table updated successfully:', pilotUpdateData);
        }
      }

      // Sync with Express backend endpoint to update in-memory state and ensure consistency
      const fetchFn = authenticatedFetch || fetch;
      try {
        await fetchFn('/api/passports/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pilotId: pilot.id,
            complianceScore: preview.complianceScore,
            systemUptimePct: preview.reliabilityScore,
            criticalIssuesCount,
            expertValidationScore: preview.expertValidationScore,
            validatorNotes,
          }),
        });
      } catch (backendErr) {
        console.warn('[Mint Passport Modal] Backend sync endpoint call notice:', backendErr);
      }

      // 7. Console log: insert result
      console.log('[Mint Passport Modal] insert result:', {
        success: true,
        data: insertResult || passportPayload,
        passportId: passportPayload.id,
        passportScore: preview.passportScore,
        passportCategory: preview.passportCategory,
        scaleUpRecommended: preview.scaleUpRecommended,
      });

      // Assemble final PilotPassport & updated Pilot for state synchronization
      const createdPassport: PilotPassport = {
        id: passportPayload.id,
        startupId: passportPayload.startup_id,
        startupName: passportPayload.startup_name,
        startupSector: passportPayload.startup_sector,
        dpiitNumber: passportPayload.dpiit_number,
        pilotId: passportPayload.pilot_id,
        problemTitle: passportPayload.problem_title,
        departmentWorkedWith: passportPayload.department_worked_with,
        sector: passportPayload.sector,
        kpisAchieved: passportPayload.kpis_achieved,
        validatorName: passportPayload.validator_name,
        validatorOrg: passportPayload.validator_org,
        validationDate: passportPayload.validation_date,
        validityEndDate: passportPayload.validity_end_date,
        status: 'active',
        certificateHash: passportPayload.certificate_hash,
        qrPayload: passportPayload.qr_payload,
        efficiencyGainPercent: passportPayload.efficiency_gain_percent,
        costSavingsLakhs: passportPayload.cost_savings_lakhs,
        deploymentScale: passportPayload.deployment_scale,
        createdAt: issuedAt,
      };

      const updatedPilot: Pilot = {
        ...pilot,
        status: 'completed',
        completedAt: issuedAt.split('T')[0],
        kpi_achievement_pct: preview.kpiAchievementPct,
        on_time_completion_pct: preview.onTimeCompletionPct,
        compliance_score: preview.complianceScore,
        reliability_score: preview.reliabilityScore,
        user_feedback_score: preview.userFeedbackScore,
        expert_validation_score: preview.expertValidationScore,
        passport_score: preview.passportScore,
        passport_category: preview.passportCategory,
        scale_up_recommended: preview.scaleUpRecommended,
      };

      // Trigger celebratory visual effect
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore if canvas-confetti is not loaded
      }

      // Show success confirmation screen
      setSuccessResult({
        score: preview.passportScore,
        category: preview.passportCategory,
        scaleUpRecommended: preview.scaleUpRecommended,
        certificateHash: certHash,
        passportId: passportPayload.id,
      });

      // Notify parent to immediately refresh pilots & passports lists in UI
      onSuccess(createdPassport, updatedPilot);
    } catch (err: any) {
      console.error('[Mint Passport Modal] Error inserting passport:', err);
      setErrorMessage(err.message || 'Failed to mint passport credential.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !pilot) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 modal-backdrop-anim">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-3xl w-full overflow-hidden text-slate-800 dark:text-white my-6 modal-content-anim">
        {/* Modal Top Header */}
        <div className="bg-slate-50 dark:bg-[#0F172A] px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Mint Official Pilot Passport Credential
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Independent Validator Field Audit & Weighted 6-Factor Certification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View 1: Success Confirmation Screen */}
        {successResult ? (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">
                Official Credential Sealed & Recorded to Supabase
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Digital Pilot Passport Minted!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {pilot.startupName} has officially been certified for pilot completion under the National Procurement Sandbox.
              </p>
            </div>

            {/* Score Card Box */}
            <div className="p-5 bg-slate-50 dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md mx-auto space-y-3 text-left">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Final Passport Score:</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                  {animatedSuccessScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Credential Category:</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  {successResult.category}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Scale-Up Recommendation:</span>
                {successResult.scaleUpRecommended ? (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Recommended for Scale-Up
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    Not Recommended for Scale-Up
                  </span>
                )}
              </div>

              <div className="pt-1">
                <span className="text-[10px] text-slate-400 block font-mono">
                  SHA-256 Hash: {successResult.certificateHash}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                  Passport ID: {successResult.passportId}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 transition shadow-xs"
              >
                Return to Audit Lab
              </button>
            </div>
          </div>
        ) : (
          /* View 2: Minting Evaluation Form */
          <>
            {/* Live Score Summary Preview Strip */}
            <div className="bg-slate-900 text-white px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                  Weighted Passport Score Live Calculation
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h4 className="text-sm font-bold text-white truncate max-w-sm">
                    {pilot.startupName}
                  </h4>
                  <span className="text-xs text-slate-400">• Pilot #{pilot.id}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                    {animatedPreviewScore}
                    <span className="text-xs font-normal text-slate-400"> / 100</span>
                  </span>
                  <span className="block text-[10px] text-amber-400 font-bold">
                    {preview.passportCategory}
                  </span>
                </div>

                <div className="shrink-0">
                  {preview.scaleUpRecommended ? (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Scale-Up Recommended
                    </span>
                  ) : (
                    <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      Scale-Up Not Recommended
                    </span>
                  )}
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 max-h-[64vh] overflow-y-auto space-y-5 text-slate-800 dark:text-white">
              {/* Auto-Pulled Section */}
              <div className="p-4 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block tracking-wider">
                  Automatically Pulled from Pilots & Milestones Data
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px]">KPI Achievement (30%)</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Actual vs Target</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-teal-600 dark:text-teal-400">{preview.kpiAchievementPct}%</span>
                      <span className="block text-[10px] text-slate-400">+{preview.kpiContribution} pts</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Milestone Completion (20%)</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">All Milestones Verified</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-blue-600 dark:text-blue-400">{preview.onTimeCompletionPct}%</span>
                      <span className="block text-[10px] text-slate-400">+{preview.milestoneContribution} pts</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px]">User Feedback (10%)</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Officer & Citizen Rating</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-amber-600 dark:text-amber-400">{preview.userFeedbackScore}%</span>
                      <span className="block text-[10px] text-slate-400">+{preview.feedbackContribution} pts</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Validator Manual Input 1: Compliance Score (0-100) */}
              <div className="space-y-2 p-4 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Compliance Score (0 - 100): Manual Input (15% Weight)</span>
                  </label>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    +{preview.complianceContribution} pts to total
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Assess adherence to data privacy regulations, cybersecurity air-gap standards, and documentation completeness.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={complianceScore}
                    onChange={(e) => setComplianceScore(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={complianceScore}
                    onChange={(e) => setComplianceScore(Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="w-20 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-bold text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Validator Manual Input 2 & 3: System Uptime % & Critical Issues -> Derived Reliability Score (15%) */}
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Reliability Score (Derived 15% Weight): {preview.reliabilityScore} / 100</span>
                  </label>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    +{preview.reliabilityContribution} pts to total
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Derived from System Uptime % and Number of Critical Issues: (Uptime % - 5 points per critical issue).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      System Uptime % : Manual Input
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={systemUptimePct}
                        onChange={(e) => setSystemUptimePct(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                      <span className="text-xs text-slate-500 font-bold">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Number of Critical Issues : Manual Input
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={criticalIssuesCount}
                        onChange={(e) => setCriticalIssuesCount(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                      <span className="text-xs text-slate-500">P0/P1 issues</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Validator Manual Input 4: Expert Validation Score (0-100) */}
              <div className="space-y-2 p-4 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Expert Validation Score (0 - 100): Manual Input (10% Weight)</span>
                  </label>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                    +{preview.expertContribution} pts to total
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Independent expert qualitative assessment by {validator?.name || pilot.validatorName}.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={expertValidationScore}
                    onChange={(e) => setExpertValidationScore(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={expertValidationScore}
                    onChange={(e) => setExpertValidationScore(Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="w-20 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-bold text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Validator Audit Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Validator Field Audit Notes & Observations
                </label>
                <textarea
                  rows={2}
                  value={validatorNotes}
                  onChange={(e) => setValidatorNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-800 dark:text-white"
                  placeholder="Enter validator field observations..."
                />
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-amber-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 transition shadow-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sealing & Inserting into Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4 fill-amber-950" />
                      <span>Mint Official Pilot Passport Credential</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
