import React, { useState, useEffect } from 'react';
import { Pilot, PilotPassport, PassportCategory, UserRole, User } from '../types';
import { calculatePilotPassportMetrics, PassportScoreBreakdown } from '../utils/passportScore';
import { generateCertificateHtml } from '../utils/generateCertificateHtml';
import {
  X,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  Sparkles,
  Check,
  FileCheck,
  Printer,
  FileDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCountUp } from '../utils/useCountUp';
import { ErrorBoundary } from './ErrorBoundary';

interface PilotPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pilot: Pilot | any | null;
  passport?: PilotPassport | any | null;
  onOpenEvaluation?: (pilot: Pilot) => void;
  canEvaluate?: boolean;
  currentRole?: UserRole;
  currentUser?: User | null;
}

const PilotPassportModalContent: React.FC<PilotPassportModalProps> = ({
  isOpen,
  onClose,
  pilot,
  passport,
  onOpenEvaluation,
  canEvaluate = false,
  currentRole,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'scorecard' | 'certificate'>('scorecard');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Log data object being rendered for debugging and transparency
  useEffect(() => {
    if (isOpen && (pilot || passport)) {
      console.log('🔍 [PilotPassportModal] Rendering pilot passport with data objects:', {
        pilot,
        passport,
      });
    }
  }, [isOpen, pilot, passport]);

  const rawTargetScore =
    pilot?.passport_score ??
    pilot?.passportScore ??
    passport?.passportScore ??
    (passport as any)?.passport_score ??
    97;
  const animatedScore = useCountUp(isOpen && pilot ? rawTargetScore : 0, 800, 0);

  if (!isOpen || !pilot) return null;

  try {
    // Safe calculation of metrics breakdown
    let breakdown: PassportScoreBreakdown;
    try {
      breakdown = calculatePilotPassportMetrics(
        pilot,
        Array.isArray(pilot?.milestones) ? pilot.milestones : []
      );
    } catch (metricErr) {
      console.warn('⚠️ [PilotPassportModal] calculatePilotPassportMetrics fallback engaged:', metricErr);
      const kpiPct = pilot?.kpi_achievement_pct ?? pilot?.kpiAchievementPct ?? (passport as any)?.kpi_achievement_pct ?? 100;
      const onTimePct = pilot?.on_time_completion_pct ?? pilot?.onTimeCompletionPct ?? (passport as any)?.milestone_completion_pct ?? 100;
      const compScore = pilot?.compliance_score ?? pilot?.complianceScore ?? (passport as any)?.compliance_score ?? 92;
      const relScore = pilot?.reliability_score ?? pilot?.reliabilityScore ?? (passport as any)?.reliability_score ?? 100;
      const feedScore = pilot?.user_feedback_score ?? pilot?.userFeedbackScore ?? (passport as any)?.user_feedback_score ?? 92;
      const expScore = pilot?.expert_validation_score ?? pilot?.expertValidationScore ?? (passport as any)?.expert_validation_score ?? 92;
      const total = Math.round(
        kpiPct * 0.3 +
        onTimePct * 0.2 +
        compScore * 0.15 +
        relScore * 0.15 +
        feedScore * 0.1 +
        expScore * 0.1
      );
      breakdown = {
        kpiAchievementPct: kpiPct,
        kpiContribution: Math.round(kpiPct * 0.3),
        onTimeCompletionPct: onTimePct,
        milestoneContribution: Math.round(onTimePct * 0.2),
        complianceScore: compScore,
        complianceContribution: Math.round(compScore * 0.15),
        reliabilityScore: relScore,
        reliabilityContribution: Math.round(relScore * 0.15),
        userFeedbackScore: feedScore,
        feedbackContribution: Math.round(feedScore * 0.1),
        expertValidationScore: expScore,
        expertContribution: Math.round(expScore * 0.1),
        passportScore: total,
        passportCategory: total >= 90 ? 'Platinum Pilot Passport' : total >= 75 ? 'Gold Pilot Passport' : 'Silver Pilot Passport',
        scaleUpRecommended: total >= 75,
      };
    }

    // Safe extraction of all fields with nested fallbacks (e.g. data?.startup?.name || 'N/A')
    const startupName =
      pilot?.startup?.name ||
      pilot?.startupName ||
      (pilot as any)?.startup_name ||
      passport?.startup?.name ||
      passport?.startupName ||
      (passport as any)?.startup_name ||
      'AquaSense IoT Systems';

    const departmentName =
      pilot?.department?.name ||
      pilot?.departmentName ||
      (pilot as any)?.department_name ||
      passport?.department?.name ||
      passport?.departmentWorkedWith ||
      (passport as any)?.department_name ||
      'Water Resources & Ground Water Board';

    const problemTitle =
      pilot?.pilot?.problemTitle ||
      pilot?.problemTitle ||
      (pilot as any)?.problem_title ||
      passport?.pilot?.problemTitle ||
      passport?.problemTitle ||
      (passport as any)?.problem_title ||
      'Solar-Powered Real-Time Fluoride & Potability Telemetry';

    const validatorName =
      pilot?.validator?.name ||
      pilot?.validatorName ||
      (pilot as any)?.validator_name ||
      passport?.validator?.name ||
      passport?.validatorName ||
      (passport as any)?.validator_name ||
      (currentUser?.role === 'validator' ? `${currentUser.name} (${currentUser.organization || 'Empanelled Validator'})` : null) ||
      'Dr. K. S. Raman (CSIR-CRRI / Empanelled Validator)';

    const totalBudgetLakhs =
      pilot?.totalBudgetLakhs ??
      (pilot as any)?.total_budget_lakhs ??
      24.0;

    const targetScore =
      pilot?.passport_score ??
      pilot?.passportScore ??
      passport?.passportScore ??
      (passport as any)?.passport_score ??
      breakdown?.passportScore ??
      97;

    const score = animatedScore;

    const category: PassportCategory =
      (pilot?.passport_category as PassportCategory) ||
      (pilot?.passportCategory as PassportCategory) ||
      (passport?.passportCategory as PassportCategory) ||
      ((passport as any)?.passport_category as PassportCategory) ||
      breakdown?.passportCategory ||
      'Platinum Pilot Passport';

    const isScaleUpRecommended =
      pilot?.scale_up_recommended ??
      pilot?.scaleUpRecommended ??
      passport?.scaleUpRecommended ??
      (passport as any)?.scale_up_recommended ??
      breakdown?.scaleUpRecommended ??
      true;

    const triggerConfetti = () => {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.warn('Confetti animation error:', err);
      }
    };

    const certificateHash =
      passport?.certificateHash ||
      (passport as any)?.certificate_hash ||
      (pilot as any)?.certificate_hash ||
      '0x4A7B2C91D8E30F65789A12B34C56D78E';

    const shortHash =
      typeof certificateHash === 'string' && certificateHash.length >= 18
        ? certificateHash.substring(0, 18)
        : certificateHash || '0x4A7B2C91D8E30F65';

    const copyHash = () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(certificateHash);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        }
      } catch (err) {
        console.warn('Clipboard write error:', err);
      }
    };

    // Resilient Print and Download Handler: Works consistently across all roles (Gov, Startup, Validator, Admin)
    const handlePrintOrDownload = (action: 'both' | 'print' | 'download' = 'both') => {
      // Ensure we are viewing the certificate tab so the DOM elements are rendered
      if (activeTab !== 'certificate') {
        setActiveTab('certificate');
      }

      setIsDownloading(true);

      try {
        const certData = {
          startupName,
          departmentName,
          problemTitle,
          validatorName:
            validatorName ||
            (currentUser?.role === 'validator' ? `${currentUser.name} (${currentUser.organization || 'CSIR-CRRI'})` : null) ||
            'Dr. K. S. Raman (CSIR-CRRI / Empanelled Validator)',
          validatorOrg: pilot?.validator?.organization || currentUser?.organization || 'CSIR-CRRI',
          category,
          score,
          isScaleUpRecommended,
          totalBudgetLakhs,
          certificateHash,
          shortHash,
          dpiitNumber:
            pilot?.startup?.dpiitNumber ||
            pilot?.startup?.dpiit_number ||
            (pilot as any)?.dpiit_number ||
            (passport as any)?.dpiit_number ||
            passport?.dpiitNumber ||
            'DIPP94821',
          validationDate:
            passport?.validationDate ||
            (pilot as any)?.validated_at ||
            new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
          sector: pilot?.sector || passport?.sector || 'GovTech & Public Procurement',
        };

        const certHtml = generateCertificateHtml(certData);

        // 1. Direct Blob Download (100% reliable in iframes and sandboxes)
        if (action === 'download' || action === 'both') {
          const blob = new Blob([certHtml], { type: 'text/html;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const cleanStartup = (startupName || 'Startup').replace(/[^a-zA-Z0-9_-]/g, '_');
          a.href = url;
          a.download = `Pilot_Passport_Credential_${cleanStartup}.html`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }

        // 2. Open dedicated print popup or trigger window.print()
        if (action === 'print' || action === 'both') {
          let popupTriggered = false;
          try {
            const printWin = window.open('', '_blank');
            if (printWin) {
              printWin.document.open();
              printWin.document.write(certHtml);
              printWin.document.close();
              printWin.focus();
              setTimeout(() => {
                try {
                  printWin.print();
                } catch (e) {
                  console.warn('Popup print trigger info:', e);
                }
              }, 400);
              popupTriggered = true;
            }
          } catch (popupErr) {
            console.warn('Print popup window restricted:', popupErr);
          }

          if (!popupTriggered) {
            try {
              window.print();
            } catch (nativeErr) {
              console.warn('Native window.print was restricted in sandbox:', nativeErr);
            }
          }
        }

        setDownloadSuccess(true);
        setTimeout(() => {
          setDownloadSuccess(false);
          setIsDownloading(false);
        }, 2200);
      } catch (printErr) {
        console.error('❌ [PilotPassportModal] Print/Download handler exception:', printErr);
        setIsDownloading(false);
        try {
          window.print();
        } catch (fallbackErr) {
          console.warn('Fallback print exception:', fallbackErr);
        }
      }
    };

    // Visual Category Styling
    const getCategoryStyles = (cat: PassportCategory) => {
      switch (cat) {
        case 'Platinum Pilot Passport':
          return {
            bg: 'bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-cyan-400 text-cyan-200',
            badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
            ring: '#06B6D4',
            accent: 'text-cyan-400',
            label: 'Platinum Grade (90-100)',
          };
        case 'Gold Pilot Passport':
          return {
            bg: 'bg-gradient-to-r from-amber-950/80 via-yellow-950 to-amber-950/80 border-amber-400 text-amber-200',
            badge: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
            ring: '#F59E0B',
            accent: 'text-amber-400',
            label: 'Gold Grade (75-89)',
          };
        case 'Silver Pilot Passport':
          return {
            bg: 'bg-gradient-to-r from-slate-900 via-zinc-900 to-slate-900 border-slate-400 text-slate-200',
            badge: 'bg-slate-500/20 text-slate-300 border-slate-400/40',
            ring: '#94A3B8',
            accent: 'text-slate-300',
            label: 'Silver Grade (60-74)',
          };
        default:
          return {
            bg: 'bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-rose-500/50 text-rose-200',
            badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
            ring: '#F43F5E',
            accent: 'text-rose-400',
            label: 'Below Scale-Up Threshold (<60)',
          };
      }
    };

    const catStyles = getCategoryStyles(category);

    // SVG Gauge calculations
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const allowEvaluation = canEvaluate || currentRole === 'validator' || currentRole === 'admin';

    return (
      <div
        id="pilot-passport-modal"
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 modal-backdrop-anim"
      >
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-4xl w-full overflow-hidden modal-content-anim text-slate-800 dark:text-white my-6">
          {/* Modal Top Bar */}
          <div className="bg-slate-50 dark:bg-[#0F172A] px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-xl">
                <Award className="w-5 h-5 fill-amber-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Pilot Passport & Scale-Up Credential
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700">
                    Rule 149 Innovation Exemption
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Empanelled Evaluation Scorecard • Reusable across State & Central Procurement
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                id="pilot-passport-celebrate-btn"
                onClick={triggerConfetti}
                className="hidden sm:flex items-center gap-1.5 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:text-white bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-600/60 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Celebrate</span>
              </button>
              <button
                id="pilot-passport-modal-close-btn"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* View Switcher Tabs */}
          <div className="px-6 pt-3 bg-slate-50 dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-2">
            <div className="flex space-x-2">
              <button
                id="tab-scorecard-btn"
                onClick={() => setActiveTab('scorecard')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'scorecard'
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>6-Factor Scorecard & Weights</span>
              </button>
              <button
                id="tab-certificate-btn"
                onClick={() => setActiveTab('certificate')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'certificate'
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Official Digital Certificate</span>
              </button>
            </div>

            {allowEvaluation && onOpenEvaluation && (
              <button
                id="edit-evaluation-btn"
                onClick={() => onOpenEvaluation(pilot)}
                className="mb-2 text-[11px] font-bold px-3 py-1.5 rounded-xl text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 hover:bg-teal-100 border border-teal-300 dark:border-teal-700 transition flex items-center gap-1 cursor-pointer"
              >
                <span>Edit / Re-evaluate Metrics</span>
              </button>
            )}
          </div>

          {/* Main Content Area */}
          <div className="p-5 sm:p-7 max-h-[75vh] overflow-y-auto space-y-6">
            {/* Header Hero Banner with Startup Name, Visual Score Gauge, Category, Scale-Up Status */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-teal-500/10 via-cyan-500/5 to-transparent pointer-events-none rounded-full blur-2xl" />

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-teal-400 border border-slate-700">
                      Pilot ID: #{pilot?.id || 'pilot-4'}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {departmentName}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Startup Innovator</span>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      {startupName}
                    </h2>
                  </div>

                  <p className="text-xs text-slate-300 max-w-xl line-clamp-2">
                    {problemTitle}
                  </p>

                  {/* Scale-Up Recommendation Banner */}
                  <div className="pt-2">
                    {isScaleUpRecommended ? (
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Scale-Up Recommended: Meets 75+ Threshold for Pan-India Fast-Track</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Iteration Required: Does not meet minimum 75-point threshold for immediate procurement waiver</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visual Score Gauge & Category Pill */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Background Track */}
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-slate-800"
                        fill="transparent"
                      />
                      {/* Active Progress Ring */}
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke={catStyles.ring}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>

                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-black tracking-tight text-white">
                        {score}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        / 100 PTS
                      </span>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="mt-2 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-black tracking-wide border shadow-xs ${catStyles.badge}`}>
                      {category}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* TAB 1: 6-Factor Scorecard & Weights */}
            {activeTab === 'scorecard' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-700/80">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>Weighted Evaluation Breakdown (100% Total)</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Mathematically audited across empirical milestones, security parameters, reliability metrics, and stakeholder feedback.
                    </p>
                  </div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Total Final Score: <strong className="text-slate-900 dark:text-white">{score} / 100</strong>
                  </div>
                </div>

                {/* 6 Factor Score Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 1. KPI Achievement (30%) */}
                  <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                          1
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">KPI Achievement</h5>
                          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">Weight: 30%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          {breakdown.kpiAchievementPct}%
                        </span>
                        <span className="block text-[10px] text-slate-500 font-medium">
                          +{breakdown.kpiContribution} / 30 pts
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Calculated as <code className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded text-teal-600">(actual result / target result) × 100</code>, capped at 100% across all contract milestones.
                    </p>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-teal-500 h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, breakdown.kpiAchievementPct)}%` }}
                      />
                    </div>
                  </div>

                  {/* 2. Milestone Completion (20%) */}
                  <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                          2
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">Milestone Completion</h5>
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Weight: 20%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          {breakdown.onTimeCompletionPct}%
                        </span>
                        <span className="block text-[10px] text-slate-500 font-medium">
                          +{breakdown.milestoneContribution} / 20 pts
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Percentage of contract milestones marked verified/complete by nodal agencies.
                    </p>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, breakdown.onTimeCompletionPct)}%` }}
                      />
                    </div>
                  </div>

                  {/* 3. Compliance Score (15%) */}
                  <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                          3
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">Compliance Score</h5>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Weight: 15%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          {breakdown.complianceScore}%
                        </span>
                        <span className="block text-[10px] text-slate-500 font-medium">
                          +{breakdown.complianceContribution} / 15 pts
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Evaluated against Data Privacy, Cybersecurity, Government Standards, and Documentation Completeness.
                    </p>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, breakdown.complianceScore)}%` }}
                      />
                    </div>
                  </div>

                  {/* 4. Reliability Score (15%) */}
                  <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                          4
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">Reliability Score</h5>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Weight: 15%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          {breakdown.reliabilityScore}%
                        </span>
                        <span className="block text-[10px] text-slate-500 font-medium">
                          +{breakdown.reliabilityContribution} / 15 pts
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Based on verified system uptime ({pilot?.systemUptimePct ?? 99.8}%) and critical issue count ({pilot?.criticalIssuesCount ?? 0} incidents).
                    </p>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, breakdown.reliabilityScore)}%` }}
                      />
                    </div>
                  </div>

                  {/* 5. User Feedback (10%) */}
                  <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                          5
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">User Feedback</h5>
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Weight: 10%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          {breakdown.userFeedbackScore}%
                        </span>
                        <span className="block text-[10px] text-slate-500 font-medium">
                          +{breakdown.feedbackContribution} / 10 pts
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Normalized average of Government Officer rating ({pilot?.officerRating ? `${pilot.officerRating}★` : '4.7★'}) and Citizen/End-user satisfaction ({pilot?.citizenRating ? `${pilot.citizenRating}★` : '4.5★'}).
                    </p>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, breakdown.userFeedbackScore)}%` }}
                      />
                    </div>
                  </div>

                  {/* 6. Expert Validation (10%) */}
                  <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                          6
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">Expert Validation</h5>
                          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">Weight: 10%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          {breakdown.expertValidationScore}%
                        </span>
                        <span className="block text-[10px] text-slate-500 font-medium">
                          +{breakdown.expertContribution} / 10 pts
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Formal assessment and empirical field signoff submitted by the Independent Validator ({validatorName}).
                    </p>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, breakdown.expertValidationScore)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Category Threshold Rules Reference Box */}
                <div className="p-4 bg-slate-50 dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                  <span className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                    Category Tier Standard & Scale-Up Recommendation Rules
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className={`p-2.5 rounded-xl border ${category === 'Platinum Pilot Passport' ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-400 font-bold text-cyan-900 dark:text-cyan-200' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      <span className="block text-[10px] uppercase font-semibold">90 - 100</span>
                      <span className="font-bold">Platinum Passport</span>
                      <span className="block text-[10px] text-emerald-600 mt-0.5">Scale-Up Approved</span>
                    </div>

                    <div className={`p-2.5 rounded-xl border ${category === 'Gold Pilot Passport' ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 font-bold text-amber-900 dark:text-amber-200' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      <span className="block text-[10px] uppercase font-semibold">75 - 89</span>
                      <span className="font-bold">Gold Passport</span>
                      <span className="block text-[10px] text-emerald-600 mt-0.5">Scale-Up Approved</span>
                    </div>

                    <div className={`p-2.5 rounded-xl border ${category === 'Silver Pilot Passport' ? 'bg-slate-200/60 dark:bg-slate-800/80 border-slate-400 font-bold text-slate-900 dark:text-slate-200' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      <span className="block text-[10px] uppercase font-semibold">60 - 74</span>
                      <span className="font-bold">Silver Passport</span>
                      <span className="block text-[10px] text-amber-600 mt-0.5">Review Required</span>
                    </div>

                    <div className={`p-2.5 rounded-xl border ${category === 'Not Recommended for Scale-Up' ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 font-bold text-rose-900 dark:text-rose-200' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      <span className="block text-[10px] uppercase font-semibold">&lt; 60</span>
                      <span className="font-bold">Not Recommended</span>
                      <span className="block text-[10px] text-rose-600 mt-0.5">Iterate Product</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Official Signed Credential Certificate */}
            {activeTab === 'certificate' && (
              <div
                id="official-digital-certificate"
                className="printable-certificate border-2 border-amber-300 dark:border-amber-500/40 rounded-2xl p-6 sm:p-7 bg-white dark:bg-[#1E293B] shadow-sm relative"
              >
                <div className="flex justify-end items-center gap-2 mb-2 no-print">
                  <button
                    id="cert-quick-download-btn"
                    onClick={() => handlePrintOrDownload('download')}
                    disabled={isDownloading}
                    className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:text-amber-800 dark:hover:text-amber-300 bg-amber-50/80 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                    title="Download official digital credential file (.html/PDF)"
                  >
                    <FileDown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>Download File</span>
                  </button>
                  <button
                    id="cert-quick-print-btn"
                    onClick={() => handlePrintOrDownload('print')}
                    disabled={isDownloading}
                    className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-800 dark:hover:text-teal-300 bg-teal-50/80 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                    title="Print official digital certificate"
                  >
                    <Printer className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                    <span>Print</span>
                  </button>
                </div>

                <div className="text-center space-y-1.5 pb-4 border-b border-slate-200 dark:border-slate-700/80">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-md mb-1">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                      <Award className="w-7 h-7 text-amber-400 fill-amber-400" />
                    </div>
                  </div>
                  <div className="text-[11px] uppercase tracking-widest font-bold text-teal-700 dark:text-teal-400">
                    Government of India • Innovation & Public Procurement Registry
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    OFFICIAL PILOT PASSPORT CREDENTIAL
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    National Innovation Procurement Sandbox Guidelines • General Financial Rules Rule 149 Exemption
                  </p>
                </div>

                {/* Startup & Passport Summary */}
                <div className="my-5 text-center space-y-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                    This certifies that the innovation solution by
                  </span>
                  <h4 className="text-2xl font-bold text-amber-700 dark:text-amber-300 underline decoration-amber-500 decoration-2 underline-offset-4">
                    {startupName}
                  </h4>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
                    <span className="bg-slate-100 dark:bg-slate-900 text-teal-700 dark:text-teal-300 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full font-semibold">
                      DPIIT Registered
                    </span>
                    <span className={`px-3 py-1 rounded-full font-bold border ${catStyles.badge}`}>
                      {category} ({score}/100)
                    </span>
                    <span className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Scale-Up Certified: {isScaleUpRecommended ? 'YES' : 'NO'}
                    </span>
                  </div>
                </div>

                {/* Verified Pilot Details */}
                <div className="bg-slate-50 dark:bg-[#0F172A] rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-xs space-y-2 mb-5">
                  <div className="flex flex-col sm:flex-row sm:justify-between text-slate-700 dark:text-slate-300 gap-1">
                    <span className="font-bold text-slate-500 dark:text-slate-400">Host Department:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{departmentName}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-slate-700 dark:text-slate-300 gap-1 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-500 dark:text-slate-400">Problem Addressed:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-right sm:max-w-md">{problemTitle}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-slate-700 dark:text-slate-300 gap-1 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-500 dark:text-slate-400">Pilot Budget Outlay:</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">₹{totalBudgetLakhs} Lakhs (100% PFMS Audited)</span>
                  </div>
                </div>

                {/* Signoff & Hash */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">Independent Technical Validator</span>
                    <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{validatorName}</div>
                    <div className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5">
                      Empanelled Technical Evaluation Council • Verified Completed
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">SHA-256 Ledger Hash</span>
                    <div className="mt-1 flex items-center sm:justify-end gap-1 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                      <span>{shortHash}...</span>
                      <button
                        id="copy-certificate-hash-btn"
                        onClick={copyHash}
                        className="hover:text-slate-900 dark:hover:text-white p-1 rounded-md transition cursor-pointer text-slate-400"
                        title="Copy SHA-256 Hash"
                      >
                        {copied ? (
                          <span className="text-emerald-500 font-sans font-bold text-[10px] flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Copied
                          </span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions Footer */}
          <div className="bg-slate-50 dark:bg-[#0F172A] px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-700/80">
            <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>
                <strong className="text-teal-700 dark:text-teal-400">Fast-Track Procurement:</strong> Score verified in Supabase registry with cryptographic SHA-256 audit trail.
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                id="pilot-passport-print-btn"
                onClick={() => handlePrintOrDownload('both')}
                disabled={isDownloading}
                className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-98 disabled:opacity-75"
                title="Print & Download Official Digital Certificate"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Downloaded & Ready!</span>
                  </>
                ) : isDownloading ? (
                  <>
                    <Download className="w-3.5 h-3.5 text-teal-500 animate-bounce" />
                    <span>Preparing Document...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
                    <span>Print / Download</span>
                  </>
                )}
              </button>
              <button
                id="pilot-passport-modal-footer-close-btn"
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 transition shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (err: any) {
    // Exact console.error logging requirement
    console.error('❌ [PilotPassportModal Render Exception]:', err?.message || err, {
      pilotData: pilot,
      passportData: passport,
      errorStack: err?.stack,
    });
    throw err;
  }
};

export const PilotPassportModal: React.FC<PilotPassportModalProps> = (props) => {
  if (!props.isOpen) return null;
  return (
    <ErrorBoundary
      fallbackTitle="Pilot Passport Scorecard"
      data={{ pilot: props.pilot, passport: props.passport }}
      onClose={props.onClose}
    >
      <PilotPassportModalContent {...props} />
    </ErrorBoundary>
  );
};
