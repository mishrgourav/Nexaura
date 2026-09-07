import React from 'react';
import { Pilot, DelayRiskStatus } from '../types';
import { calculatePilotMonitoringMetrics } from '../utils/pilotMonitoring';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
} from 'lucide-react';

interface PilotMonitoringCardProps {
  pilot: Pilot;
  onViewPilotDetail?: (pilot: Pilot) => void;
  userRole?: 'startup' | 'department' | 'admin';
}

export const PilotMonitoringCard: React.FC<PilotMonitoringCardProps> = ({
  pilot,
  onViewPilotDetail,
  userRole = 'department',
}) => {
  const metrics = calculatePilotMonitoringMetrics(pilot);

  // Badge configurations based on Risk of Delay
  const riskBadgeConfig: Record<
    DelayRiskStatus,
    {
      label: string;
      sublabel: string;
      badgeClasses: string;
      icon: React.ReactNode;
      borderAccent: string;
    }
  > = {
    low: {
      label: 'Low Risk',
      sublabel: 'On-Track',
      badgeClasses:
        'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-600/80',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      borderAccent: 'hover:border-emerald-400/60 dark:hover:border-emerald-500/60',
    },
    medium: {
      label: 'Medium Risk',
      sublabel: 'Slight Delay',
      badgeClasses:
        'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-600/80',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      borderAccent: 'hover:border-amber-400/60 dark:hover:border-amber-500/60',
    },
    high: {
      label: 'High Risk',
      sublabel: 'Action Needed',
      badgeClasses:
        'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-600/80',
      icon: <AlertOctagon className="w-3.5 h-3.5" />,
      borderAccent: 'hover:border-rose-400/60 dark:hover:border-rose-500/60',
    },
  };

  const badge = riskBadgeConfig[metrics.riskOfDelay];

  // Deadline formatting
  const renderDeadlineStatus = () => {
    if (!metrics.nextMilestone) {
      return (
        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>All Milestones Completed</span>
        </span>
      );
    }

    if (metrics.isOverdue) {
      const overdueDays = Math.abs(metrics.daysUntilNextDeadline || 0);
      return (
        <span className="text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1">
          <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
          <span>Overdue by {overdueDays} day{overdueDays === 1 ? '' : 's'}</span>
        </span>
      );
    }

    if (metrics.isDeadlineNear) {
      return (
        <span className="text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-1 animate-pulse">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>Due in {metrics.daysUntilNextDeadline} day{metrics.daysUntilNextDeadline === 1 ? '' : 's'}</span>
        </span>
      );
    }

    return (
      <span className="text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1">
        <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        <span>{metrics.daysUntilNextDeadline} days remaining</span>
      </span>
    );
  };

  return (
    <div
      id={`monitoring-card-${pilot.id}`}
      className={`bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs transition-all duration-200 ${badge.borderAccent} flex flex-col justify-between space-y-4 card-hover`}
    >
      {/* Header: Title, Partner, Risk Badge */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-700 shrink-0">
                #{pilot.id}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {pilot.problemTitle}
              </h4>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {userRole === 'startup' ? (
                <>Gov Dept: <strong className="text-slate-700 dark:text-slate-200">{pilot.departmentName}</strong></>
              ) : (
                <>Startup: <strong className="text-slate-700 dark:text-slate-200">{pilot.startupName}</strong></>
              )}
            </p>
          </div>

          {/* Risk Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 ${badge.badgeClasses}`}
          >
            {badge.icon}
            <span>{badge.label}</span>
          </div>
        </div>

        {/* Schedule Risk Context Narrative */}
        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
          {metrics.riskReason}
        </p>
      </div>

      {/* Metric 1 & Metric 2: Completion Progress & Next Milestone */}
      <div className="space-y-3 pt-1">
        {/* Progress Bar with Dual Metrics (Completion vs Elapsed Time) */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-teal-500" />
              <span>Milestone Progress:</span>
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {metrics.completionPercentage}% Delivered
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-200/60 dark:border-slate-700/60 relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                metrics.riskOfDelay === 'high'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                  : metrics.riskOfDelay === 'medium'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  : 'bg-gradient-to-r from-teal-500 to-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(metrics.completionPercentage, 3))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <span>
              {metrics.completedMilestones} of {metrics.totalMilestones} milestones verified
            </span>
            <span className="flex items-center gap-1 font-medium">
              {metrics.scheduleDifference >= 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>+{metrics.scheduleDifference}% pace</span>
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" />
                  <span>{metrics.scheduleDifference}% pace</span>
                </span>
              )}
              <span className="text-slate-400 dark:text-slate-600">({metrics.elapsedTimePercentage}% time elapsed)</span>
            </span>
          </div>
        </div>

        {/* Next Milestone Box */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              Next Milestone Deadline:
            </span>
            {renderDeadlineStatus()}
          </div>

          {metrics.nextMilestone ? (
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {metrics.nextMilestone.title}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                <span>Target: {metrics.nextMilestone.targetKpiValue} {metrics.nextMilestone.kpiUnit}</span>
                <span className="font-mono text-teal-600 dark:text-teal-400 font-semibold">
                  Due {metrics.deadlineDate || 'TBD'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pilot validation completed. Ready for final scale-up sign-off.
            </p>
          )}
        </div>
      </div>

      {/* Card Footer: Detail Inspection CTA */}
      {onViewPilotDetail && (
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Budget: <strong className="text-slate-800 dark:text-slate-200 font-mono">₹{pilot.totalBudgetLakhs}L</strong>
          </span>
          <button
            onClick={() => onViewPilotDetail(pilot)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
          >
            <span>Inspect Milestones</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
