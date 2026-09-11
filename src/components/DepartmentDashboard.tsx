import React, { useState } from 'react';
import {
  Department,
  ProblemStatement,
  Pilot,
  StartupMatch,
  Startup,
  PaymentRecord,
  User,
  PilotPassport,
} from '../types';
import { AiMatchCard } from './AiMatchCard';
import { PaymentTrackerCard } from './PaymentTrackerCard';
import { PilotMonitoringCard } from './PilotMonitoringCard';
import { PilotAlertBanner } from './PilotAlertBanner';
import {
  Building2,
  Sparkles,
  Rocket,
  Award,
  AlertTriangle,
  Plus,
  Search,
  ChevronRight,
  Bot,
  Clock,
  FileQuestion,
  Landmark,
} from 'lucide-react';
import { apiUrl } from '../lib/api';

interface DepartmentDashboardProps {
  currentUser: User;
  departments: Department[];
  problemStatements: ProblemStatement[];
  pilots: Pilot[];
  payments: PaymentRecord[];
  startups: Startup[];
  passports: PilotPassport[];
  onOpenNewProblem: () => void;
  onSelectProblem: (problem: ProblemStatement) => void;
  onInitiatePilot: (problem: ProblemStatement, startup: Startup) => void;
  onViewPilotDetail: (pilot: Pilot) => void;
  onViewPassport: (startupId: string) => void;
  onApprovePayment: (paymentId: string) => Promise<void>;
  onMarkPaymentPaid: (paymentId: string) => Promise<void>;
  approvingPaymentId: string | null;
  markingPaidPaymentId: string | null;
}

