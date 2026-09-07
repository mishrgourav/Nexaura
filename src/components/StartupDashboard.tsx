import React, { useState } from 'react';
import {
  Startup,
  ProblemStatement,
  Pilot,
  PaymentRecord,
  PilotPassport,
  Milestone,
  User,
} from '../types';
import { PaymentTrackerCard } from './PaymentTrackerCard';
import { PilotMonitoringCard } from './PilotMonitoringCard';
import {
  Rocket,
  Award,
  ShieldCheck,
  CheckCircle2,
  Upload,
  Search,
  Clock,
  Sparkles,
  Building2,
  Landmark,
  ChevronDown,
} from 'lucide-react';

interface StartupDashboardProps {
  currentUser: User;
  startup: Startup;
  startups?: Startup[];
  problemStatements: ProblemStatement[];
  pilots: Pilot[];
  payments: PaymentRecord[];
  passports: PilotPassport[];
  onOpenSubmitMilestone: (milestone: Milestone) => void;
  onViewPilotDetail: (pilot: Pilot) => void;
  onViewPassport: (startupId: string) => void;
  onApplyProblem: (problem: ProblemStatement) => void;
}

export const StartupDashboard: React.FC<StartupDashboardProps> = ({
  currentUser,
  startup,
  startups = [],
  problemStatements,
  pilots,
  payments,
  passports,
  onOpenSubmitMilestone,
  onViewPilotDetail,
  onViewPassport,
  onApplyProblem,
}) => {
  const [selectedStartupId, setSelectedStartupId] = useState<string>(startup.id || 'st-2');
  const activeStartup = startups.find((s) => s.id === selectedStartupId) || startup;

  const [activeTab, setActiveTab] = useState<'marketplace' | 'my_pilots' | 'passports' | 'payments'>('my_pilots');
  const [appliedProblemIds, setAppliedProblemIds] = useState<string[]>([]);
  const [searchMarketplaceQuery, setSearchMarketplaceQuery] = useState('');

  const myPilots = pilots.filter((p) => p.startupId === activeStartup.id);
  const activeMyPilots = myPilots.filter((p) => p.status === 'active');
  const myPayments = payments.filter((p) => p.startupId === activeStartup.id);
  const myPassports = passports.filter((p) => p.startupId === activeStartup.id);

  const handleApply = (problem: ProblemStatement) => {
    setAppliedProblemIds((prev) => [...prev, problem.id]);
    onApplyProblem(problem);
  };

  const totalEarnedLakhs = myPayments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amountLakhs, 0);

  const filteredMarketplace = problemStatements.filter(
    (p) =>
      p.title.toLowerCase().includes(searchMarketplaceQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchMarketplaceQuery.toLowerCase()) ||
      p.departmentName.toLowerCase().includes(searchMarketplaceQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Startup Header Banner */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 text-slate-800 dark:text-white shadow-xs dark:shadow-lg dark:shadow-black/20 border border-slate-200 dark:border-slate-700/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{activeStartup.name}</h1>
                  <span className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-600/80 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    DPIIT {activeStartup.dpiitNumber}
                  </span>

                  {startups.length > 1 && (
                    <div className="relative inline-block ml-2">
                      <select
                        value={selectedStartupId}
                        onChange={(e) => setSelectedStartupId(e.target.value)}
                        className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 pr-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
                      >
                        {startups.map((s) => (
                          <option key={s.id} value={s.id}>
                            Switch Startup: {s.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-2 pointer-events-none" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Sector: <strong className="text-slate-800 dark:text-slate-200">{activeStartup.sector}</strong> • HQ: <strong className="text-slate-800 dark:text-slate-200">{activeStartup.city}</strong> • Stage: <strong className="text-slate-800 dark:text-slate-200">{activeStartup.stage}</strong>
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              {activeStartup.description}
            </p>
          </div>

          {activeStartup.hasVerifiedPassport && (
            <button
              onClick={() => onViewPassport(activeStartup.id)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-amber-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 transition-all shadow-md shadow-amber-500/20 shrink-0"
            >
              <Award className="w-4 h-4 fill-amber-950" />
              <span>View Verified Passport</span>
            </button>
          )}
        </div>

        {/* 4 Quick Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-slate-200 dark:border-slate-700/80">
          <div className="bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xs dark:shadow-inner flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">Active Pilots</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{myPilots.length || '2'}</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Gov Deployments</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Rocket className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xs dark:shadow-inner flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">Pilot Passports</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{myPassports.length || '1'}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Verified Credentials</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xs dark:shadow-inner flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">Funds Received</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">₹{totalEarnedLakhs > 0 ? totalEarnedLakhs.toFixed(2) : '16.50'}L</span>
                <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">PFMS Direct DBT</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Landmark className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xs dark:shadow-inner flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">Track Record</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{startup.successRatePercent || 94}%</span>
                <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">{startup.pastPilotCount || 3} Past Pilots</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Numbered Navigation Tabs: Symmetrical, equal-width flex/grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex items-center justify-center sm:justify-start gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'marketplace'
              ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white border-transparent shadow-sm shadow-teal-500/20'
              : 'bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700/80'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'marketplace' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-300'}`}>
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <span className="truncate">1. Marketplace ({problemStatements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('my_pilots')}
          className={`flex items-center justify-center sm:justify-start gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'my_pilots'
              ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white border-transparent shadow-sm shadow-teal-500/20'
              : 'bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700/80'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'my_pilots' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-300'}`}>
            <Rocket className="w-3.5 h-3.5" />
          </div>
          <span className="truncate">2. Active Pilots ({myPilots.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('passports')}
          className={`flex items-center justify-center sm:justify-start gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'passports'
              ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white border-transparent shadow-sm shadow-teal-500/20'
              : 'bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700/80'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'passports' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-300'}`}>
            <Award className="w-3.5 h-3.5" />
          </div>
          <span className="truncate">3. Pilot Passports ({myPassports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center justify-center sm:justify-start gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'payments'
              ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white border-transparent shadow-sm shadow-teal-500/20'
              : 'bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700/80'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'payments' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-300'}`}>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <span className="truncate">4. Bank Credits ({myPayments.length})</span>
        </button>
      </div>

      {/* TAB 1: Open Reverse Marketplace Challenges */}
      {activeTab === 'marketplace' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs dark:shadow-lg dark:shadow-black/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700/80">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Government Innovation Challenges Marketplace</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Browse official operational problems published by departments. Apply directly with 1-click credential submission.
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search challenges..."
                value={searchMarketplaceQuery}
                onChange={(e) => setSearchMarketplaceQuery(e.target.value)}
                className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-64"
              />
            </div>
          </div>

          {filteredMarketplace.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Building2 className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">No challenges found matching your search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMarketplace.map((prob) => {
                const isApplied = appliedProblemIds.includes(prob.id);
                return (
                  <div
                    key={prob.id}
                    className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-xs hover:border-teal-500/60 dark:hover:border-slate-600 transition flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-slate-800 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-slate-700">
                          {prob.category}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                          Budget: ₹{prob.budgetMinLakhs}-{prob.budgetMaxLakhs}L
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{prob.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                          Department: {prob.departmentName}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed line-clamp-3">
                          {prob.description}
                        </p>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block mb-1">Expected Field Outcome:</span>
                        <p className="text-[11px] text-teal-700 dark:text-teal-300">{prob.expectedOutcome}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">Risk Profile: {prob.riskLevel}</span>
                      <button
                        onClick={() => handleApply(prob)}
                        disabled={isApplied}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                          isApplied
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 cursor-default'
                            : 'bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white shadow-teal-500/20'
                        }`}
                      >
                        {isApplied ? '✓ Application Submitted' : 'Submit Pilot Proposal'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: My Active Pilots */}
      {activeTab === 'my_pilots' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs dark:shadow-lg dark:shadow-black/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700/80">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Rocket className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>My Active Government Deployments</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Submit live sensor telemetry logs and empirical proof for automated milestone rule checks.
              </p>
            </div>
          </div>

          {myPilots.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Rocket className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">No active pilots underway for this startup</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Use the switcher in the header above to inspect other startups (e.g., UrbanPulse Mobility or AquaSense IoT), or browse open challenges in the Marketplace to submit proposals.
              </p>
              <button
                onClick={() => setActiveTab('marketplace')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 transition shadow-xs"
              >
                Browse Marketplace Challenges &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Real-Time AI Pilot Monitoring Cards for active pilots */}
              {activeMyPilots.length > 0 && (
                <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Real-Time AI Pilot Monitoring ({activeMyPilots.length} Active)
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Telemetry sync & computed risk of delay
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeMyPilots.map((pilot) => (
                      <PilotMonitoringCard
                        key={pilot.id}
                        pilot={pilot}
                        onViewPilotDetail={onViewPilotDetail}
                        userRole="startup"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Pilot Milestone Submissions */}
              {myPilots.map((pilot) => (
                <div
                  key={pilot.id}
                  className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-xs space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-teal-400 border border-slate-300 dark:border-slate-700 font-mono">
                          Pilot #{pilot.id}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">{pilot.problemTitle}</h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Client Department: <strong className="text-slate-800 dark:text-slate-200">{pilot.departmentName}</strong> • Empanelled Auditor: <strong className="text-slate-800 dark:text-slate-200">{pilot.validatorName}</strong>
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-semibold">Total Pilot Budget</span>
                      <span className="text-base font-bold text-slate-900 dark:text-white">₹{pilot.totalBudgetLakhs} Lakhs</span>
                    </div>
                  </div>

                  {/* 4 Milestones Interactive Grid */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Milestones Progress & Telemetry Proof Submissions:
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pilot.milestones?.map((m) => {
                        const isPendingSubmit = m.status === 'pending';
                        const isSubmitted = m.status === 'submitted';
                        const isVerified = m.status === 'verified';
                        const isPaid = m.status === 'paid';

                        return (
                          <div
                            key={m.id}
                            className={`p-4 rounded-xl border transition ${
                              isPaid
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-700/60'
                                : isVerified
                                ? 'bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-700/60'
                                : isSubmitted
                                ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-700/60'
                                : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">{m.title}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  isPaid
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                                    : isVerified
                                    ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700'
                                    : isSubmitted
                                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                                }`}
                              >
                                {isPaid ? '✓ Disbursed' : isVerified ? '✓ Rule Verified' : isSubmitted ? 'Auditing Proof' : 'Action Required'}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{m.description}</p>

                            <div className="mt-3 pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs">
                              <div>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Target Threshold:</span>
                                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                  {m.targetKpiValue} {m.kpiUnit}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Milestone Payout:</span>
                                <span className="font-mono font-bold text-teal-700 dark:text-teal-400">
                                  ₹{m.amountLakhs}L ({m.weightPercent}%)
                                </span>
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="mt-3 pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex justify-end">
                              {isPendingSubmit && (
                                <button
                                  onClick={() => onOpenSubmitMilestone(m)}
                                  className="w-full py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 transition flex items-center justify-center gap-1.5 shadow-2xs"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Submit Proof & Telemetry</span>
                                </button>
                              )}
                              {isSubmitted && (
                                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Submitted ({m.submittedValue} {m.kpiUnit}) • Awaiting Auditor</span>
                                </span>
                              )}
                              {(isVerified || isPaid) && (
                                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Passed Rule Check ({m.submittedValue || m.targetKpiValue} {m.kpiUnit})</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Passports */}
      {activeTab === 'passports' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs dark:shadow-lg dark:shadow-black/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700/80">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>My Verified Digital Pilot Passports</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official credentials certifying past government deployments. Reusable across all public procurement portals under Rule 149.
              </p>
            </div>
          </div>

          {myPassports.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Award className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Pilot Passports Issued Yet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Complete all 4 milestones of any government pilot to have your independent validator mint an official cryptographic Digital Pilot Passport.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myPassports.map((pass) => (
                <div
                  key={pass.id}
                  className="bg-slate-50 dark:bg-[#0F172A] border-2 border-amber-400/60 dark:border-amber-500/50 rounded-2xl p-6 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                      Sector: {pass.sector}
                    </span>
                    <Award className="w-5 h-5 text-amber-500 fill-amber-500" />
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{pass.startupName}</h4>
                    <p className="text-xs text-teal-700 dark:text-teal-400 font-semibold mt-0.5">DPIIT: {pass.dpiitNumber}</p>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 font-medium leading-relaxed">{pass.problemTitle}</p>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Verified Field KPI:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{pass.kpiAchievedSummary}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Empanelled Auditor:</span>
                      <span className="text-slate-800 dark:text-slate-200 font-semibold">{pass.validatorName}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Validity:</span>
                      <span className="text-slate-800 dark:text-slate-200">2 Years (Valid until {pass.expiryDate})</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onViewPassport(pass.startupId)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-amber-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 transition shadow-2xs flex items-center justify-center gap-2"
                  >
                    <Award className="w-4 h-4 fill-amber-950" />
                    <span>View Official Passport Certificate</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Milestone Payments */}
      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs dark:shadow-lg dark:shadow-black/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700/80">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>My Milestone Payment Tracker & Treasury Logs</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track real-time status across all 5 payment stages with direct PFMS Treasury bank transfers.
              </p>
            </div>
          </div>

          {myPayments.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Clock className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">No milestone payments recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myPayments.map((p) => (
                <PaymentTrackerCard
                  key={p.id}
                  payment={p}
                  currentRole="startup"
                  onApproveAndSendToTreasury={async () => {}}
                  onMarkPaid={async () => {}}
                  approving={false}
                  markingPaid={false}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
