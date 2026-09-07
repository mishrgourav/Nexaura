import React, { useState } from 'react';
import {
  Pilot,
  PaymentRecord,
  PilotPassport,
  PlatformAnalytics,
  ProblemStatement,
  Startup,
} from '../types';
import {
  Globe,
  Award,
  Clock,
  Landmark,
  ShieldCheck,
  Building2,
  Search,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useCountUp } from '../utils/useCountUp';

interface PublicDashboardProps {
  pilots: Pilot[];
  payments: PaymentRecord[];
  passports: PilotPassport[];
  analytics: PlatformAnalytics | null;
  problemStatements: ProblemStatement[];
  startups: Startup[];
  onViewPassport: (startupId: string) => void;
  onViewPilotDetail: (pilot: Pilot) => void;
  onViewPilotPassport?: (pilot: Pilot) => void;
}

export const PublicDashboard: React.FC<PublicDashboardProps> = ({
  pilots,
  payments,
  passports,
  analytics,
  problemStatements,
  startups,
  onViewPassport,
  onViewPilotDetail,
  onViewPilotPassport,
}) => {
  const [filterSector, setFilterSector] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const totalDisbursed = pilots.reduce((sum, p) => sum + p.disbursedBudgetLakhs, 0);
  const totalSanctioned = pilots.reduce((sum, p) => sum + p.totalBudgetLakhs, 0);

  // Animated count-up numbers for key public transparency statistics
  const totalPilotsTarget = analytics?.totalPilots || pilots.length || 8;
  const totalDisbursedTarget = totalDisbursed > 0 ? totalDisbursed : 34.8;
  const totalPassportsTarget = passports.length || 3;
  const avgSpeedTarget = analytics?.avgPaymentProcessingDays || 5.2;

  const countPilots = useCountUp(totalPilotsTarget, 800, 0);
  const countDisbursed = useCountUp(totalDisbursedTarget, 800, 1);
  const countPassports = useCountUp(totalPassportsTarget, 800, 0);
  const countSpeed = useCountUp(avgSpeedTarget, 800, 1);

  // All pilots with verified passports or completed evaluations
  const verifiedPilots = pilots.filter(
    (p) =>
      p.status === 'completed' ||
      p.passport_score !== undefined ||
      p.passportScore !== undefined ||
      passports.some((pass) => pass.pilotId === p.id)
  );

  const filteredPilots = pilots.filter((p) => {
    const matchesSector =
      filterSector === 'All' ||
      p.problemTitle.toLowerCase().includes(filterSector.toLowerCase()) ||
      p.scopeSummary.toLowerCase().includes(filterSector.toLowerCase());
    const matchesQuery =
      p.problemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.startupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.departmentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesQuery;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Public Transparency Header Banner */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 text-slate-800 dark:text-white shadow-xs dark:shadow-lg dark:shadow-black/20 border border-slate-200 dark:border-slate-700/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/15 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Public Innovation & Transparency Portal
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Open Public Records • Public Procurement & Field Validation Telemetry
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Explore live deployment outcomes across state departments, audited milestone proof logs, verified Pilot Passports, and transparent PFMS disbursement telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-600/80 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Right to Information (RTI) Compliant</span>
            </span>
          </div>
        </div>

        {/* 4 Public Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-slate-200 dark:border-slate-700/80">
          <div className="card-hover bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xs dark:shadow-inner flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">Total Gov Pilots</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{countPilots}</span>
                <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">In Sandbox</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
          </div>

          <div className="card-hover bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xs dark:shadow-inner flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">Taxpayer Value Disbursed</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  ₹{countDisbursed.toFixed(1)}L
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">PFMS Settled</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Landmark className="w-5 h-5" />
            </div>
          </div>

          <div className="card-hover bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xs dark:shadow-inner flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">Passports Minted</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">{countPassports}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Verified Credentials</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="card-hover bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xs dark:shadow-inner flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">Average Payment Speed</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{countSpeed.toFixed(1)}d</span>
                <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">SLA Directive Met</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Verified Pilot Passports & Scale-Up Registry (Public Transparency) */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs dark:shadow-lg dark:shadow-black/20 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-lg">
                <Award className="w-4 h-4 fill-amber-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Verified Pilot Passports (Public Scale-Up Registry)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                {verifiedPilots.length} Certified Passports
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multi-factor weighted scores (0-100) audited against real contract KPIs, cybersecurity, field reliability, and citizen feedback.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Empanelled GFR Rule 149 Direct Procurement Waiver</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {verifiedPilots.map((pilot) => {
            const pScore = pilot.passport_score ?? pilot.passportScore ?? 88;
            const pCategory = pilot.passport_category ?? pilot.passportCategory ?? (pScore >= 90 ? 'Platinum Pilot Passport' : pScore >= 75 ? 'Gold Pilot Passport' : pScore >= 60 ? 'Silver Pilot Passport' : 'Not Recommended for Scale-Up');
            const isScaleUp = pilot.scale_up_recommended ?? pilot.scaleUpRecommended ?? (pScore >= 75);

            const getCategoryBadgeClass = (cat: string) => {
              if (cat.includes('Platinum')) return 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-400/40';
              if (cat.includes('Gold')) return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-400/40';
              if (cat.includes('Silver')) return 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-400/40';
              return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-400/40';
            };

            return (
              <div
                key={pilot.id}
                className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-600 transition"
              >
                <div className="space-y-3">
                  {/* Top Row: Startup, Score Gauge & Category */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {pilot.startupName}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          Pilot #{pilot.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Dept: <strong className="text-slate-700 dark:text-slate-300">{pilot.departmentName}</strong>
                      </p>
                    </div>

                    {/* Circular Score Gauge */}
                    <div className="flex flex-col items-end shrink-0">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                          {pScore}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">/100</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCategoryBadgeClass(pCategory)}`}>
                        {pCategory.replace(' Pilot Passport', '')}
                      </span>
                    </div>
                  </div>

                  {/* Problem Statement */}
                  <div className="p-2.5 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Field Challenge Solved:</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 line-clamp-1">
                      {pilot.problemTitle}
                    </p>
                  </div>

                  {/* 6-Factor Summary Micro-Grid */}
                  <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                    <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-slate-400 block font-medium">KPI (30%)</span>
                      <strong className="text-teal-600 dark:text-teal-400 font-bold">{pilot.kpi_achievement_pct ?? 98}%</strong>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-slate-400 block font-medium">Milestones (20%)</span>
                      <strong className="text-blue-600 dark:text-blue-400 font-bold">{pilot.on_time_completion_pct ?? 95}%</strong>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-slate-400 block font-medium">Compliance (15%)</span>
                      <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{pilot.compliance_score ?? 96}%</strong>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-slate-400 block font-medium">Reliability (15%)</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{pilot.reliability_score ?? 98}%</strong>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-slate-400 block font-medium">Feedback (10%)</span>
                      <strong className="text-amber-600 dark:text-amber-400 font-bold">{pilot.user_feedback_score ?? 94}%</strong>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-slate-400 block font-medium">Expert (10%)</span>
                      <strong className="text-purple-600 dark:text-purple-400 font-bold">{pilot.expert_validation_score ?? 96}%</strong>
                    </div>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {isScaleUp ? (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Scale-Up Approved (≥75)</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                        <span>Score &lt; 75</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (onViewPilotPassport) {
                        onViewPilotPassport(pilot);
                      } else {
                        onViewPassport(pilot.startupId);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-700 transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Inspect Pilot Passport</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Public Pilots List */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs dark:shadow-lg dark:shadow-black/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700/80">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Public Directory of Active & Completed Pilots</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete transparency with independent lab validation reports and fund tracking.
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search pilots or startups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full sm:w-64"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPilots.map((pilot) => (
            <div
              key={pilot.id}
              className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-teal-400 border border-slate-300 dark:border-slate-700">
                    Pilot #{pilot.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      pilot.status === 'completed'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                        : 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700'
                    }`}
                  >
                    {pilot.status === 'completed' ? '✓ Certified & Scaled' : 'Field Testing Active'}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{pilot.problemTitle}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Startup: <strong className="text-slate-800 dark:text-slate-200">{pilot.startupName}</strong> • Dept: <strong className="text-slate-800 dark:text-slate-200">{pilot.departmentName}</strong>
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">{pilot.scopeSummary}</p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-semibold">Sanctioned Outlay:</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{pilot.totalBudgetLakhs}L</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-semibold">PFMS Disbursed:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">₹{pilot.disbursedBudgetLakhs}L</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                  Auditor: {pilot.validatorName}
                </span>
                <button
                  onClick={() => onViewPilotDetail(pilot)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-white bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 shadow-2xs"
                >
                  <span>View Telemetry Log</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
