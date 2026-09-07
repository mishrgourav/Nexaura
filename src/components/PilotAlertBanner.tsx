import React from 'react';
import { Pilot } from '../types';
import { calculatePilotMonitoringMetrics } from '../utils/pilotMonitoring';
import {
  AlertOctagon,
  Clock,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';

interface PilotAlertBannerProps {
  pilots: Pilot[];
  onViewPilotDetail: (pilot: Pilot) => void;
  onFilterAtRisk?: () => void;
}

export const PilotAlertBanner: React.FC<PilotAlertBannerProps> = ({
  pilots,
  onViewPilotDetail,
  onFilterAtRisk,
}) => {
  // Only evaluate active pilots
  const activePilots = pilots.filter((p) => p.status === 'active');

  // Find all pilots with High Risk OR deadline <= 3 days (including overdue)
  const alertedPilots = activePilots
    .map((pilot) => ({
      pilot,
      metrics: calculatePilotMonitoringMetrics(pilot),
    }))
    .filter(
      ({ metrics }) =>
        metrics.riskOfDelay === 'high' ||
        metrics.isDeadlineNear ||
        metrics.isOverdue
    );

  if (alertedPilots.length === 0) {
    return null;
  }

  const highRiskCount = alertedPilots.filter(
    (item) => item.metrics.riskOfDelay === 'high'
  ).length;

  const nearDeadlineCount = alertedPilots.filter(
    (item) => item.metrics.isDeadlineNear && item.metrics.riskOfDelay !== 'high'
  ).length;

  return (
    <div
      id="pilot-monitoring-alert-banner"
      className="relative overflow-hidden rounded-2xl border border-rose-300 dark:border-rose-700/80 bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 dark:from-rose-950/40 dark:via-amber-950/30 dark:to-orange-950/20 p-5 shadow-md shadow-rose-900/5 dark:shadow-black/20"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left side: Alert Icon + Warning Message */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-700">
                🚨 Real-time AI Pilot Alert
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {alertedPilots.length} Deployment{alertedPilots.length === 1 ? '' : 's'} Require Immediate Department Attention
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Automated telemetry & schedule tracking detected critical delay risks or milestones due within 3 days. Department nodal officers should audit submitted proof or coordinate with validators.
            </p>
          </div>
        </div>

        {/* Quick summary badges */}
        <div className="flex items-center gap-2 shrink-0">
          {highRiskCount > 0 && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-700 flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>{highRiskCount} High Risk</span>
            </span>
          )}
          {nearDeadlineCount > 0 && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{nearDeadlineCount} Due in ≤3 Days</span>
            </span>
          )}
        </div>
      </div>

      {/* List of at-risk pilot alerts */}
      <div className="mt-4 pt-3.5 border-t border-rose-200/80 dark:border-rose-800/80 grid grid-cols-1 md:grid-cols-2 gap-3">
        {alertedPilots.map(({ pilot, metrics }) => {
          const isHigh = metrics.riskOfDelay === 'high';
          return (
            <div
              key={pilot.id}
              className="bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-xs rounded-xl p-3.5 border border-rose-200/80 dark:border-rose-800/60 shadow-xs flex items-center justify-between gap-3 hover:border-rose-400 dark:hover:border-rose-500 transition-colors"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                      isHigh
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                    }`}
                  >
                    {isHigh ? 'High Risk' : 'Due Soon'}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {pilot.problemTitle}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2 truncate">
                  <span>Partner: <strong className="text-slate-800 dark:text-slate-200">{pilot.startupName}</strong></span>
                  <span>•</span>
                  <span className="text-rose-700 dark:text-rose-300 font-medium">
                    {metrics.isOverdue
                      ? `Overdue by ${Math.abs(metrics.daysUntilNextDeadline || 0)}d`
                      : metrics.isDeadlineNear
                      ? `Deadline in ${metrics.daysUntilNextDeadline}d`
                      : `${metrics.completionPercentage}% vs ${metrics.elapsedTimePercentage}% time`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onViewPilotDetail(pilot)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition shrink-0"
              >
                <span>Audit</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
