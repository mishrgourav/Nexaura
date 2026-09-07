import React from 'react';
import { PaymentRecord, UserRole } from '../types';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Landmark,
} from 'lucide-react';

interface PaymentTrackerCardProps {
  payment: PaymentRecord;
  currentRole: UserRole;
  onApproveAndSendToTreasury: (paymentId: string) => Promise<void>;
  onMarkPaid: (paymentId: string) => Promise<void>;
  approving: boolean;
  markingPaid: boolean;
}

export const PaymentTrackerCard: React.FC<PaymentTrackerCardProps> = ({
  payment,
  currentRole,
  onApproveAndSendToTreasury,
  onMarkPaid,
  approving,
  markingPaid,
}) => {
  const steps = [
    { key: 'submitted', label: '1. KPI Submitted', date: payment.requestedAt, desc: 'Startup telemetry uploaded' },
    { key: 'verified', label: '2. Rule-Checked', date: payment.requestedAt, desc: 'KPI matched target' },
    { key: 'approved', label: '3. Dept Approved', date: payment.approvedAt, desc: 'Officer signoff complete' },
    { key: 'sent_to_treasury', label: '4. Sent to Treasury', date: payment.sentToTreasuryAt, desc: 'Queued in PFMS engine' },
    { key: 'paid', label: '5. Disbursed', date: payment.paidAt, desc: 'Direct DBT to startup account' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'submitted': return 0;
      case 'verified': return 1;
      case 'approved': return 2;
      case 'sent_to_treasury': return 3;
      case 'paid': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(payment.status);

  return (
    <div
      className={`bg-white dark:bg-[#1E293B] rounded-2xl border ${
        payment.isDelayed
          ? 'border-rose-400 dark:border-rose-500/80 ring-2 ring-rose-500/20'
          : 'border-slate-200 dark:border-slate-700/80'
      } p-6 shadow-xs dark:shadow-lg dark:shadow-black/20 card-hover transition`}
    >
      {/* Header with Amount & Delay Alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-700/60">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-400 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md font-bold">
              {payment.id}
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{payment.milestoneTitle}</span>

            {/* Delay Escalation Badge */}
            {payment.isDelayed ? (
              <span className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-600/80 text-[11px] font-bold px-3 py-0.5 rounded-full animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>SLA Breach (&gt;10 Days Delay)</span>
              </span>
            ) : payment.status === 'paid' ? (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-600/80 text-[11px] font-bold px-3 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Paid & Settled via PFMS</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-600/80 text-[11px] font-semibold px-3 py-0.5 rounded-full">
                <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>In Progress ({Math.max(0, 10 - payment.elapsedDays)}d left in SLA)</span>
              </span>
            )}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Pilot: <strong className="text-slate-800 dark:text-slate-200">{payment.pilotTitle}</strong></span>
            <span>•</span>
            <span>Recipient: <strong className="text-slate-800 dark:text-slate-200">{payment.startupName}</strong></span>
            <span>•</span>
            <span>Dept: <strong className="text-slate-800 dark:text-slate-200">{payment.departmentName}</strong></span>
          </div>
        </div>

        {/* Amount */}
        <div className="text-left sm:text-right shrink-0 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-bold tracking-wider">Disbursement Sum</span>
          <div className="flex items-baseline sm:justify-end text-lg font-bold text-slate-900 dark:text-white">
            <span>₹{payment.amountLakhs.toFixed(2)}</span>
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 ml-1">Lakhs</span>
          </div>
        </div>
      </div>

      {/* Escalation Notice Box for SLA Delayed Payments */}
      {payment.isDelayed && payment.escalationNotice && (
        <div className="mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-700/60 rounded-xl text-xs text-rose-800 dark:text-rose-200 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 dark:text-white">Automated SLA Escalation Active: </span>
            <span>{payment.escalationNotice}</span>
            <div className="mt-1 text-[11px] text-rose-700 dark:text-rose-300">
              Elapsed: <strong>{payment.elapsedDays} days</strong> | Strict SLA Directive: <strong>{payment.slaDays} days</strong>
            </div>
          </div>
        </div>
      )}

      {/* 5-Step Order Tracking Horizontal Visualizer */}
      <div className="mt-6 mb-4">
        <div className="relative">
          {/* Connecting Track Line */}
          <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 dark:bg-slate-700/80 -z-0 rounded-full">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                payment.isDelayed ? 'bg-rose-500 shadow-md shadow-rose-500/50' : 'bg-gradient-to-r from-teal-500 to-emerald-500 shadow-md shadow-teal-500/50'
              }`}
              style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Steps */}
          <div className="grid grid-cols-5 gap-1 relative z-10">
            {steps.map((step, idx) => {
              const isCompleted = idx <= currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <div key={step.key} className="flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCompleted
                        ? payment.isDelayed && isCurrent
                          ? 'bg-rose-600 text-white ring-4 ring-rose-500/30'
                          : 'bg-emerald-600 text-white ring-4 ring-emerald-500/30'
                        : 'bg-slate-100 dark:bg-[#0F172A] border-2 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-2 leading-tight ${
                      isCurrent
                        ? 'text-teal-700 dark:text-teal-300 font-bold'
                        : isCompleted
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden md:block mt-0.5">
                    {step.desc}
                  </span>
                  {step.date && (
                    <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                      {new Date(step.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Treasury Ref Number & Action Buttons */}
      <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-[#0F172A]/70 -mx-6 -mb-6 p-4 sm:p-5 rounded-b-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
          <Landmark className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span className="text-[11px]">
            {payment.treasuryRefNumber ? (
              <span>
                PFMS / Treasury Disbursement Ref: <strong className="font-mono text-teal-700 dark:text-teal-300">{payment.treasuryRefNumber}</strong>
              </span>
            ) : (
              <span>Sandbox verification layer active. 1-click PFMS release ready.</span>
            )}
          </span>
        </div>

        {/* Action Buttons based on Status and User Role */}
        <div className="flex items-center gap-2">
          {payment.status === 'verified' && (
            <button
              onClick={() => onApproveAndSendToTreasury(payment.id)}
              disabled={approving}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 transition-all shadow-xs shadow-teal-500/20 disabled:opacity-50 flex items-center gap-1.5 btn-hover"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{approving ? 'Dispatching to Treasury...' : 'Approve & Send to Treasury'}</span>
            </button>
          )}

          {payment.status === 'sent_to_treasury' && (
            <button
              onClick={() => onMarkPaid(payment.id)}
              disabled={markingPaid}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-xs shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-1.5 btn-hover"
              title="Simulate PFMS direct DBT transfer credit into startup bank account"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{markingPaid ? 'Settling Funds...' : 'Mark Settled by Treasury'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
