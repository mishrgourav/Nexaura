import React, { useState } from 'react';
import { ProblemStatement, Startup, Validator } from '../types';
import { X, Rocket, IndianRupee, Layers, Calendar, UserCheck } from 'lucide-react';

interface CreatePilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: ProblemStatement | null;
  startup: Startup | null;
  validators: Validator[];
  onSubmit: (data: {
    problemId: string;
    startupId: string;
    totalBudgetLakhs: number;
    validatorId: string;
    startDate: string;
    endDate: string;
    scopeSummary: string;
    customMilestones: any[];
  }) => Promise<void>;
  loading: boolean;
}

export const CreatePilotModal: React.FC<CreatePilotModalProps> = ({
  isOpen,
  onClose,
  problem,
  startup,
  validators,
  onSubmit,
  loading,
}) => {
  const [budgetLakhs, setBudgetLakhs] = useState<number>(problem?.budgetMinLakhs || 20);
  const [validatorId, setValidatorId] = useState<string>(validators?.[0]?.id || 'val-1');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0]
  );
  const [scopeSummary, setScopeSummary] = useState(
    problem && startup
      ? `Field deployment and testing of ${startup.name}'s innovative solution to address "${problem.title}".`
      : ''
  );

  // Default 4-Milestone Template
  const [milestones, setMilestones] = useState([
    {
      milestoneNumber: 1,
      title: 'Milestone 1: Deployment & Baseline Setup',
      description: 'Complete physical/cloud hardware deployment and train designated nodal field officers.',
      targetKpiDescription: 'Operational nodes / test sites activated',
      targetKpiValue: 10,
      kpiUnit: 'Sites',
      weightPercent: 20,
    },
    {
      milestoneNumber: 2,
      title: 'Milestone 2: Live Usage & Data Submission',
      description: 'Stream continuous live operational telemetry and demonstrate sustained system uptime.',
      targetKpiDescription: 'Consecutive days of uninterrupted live telemetry data',
      targetKpiValue: 30,
      kpiUnit: 'Days',
      weightPercent: 30,
    },
    {
      milestoneNumber: 3,
      title: 'Milestone 3: Core KPI Target Achieved',
      description: 'Achieve primary efficacy threshold agreed with the department under field conditions.',
      targetKpiDescription: 'Target performance/accuracy efficacy score',
      targetKpiValue: 85,
      kpiUnit: '% Score',
      weightPercent: 30,
    },
    {
      milestoneNumber: 4,
      title: 'Milestone 4: Independent Validation & Pilot Closure',
      description: 'Third-party validation protocol signoff and handover documentation for Pilot Passport issuance.',
      targetKpiDescription: 'Independent validator audit compliance score',
      targetKpiValue: 100,
      kpiUnit: '% Compliance',
      weightPercent: 20,
    },
  ]);

  const handleMilestoneChange = (index: number, field: string, value: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem || !startup) return;
    await onSubmit({
      problemId: problem.id,
      startupId: startup.id,
      totalBudgetLakhs: Number(budgetLakhs),
      validatorId,
      startDate,
      endDate,
      scopeSummary,
      customMilestones: milestones,
    });
    onClose();
  };

  const totalWeight = milestones.reduce((sum, m) => sum + Number(m.weightPercent), 0);

  if (!isOpen || !problem || !startup) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 modal-backdrop-anim">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-3xl w-full overflow-hidden modal-content-anim text-slate-800 dark:text-white">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-[#0F172A] px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-50 dark:bg-teal-500/15 border border-teal-200 dark:border-teal-500/30 rounded-xl text-teal-600 dark:text-teal-400">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Initiate Innovation Pilot Agreement</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Department: {problem.departmentName} ➔ Startup: {startup.name}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Problem & Startup Summary Banner */}
          <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs space-y-2">
            <div className="flex justify-between items-start gap-2">
              <span className="font-bold text-slate-500 dark:text-slate-400">Target Problem:</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium text-right max-w-md">{problem.title}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-500 dark:text-slate-400">Selected Startup:</span>
              <span className="text-slate-900 dark:text-white font-bold flex items-center gap-2">
                <span>{startup.name}</span>
                {startup.hasVerifiedPassport && (
                  <span className="text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-600/80 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    ✓ Verified Passport Holder
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Budget, Validator & Timeline Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Pilot Budget (₹ Lakhs)</span>
              </label>
              <input
                type="number"
                min={1}
                max={500}
                required
                value={budgetLakhs}
                onChange={(e) => setBudgetLakhs(Number(e.target.value))}
                className="w-full text-xs font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Empanelled Validator</span>
              </label>
              <select
                value={validatorId}
                onChange={(e) => setValidatorId(e.target.value)}
                className="w-full text-xs text-slate-900 dark:text-slate-200 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {validators.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.organization})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Target Pilot Duration</span>
              </label>
              <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 font-medium">
                6 Months (180 Days)
              </div>
            </div>
          </div>

          {/* EDITABLE 4-MILESTONE TEMPLATE */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Milestone-Based Payment Structure (Editable Template)</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Payments are generated into PFMS/Treasury queue upon verified milestone KPI completion.
                </p>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                  totalWeight === 100
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700'
                    : 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-700'
                }`}
              >
                Total Weight: {totalWeight}%
              </span>
            </div>

            <div className="space-y-3">
              {milestones.map((m, idx) => {
                const milestoneAmount = Math.round(((budgetLakhs * m.weightPercent) / 100) * 100) / 100;

                return (
                  <div key={idx} className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <input
                        type="text"
                        value={m.title}
                        onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                        className="text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-teal-500 w-full sm:w-2/3 shadow-2xs"
                      />
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">Weight:</span>
                          <input
                            type="number"
                            min={5}
                            max={100}
                            value={m.weightPercent}
                            onChange={(e) => handleMilestoneChange(idx, 'weightPercent', Number(e.target.value))}
                            className="w-14 text-xs font-mono font-bold text-teal-700 dark:text-teal-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center shadow-2xs"
                          />
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">%</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-700">
                          ₹{milestoneAmount.toFixed(2)}L
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="sm:col-span-2">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1 font-semibold">Target KPI Description:</span>
                        <input
                          type="text"
                          value={m.targetKpiDescription}
                          onChange={(e) => handleMilestoneChange(idx, 'targetKpiDescription', e.target.value)}
                          className="w-full text-xs text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 shadow-2xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1 font-semibold">Target Value & Unit:</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={m.targetKpiValue}
                            onChange={(e) => handleMilestoneChange(idx, 'targetKpiValue', Number(e.target.value))}
                            className="w-20 text-xs font-bold text-teal-700 dark:text-teal-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 font-mono shadow-2xs"
                          />
                          <input
                            type="text"
                            value={m.kpiUnit}
                            onChange={(e) => handleMilestoneChange(idx, 'kpiUnit', e.target.value)}
                            className="w-full text-xs text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              * Creates pilot agreement with live tracking across all 4 milestones.
            </span>
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || totalWeight !== 100}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 transition-all shadow-xs shadow-teal-500/20 disabled:opacity-50 flex items-center gap-1.5"
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>{loading ? 'Executing Agreement...' : 'Confirm & Launch Pilot'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
