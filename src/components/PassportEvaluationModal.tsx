import React, { useState, useEffect } from 'react';
import { Pilot, Milestone } from '../types';
import {
  calculatePilotPassportMetrics,
  PassportEvaluationInputs,
  PassportScoreBreakdown,
} from '../utils/passportScore';
import {
  X,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Sparkles,
  Server,
  Star,
  FileCheck,
  Loader2,
} from 'lucide-react';

interface PassportEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pilot: Pilot | null;
  onSubmit: (pilotId: string, evaluation: PassportEvaluationInputs) => Promise<void>;
  loading?: boolean;
  submitting?: boolean;
}

export const PassportEvaluationModal: React.FC<PassportEvaluationModalProps> = ({
  isOpen,
  onClose,
  pilot,
  onSubmit,
  loading = false,
  submitting = false,
}) => {
  const isBusy = loading || submitting;

  // 1. Compliance Sub-metrics (sums to 100)
  const [dataPrivacy, setDataPrivacy] = useState<number>(24);
  const [cybersecurity, setCybersecurity] = useState<number>(24);
  const [govtStandards, setGovtStandards] = useState<number>(24);
  const [docCompleteness, setDocCompleteness] = useState<number>(24);
  const complianceTotal = Math.min(100, dataPrivacy + cybersecurity + govtStandards + docCompleteness);

  // 2. Reliability Metrics
  const [systemUptime, setSystemUptime] = useState<number>(pilot?.systemUptimePct ?? 99.8);
  const [criticalIssues, setCriticalIssues] = useState<number>(pilot?.criticalIssuesCount ?? 0);

  // 3. User Feedback Ratings (1 - 5 stars)
  const [officerRating, setOfficerRating] = useState<number>(pilot?.officerRating ?? 4.8);
  const [citizenRating, setCitizenRating] = useState<number>(pilot?.citizenRating ?? 4.6);

  // 4. Expert Validation Score (0 - 100)
  const [expertScore, setExpertScore] = useState<number>(
    pilot?.expert_validation_score ?? pilot?.expertValidationScore ?? 95
  );
  const [validatorNotes, setValidatorNotes] = useState<string>(
    pilot?.validatorNotes ||
      `Empanelled field audit successfully verified all operational deliverables. The startup solution satisfies the National Procurement Sandbox standards with high field reliability.`
  );

  // Pre-load from pilot if already evaluated or changed
  useEffect(() => {
    if (pilot) {
      if (pilot.compliance_score || pilot.complianceScore) {
        const comp = pilot.compliance_score ?? pilot.complianceScore ?? 96;
        const each = Math.round(comp / 4);
        setDataPrivacy(each);
        setCybersecurity(each);
        setGovtStandards(each);
        setDocCompleteness(comp - (each * 3));
      }
      if (pilot.systemUptimePct !== undefined) setSystemUptime(pilot.systemUptimePct);
      if (pilot.criticalIssuesCount !== undefined) setCriticalIssues(pilot.criticalIssuesCount);
      if (pilot.officerRating !== undefined) setOfficerRating(pilot.officerRating);
      if (pilot.citizenRating !== undefined) setCitizenRating(pilot.citizenRating);
      if (pilot.expert_validation_score !== undefined || pilot.expertValidationScore !== undefined) {
        setExpertScore(pilot.expert_validation_score ?? pilot.expertValidationScore ?? 95);
      }
    }
  }, [pilot, isOpen]);

  // Real-time calculation of all 6 factors & total score
  const currentInputs: PassportEvaluationInputs = {
    complianceScore: complianceTotal,
    dataPrivacyScore: dataPrivacy,
    cybersecurityScore: cybersecurity,
    govtStandardsScore: govtStandards,
    docCompletenessScore: docCompleteness,
    systemUptimePct: systemUptime,
    criticalIssuesCount: criticalIssues,
    officerRating,
    citizenRating,
    expertValidationScore: expertScore,
  };

  const preview: PassportScoreBreakdown = pilot
    ? calculatePilotPassportMetrics(pilot, pilot.milestones || [], currentInputs)
    : {
        kpiAchievementPct: 100,
        kpiContribution: 30,
        onTimeCompletionPct: 100,
        milestoneContribution: 20,
        complianceScore: complianceTotal,
        complianceContribution: Math.round(complianceTotal * 0.15),
        reliabilityScore: 100,
        reliabilityContribution: 15,
        userFeedbackScore: 92,
        feedbackContribution: 9,
        expertValidationScore: expertScore,
        expertContribution: Math.round(expertScore * 0.1),
        passportScore: 97,
        passportCategory: 'Platinum Pilot Passport',
        scaleUpRecommended: true,
      };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pilot) return;
    await onSubmit(pilot.id, {
      ...currentInputs,
      complianceScore: complianceTotal,
    });
  };

  if (!isOpen || !pilot) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 modal-backdrop-anim">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-3xl w-full overflow-hidden modal-content-anim text-slate-800 dark:text-white my-6">
        {/* Modal Top Header */}
        <div className="bg-slate-50 dark:bg-[#0F172A] px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-teal-50 dark:bg-teal-500/15 border border-teal-200 dark:border-teal-500/30 text-teal-600 dark:text-teal-400 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Pilot Passport Metric Evaluation & Scoring
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Input validator audit scores, reliability benchmarks, and stakeholder satisfaction ratings.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Score Summary Preview Strip */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider block">
              Live Passport Formula Preview
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
              <span className="text-2xl sm:text-3xl font-black text-white">
                {preview.passportScore}
                <span className="text-xs font-normal text-slate-400"> / 100</span>
              </span>
              <span className="block text-[10px] text-teal-400 font-bold">
                {preview.passportCategory}
              </span>
            </div>

            <div className="shrink-0">
              {preview.scaleUpRecommended ? (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Scale-Up Approved
                </span>
              ) : (
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  Needs Iteration
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 max-h-[68vh] overflow-y-auto space-y-6">
          {/* Section 0: Auto-Calculated Data from Milestones */}
          <div className="p-4 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block tracking-wider">
              Auto-Calculated from Milestones & Contract Data
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">1. KPI Achievement (30%)</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">(Actual / Target) × 100</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-teal-600 dark:text-teal-400">{preview.kpiAchievementPct}%</span>
                  <span className="block text-[10px] text-slate-400">+{preview.kpiContribution} pts</span>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">2. Milestone Completion (20%)</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">% Milestones + On-Time</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-blue-600 dark:text-blue-400">{preview.onTimeCompletionPct}%</span>
                  <span className="block text-[10px] text-slate-400">+{preview.milestoneContribution} pts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Compliance Score (15% Weight) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>3. Compliance Score (15% Weight)</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Data privacy, cybersecurity, government standards, documentation completeness
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{complianceTotal} / 100</span>
                <span className="block text-[10px] text-slate-400">+{preview.complianceContribution} pts</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Data Privacy & Protection (0 - 25): {dataPrivacy}
                </label>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={dataPrivacy}
                  onChange={(e) => setDataPrivacy(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cybersecurity & Air-Gap (0 - 25): {cybersecurity}
                </label>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={cybersecurity}
                  onChange={(e) => setCybersecurity(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Govt IT & Interoperability (0 - 25): {govtStandards}
                </label>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={govtStandards}
                  onChange={(e) => setGovtStandards(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Documentation & Audit Trail (0 - 25): {docCompleteness}
                </label>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={docCompleteness}
                  onChange={(e) => setDocCompleteness(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Reliability Metrics (15% Weight) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>4. Reliability Score (15% Weight)</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  System uptime percentage and critical issues during field deployment
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{preview.reliabilityScore} / 100</span>
                <span className="block text-[10px] text-slate-400">+{preview.reliabilityContribution} pts</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  System Uptime Percentage (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="80"
                    max="100"
                    value={systemUptime}
                    onChange={(e) => setSystemUptime(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-500">%</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Critical Issues / P0 Incidents
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={criticalIssues}
                    onChange={(e) => setCriticalIssues(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-500">issues</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: User Feedback (10% Weight) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>5. User Feedback Ratings (10% Weight)</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Government officer rating and citizen / end-user satisfaction
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{preview.userFeedbackScore} / 100</span>
                <span className="block text-[10px] text-slate-400">+{preview.feedbackContribution} pts</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Government Officer Rating (1 - 5★): {officerRating}
                </label>
                <input
                  type="range"
                  step="0.1"
                  min="1"
                  max="5"
                  value={officerRating}
                  onChange={(e) => setOfficerRating(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Citizen / End-User Satisfaction (1 - 5★): {citizenRating}
                </label>
                <input
                  type="range"
                  step="0.1"
                  min="1"
                  max="5"
                  value={citizenRating}
                  onChange={(e) => setCitizenRating(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Expert Validation (10% Weight) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>6. Independent Expert Validation (10% Weight)</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Empanelled technical auditor signoff score ({pilot.validatorName})
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{expertScore} / 100</span>
                <span className="block text-[10px] text-slate-400">+{preview.expertContribution} pts</span>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Validator Assessment Score (0 - 100): {expertScore}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={expertScore}
                  onChange={(e) => setExpertScore(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Audit Findings & Technical Signoff Notes
                </label>
                <textarea
                  rows={2}
                  value={validatorNotes}
                  onChange={(e) => setValidatorNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="Summarize validator audit observations..."
                />
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isBusy}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 transition shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {isBusy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Computing & Persisting to Supabase...</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Generate & Seal Pilot Passport</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
