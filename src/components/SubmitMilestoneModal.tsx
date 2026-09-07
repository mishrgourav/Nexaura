import React, { useState } from 'react';
import { Milestone } from '../types';
import { X, Upload, CheckCircle2, AlertCircle, FileText, BarChart2 } from 'lucide-react';

interface SubmitMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: Milestone | null;
  onSubmit: (data: {
    milestoneId: string;
    submittedValue: number;
    submittedProofUrl: string;
    submittedNotes: string;
  }) => Promise<void>;
  loading: boolean;
}

export const SubmitMilestoneModal: React.FC<SubmitMilestoneModalProps> = ({
  isOpen,
  onClose,
  milestone,
  onSubmit,
  loading,
}) => {
  const [submittedValue, setSubmittedValue] = useState<number>(milestone?.targetKpiValue || 100);
  const [submittedProofUrl, setSubmittedProofUrl] = useState(
    'https://docs.gov.startupconnect.in/proofs/telemetry-acceptance-log.pdf'
  );
  const [submittedNotes, setSubmittedNotes] = useState(
    'All field sensor logs and user acceptance tests successfully completed in accordance with pilot agreement.'
  );
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestone) return;
    if (submittedValue === undefined || isNaN(submittedValue)) {
      setError('Please provide a valid numeric submitted KPI value.');
      return;
    }

    try {
      await onSubmit({
        milestoneId: milestone.id,
        submittedValue: Number(submittedValue),
        submittedProofUrl,
        submittedNotes,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit milestone proof');
    }
  };

  const handleMatchTarget = () => {
    if (milestone) setSubmittedValue(milestone.targetKpiValue);
  };

  const handleExceedTarget = () => {
    if (milestone) setSubmittedValue(Math.round(milestone.targetKpiValue * 1.1 * 10) / 10);
  };

  if (!isOpen || !milestone) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 modal-backdrop-anim">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full overflow-hidden modal-content-anim text-slate-800 dark:text-white">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-[#0F172A] px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Submit Milestone Proof & KPI Data</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {milestone.title} • ₹{milestone.amountLakhs} Lakhs ({milestone.weightPercent}%)
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-600/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Milestone Target KPI Reference Box */}
          <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-xs space-y-1.5">
            <div className="font-bold text-slate-700 dark:text-slate-300">Required Target KPI Metric:</div>
            <div className="text-slate-500 dark:text-slate-400">{milestone.targetKpiDescription}</div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Benchmark Target Value:</span>
              <span className="font-mono font-bold text-teal-700 dark:text-teal-300 text-sm">
                {milestone.targetKpiValue} {milestone.kpiUnit}
              </span>
            </div>
          </div>

          {/* Submitted KPI Value Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Achieved / Submitted Value ({milestone.kpiUnit}) <span className="text-rose-500 dark:text-rose-400">*</span></span>
              </label>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={handleMatchTarget}
                  className="text-teal-700 dark:text-teal-400 hover:underline font-semibold"
                >
                  Match Target ({milestone.targetKpiValue})
                </button>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <button
                  type="button"
                  onClick={handleExceedTarget}
                  className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
                >
                  Exceed Target (+10%)
                </button>
              </div>
            </div>
            <input
              type="number"
              step="any"
              required
              value={submittedValue}
              onChange={(e) => setSubmittedValue(parseFloat(e.target.value))}
              className="w-full text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Rule check requirement: submitted_value &ge; {milestone.targetKpiValue} {milestone.kpiUnit} to pass automatic rule check.
            </p>
          </div>

          {/* Proof URL / Document Link */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Proof Document / Telemetry Data Log URL</span>
            </label>
            <input
              type="text"
              required
              value={submittedProofUrl}
              onChange={(e) => setSubmittedProofUrl(e.target.value)}
              className="w-full text-xs text-slate-900 dark:text-slate-200 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
            />
          </div>

          {/* Submission Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Technical Remarks & Field Notes
            </label>
            <textarea
              rows={3}
              value={submittedNotes}
              onChange={(e) => setSubmittedNotes(e.target.value)}
              className="w-full text-xs text-slate-900 dark:text-slate-200 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              * Auto-initiates verification and payment request.
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
                disabled={loading}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 transition-all shadow-xs shadow-teal-500/20 disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{loading ? 'Submitting...' : 'Submit Proof'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
