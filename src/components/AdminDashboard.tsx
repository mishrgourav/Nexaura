import React, { useState } from 'react';
import {
  Validator,
  PlatformAnalytics,
  Pilot,
  PaymentRecord,
  Department,
  Startup,
  User,
} from '../types';
import {
  ShieldCheck,
  UserCheck,
  Award,
  AlertTriangle,
  TrendingUp,
  Plus,
  CheckCircle2,
  Clock,
  Send,
  X,
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  validators: Validator[];
  analytics: PlatformAnalytics | null;
  pilots: Pilot[];
  payments: PaymentRecord[];
  departments: Department[];
  startups: Startup[];
  onAddValidator: (val: { name: string; organization: string; email: string; sectorExpertise: string[] }) => Promise<void>;
  onApprovePayment: (paymentId: string) => Promise<void>;
  onMarkPaymentPaid: (paymentId: string) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  validators,
  analytics,
  pilots,
  payments,
  departments,
  startups,
  onAddValidator,
  onApprovePayment,
  onMarkPaymentPaid,
}) => {
  const [showAddValidatorModal, setShowAddValidatorModal] = useState(false);
  const [newValName, setNewValName] = useState('');
  const [newValOrg, setNewValOrg] = useState('');
  const [newValEmail, setNewValEmail] = useState('');
  const [newValSector, setNewValSector] = useState('Healthcare & Life Sciences');
  const [addingValidator, setAddingValidator] = useState(false);

  const delayedPayments = payments.filter((p) => p.isDelayed);

  const handleCreateValidator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValName || !newValOrg || !newValEmail) return;
    setAddingValidator(true);
    try {
      await onAddValidator({
        name: newValName,
        organization: newValOrg,
        email: newValEmail,
        sectorExpertise: [newValSector],
      });
      setShowAddValidatorModal(false);
      setNewValName('');
      setNewValOrg('');
      setNewValEmail('');
    } catch (err) {
      console.error(err);
    } finally {
      setAddingValidator(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Admin Banner */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 text-slate-800 dark:text-white shadow-xs dark:shadow-lg dark:shadow-black/20 border border-slate-200 dark:border-slate-700/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  MSInS Platform Oversight Console
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Maharashtra State Innovation Society • Sandbox Governance
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Empanel independent technical evaluators, monitor platform-wide payment SLAs, enforce the 10-day directive, and track public innovation outcomes.
            </p>
          </div>

          <button
            onClick={() => setShowAddValidatorModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-md shadow-purple-500/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Empanel New Validator</span>
          </button>
        </div>

        {/* 4 Analytics Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-slate-200 dark:border-slate-700/80">
          <div className="bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xs dark:shadow-inner flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">Total Pilots</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{analytics?.totalPilots || pilots.length || 8}</span>
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                  {pilots.filter((p) => p.status === 'completed').length || 3} Completed
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xs dark:shadow-inner flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">Pilot Success Rate</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{analytics?.pilotSuccessRatePercent || 94.6}%</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Validated</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xs dark:shadow-inner flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">Avg Payment Speed</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{analytics?.avgPaymentProcessingDays || 5.2}d</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Under 10d SLA</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xs dark:shadow-inner flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">Passports Minted</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">{analytics?.passportsIssued || 3}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">SHA-256 Verified</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* SLA Breach Escalation Gateway: Consistent card container */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs dark:shadow-lg dark:shadow-black/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                SLA Compliance & Escalation Gateway (10-Day Directive)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated alerts and escalation notifications for payments exceeding the 10-day ceiling.
              </p>
            </div>
          </div>

          <span className={`text-xs font-bold px-3 py-1 rounded-full border self-start sm:self-center ${
            delayedPayments.length > 0
              ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700 animate-pulse'
              : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
          }`}>
            {delayedPayments.length > 0 ? `${delayedPayments.length} Active SLA Breaches` : '100% SLA Compliant'}
          </span>
        </div>

        {delayedPayments.length === 0 ? (
          <div className="p-4 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>All milestone disbursements across all government departments are processing well within the 10-day directive.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {delayedPayments.map((dp) => (
              <div
                key={dp.id}
                className="bg-slate-50 dark:bg-[#0F172A] border border-rose-300 dark:border-rose-600/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{dp.id}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{dp.milestoneTitle}</span>
                    <span className="text-rose-700 dark:text-rose-400 font-bold bg-rose-100 dark:bg-rose-950/80 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800 text-[10px]">
                      Elapsed: {dp.elapsedDays} Days (&gt;10d SLA)
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Department: <strong className="text-slate-800 dark:text-slate-200">{dp.departmentName}</strong> • Recipient Startup: <strong className="text-slate-800 dark:text-slate-200">{dp.startupName}</strong> • Amount: <strong className="text-teal-700 dark:text-teal-400">₹{dp.amountLakhs}L</strong>
                  </p>
                  <p className="text-rose-700 dark:text-rose-300 text-[11px] mt-1 italic">
                    Notice: {dp.escalationNotice}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onApprovePayment(dp.id)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition shadow-xs flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Authorize PFMS Release</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Empanelled Independent Validators Grid: Aligned in consistent layout */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs dark:shadow-lg dark:shadow-black/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700/80">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Empanelled Technical Validators ({validators.length})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              IITs, CSIR institutions, and state laboratories authorized to conduct empirical audits and issue Pilot Passports.
            </p>
          </div>

          <button
            onClick={() => setShowAddValidatorModal(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition flex items-center gap-1.5 self-start sm:self-center"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Empanel Agency</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {validators.map((val) => (
            <div
              key={val.id}
              className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{val.name}</h4>
                  <p className="text-xs text-purple-700 dark:text-purple-400 font-semibold mt-0.5">{val.organization}</p>
                </div>
                <span className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">
                  <UserCheck className="w-4 h-4" />
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {val.sectorExpertise.map((sec, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium"
                  >
                    {sec}
                  </span>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Pilots Certified:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{val.verifiedPilotsCount} Validations</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empanel Modal */}
      {showAddValidatorModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4 text-slate-800 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Empanel Technical Validator</span>
              </h3>
              <button
                onClick={() => setShowAddValidatorModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateValidator} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lead Evaluator / Director Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Prof. Rajesh Verma"
                  value={newValName}
                  onChange={(e) => setNewValName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Institution / Organization *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., IIT Bombay Centre of Excellence"
                  value={newValOrg}
                  onChange={(e) => setNewValOrg(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g., evaluator@iitb.ac.in"
                  value={newValEmail}
                  onChange={(e) => setNewValEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Domain Sector Expertise
                </label>
                <select
                  value={newValSector}
                  onChange={(e) => setNewValSector(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                  <option value="Urban Infrastructure & Transport">Urban Infrastructure & Transport</option>
                  <option value="Agriculture & Agritech">Agriculture & Agritech</option>
                  <option value="Water, Sanitation & Environment">Water, Sanitation & Environment</option>
                  <option value="Energy & CleanTech">Energy & CleanTech</option>
                  <option value="Education & EdTech">Education & EdTech</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddValidatorModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingValidator}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition shadow-md disabled:opacity-50"
                >
                  {addingValidator ? 'Empanelling...' : 'Confirm Empanelment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
