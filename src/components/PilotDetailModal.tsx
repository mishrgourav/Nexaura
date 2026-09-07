import React from 'react';
import { Pilot, Milestone, UserRole } from '../types';
import {
  X,
  Rocket,
  Award,
  CheckCircle2,
  Send,
  Upload,
  FileText,
  ExternalLink,
} from 'lucide-react';

interface PilotDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  pilot: Pilot | null;
  currentRole: UserRole;
  onOpenSubmitMilestone: (milestone: Milestone) => void;
  onVerifyMilestone: (milestoneId: string) => Promise<void>;
  onApprovePayment: (paymentId: string) => Promise<void>;
  onMarkPaymentPaid: (paymentId: string) => Promise<void>;
  onGeneratePassport: (pilotId: string) => Promise<void>;
  onViewPassport: (startupId: string) => void;
  onViewPilotPassport?: (pilot: Pilot) => void;
  onOpenPassportEvaluation?: (pilot: Pilot) => void;
  verifyingId: string | null;
  approvingId: string | null;
  generatingPassport: boolean;
}

export const PilotDetailModal: React.FC<PilotDetailModalProps> = ({
  isOpen,
  onClose,
  pilot,
  currentRole,
  onOpenSubmitMilestone,
  onVerifyMilestone,
  onApprovePayment,
  onMarkPaymentPaid,
  onGeneratePassport,
  onViewPassport,
  onViewPilotPassport,
  onOpenPassportEvaluation,
  verifyingId,
  approvingId,
  generatingPassport,
}) => {
  if (!isOpen || !pilot) return null;

  const milestones = pilot.milestones || [];
  const payments = pilot.payments || [];
  const percentDisbursed = Math.round((pilot.disbursedBudgetLakhs / pilot.totalBudgetLakhs) * 100);
  const allMilestonesDone = milestones.length > 0 && milestones.every(m => m.status === 'verified' || m.status === 'paid');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700 px-2.5 py-0.5 rounded-full">Paid & Settled</span>;
      case 'verified':
        return <span className="text-[11px] font-bold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-700 px-2.5 py-0.5 rounded-full">Verified (Ready for Treasury)</span>;
      case 'submitted':
        return <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-700 px-2.5 py-0.5 rounded-full">Proof Submitted</span>;
      default:
        return <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-full">Pending</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 modal-backdrop-anim">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-4xl w-full overflow-hidden modal-content-anim text-slate-800 dark:text-white">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-[#0F172A] px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-50 dark:bg-teal-500/15 border border-teal-200 dark:border-teal-500/30 rounded-xl text-teal-600 dark:text-teal-400">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{pilot.problemTitle}</h3>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  pilot.status === 'completed'
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700'
                    : 'bg-sky-50 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-700'
                }`}>
                  {pilot.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Dept: <strong className="text-slate-800 dark:text-slate-200">{pilot.departmentName}</strong> ➔ Innovator: <strong className="text-slate-800 dark:text-slate-200">{pilot.startupName}</strong>
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Top Summary Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl p-3.5">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Total Pilot Budget</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">₹{pilot.totalBudgetLakhs} L</span>
            </div>
            <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl p-3.5">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Disbursed by Treasury</span>
              <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">₹{pilot.disbursedBudgetLakhs} L ({percentDisbursed}%)</span>
            </div>
            <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl p-3.5">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Empanelled Validator</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 mt-1">{pilot.validatorName}</span>
            </div>
            <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl p-3.5">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Timeline</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block font-mono">
                {pilot.startDate} to {pilot.endDate}
              </span>
            </div>
          </div>

          {/* Scope Summary */}
          <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-xs text-slate-700 dark:text-slate-300">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Operational Scope Summary:</span>
            <span>{pilot.scopeSummary}</span>
          </div>

          {/* Pilot Passport Banner & Scorecard (if Completed or Evaluated) */}
          {(pilot.status === 'completed' || pilot.passport_score !== undefined || pilot.passportScore !== undefined) && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900/40 border border-amber-300 dark:border-amber-500/40 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="p-3 bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40 text-amber-600 dark:text-amber-400 rounded-xl">
                    <Award className="w-6 h-6 fill-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Digital Pilot Passport Issued & Active
                      </h4>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                        {pilot.scale_up_recommended ?? pilot.scaleUpRecommended ?? true ? 'Scale-Up Approved' : 'Needs Iteration'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Empanelled procurement credential with independent 6-factor audit trail.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {pilot.passport_score ?? pilot.passportScore ?? 88}
                      <span className="text-xs font-normal text-slate-400">/100</span>
                    </span>
                    <span className="block text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      {pilot.passport_category ?? pilot.passportCategory ?? 'Gold Pilot Passport'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onOpenPassportEvaluation && (currentRole === 'validator' || currentRole === 'admin') && (
                      <button
                        onClick={() => onOpenPassportEvaluation(pilot)}
                        className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition shadow-2xs"
                        title="Re-evaluate or adjust compliance/reliability metrics"
                      >
                        Adjust Metrics
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (onViewPilotPassport) {
                          onViewPilotPassport(pilot);
                        } else {
                          onViewPassport(pilot.startupId);
                        }
                      }}
                      className="bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0"
                    >
                      <Award className="w-4 h-4 fill-amber-950" />
                      <span>View Pilot Passport</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 6-Factor Breakdown Summary Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2 border-t border-amber-200/60 dark:border-slate-700/60 text-[10px]">
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-slate-400 block font-medium">KPI (30%)</span>
                  <strong className="text-teal-600 dark:text-teal-400 text-xs font-bold">
                    {pilot.kpi_achievement_pct ?? 98}%
                  </strong>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-slate-400 block font-medium">Milestones (20%)</span>
                  <strong className="text-blue-600 dark:text-blue-400 text-xs font-bold">
                    {pilot.on_time_completion_pct ?? 95}%
                  </strong>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-slate-400 block font-medium">Compliance (15%)</span>
                  <strong className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                    {pilot.compliance_score ?? 96}%
                  </strong>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-slate-400 block font-medium">Reliability (15%)</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    {pilot.reliability_score ?? 98}%
                  </strong>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-slate-400 block font-medium">Feedback (10%)</span>
                  <strong className="text-amber-600 dark:text-amber-400 text-xs font-bold">
                    {pilot.user_feedback_score ?? 94}%
                  </strong>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-slate-400 block font-medium">Expert (10%)</span>
                  <strong className="text-purple-600 dark:text-purple-400 text-xs font-bold">
                    {pilot.expert_validation_score ?? 96}%
                  </strong>
                </div>
              </div>
            </div>
          )}

          {pilot.status !== 'completed' && allMilestonesDone && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-600/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 rounded-xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">All Milestones Successfully Validated!</h4>
                  <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80 mt-0.5">
                    Pilot is complete. Ready to evaluate 6-factor metrics and issue the official Digital Pilot Passport.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onOpenPassportEvaluation && (currentRole === 'validator' || currentRole === 'admin') ? (
                  <button
                    onClick={() => onOpenPassportEvaluation(pilot)}
                    className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0"
                  >
                    <Award className="w-4 h-4" />
                    <span>Evaluate & Mint Passport</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onGeneratePassport(pilot.id)}
                    disabled={generatingPassport}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    <Award className="w-4 h-4" />
                    <span>{generatingPassport ? 'Minting Credential...' : 'Mint Pilot Passport'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Milestones & Verification Engine */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Milestone Verification & Payment Progress
              </h4>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {milestones.filter(m => m.status === 'paid').length} of {milestones.length} Paid
              </span>
            </div>

            <div className="space-y-3">
              {milestones.map((m) => {
                const isVerifying = verifyingId === m.id;
                const payment = payments.find(p => p.milestoneId === m.id);
                const isApproving = payment && approvingId === payment.id;

                return (
                  <div
                    key={m.id}
                    className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 space-y-3"
                  >
                    {/* Top Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{m.title}</span>
                        {getStatusBadge(m.status)}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Weight: {m.weightPercent}%</span>
                        <span className="font-mono font-bold text-teal-700 dark:text-teal-300 bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          ₹{m.amountLakhs.toFixed(2)} Lakhs
                        </span>
                      </div>
                    </div>

                    {/* Description & Target KPI */}
                    <div className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                      <p>{m.description}</p>
                      <div className="flex flex-wrap items-center justify-between pt-2 text-[11px] border-t border-slate-100 dark:border-slate-800">
                        <span>Target KPI: <strong className="text-slate-800 dark:text-slate-200">{m.targetKpiDescription}</strong></span>
                        <span className="font-mono font-bold text-teal-700 dark:text-teal-300">
                          Target: {m.targetKpiValue} {m.kpiUnit}
                        </span>
                      </div>
                    </div>

                    {/* Submission Data if submitted */}
                    {m.submittedValue !== undefined && (
                      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-700/60 rounded-lg p-3 text-xs space-y-1">
                        <div className="flex justify-between items-center text-slate-900 dark:text-white font-bold">
                          <span>Submitted Telemetry Value:</span>
                          <span className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">
                            {m.submittedValue} {m.kpiUnit}
                          </span>
                        </div>
                        {m.submittedNotes && (
                          <div className="text-slate-700 dark:text-slate-300 text-[11px] pt-1">
                            Notes: {m.submittedNotes}
                          </div>
                        )}
                        {m.submittedProofUrl && (
                          <div className="pt-1">
                            <a
                              href={m.submittedProofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-teal-700 dark:text-teal-400 hover:underline text-[11px] inline-flex items-center gap-1 font-medium"
                            >
                              <FileText className="w-3 h-3" />
                              <span>View Telemetry Audit Log Proof</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons for this milestone */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {m.verifiedAt ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                            ✓ Verified on {new Date(m.verifiedAt).toLocaleDateString()} by {m.verifiedBy}
                          </span>
                        ) : m.status === 'submitted' ? (
                          <span className="text-amber-700 dark:text-amber-400 font-medium">
                            Rule-based check ready for audit review
                          </span>
                        ) : (
                          <span>Awaiting startup submission</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Startup Submit Proof Button */}
                        {m.status === 'pending' && (
                          <button
                            onClick={() => onOpenSubmitMilestone(m)}
                            className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition shadow-2xs"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload KPI Proof</span>
                          </button>
                        )}

                        {/* Run Rule-Based Check & Verify */}
                        {m.status === 'submitted' && (
                          <button
                            onClick={() => onVerifyMilestone(m.id)}
                            disabled={isVerifying}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition shadow-2xs disabled:opacity-50"
                            title="Auto-checks submitted value >= target KPI and queues payment instruction"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isVerifying ? 'Checking...' : 'Run KPI Check & Verify'}</span>
                          </button>
                        )}

                        {/* Officer Approve & Send to Treasury */}
                        {payment && payment.status === 'verified' && (
                          <button
                            onClick={() => onApprovePayment(payment.id)}
                            disabled={isApproving}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition shadow-2xs disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{isApproving ? 'Sending...' : 'Approve & Send to Treasury'}</span>
                          </button>
                        )}

                        {/* Settle Treasury (Mark Paid) */}
                        {payment && payment.status === 'sent_to_treasury' && (
                          <button
                            onClick={() => onMarkPaymentPaid(payment.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition shadow-2xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Paid (PFMS)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-[#0F172A] px-6 py-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-700/80 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Platform acts as verification layer; all disbursements handled via State Treasury / PFMS.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-white text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