export const DepartmentDashboard: React.FC<DepartmentDashboardProps> = ({
  currentUser,
  departments,
  problemStatements,
  pilots,
  payments,
  startups,
  passports,
  onOpenNewProblem,
  onSelectProblem,
  onInitiatePilot,
  onViewPilotDetail,
  onViewPassport,
  onApprovePayment,
  onMarkPaymentPaid,
  approvingPaymentId,
  markingPaidPaymentId,
}) => {
  const [activeTab, setActiveTab] = useState<'problems' | 'pilots' | 'payments' | 'passports'>('problems');
  const [selectedProblemId, setSelectedProblemId] = useState<string>(problemStatements[0]?.id || '');
  const [aiMatches, setAiMatches] = useState<StartupMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [aiBrief, setAiBrief] = useState<string | null>(null);
  const [loadingAiBrief, setLoadingAiBrief] = useState(false);
  const [searchProblemQuery, setSearchProblemQuery] = useState('');

  // Fetch AI matches whenever selected problem changes
  React.useEffect(() => {
    if (!selectedProblemId) {
      if (problemStatements.length > 0) {
        setSelectedProblemId(problemStatements[0].id);
      }
      return;
    }
    setLoadingMatches(true);
    fetch(apiUrl(`/api/matches/${selectedProblemId}`))
      .then((res) => res.json())
      .then((data) => {
        setAiMatches(data);
        setLoadingMatches(false);
      })
      .catch((err) => {
        console.error('Error fetching matches:', err);
        setLoadingMatches(false);
      });
  }, [selectedProblemId, problemStatements]);

  const currentProblem = problemStatements.find((p) => p.id === selectedProblemId) || problemStatements[0];

  // Key KPI stats
  const activePilotsCount = pilots.filter((p) => p.status === 'active').length;
  const pendingPayments = payments.filter((p) => p.status === 'verified');
  const delayedPayments = payments.filter((p) => p.isDelayed);
  const totalDisbursedLakhs = pilots.reduce((sum, p) => sum + p.disbursedBudgetLakhs, 0);

  const handleExplainWithAi = async (problemId: string, startupId: string) => {
    setLoadingAiBrief(true);
    setAiBrief(null);
    try {
      const res = await fetch(apiUrl('/api/ai-match/explain'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId, startupId }),
      });
      const data = await res.json();
      setAiBrief(data.aiNarrative);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiBrief(false);
    }
  };

  const filteredProblems = problemStatements.filter(
    (p) =>
      p.title.toLowerCase().includes(searchProblemQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchProblemQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchProblemQuery.toLowerCase())
  );

  const activePilots = pilots.filter((p) => p.status === 'active');
  const completedPilots = pilots.filter((p) => p.status === 'completed');

  const handleInitiatePilotWithMatchRecord = async (prob: ProblemStatement, startup: Startup) => {
    console.log('[DepartmentDashboard] Proposing pilot & creating match row in database for:', prob.id, startup.id);
    try {
      await fetch(apiUrl('/api/matches'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: prob.id,
          startupId: startup.id,
        }),
      });
    } catch (err) {
      console.warn('Match record write warning:', err);
    }
    onInitiatePilot(prob, startup);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Real-time AI Pilot Monitoring Alert Banner (Appears when High Risk or Deadline <= 3 Days) */}
      <PilotAlertBanner
        pilots={pilots}
        onViewPilotDetail={onViewPilotDetail}
        onFilterAtRisk={() => setActiveTab('pilots')}
      />

      {/* Top Banner & KPI Stat Cards */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 text-slate-800 dark:text-white shadow-xs dark:shadow-lg dark:shadow-black/20 border border-slate-200 dark:border-slate-700/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/15 border border-sky-200 dark:border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Government Department Portal
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentUser.departmentName || 'Public Works, Urban Mobility & Civic Systems'}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Post operational challenge statements, explore AI-matched startups, track field milestone KPIs, and approve rapid Treasury disbursements.
            </p>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={onOpenNewProblem}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 transition-all shadow-md shadow-teal-500/20 shrink-0 btn-hover"
          >
            <Plus className="w-4 h-4" />
            <span>Post Problem Statement</span>
          </button>
        </div>

        {/* 4 Dashboard Stat Cards: Unified grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-slate-200 dark:border-slate-700/80">
          <div className="bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xs dark:shadow-inner flex items-center justify-between card-hover">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">
                Posted Challenges
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{problemStatements.length || '3'}</span>
                <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">Active</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <FileQuestion className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xs dark:shadow-inner flex items-center justify-between card-hover">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">
                Active Field Pilots
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{activePilotsCount || '2'}</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">{pilots.length || '4'} Total</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Rocket className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xs dark:shadow-inner flex items-center justify-between card-hover">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">
                Pending Approvals
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingPayments.length || '1'}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Ready for PFMS</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xs dark:shadow-inner flex items-center justify-between card-hover">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">
                Disbursed Funds
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  ₹{totalDisbursedLakhs > 0 ? totalDisbursedLakhs.toFixed(1) : '24.5'}L
                </span>
                <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">PFMS Settled</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* SLA Breach Alert Banner if any delayed payments exist */}
      {delayedPayments.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-600/60 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-rose-800 dark:text-rose-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/50 border border-rose-300 dark:border-rose-600 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-rose-900 dark:text-white text-sm">
                10-Day SLA Payment Directive Alert ({delayedPayments.length} Overdue Disbursal)
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-200/90 mt-0.5">
                Government sandbox regulations mandate milestone signoffs within 10 days of verified telemetry proof.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('payments')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition shadow-xs shrink-0"
          >
            Review Escalated Payments &rarr;
          </button>
        </div>
      )}

      {/* Numbered Navigation Tabs: Symmetrical, equal-width flex/grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <button
          onClick={() => setActiveTab('problems')}
          className={`flex items-center justify-center sm:justify-start gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'problems'
              ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white border-transparent shadow-sm shadow-teal-500/20'
              : 'bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700/80'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'problems' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-300'}`}>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="truncate">1. Problem Statements ({problemStatements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pilots')}
          className={`flex items-center justify-center sm:justify-start gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'pilots'
              ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white border-transparent shadow-sm shadow-teal-500/20'
              : 'bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700/80'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'pilots' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-300'}`}>
            <Rocket className="w-3.5 h-3.5" />
          </div>
          <span className="truncate">2. Field Pilots ({pilots.length})</span>
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
          <span className="truncate">3. Payment Engine ({payments.length})</span>
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
          <span className="truncate">4. Pilot Passports ({passports.length})</span>
        </button>
      </div>

      {/* TAB 1: Problems & AI Matching */}
      {activeTab === 'problems' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Problem Statements Selector */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs dark:shadow-lg dark:shadow-black/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Your Posted Challenges</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Select a problem to view AI matches</p>
                </div>
                <button
                  onClick={onOpenNewProblem}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-teal-600 dark:text-teal-400 border border-slate-200 dark:border-slate-700 transition"
                  title="Add another problem statement"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filter problem statements..."
                  value={searchProblemQuery}
                  onChange={(e) => setSearchProblemQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Problems List with Empty State Support */}
              {filteredProblems.length === 0 ? (
                <div className="text-center py-8 px-4 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <FileQuestion className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    No problem statements match your filter.
                  </p>
                  <button
                    onClick={onOpenNewProblem}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Post First Problem</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {filteredProblems.map((prob) => {
                    const isSelected = prob.id === selectedProblemId;
                    return (
                      <div
                        key={prob.id}
                        onClick={() => {
                          console.log('[DepartmentDashboard] Problem statement card clicked:', prob.id, prob.title);
                          setSelectedProblemId(prob.id);
                          onSelectProblem(prob);
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-50 dark:bg-[#0F172A] border-teal-500 ring-1 ring-teal-500/40 shadow-xs'
                            : 'bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 dark:bg-slate-900 border border-teal-200 dark:border-slate-700 text-teal-700 dark:text-teal-400">
                            {prob.category}
                          </span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                            ₹{prob.budgetMinLakhs}-{prob.budgetMaxLakhs}L
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-2 line-clamp-2">{prob.title}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{prob.description}</p>

                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-semibold">
                            <Sparkles className="w-3 h-3" />
                            <span>AI Matches Active</span>
                          </span>
                          <span className="text-slate-400 dark:text-slate-500">Risk: {prob.riskLevel}</span>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-medium">Click to inspect full specs</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('[DepartmentDashboard] "View Details & Matches" clicked for:', prob.id);
                              setSelectedProblemId(prob.id);
                              onSelectProblem(prob);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline"
                          >
                            <span>View Details & Matches</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: AI Startup Matches for Selected Problem */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs dark:shadow-lg dark:shadow-black/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700/80">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI-Ranked Startup Matches</h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Evaluated for: <strong className="text-slate-800 dark:text-slate-200">{currentProblem?.title || 'Selected Challenge'}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700/60">
                    {aiMatches.length} Evaluated
                  </span>
                  {currentProblem && (
                    <button
                      type="button"
                      onClick={() => {
                        console.log('[DepartmentDashboard] Full Detail View opened for:', currentProblem.id);
                        onSelectProblem(currentProblem);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-xs transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Full Detail View</span>
                    </button>
                  )}
                </div>
              </div>

              {/* AI Procurement Committee Narrative Banner if present */}
              {aiBrief && (
                <div className="p-4 bg-slate-50 dark:bg-[#0F172A] border border-teal-300 dark:border-teal-700/80 rounded-xl space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span>AI Procurement Committee Brief & Justification Note</span>
                    </span>
                    <button
                      onClick={() => setAiBrief(null)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs"
                    >
                      Dismiss
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{aiBrief}</p>
                </div>
              )}

              {loadingAiBrief && (
                <div className="p-4 bg-slate-50 dark:bg-[#0F172A] border border-teal-300 dark:border-teal-800 rounded-xl text-xs text-teal-700 dark:text-teal-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-teal-600 dark:text-teal-400" />
                  <span>Generating structured procurement committee evaluation brief using Gemini...</span>
                </div>
              )}

              {/* Match Cards List */}
              {loadingMatches ? (
                <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs space-y-2">
                  <Sparkles className="w-6 h-6 text-teal-500 dark:text-teal-400 animate-spin mx-auto" />
                  <p>Running multi-factor AI scoring algorithm...</p>
                </div>
              ) : aiMatches.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <Sparkles className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No startups currently matching this exact domain. Select another challenge or post a new problem statement.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {aiMatches.map((match, idx) => (
                    <AiMatchCard
                      key={match.startup.id}
                      match={match}
                      rank={idx + 1}
                      onInitiatePilot={() => currentProblem && handleInitiatePilotWithMatchRecord(currentProblem, match.startup)}
                      onViewPassport={onViewPassport}
                      onExplainWithAi={handleExplainWithAi}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Field Pilot Agreements */}
      {activeTab === 'pilots' && (
        <div className="space-y-6">
          {/* Real-Time AI Pilot Monitoring Section */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs dark:shadow-lg dark:shadow-black/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700/80">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Real-Time AI Pilot Monitoring</span>
                  </h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    {activePilots.length} Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Automated schedule progress tracking, days until next milestone deadline, and algorithmic delay risk status.
                </p>
              </div>

              {/* Status Legend */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Low Risk (On Track)</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>Medium Risk (Lagging)</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-semibold text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>High Risk (Critical)</span>
                </span>
              </div>
            </div>

            {activePilots.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800">
                No active pilots currently undergoing field testing. All completed pilots are archived below.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activePilots.map((pilot) => (
                  <PilotMonitoringCard
                    key={pilot.id}
                    pilot={pilot}
                    onViewPilotDetail={onViewPilotDetail}
                    userRole="department"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs dark:shadow-lg dark:shadow-black/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700/80">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Field Pilot Agreements & Deployment Status</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  All pilots executed with 4 standardized milestones and independent auditor oversight.
                </p>
              </div>
            </div>

          {pilots.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Rocket className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">No active pilot agreements yet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Discover matched startups under the Problem Statements tab and click "Initiate Pilot Agreement" to launch your first sandbox deployment.
              </p>
              <button
                onClick={() => setActiveTab('problems')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 transition shadow-xs"
              >
                Browse Problem Statements &rarr;
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pilots.map((pilot) => (
                <div
                  key={pilot.id}
                  className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-xs hover:border-teal-500/60 dark:hover:border-slate-600 transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-teal-400 border border-slate-300 dark:border-slate-700">
                        Pilot #{pilot.id}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          pilot.status === 'completed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                            : 'bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700'
                        }`}
                      >
                        {pilot.status === 'completed' ? 'Certified & Completed' : 'Active Field Testing'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{pilot.problemTitle}</h4>
                      <p className="text-xs text-teal-700 dark:text-teal-400 font-semibold mt-0.5">
                        Startup Partner: {pilot.startupName}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{pilot.scopeSummary}</p>
                    </div>

                    {/* Progress Bar for Milestones */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
                        <span>Milestones Verified:</span>
                        <span className="font-bold text-teal-700 dark:text-teal-400">
                          {pilot.milestones?.filter((m) => m.status === 'verified' || m.status === 'paid').length} / {pilot.milestones?.length} Completed
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-300 dark:border-slate-700">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              ((pilot.milestones?.filter((m) => m.status === 'verified' || m.status === 'paid').length || 0) /
                                (pilot.milestones?.length || 1)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Budget & Validator info */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Total Sanctioned:</span>
                        <span className="font-bold text-slate-900 dark:text-white">₹{pilot.totalBudgetLakhs} Lakhs</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Disbursed (PFMS):</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">₹{pilot.disbursedBudgetLakhs} Lakhs</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                      Auditor: {pilot.validatorName}
                    </span>
                    <button
                      onClick={() => onViewPilotDetail(pilot)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-800 dark:text-white bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition flex items-center gap-1.5"
                    >
                      <span>Open Console</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      {/* TAB 3: Milestone Payments Engine */}
      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs dark:shadow-lg dark:shadow-black/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700/80">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>5-Stage Milestone Payment Engine & SLA Monitor</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rule-verified milestones eligible for 1-click Treasury disbursement within the 10-day directive.
              </p>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Clock className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">No milestone payment records yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((p) => (
                <PaymentTrackerCard
                  key={p.id}
                  payment={p}
                  currentRole="department"
                  onApproveAndSendToTreasury={onApprovePayment}
                  onMarkPaid={onMarkPaymentPaid}
                  approving={approvingPaymentId === p.id}
                  markingPaid={markingPaidPaymentId === p.id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Passports Directory */}
      {activeTab === 'passports' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs dark:shadow-lg dark:shadow-black/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700/80">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Fast-Track Pilot Passports Directory</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Startups holding these verified credentials bypass preliminary technical evaluations under Rule 149.
              </p>
            </div>
          </div>

          {passports.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Award className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">No pilot passports minted in this domain yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {passports.map((pass) => (
                <div
                  key={pass.id}
                  className="bg-slate-50 dark:bg-[#0F172A] border border-amber-300 dark:border-amber-600/40 rounded-2xl p-6 shadow-xs hover:border-amber-500 transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                        {pass.sector}
                      </span>
                      <Award className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{pass.startupName}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">DPIIT: {pass.dpiitNumber}</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 font-medium leading-relaxed">{pass.problemTitle}</p>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Validated Metric:</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">{pass.kpiAchievedSummary}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Auditing Lab:</span>
                        <span className="text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{pass.validatorName}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onViewPassport(pass.startupId)}
                    className="w-full py-2 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700/60 transition flex items-center justify-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Inspect Passport Certificate</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
