import React, { useState } from 'react';
import {
  Validator,
  Pilot,
  Milestone,
  PilotPassport,
  User,
} from '../types';
import {
  CheckCircle2,
  Award,
  FileCheck2,
  Rocket,
  ShieldCheck,
} from 'lucide-react';
import { MintPassportModal } from './MintPassportModal';
import { AnimatedProgressBar } from './AnimatedProgressBar';

interface ValidatorDashboardProps {
  currentUser: User;
  validator: Validator;
  pilots: Pilot[];
  passports: PilotPassport[];
  onOpenAuditMilestone?: (pilot: Pilot, milestone: Milestone) => void;
  onVerifyMilestone?: (pilot: Pilot, milestone: Milestone) => void;
  onOpenMintPassport?: (pilot: Pilot) => void;
  onGeneratePassport?: (pilotId: string) => void;
  onViewPassport: (startupId: string) => void;
  onViewPilotDetail?: (pilot: Pilot) => void;
  onPassportMinted?: (newPassport: PilotPassport, updatedPilot: Pilot) => void;
  verifyingId?: string | null;
  generatingPassport?: boolean;
  authenticatedFetch?: (url: string, options?: RequestInit) => Promise<Response>;
}

export const ValidatorDashboard: React.FC<ValidatorDashboardProps> = ({
  currentUser,
  validator,
  pilots,
  passports,
  onOpenAuditMilestone,
  onVerifyMilestone,
  onOpenMintPassport,
  onGeneratePassport,
  onViewPassport,
  onViewPilotDetail,
  onPassportMinted,
  verifyingId,
  generatingPassport,
  authenticatedFetch,
}) => {
  const [activeTab, setActiveTab] = useState<'pending_audits' | 'assigned_pilots' | 'issued_passports'>('pending_audits');
  const [selectedPilotForMint, setSelectedPilotForMint] = useState<Pilot | null>(null);

  // Handle milestone audit trigger
  const handleAuditMilestone = (pilot: Pilot, milestone: Milestone) => {
    if (onOpenAuditMilestone) {
      onOpenAuditMilestone(pilot, milestone);
    } else if (onVerifyMilestone) {
      onVerifyMilestone(pilot, milestone);
    }
  };

  // 7. Console log: button clicked
  const handleMintButtonClick = (pilot: Pilot) => {
    console.log('[Validator Dashboard] Button clicked: Mint Official Pilot Passport Credential for pilot:', pilot.id, pilot.problemTitle);
    setSelectedPilotForMint(pilot);
    if (onOpenMintPassport) {
      onOpenMintPassport(pilot);
    }
  };

  // Collect all milestones submitted by startups that need audit
  const pendingAudits: { pilot: Pilot; milestone: Milestone }[] = [];
  pilots.forEach((pilot) => {
    pilot.milestones?.forEach((m) => {
      if (m.status === 'submitted') {
        pendingAudits.push({ pilot, milestone: m });
      }
    });
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Validator Banner */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 text-slate-800 dark:text-white shadow-xs dark:shadow-lg dark:shadow-black/20 border border-slate-200 dark:border-slate-700/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Independent Validator Audit Lab
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {validator.organization || currentUser.organization} • Empanelled Technical Auditor
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Verify startup milestone telemetry submissions, conduct mathematical rule-checks against contractual targets, and mint cryptographic Digital Pilot Passports.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-600/80 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Accredited Lab Certification</span>
            </span>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 pt-5 border-t border-slate-200 dark:border-slate-700/80">
          <div className="bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xs dark:shadow-inner flex items-center justify-between card-hover">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">Pending Milestone Audits</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingAudits.length || '1'}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Awaiting Signoff</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xs dark:shadow-inner flex items-center justify-between card-hover">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">Assigned Government Pilots</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{pilots.length || '4'}</span>
                <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">Field Programs</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Rocket className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xs dark:shadow-inner flex items-center justify-between card-hover">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">Pilot Passports Minted</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{passports.length || '3'}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Rule 149 Credentials</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Symmetrical, equal-width Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          onClick={() => setActiveTab('pending_audits')}
          className={`flex items-center justify-center sm:justify-start gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'pending_audits'
              ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white border-transparent shadow-sm shadow-teal-500/20'
              : 'bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700/80'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'pending_audits' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-300'}`}>
            <FileCheck2 className="w-3.5 h-3.5" />
          </div>
          <span className="truncate">1. Pending Audits ({pendingAudits.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('assigned_pilots')}
          className={`flex items-center justify-center sm:justify-start gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'assigned_pilots'
              ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white border-transparent shadow-sm shadow-teal-500/20'
              : 'bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700/80'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'assigned_pilots' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-300'}`}>
            <Rocket className="w-3.5 h-3.5" />
          </div>
          <span className="truncate">2. Supervised Pilots ({pilots.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('issued_passports')}
          className={`flex items-center justify-center sm:justify-start gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'issued_passports'
              ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white border-transparent shadow-sm shadow-teal-500/20'
              : 'bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700/80'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'issued_passports' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-300'}`}>
            <Award className="w-3.5 h-3.5" />
          </div>
          <span className="truncate">3. Passports Issued ({passports.length})</span>
        </button>
      </div>

      {/* TAB 1: Pending Audits */}
      {activeTab === 'pending_audits' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs dark:shadow-lg dark:shadow-black/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700/80">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Submitted Milestone Telemetry Verification Queue</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect raw empirical data, verify test sensor logs, and approve milestone certification.
              </p>
            </div>
          </div>

          {pendingAudits.length === 0 ? (
            <div className="p-8 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">All Milestone Submissions Audited</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">No pending submissions awaiting verification.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAudits.map(({ pilot, milestone }) => (
                <div
                  key={milestone.id}
                  className="bg-slate-50 dark:bg-[#0F172A] border border-amber-400/60 dark:border-amber-600/60 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-hover"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-teal-400 border border-slate-300 dark:border-slate-700">
                        Milestone #{milestone.id}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{milestone.title}</h4>
                      <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Proof Submitted
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Pilot: <strong className="text-slate-900 dark:text-white">{pilot.problemTitle}</strong> • Startup: <strong className="text-teal-700 dark:text-teal-400">{pilot.startupName}</strong>
                    </p>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-semibold">Target Requirement:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {milestone.targetKpiValue} {milestone.kpiUnit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-semibold">Submitted Field Telemetry:</span>
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {milestone.submittedValue} {milestone.kpiUnit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <button
                      onClick={() => handleAuditMilestone(pilot, milestone)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 transition shadow-xs flex items-center justify-center gap-2 btn-hover"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>Audit & Verify Milestone</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Assigned Pilots & Minting */}
      {activeTab === 'assigned_pilots' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs dark:shadow-lg dark:shadow-black/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700/80">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Rocket className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Supervised Field Pilots & Passport Minting Engine</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                When all milestones achieve verified status, the validator can mint an official Digital Pilot Passport.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pilots.map((pilot) => {
              const totalMilestones = pilot.milestones?.length || 0;
              const verifiedMilestonesCount = pilot.milestones?.filter(
                (m) => m.status === 'verified' || m.status === 'paid'
              ).length || 0;
              const isAllMilestonesCompleted = totalMilestones > 0 && verifiedMilestonesCount === totalMilestones;

              const matchedPassport = passports.find(
                (p) => p.pilotId === pilot.id || (p as any).pilot_id === pilot.id || p.startupId === pilot.startupId
              );
              const hasMintedPassport = Boolean(matchedPassport) || pilot.passport_score !== undefined || pilot.status === 'completed';

              return (
                <div
                  key={pilot.id}
                  className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 card-hover"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-teal-400 border border-slate-300 dark:border-slate-700">
                        Pilot #{pilot.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          hasMintedPassport
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                            : isAllMilestonesCompleted
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {hasMintedPassport
                          ? 'Passport Minted'
                          : isAllMilestonesCompleted
                          ? 'Eligible for Passport'
                          : 'Field Testing in Progress'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{pilot.problemTitle}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Startup: <strong className="text-slate-800 dark:text-slate-200">{pilot.startupName}</strong> • Dept: <strong className="text-slate-800 dark:text-slate-200">{pilot.departmentName}</strong>
                      </p>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Milestones Verified:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {verifiedMilestonesCount} / {totalMilestones} Completed
                        </span>
                      </div>
                      <AnimatedProgressBar
                        value={totalMilestones > 0 ? (verifiedMilestonesCount / totalMilestones) * 100 : 0}
                        color="bg-emerald-500"
                        height="h-1.5"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                    {hasMintedPassport ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs">
                          <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Passport Minted • {matchedPassport?.passportCategory || pilot.passport_category || 'Platinum Pilot Passport'}</span>
                          </span>
                          <span className="font-mono font-bold text-emerald-900 dark:text-emerald-200">
                            {matchedPassport?.passportScore || pilot.passport_score || 90}/100
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onViewPassport(pilot.startupId || pilot.id)}
                          className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer btn-hover"
                        >
                          <Award className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span>View Minted Digital Passport</span>
                        </button>
                      </div>
                    ) : isAllMilestonesCompleted ? (
                      <button
                        type="button"
                        onClick={() => handleMintButtonClick(pilot)}
                        className="w-full py-2.5 rounded-xl text-xs font-bold text-amber-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] btn-hover"
                      >
                        <Award className="w-4 h-4 fill-amber-950" />
                        <span>Mint Official Pilot Passport Credential</span>
                      </button>
                    ) : (
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          disabled
                          className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 cursor-not-allowed flex items-center justify-center gap-1.5 opacity-60"
                          title="All milestones must be verified by the validator before minting passport"
                        >
                          <Award className="w-4 h-4 text-slate-400" />
                          <span>Milestones Incomplete ({verifiedMilestonesCount}/{totalMilestones} Completed)</span>
                        </button>
                        <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
                          {totalMilestones === 0
                            ? '0/0 Completed: No verified milestones yet. Ineligible for passport minting.'
                            : `Requires all ${totalMilestones} milestones verified before passport can be minted.`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Issued Passports */}
      {activeTab === 'issued_passports' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs dark:shadow-lg dark:shadow-black/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700/80">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Cryptographic Pilot Passports Minted</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official validated credentials signed with SHA-256 certificate hashes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {passports.map((pass) => (
              <div
                key={pass.id}
                className="bg-slate-50 dark:bg-[#0F172A] border border-amber-300 dark:border-amber-600/40 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 card-hover"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                      {pass.sector}
                    </span>
                    <Award className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{pass.startupName}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">DPIIT: {pass.dpiitNumber}</p>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium line-clamp-2">{pass.problemTitle}</p>
                  </div>

                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 truncate">
                    Hash: {pass.certificateHash}
                  </div>
                </div>

                <button
                  onClick={() => onViewPassport(pass.startupId || pass.pilotId || pass.id)}
                  className="w-full py-2 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700/60 transition btn-hover"
                >
                  Inspect Certificate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mint Passport Modal */}
      <MintPassportModal
        isOpen={Boolean(selectedPilotForMint)}
        onClose={() => setSelectedPilotForMint(null)}
        pilot={selectedPilotForMint}
        validator={validator}
        onSuccess={(newPassport, updatedPilot) => {
          if (onPassportMinted) {
            onPassportMinted(newPassport, updatedPilot);
          }
        }}
        authenticatedFetch={authenticatedFetch}
      />
    </div>
  );
};
